import { NextResponse } from 'next/server';
import { otpStorage } from '@/lib/otpStore';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ success: false, error: 'Email, OTP and New Password are required' }, { status: 400 });
        }

        const record = otpStorage[email];

        if (!record) {
            return NextResponse.json({ success: false, error: 'No OTP requested for this email' }, { status: 400 });
        }

        if (Date.now() > record.expires) {
            delete otpStorage[email];
            return NextResponse.json({ success: false, error: 'OTP has expired' }, { status: 400 });
        }

        if (record.otp !== otp) {
            return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
        }

        
        const supabaseAdmin = await createAdminClient();

        if (!record.userid) {
            return NextResponse.json({ success: false, error: 'User ID context lost. Please try forgot password again.' }, { status: 400 });
        }

        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            record.userid,
            { password: newPassword }
        );

        if (authError) {
            console.error('Supabase Auth Admin Error:', authError);
            return NextResponse.json({ success: false, error: 'Failed to update password in Auth: ' + authError.message }, { status: 500 });
        }

        
        delete otpStorage[email];

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Error verifying OTP/Resetting password:', error);
        return NextResponse.json({ success: false, error: 'Failed to reset password: ' + (error.message || 'Unknown error') }, { status: 500 });
    }
}
