import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages } = body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API key is missing" }, { status: 500 });
        }
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        const supabase = await createClient();

        // Lấy danh sách món ăn từ database để làm context
        const { data: dishes, error: dishesError } = await supabase
            .from('fooditems')
            .select('foodname, descriptions, price, calories, preptime, allergyinfo, ingredients')
            .eq('foodstatus', 'Available');

        if (dishesError) {
            console.error("Error fetching dishes for chat context:", dishesError);
        }

        const menuContext = (dishes || []).map(dish => {
            let metadata = { ingredients: [] };
            try {
                if (dish.ingredients && typeof dish.ingredients === 'string') {
                    if (dish.ingredients.startsWith('{') || dish.ingredients.startsWith('[')) {
                        metadata = JSON.parse(dish.ingredients);
                    }
                } else if (typeof dish.ingredients === 'object' && dish.ingredients !== null) {
                    metadata = dish.ingredients;
                }
            } catch (e) {
                console.warn(`Error parsing ingredients for dish ${dish.foodname}:`, e);
            }

            const ingredientsList = Array.isArray(metadata?.ingredients)
                ? metadata.ingredients.map((i: any) => i.name || i).join(', ')
                : (typeof dish.ingredients === 'string' ? dish.ingredients : 'N/A');

            return `- ${dish.foodname}: ${dish.descriptions}. Giá: ${(dish.price || 0).toLocaleString('vi-VN')}đ, Calo: ${dish.calories || 0}kcal, Thời gian: ${dish.preptime || 0}p. Thành phần: ${ingredientsList}. Dị ứng: ${dish.allergyinfo || 'N/A'}`;
        }).join('\n') || "Hiện tại không có món ăn nào trong thực đơn.";

        console.log(`Successfully built menu context with ${dishes?.length || 0} dishes.`);

        // Gọi Supabase Edge Function bằng fetch trực tiếp để dễ debug
        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/smartbite-ai`;
        const edgeResponse = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
            body: JSON.stringify({
                messages,
                menuContext
            })
        });

        const responseText = await edgeResponse.text();
        let edgeData: any = null;
        try {
            edgeData = JSON.parse(responseText);
        } catch (e) {
            console.error("Non-JSON response from Edge Function:", responseText);
        }

        if (!edgeResponse.ok) {
            console.error("Edge Function Error Status:", edgeResponse.status, responseText);
            return NextResponse.json(
                { error: "No content returned from AI" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            role: "assistant",
            content: edgeData?.content || "Không có phản hồi từ AI."
        });

    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            {
                error: error.message || "Lỗi không xác định",
                details: error.stack,
                status: "failed"
            },
            { status: 500 }
        );
    }
}