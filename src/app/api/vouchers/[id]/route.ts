import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { formatToDb } from '@/utils/date-utils'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const params = await context.params

    try {
        const body = await request.json()

        if (body.startdate) body.startdate = formatToDb(new Date(body.startdate))
        if (body.enddate) body.enddate = formatToDb(new Date(body.enddate))

        const { data, error } = await supabase
            .from('vouchers')
            .update(body)
            .eq('voucherid', params.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating voucher:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const params = await context.params

    try {
        const { error } = await supabase
            .from('vouchers')
            .delete()
            .eq('voucherid', params.id)

        if (error) {
            console.error('Error deleting voucher:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Voucher deleted successfully' })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
