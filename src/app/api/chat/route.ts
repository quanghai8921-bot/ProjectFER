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

        // 1. Lấy danh sách món ăn từ database để làm context
        const { data: dishes, error: dishesError } = await supabase
            .from('fooditems')
            .select('foodname, descriptions, price, calories, preptime, allergyinfo, ingredients')
            .eq('foodstatus', 'Available');

        if (dishesError) {
            console.error("Error fetching dishes for chat context:", dishesError);
        }

        // 2. Chuyển đổi dữ liệu món ăn thành chuỗi văn bản cho AI dễ hiểu
        const menuContext = (dishes || []).map((dish: any) => {
            let ingredientsList = 'N/A';
            try {
                if (dish.ingredients) {
                    const parsed = typeof dish.ingredients === 'string'
                        ? JSON.parse(dish.ingredients)
                        : dish.ingredients;

                    if (Array.isArray(parsed.ingredients)) {
                        ingredientsList = parsed.ingredients.map((i: any) => i.name || i).join(', ');
                    } else if (typeof parsed === 'string') {
                        ingredientsList = parsed;
                    }
                }
            } catch (e) {
                ingredientsList = typeof dish.ingredients === 'string' ? dish.ingredients : 'N/A';
            }

            return `- ${dish.foodname}: ${dish.descriptions}. Giá: ${(dish.price || 0).toLocaleString('vi-VN')}đ, Calo: ${dish.calories || 0}kcal, Thời gian: ${dish.preptime || 0}p. Thành phần: ${ingredientsList}. Dị ứng: ${dish.allergyinfo || 'N/A'}`;
        }).join('\n') || "Hiện tại không có món ăn nào trong thực đơn.";

        console.log(`Successfully built menu context with ${dishes?.length || 0} dishes.`);

        // 3. Gọi Supabase Edge Function "smartbite-ai"
        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/smartbite-ai`;
        const edgeResponse = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
            },
            body: JSON.stringify({
                messages,
                menuContext
            })
        });

        const responseText = await edgeResponse.text();
        let responseData: any;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = { error: responseText };
        }

        if (!edgeResponse.ok) {
            console.error("Edge Function Error Details:", responseText);
            return NextResponse.json(
                { error: `Lỗi AI (${edgeResponse.status}): ` + (responseData.error || responseText || "Không xác định") },
                { status: edgeResponse.status }
            );
        }

        return NextResponse.json({
            role: "assistant",
            content: responseData.content || "Không có phản hồi từ AI."
        });

    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: "Lỗi hệ thống: " + (error.message || "Lỗi không xác định") },
            { status: 500 }
        );
    }
}
