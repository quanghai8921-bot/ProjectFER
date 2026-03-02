"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, Hash } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must have at least 6 characters.");
            return;
        }

        setIsLoading(true);

        try {

            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await res.json();

            if (res.ok && data.success) {



                setSuccess("Password changed successfully! Redirecting to login page...");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } else {
                setError(data.error || "Invalid or expired OTP code.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#FFF8F3] p-4 lg:p-8">
            <div className="flex w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl lg:flex-row flex-col">
                <div className="flex w-full flex-col justify-center p-8 lg:p-16 relative">
                    <div className="mx-auto w-full max-w-md space-y-8">
                        <div className="space-y-4 text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mt-6">Thay đổi mật khẩu</h1>
                            <p className="text-gray-500 text-sm">
                                Vui lòng nhập mã OTP gồm 6 chữ số được gửi đến email của bạn <br />
                                <span className="font-semibold text-gray-800">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                                    {success}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Mã OTP (6 chữ số)</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="text"
                                        maxLength={6}
                                        placeholder="123456"
                                        className="pl-10 h-12 bg-gray-50 border-gray-200 tracking-widest text-lg font-mono placeholder:tracking-normal placeholder:font-sans"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-medium shadow-orange-200 shadow-lg mt-4">
                                {isLoading ? "Đang xử lý..." : "Thay đổi mật khẩu"}
                            </Button>

                            <div className="text-center pt-4">
                                <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors">
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
