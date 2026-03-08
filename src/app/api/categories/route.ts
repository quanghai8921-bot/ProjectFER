import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('categoryname', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { categoryName } = await request.json();

        if (!categoryName) {
            return NextResponse.json({ error: 'Category Name is required' }, { status: 400 });
        }

        const categoryId = categoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const { data, error } = await supabase
            .from('categories')
            .insert([{ categoryid: categoryId, categoryname: categoryName }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
