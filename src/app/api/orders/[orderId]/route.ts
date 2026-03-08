import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const supabase = await createClient();
        const { orderId: rawOrderId } = await params;

        const orderId = rawOrderId.replace(/^#/, '');

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                users:userid (fullname, email, phonenumber),
                orderitems (*, fooditems:foodid (*), orderitemtoppings (toppingid, price, toppingoptions:toppingid(toppingname))),
                payments (*),
                vouchers (*)
            `)
            .eq('orderid', orderId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({ order });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const supabase = await createAdminClient();
        const { orderId: rawOrderId } = await params;
        console.log(`[API PUT /api/orders/${rawOrderId}] Starting update...`);

        const orderId = rawOrderId.replace(/^#/, '').trim();
        const body = await request.json();
        const { status } = body;

        console.log(`[API PUT] Body status: ${status}, rawOrderId: ${rawOrderId}, resolved orderId: ${orderId}`);

        const statusMap: Record<string, number> = {
            'cancelled': 0,
            'pending': 1,
            'accepted': 2,
            'preparing': 3,
            'delivering': 4,
            'completed': 5
        };
        const statusValue = typeof status === 'number' ? status : (statusMap[status] || 1);

        console.log(`[API PUT] Resolved statusValue: ${statusValue}`);

        const { data, error } = await supabase
            .from('orders')
            .update({ orderstatus: statusValue })
            .eq('orderid', orderId)
            .select('*');

        if (error) {
            console.error(`[API PUT /api/orders/${orderId}] Supabase EXCEPTION:`, JSON.stringify(error, null, 2));
            return NextResponse.json({ error: 'Database update failed', details: error }, { status: 500 });
        }

        console.log(`[API PUT /api/orders/${orderId}] Rows returned from select():`, data?.length);

        if (!data || data.length === 0) {
            console.warn(`[API PUT /api/orders/${orderId}] Record NOT FOUND after update attempt.`);
            // Let's try to check if the record exists at all
            const { count: existsCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('orderid', orderId);
            console.warn(`[API PUT] Exists check for ${orderId}: ${existsCount} record(s) found.`);

            return NextResponse.json({
                error: 'Order not found',
                debug: { searchedId: orderId, exists: existsCount }
            }, { status: 404 });
        }

        console.log(`[API PUT /api/orders/${orderId}] Successfully updated status to ${statusValue}`);

        // If order is marked as completed (status 5) or cancelled (status 0), handle related payments
        if (statusValue === 5 || statusValue === 0) {
            const newPaymentStatus = statusValue === 5 ? 'completed' : 'cancelled';
            console.log(`[API PUT] Updating payments to ${newPaymentStatus} for ${orderId}`);
            await supabase
                .from('payments')
                .update({ paymentstatus: newPaymentStatus })
                .eq('orderid', orderId);
        }

        return NextResponse.json({
            success: true,
            updatedStatus: statusValue,
            updatedRecord: data[0]
        });
    } catch (error: any) {
        console.error("Update Order Status Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
