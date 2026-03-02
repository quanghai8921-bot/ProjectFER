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
                    setError("This email is not registered in our system.");
                } else {
                    setError(data.error || "Failed to send OTP. Please try again later.");
                }
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
                        <div className="space-y-4 relative">
                            <Link href="/auth/login" className="absolute right-0 top-0 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors flex items-center">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Login
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900 mt-6">Forgot Password?</h1>
                            <p className="text-gray-500 text-sm">
                                Please enter the email address you used to register. We will send a 6-digit OTP to help you reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="youremail@gmail.com"
                                        className="pl-10 h-12 bg-gray-50 border-gray-200"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-medium shadow-orange-200 shadow-lg">
                                {isLoading ? "Sending code..." : "Send confirmation code"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
