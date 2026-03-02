import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { email, password, fullName, phoneNumber, birthDate, address } = body;

        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

        
        if (authData.user) {
            const { error: dbError } = await supabase
                .from('users')
                .insert([{
                    userid: authData.user.id,        
                    fullname: fullName,              
                    birthdate: birthDate,            
                    phonenumber: phoneNumber,        
                    email: email,                    
                    addressdelivery: address         
                }]);

            if (dbError) {
                
                
                
                console.error("Lỗi Database:", dbError.message);

                return NextResponse.json({
                    error: `Lỗi lưu Database: ${dbError.message}. Vui lòng thử lại với email khác hoặc xóa user cũ.`
                }, { status: 400 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}