import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


export async function PUT(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const supabase = await createClient();
        const { itemId } = await params;
        const body = await request.json();
        const { quantity } = body;

        if (quantity <= 0) {
            
            await supabase
                .from('cartitemtoppings')
                .delete()
                .eq('cartitemid', itemId);

            
            const { error: deleteError } = await supabase
                .from('cartitems')
                .delete()
                .eq('cartitemid', itemId);

            if (deleteError) throw deleteError;
            return NextResponse.json({ success: true, message: 'Item removed' });
        }

        const { error: updateError } = await supabase
            .from('cartitems')
            .update({ quantity })
            .eq('cartitemid', itemId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const supabase = await createClient();
        const { itemId } = await params;

        
        await supabase
            .from('cartitemtoppings')
            .delete()
            .eq('cartitemid', itemId);

        
        const { error: deleteError } = await supabase
            .from('cartitems')
            .delete()
            .eq('cartitemid', itemId);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
