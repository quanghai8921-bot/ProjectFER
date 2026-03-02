import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { formatToDb } from '@/utils/date-utils'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    try {
        let query = supabase.from('vouchers').select('*').order('startdate', { ascending: false })

        if (statusFilter === 'Active') {
            query = query.eq('isactive', 1)




        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching vouchers:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const body = await request.json()


        if (!body.vouchercode || body.discountvalue === undefined || body.minordervalue === undefined || !body.enddate) {
            return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
        }


        const generatedId = "VOUCHER-" + Math.random().toString(36).substring(2, 10).toUpperCase()


        const { data, error } = await supabase
            .from('vouchers')
            .insert([{
                voucherid: body.voucherid || generatedId,
                vouchercode: body.vouchercode,
                vouchertype: body.vouchertype || 'Ship',
                discountvalue: body.discountvalue,
                minordervalue: body.minordervalue,
                maxusage: body.maxusage || null,
                startdate: formatToDb(body.startdate ? new Date(body.startdate) : new Date()),
                enddate: formatToDb(new Date(body.enddate)),
                isactive: body.isactive !== undefined ? body.isactive : 1
            }])
            .select()
            .single()

        if (error) {
            console.error('Error creating voucher:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
