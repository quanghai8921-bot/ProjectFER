import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const params = await props.params;
        const id = params.id;


        const { data: dish, error } = await supabase
            .from('fooditems')
            .select(`
                *,
                categories:categoryid (categoryname)
            `)
            .eq('foodid', id)
            .single();

        if (error || !dish) {
            return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
        }


        const { data: toppings } = await supabase
            .from('foodtoppings')
            .select(`
                toppingoptions (*)
            `)
            .eq('foodid', id);

        const extras = toppings?.map((t: any) => ({
            id: t.toppingoptions.toppingid,
            name: t.toppingoptions.toppingname,
            price: t.toppingoptions.price.toLocaleString('vi-VN') + " đ",
            rawPrice: t.toppingoptions.price
        })) || [];


        const { data: ratingStats } = await supabase
            .from('foodreviews')
            .select('rating')
            .eq('foodid', id);

        const reviewCount = ratingStats?.length || 0;
        const avgRating = reviewCount > 0
            ? Number((ratingStats!.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1))
            : 5;


        const metadata = dish.ingredients ? JSON.parse(dish.ingredients) : {};
        const formattedDish = {
            id: dish.foodid,
            title: dish.foodname,
            desc: dish.descriptions,
            price: dish.price ? dish.price.toLocaleString('vi-VN') + " đ" : "0 đ",
            image: dish.foodimageurl,
            category: dish.categoryid,
            calories: dish.calories ? dish.calories + " kcal" : "0 kcal",
            time: dish.preptime ? dish.preptime + "m" : "0m",
            rating: avgRating,
            reviewCount: reviewCount,
            dietaryBalance: metadata.dietaryBalance || "Cân bằng",
            aiReview: metadata.aiReview || { summary: "", tags: [] },
            ingredients: metadata.ingredients || [],
            extras: extras,
            diets: metadata.diets || [],
            allergies: dish.allergyinfo ? JSON.parse(dish.allergyinfo) : [],
            flavors: metadata.flavors || [],
            foodstatus: dish.foodstatus || 'Available',
            foodid: dish.foodid
        };

        return NextResponse.json(formattedDish);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await props.params;


        const { error: updateError } = await supabase
            .from('fooditems')
            .update({ foodstatus: 'Unavailable' })
            .eq('foodid', id);

        if (updateError) {
            console.error("Error updating foodstatus to Unavailable:", updateError);
            throw updateError;
        }

        return NextResponse.json({ success: true, message: "Món ăn đã được chuyển sang trạng thái Ngừng kinh doanh" });
    } catch (error: any) {
        console.error("Delete (Update status) error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const params = await props.params;
        const id = params.id;
        const dish = await request.json();


        const rawPrice = typeof dish.price === 'string'
            ? parseInt(dish.price.replace(/[^\d]/g, ''))
            : dish.price;
        const calories = typeof dish.calories === 'string'
            ? parseInt(dish.calories.replace(/[^\d]/g, ''))
            : dish.calories;
        const prepTime = typeof dish.time === 'string'
            ? parseInt(dish.time.replace(/[^\d]/g, ''))
            : dish.time;

        const metadata = {
            rating: dish.rating || 5,
            dietaryBalance: dish.dietaryBalance,
            aiReview: dish.aiReview,
            ingredients: dish.ingredients,
            diets: dish.diets,
            flavors: dish.flavors,
            categories: dish.categories
        };


        const { error: foodError } = await supabase
            .from('fooditems')
            .update({
                categoryid: dish.category,
                foodname: dish.title,
                price: rawPrice,
                foodimageurl: dish.image,
                descriptions: dish.desc,
                calories: calories,
                preptime: prepTime,
                ingredients: JSON.stringify(metadata),
                allergyinfo: JSON.stringify(dish.allergies || []),
                foodstatus: dish.foodstatus || 'Available'
            })
            .eq('foodid', id);

        if (foodError) throw foodError;


        if (dish.extras && Array.isArray(dish.extras)) {

            await supabase
                .from('foodtoppings')
                .delete()
                .eq('foodid', id);

            for (const extra of dish.extras) {
                if (!extra.name) continue;

                const toppingId = "TOP-" + extra.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                const toppingPrice = typeof extra.price === 'string'
                    ? parseInt(extra.price.replace(/[^\d]/g, '')) || 0
                    : extra.price || 0;


                await supabase
                    .from('toppingoptions')
                    .upsert([{ toppingid: toppingId, toppingname: extra.name, price: toppingPrice }], { onConflict: 'toppingid' });


                await supabase
                    .from('foodtoppings')
                    .upsert([{ foodid: id, toppingid: toppingId }], { onConflict: 'foodid,toppingid' });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await props.params;
        const body = await request.json();

        const { error: updateError } = await supabase
            .from('fooditems')
            .update({ foodstatus: body.foodstatus })
            .eq('foodid', id);

        if (updateError) {
            console.error("Error patching foodstatus:", updateError);
            throw updateError;
        }

        return NextResponse.json({ success: true, message: "Trạng thái món ăn đã được cập nhật" });
    } catch (error: any) {
        console.error("Patch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
