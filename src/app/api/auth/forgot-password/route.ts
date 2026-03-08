import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { otpStorage } from '@/lib/otpStore';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Missing EMAIL_USER or EMAIL_PASS environment variables');
            return NextResponse.json({
                success: false,
                error: 'Email service is not configured on the server. Please check environment variables.'
            }, { status: 500 });
        }

        
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('userid')
            .eq('email', email.toLowerCase())
            .single();

        if (userError || !user) {
            return NextResponse.json({
                success: false,
                error: 'This email is not registered in our system.'
            }, { status: 404 });
        }

        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        
        otpStorage[email] = {
            otp,
            expires: Date.now() + 10 * 60 * 1000,
            userid: user.userid 
        };

        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS?.replace(/\s/g, ''), 
            },
        });

        const mailOptions = {
            from: `"SmartBite" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'SmartBite - Password Recovery Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #f97316; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 10px 0 0;">Password Recovery</h2>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="color: #333; font-size: 16px;">Hello,</p>
                        <p style="color: #555; font-size: 15px; line-height: 1.5;">You have requested a password recovery for your SmartBite account associated with this email. Here is your One-Time Password (OTP):</p>
                        <div style="background-color: #fff7ed; border: 1px dashed #fdba74; padding: 15px; text-align: center; border-radius: 6px; margin: 25px 0;">
                            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #ea580c;">${otp}</span>
                        </div>
                        <p style="color: #64748b; font-size: 13px;">This OTP will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
                        <p style="color: #555; font-size: 14px; margin-top: 30px;">If you did not request a password reset, please ignore this email.</p>
                        <br />
                        <p style="color: #333; font-size: 15px;">Best regards,<br /><strong>SmartBite Team</strong></p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 SmartBite. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error('Error sending OTP email:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to send OTP email: ' + (error.message || 'Unknown error'),
            details: error.code 
        }, { status: 500 });
    }
}
