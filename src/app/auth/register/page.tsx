"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Mail, Sparkles, Star, User, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
    const router = useRouter();

    
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [password, setPassword] = useState("");
    const [oauthError, setOauthError] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        try {
            
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password: password,
                    fullName: name.trim(),
                    phoneNumber: phone.trim(),
                    birthDate: birthdate,
                    address: address.trim(),
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Đăng ký thành công! Chào mừng bạn đến với SmartBite.");
                router.push("/auth/login");
            } else {
                
                alert(result.error || "Đăng ký thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Connection error:", error);
            alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setOauthError(err.message || `Could not login with ${provider}`);
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            
            <div className="hidden w-1/2 flex-col justify-between bg-orange-500 p-12 text-white lg:flex relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)', backgroundSize: '30px 30px' }}>
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>AI Nutrition Consultant</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight">
                        Eat well, live well <br />
                        with SmartBite
                    </h1>

                    <p className="max-w-md text-lg text-orange-50">
                        Discover diverse menus, track calories, and receive nutritional advice from AI - all in one application.
                    </p>
                </div>

                <div className="relative z-10 flex flex-1 items-center justify-center py-12">
                    <div className="relative aspect-square w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                        <img
                            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Healthy Food Bowl"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>

                <div className="relative z-10 flex justify-between gap-8 border-t border-white/20 pt-8">
                    <div>
                        <div className="text-3xl font-bold">50+</div>
                        <div className="text-sm font-medium text-orange-100">DISHES</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">1,500+</div>
                        <div className="text-sm font-medium text-orange-100">CUSTOMERS</div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 text-3xl font-bold">
                            4.9 <Star className="fill-yellow-400 text-yellow-400 h-6 w-6" />
                        </div>
                        <div className="text-sm font-medium text-orange-100">RATING</div>
                    </div>
                </div>
            </div>

            
            <div className="flex w-full flex-col justify-center bg-white p-8 lg:w-1/2 lg:p-12 xl:p-24">
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div className="space-y-2 relative">
                        <Link href="/" className="absolute right-0 top-0 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors">
                            ← Back to Home
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900">Create new account</h2>
                        <p className="text-gray-500">Start your healthy living journey today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Your Full Name"
                                    className="pl-10 h-12 bg-gray-50 border-gray-200"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="Name@gmail.com"
                                    className="pl-10 h-12 bg-gray-50 border-gray-200"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="tel"
                                    placeholder="Your phone number"
                                    className="pl-10 h-12 bg-gray-50 border-gray-200"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Address</label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Your full address"
                                    className="h-12 bg-gray-50 border-gray-200"
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Birthdate</label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    className="h-12 bg-gray-50 border-gray-200"
                                    required
                                    value={birthdate}
                                    onChange={(e) => setBirthdate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
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

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                required
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the <Link href="#" className="font-medium text-orange-500 hover:underline">Terms of Use</Link> and <Link href="#" className="font-medium text-orange-500 hover:underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-medium"
                        >
                            {isLoading ? "Đang xử lý..." : "Register Now"}
                        </Button>
                        {oauthError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center mt-2">
                                {oauthError}
                            </div>
                        )}
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            onClick={() => handleOAuthLogin('google')}
                            variant="outline"
                            className="h-12 border-gray-200 hover:bg-gray-50 bg-white text-gray-700"
                        >
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleOAuthLogin('facebook')}
                            variant="outline"
                            className="h-12 border-gray-200 hover:bg-gray-50 bg-white text-gray-700"
                        >
                            <svg className="mr-2 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-medium text-orange-500 hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}