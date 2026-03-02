import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
                payments (*)
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
        const supabase = await createClient();
        const { orderId: rawOrderId } = await params;
        
        const orderId = rawOrderId.replace(/^#/, '');
        const body = await request.json();
        const { status } = body;

        const statusMap: Record<string, number> = {
            'pending': 1,
            'accepted': 2,
            'preparing': 3,
            'delivering': 4,
            'completed': 5
        };
        const statusValue = typeof status === 'number' ? status : (statusMap[status] || 1);

        const { error } = await supabase
            .from('orders')
            .update({ orderstatus: statusValue })
            .eq('orderid', orderId);

        if (error) throw error;

        return NextResponse.json({ success: true, updatedStatus: statusValue });
    } catch (error: any) {
        console.error("Update Order Status Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
