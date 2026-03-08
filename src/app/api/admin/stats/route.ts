import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();


        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*');

        if (userError) throw userError;


        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('userid, finalamount, ordertime, orderstatus');

        if (orderError) throw orderError;


        const customers = users?.map(user => {
            const userOrders = orders?.filter(o => o.userid === user.userid) || [];




            const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.finalamount) || 0), 0);
            const orderCount = userOrders.length;


            const sortedOrders = [...userOrders].sort((a, b) => new Date(b.ordertime).getTime() - new Date(a.ordertime).getTime());
            const lastOrderDate = sortedOrders.length > 0 ? sortedOrders[0].ordertime : null;

            return {
                id: user.userid,
                name: user.fullname,
                email: user.email,
                phone: user.phonenumber,
                birthday: user.birthdate,
                address: user.addressdelivery,
                totalSpent: totalSpent,
                orderCount: orderCount,
                lastOrderDate: lastOrderDate
            };
        }) || [];


        customers.sort((a, b) => b.totalSpent - a.totalSpent);


        const totalRevenue = orders?.reduce((sum, o) => sum + (Number(o.finalamount) || 0), 0) || 0;
        const totalOrders = orders?.length || 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const totalCustomers = customers.length;


        const salesByDate: Record<string, number> = {};
        orders?.forEach(o => {
            if (o.ordertime) {
                const date = new Date(o.ordertime).toLocaleDateString('sv-SE');
                salesByDate[date] = (salesByDate[date] || 0) + (Number(o.finalamount) || 0);
            }
        });


        const salesTrend = Object.keys(salesByDate).sort().map(date => ({
            date,
            revenue: salesByDate[date]
        })).slice(-7);

        return NextResponse.json({
            success: true,
            customers,
            stats: {
                totalRevenue,
                totalOrders,
                averageOrderValue,
                totalCustomers,
                salesTrend
            }
        });

    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
