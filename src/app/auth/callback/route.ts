import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            
            const user = data.user;
            const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";

            
            const randomPhone = '0' + Math.floor(100000000 + Math.random() * 900000000).toString();

            const { error: upsertError } = await supabase.from('users').upsert({
                userid: user.id,
                email: user.email,
                fullname: name,
                birthdate: '2000-01-01',
                phonenumber: randomPhone,
                addressdelivery: 'Chưa cập nhật'
            }, { onConflict: 'userid' });
            
            if (upsertError) {
                console.error('OAuth sync user upsert error:', upsertError);
            }

            
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('OAuth exchange error:', error)
        }
    } else {
        console.error('OAuth callback missing code')
    }

    
    return NextResponse.redirect(`${origin}/auth/login?error=oauth-failed`)
}
