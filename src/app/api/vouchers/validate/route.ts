import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { userid, vouchercode } = body;

        if (!userid || !vouchercode) {
            return NextResponse.json({ error: 'Thiếu thông tin người dùng hoặc voucher' }, { status: 400 });
        }

        
        const { data: voucherData, error: vErr } = await supabase
            .from('vouchers')
            .select('*')
            .eq('vouchercode', vouchercode)
            .single();

        if (vErr || !voucherData) {
            return NextResponse.json({ error: 'Mã giảm giá không hợp lệ hoặc không tồn tại' }, { status: 400 });
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

        return NextResponse.json({ valid: true, voucher: voucherData });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
