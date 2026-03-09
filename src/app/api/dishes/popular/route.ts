import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        // Join fooditems with orderitems to count sales
        // Note: In Supabase, we can't do complex aggregations directly in a single select easily without RPC
        // So we'll fetch dishes and order counts separately or use a join if possible.
        // For simplicity and efficiency, let's fetch all fooditems first and then their order counts.

        const { data: dishes, error: dishesError } = await supabase
            .from('fooditems')
            .select(`
                *,
                categories:categoryid (categoryname),
                foodreviews (rating)
            `);

        if (dishesError) throw dishesError;

        const { data: orderItems, error: ordersError } = await supabase
            .from('orderitems')
            .select('foodid, quantity');

        if (ordersError) throw ordersError;

        // Calculate sales volume per dish
        const salesMap: Record<string, number> = {};
        orderItems.forEach((item: any) => {
            salesMap[item.foodid] = (salesMap[item.foodid] || 0) + (Number(item.quantity) || 0);
        });

        // Format and sort dishes
        const formattedDishes = dishes.map(dish => {
            const reviews = (dish as any).foodreviews || [];
            const reviewCount = reviews.length;
            const avgRating = reviewCount > 0
                ? Number((reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviewCount).toFixed(1))
                : 5;

            const metadata = dish.ingredients ? JSON.parse(dish.ingredients) : {};
            return {
                id: dish.foodid,
                title: dish.foodname,
                desc: dish.descriptions,
                price: dish.price ? dish.price.toLocaleString('vi-VN') + " đ" : "0 đ",
                image: dish.foodimageurl,
                categories: metadata.categories || (
    dish.categories?.categoryname
        ? [{
            categoryid: dish.categoryid,
            categoryname: dish.categories.categoryname
        }]
        : []
),
                calories: dish.calories ? dish.calories + " kcal" : "0 kcal",
                time: dish.preptime ? dish.preptime + "m" : "0m",
                rating: avgRating,
                reviewCount: reviewCount,
                salesCount: salesMap[dish.foodid] || 0,
                dietaryBalance: metadata.dietaryBalance || "Cân bằng",
                aiReview: metadata.aiReview || { summary: "", tags: [] },
                ingredients: metadata.ingredients || [],
                extras: [],
                diets: metadata.diets || [],
                allergies: dish.allergyinfo ? JSON.parse(dish.allergyinfo) : [],
                flavors: metadata.flavors || [],
                foodstatus: dish.foodstatus || 'Available'
            };
        });

        // Sort by salesCount descending and take top 4
        const popularDishes = formattedDishes
            .sort((a, b) => b.salesCount - a.salesCount)
            .slice(0, 4);

        return NextResponse.json(popularDishes);
    } catch (error: any) {
        console.error("Popular Dishes API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
