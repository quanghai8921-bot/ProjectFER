"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const normalizedEmail = email.trim().toLowerCase();

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalizedEmail }),
            });

            const data = await res.json();

            if (res.ok) {

                router.push(`/auth/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
            } else {
                if (res.status === 404) {
                    setError("Email này chưa được đăng ký trong hệ thống.");
                } else {
                    setError(data.error || "Gửi OTP thất bại. Vui lòng thử lại sau.");
                }
            }
        } catch (err) {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#FFF8F3] dark:bg-gray-950 p-4 lg:p-8 transition-colors duration-300">
            <div className="flex w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white dark:bg-gray-900 shadow-xl lg:flex-row flex-col border border-transparent dark:border-gray-800">
                <div className="flex w-full flex-col justify-center p-8 lg:p-16 relative">
                    <div className="mx-auto w-full max-w-md space-y-8">
                        <div className="space-y-4 relative">
                            <Link href="/auth/login" className="absolute right-0 top-0 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Quay lại đăng nhập
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6">Quên mật khẩu?</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Vui lòng nhập địa chỉ email bạn đã sử dụng để đăng ký. Chúng tôi sẽ gửi mã OTP gồm 6 chữ số để giúp bạn đặt lại mật khẩu.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="youremail@gmail.com"
                                        className="pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-orange-500"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-medium">
                                {isLoading ? "Đang gửi mã..." : "Gửi mã xác nhận"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
