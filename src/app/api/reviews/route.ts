import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { formatToDb } from '@/utils/date-utils';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { orderId, rating, comment, foodReviews } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }


        if (rating) {
            const reviewId = 'REV-O-' + Math.random().toString(36).substring(2, 9).toUpperCase();
            const { error: orderError } = await supabase
                .from('orderreviews')
                .insert({
                    reviewid: reviewId,
                    orderid: orderId,
                    rating: rating,
                    comment: comment,
                    createdat: formatToDb()
                });

            if (orderError) throw orderError;
        }


        if (foodReviews && Array.isArray(foodReviews)) {
            const foodInserts = foodReviews.map((fr: any) => ({
                reviewid: 'REV-F-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                foodid: fr.foodId,
                orderid: orderId,
                rating: fr.rating,
                comment: fr.comment || "",
                createdat: formatToDb()
            }));

            if (foodInserts.length > 0) {
                const { error: foodError } = await supabase
                    .from('foodreviews')
                    .insert(foodInserts);
                if (foodError) throw foodError;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Create Review Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderid');
        const foodId = searchParams.get('foodid');
        const action = searchParams.get('action');


        if (action === 'check-eligibility' && foodId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return NextResponse.json({ eligible: false, message: 'Not logged in' });


            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    orderid,
                    orderitems!inner(foodid)
                `)
                .eq('userid', user.id)
                .eq('orderstatus', 5)
                .eq('orderitems.foodid', foodId);

            if (ordersError) throw ordersError;
            if (!orders || orders.length === 0) {
                return NextResponse.json({ eligible: false, message: 'Chưa mua món này' });
            }


            for (const order of orders) {
                const { data: review, error: reviewError } = await supabase
                    .from('foodreviews')
                    .select('reviewid')
                    .eq('orderid', order.orderid)
                    .eq('foodid', foodId)
                    .single();

                if (reviewError && reviewError.code === 'PGRST116') {


                    const { data: orderItems } = await supabase
                        .from('orderitems')
                        .select('*, fooditems:foodid(foodname, foodimageurl)')
                        .eq('orderid', order.orderid);

                    return NextResponse.json({
                        eligible: true,
                        orderId: order.orderid,
                        orderItems: orderItems || []
                    });
                }
            }

            return NextResponse.json({ eligible: false, message: 'Đã đánh giá tất cả các đơn hàng cho món này' });
        }


        if (foodId) {
            const { data: reviews, error } = await supabase
                .from('foodreviews')
                .select(`
                    *,
                    orders:orderid (
                        users:userid (fullname, email)
                    )
                `)
                .eq('foodid', foodId)
                .order('createdat', { ascending: false });

            if (error) throw error;
            return NextResponse.json({ success: true, reviews });
        }


        if (orderId) {
            const { data: orderReview, error: orderError } = await supabase
                .from('orderreviews')
                .select('*')
                .eq('orderid', orderId)
                .single();

            if (orderError && orderError.code !== 'PGRST116') throw orderError;

            const { data: foodReviews, error: foodError } = await supabase
                .from('foodreviews')
                .select('*')
                .eq('orderid', orderId);

            if (foodError) throw foodError;

            return NextResponse.json({
                success: true,
                hasReviewed: !!orderReview || (foodReviews && foodReviews.length > 0),
                orderReview: orderReview || null,
                foodReviews: foodReviews || []
            });
        }


        const { data: orderReviews, error: orderError } = await supabase
            .from('orderreviews')
            .select(`
                *,
                orders:orderid (
                    orderid,
                    foodamount,
                    shippingfee,
                    ordertime,
                    users:userid (fullname, email)
                )
            `);

        if (orderError) throw orderError;

        const { data: foodReviews, error: foodError } = await supabase
            .from('foodreviews')
            .select(`
                *,
                orders:orderid (
                    orderid,
                    ordertime,
                    users:userid (fullname, email)
                ),
                fooditems:foodid (foodname, foodimageurl)
            `);

        if (foodError) throw foodError;


        const mergedReviews = [
            ...(orderReviews || []).map(r => ({ ...r, type: 'order' })),
            ...(foodReviews || []).map(r => ({ ...r, type: 'food' }))
        ].sort((a, b) => new Date(b.createdat || 0).getTime() - new Date(a.createdat || 0).getTime());

        return NextResponse.json({ success: true, reviews: mergedReviews });
    } catch (error: any) {
        console.error('Get Reviews Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
