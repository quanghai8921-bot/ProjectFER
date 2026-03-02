import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const supabase = await createClient();

        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email, password,
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 401 });
        }

        
        const { data: userRole } = await supabase
            .from('userroles')
            .select('roleid')
            .eq('userid', authData.user.id)
            .eq('roleid', 'ADMIN')
            .single();

        const isAdmin = !!userRole;

        
        if (isAdmin) {
            const cookieStore = await cookies();
            cookieStore.set('admin_token', 'secure-admin-token-value', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24,
                path: '/',
            });
        }

        
        
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                userid: authData.user.id,
                email: authData.user.email,
                fullname: email.split('@')[0],
                birthdate: '2000-01-01', 
                phonenumber: '0000000000', 
                addressdelivery: 'Chưa cập nhật' 
            }, { onConflict: 'userid' });

        if (upsertError) {
            console.error('Lỗi khi đồng bộ User Profile:', upsertError);
            
        }

        
        const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('userid', authData.user.id)
            .single();

        const responseUser = {
            userid: authData.user.id,
            email: authData.user.email,
            fullname: userProfile?.fullname || email.split('@')[0],
            phonenumber: userProfile?.phonenumber || "",
            addressdelivery: userProfile?.addressdelivery || ""
        };

        return NextResponse.json({
            success: true,
            role: isAdmin ? 'admin' : 'user',
            user: responseUser
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}