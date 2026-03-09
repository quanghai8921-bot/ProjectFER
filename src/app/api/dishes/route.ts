import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();


        const { data: dishes, error } = await supabase
            .from('fooditems')
            .select(`
    *,
    categories:categoryid (
        categoryid,
        categoryname
    ),
    foodreviews (rating)
`)

        if (error) throw error;


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

        category: dish.categoryid || null,

        calories: dish.calories ? dish.calories + " kcal" : "0 kcal",
        time: dish.preptime ? dish.preptime + "m" : "0m",
        rating: avgRating,
        reviewCount: reviewCount,
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

        return NextResponse.json(formattedDishes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const dish = await request.json();


        const foodId = dish.id || "FOOD-" + Math.random().toString(36).substring(2, 9).toUpperCase();


        const rawPrice = typeof dish.price === 'string'
            ? parseInt(dish.price.replace(/\D/g, '')) || 0
            : dish.price;

        const calories = parseInt(String(dish.calories).replace(/\D/g, '')) || 0;
        const prepTime = parseInt(String(dish.time).replace(/\D/g, '')) || 0;


        const metadata = {
            rating: dish.rating,
            dietaryBalance: dish.dietaryBalance,
            aiReview: dish.aiReview,
            ingredients: dish.ingredients,
            diets: dish.diets,
            flavors: dish.flavors,
            categories: dish.categories
        };

        const { error: foodError } = await supabase
            .from('fooditems')
            .insert([{
                foodid: foodId,
                categoryid: dish.categories?.[0] || null,
                foodname: dish.title,
                price: rawPrice,
                foodimageurl: dish.image,
                descriptions: dish.desc,
                calories: calories,
                preptime: prepTime,
                ingredients: JSON.stringify(metadata),
                allergyinfo: JSON.stringify(dish.allergies || []),
                foodstatus: dish.foodstatus || 'Available'
            }]);

        if (foodError) throw foodError;


        if (dish.extras && dish.extras.length > 0) {
            for (const extra of dish.extras) {
                const toppingId = "TOP-" + extra.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                const toppingPrice = parseInt(String(extra.price).replace(/\D/g, '')) || 0;


                await supabase
                    .from('toppingoptions')
                    .upsert([{ toppingid: toppingId, toppingname: extra.name, price: toppingPrice }], { onConflict: 'toppingid' });


                await supabase
                    .from('foodtoppings')
                    .upsert([{ foodid: foodId, toppingid: toppingId }], { onConflict: 'foodid,toppingid' });
            }
        }

        return NextResponse.json({ success: true, id: foodId }, { status: 201 });
    } catch (error: any) {
        console.error("Lỗi API Dishes:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
