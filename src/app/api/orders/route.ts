import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { formatToDb } from '@/utils/date-utils';


export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { userid, shippingaddress, totalprice, paymentmethod, vouchercode } = body;

        if (!userid) {
            return NextResponse.json({ error: 'Missing userid' }, { status: 400 });
        }


        const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('cartid')
            .eq('userid', userid)
            .single();

        if (cartError || !cart) {
            return NextResponse.json({ error: 'Cart not found or empty' }, { status: 404 });
        }


        const { data: cartItems, error: itemsError } = await supabase
            .from('cartitems')
            .select(`
                *,
                fooditems:foodid (price),
                cartitemtoppings (toppingid, toppingoptions:toppingid(price))
            `)
            .eq('cartid', cart.cartid);

        if (itemsError || !cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }


        const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;




        const shippingFee = 15000;
        const computedFoodAmount = (totalprice || 0) > shippingFee ? (totalprice - shippingFee) : (totalprice || 0);


        let appliedVoucherId = null;
        if (vouchercode) {
            const { data: voucherData, error: vErr } = await supabase
                .from('vouchers')
                .select('voucherid, maxusage, isactive')
                .eq('vouchercode', vouchercode)
                .single();

            if (vErr || !voucherData) {
                return NextResponse.json({ error: 'Mã giảm giá không tồn tại' }, { status: 400 });
            }

            if (voucherData.isactive !== 1 || (voucherData.maxusage !== null && voucherData.maxusage <= 0)) {
                return NextResponse.json({ error: 'Mã giảm giá đã hết hạn hoặc hết lượt sử dụng' }, { status: 400 });
            }


            const { count: usageCount, error: usageErr } = await supabase
                .from('orders')
                .select('orderid', { count: 'exact', head: true })
                .eq('userid', userid)
                .eq('voucherid', voucherData.voucherid);

            if (!usageErr && usageCount && usageCount > 0) {
                return NextResponse.json({ error: 'Bạn đã sử dụng mã giảm giá này rồi' }, { status: 400 });
            }

            appliedVoucherId = voucherData.voucherid;


            let updates: any = {};
            if (voucherData.maxusage && voucherData.maxusage > 0) {
                updates.maxusage = voucherData.maxusage - 1;
                if (updates.maxusage === 0) {
                    updates.isactive = 0;
                }
            }

            if (Object.keys(updates).length > 0) {
                await supabase
                    .from('vouchers')
                    .update(updates)
                    .eq('voucherid', appliedVoucherId);
            }
        }


        const { error: orderError } = await supabase
            .from('orders')
            .insert([{
                orderid: orderId,
                userid: userid,
                foodamount: computedFoodAmount,
                shippingfee: shippingFee,
                orderstatus: 1,
                deliveryaddress: shippingaddress || 'Chưa cập nhật',
                ordertime: formatToDb(),
                voucherid: appliedVoucherId
            }]);

        if (orderError) throw orderError;


        const orderItemsInserts: any[] = [];
        const orderItemToppingsInserts: any[] = [];

        for (const item of cartItems) {
            const orderItemId = `oi-${Math.random().toString(36).substring(2, 9)}`;


            let extraPrice = 0;
            if (item.cartitemtoppings && Array.isArray(item.cartitemtoppings)) {
                for (const t of item.cartitemtoppings) {
                    const tPrice = t.toppingoptions?.price || 0;
                    extraPrice += tPrice;

                    orderItemToppingsInserts.push({
                        ordertoppingid: `ot-${Math.random().toString(36).substring(2, 9)}`,
                        orderitemid: orderItemId,
                        toppingid: t.toppingid,
                        price: tPrice
                    });
                }
            }



            orderItemsInserts.push({
                orderitemid: orderItemId,
                orderid: orderId,
                foodid: item.foodid,
                quantity: item.quantity,
                unitprice: item.fooditems?.price || 0,
            });
        }

        const { error: insertItemsError } = await supabase
            .from('orderitems')
            .insert(orderItemsInserts);

        if (insertItemsError) throw insertItemsError;

        if (orderItemToppingsInserts.length > 0) {
            const { error: insertToppingsError } = await supabase
                .from('orderitemtoppings')
                .insert(orderItemToppingsInserts);
            if (insertToppingsError) throw insertToppingsError;
        }


        const paymentId = `pay-${Math.random().toString(36).substring(2, 9)}`;
        const { error: paymentError } = await supabase
            .from('payments')
            .insert([{
                paymentid: paymentId,
                orderid: orderId,
                amount: totalprice || 0,
                paymentmethod: paymentmethod || 'cash',
                paymentstatus: 'pending',
                paymentdate: formatToDb()
            }]);

        if (paymentError) throw paymentError;




        const cartItemIds = cartItems.map((item: any) => item.cartitemid);

        if (cartItemIds.length > 0) {
            await supabase.from('cartitemtoppings').delete().in('cartitemid', cartItemIds);
        }

        await supabase.from('cartitems').delete().eq('cartid', cart.cartid);

        const { error: deleteCartRecordError } = await supabase
            .from('carts')
            .delete()
            .eq('cartid', cart.cartid);

        if (deleteCartRecordError) {
            console.error("Cart record deletion error:", deleteCartRecordError);
        }


        return NextResponse.json({ success: true, orderId });

    } catch (error: any) {
        console.error('Order Creation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const userid = searchParams.get('userid');

        let query = supabase
            .from('orders')
            .select(`
                *,
                users:userid (fullname, email, phonenumber),
                orderitems (*, fooditems:foodid (foodname, foodimageurl), orderitemtoppings (toppingid, price, toppingoptions:toppingid(toppingname))),
                payments (paymentstatus, paymentmethod)
            `)
            .order('ordertime', { ascending: false });

        if (userid) {
            query = query.eq('userid', userid);
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        return NextResponse.json({ orders });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
