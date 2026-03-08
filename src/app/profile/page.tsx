"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Sparkles, MessageCircle } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [gender, setGender] = useState<"male" | "female">("male");
    const [activityLevel, setActivityLevel] = useState("moderate");
    const [goal, setGoal] = useState<"loss" | "maintain" | "gain">("maintain");
    const [diets, setDiets] = useState<string[]>(["Keto"]);
    const [allergies, setAllergies] = useState<string[]>([]);

    const toggleDiet = (item: string) => {
        if (diets.includes(item)) {
            setDiets(diets.filter(i => i !== item));
        } else {
            setDiets([...diets, item]);
        }
    };

    const toggleAllergy = (item: string) => {
        if (allergies.includes(item)) {
            setAllergies(allergies.filter(i => i !== item));
        } else {
            setAllergies([...allergies, item]);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
            <Navbar />

            <main className="container mx-auto px-4 py-8 md:py-12">

                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">Hồ sơ & Chỉ số sức khỏe</h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed">
                        Cung cấp thông tin sức khỏe của bạn để SmartBite có thể gợi ý thực đơn dinh dưỡng tối ưu dành riêng cho bạn.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">


                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <span className="text-sm font-bold">👤</span>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Thông tin cơ bản</h2>
                            </div>

                            <div className="space-y-6">

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Giới tính</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setGender("male")}
                                            className={`relative flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${gender === "male"
                                                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20"
                                                : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                }`}
                                        >
                                            <span>♂ Nam</span>
                                            {gender === "male" && <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-orange-500 border-r-transparent rounded-tl-sm transform rotate-0" />}
                                        </button>
                                        <button
                                            onClick={() => setGender("female")}
                                            className={`relative flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${gender === "female"
                                                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20"
                                                : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                }`}
                                        >
                                            <span>♀ Nữ</span>
                                        </button>
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Chiều cao (cm)</label>
                                        <Input defaultValue="170" className="h-12 text-lg active:ring-orange-500 focus-visible:ring-orange-500 border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 dark:text-gray-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Cân nặng (kg)</label>
                                        <Input defaultValue="65" className="h-12 text-lg active:ring-orange-500 focus-visible:ring-orange-500 border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 dark:text-gray-100" />
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Năm sinh</label>
                                        <Input defaultValue="1995" className="h-12 text-lg active:ring-orange-500 focus-visible:ring-orange-500 border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 dark:text-gray-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Mức độ hoạt động</label>
                                        <div className="relative">
                                            <select
                                                value={activityLevel}
                                                onChange={(e) => setActivityLevel(e.target.value)}
                                                className="w-full h-12 pl-3 pr-10 text-base border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/30 dark:bg-gray-800/50 dark:text-gray-100 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                                            >
                                                <option className="bg-white dark:bg-gray-900" value="sedentary">Ít vận động</option>
                                                <option className="bg-white dark:bg-gray-900" value="moderate">Vừa phải (1-3 ngày/tuần)</option>
                                                <option className="bg-white dark:bg-gray-900" value="active">Năng động (3-5 ngày/tuần)</option>
                                                <option className="bg-white dark:bg-gray-900" value="athlete">Vận động viên</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <span className="text-sm font-bold">🎯</span>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Mục tiêu của bạn</h2>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {[
                                    { id: "loss", title: "Weight Loss", desc: "Lose fat, gain muscle", icon: "📉" },
                                    { id: "maintain", title: "Maintain", desc: "Healthy, balanced", icon: "⚖️" },
                                    { id: "gain", title: "Muscle Gain", desc: "Build strength", icon: "💪" },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setGoal(item.id as any)}
                                        className={`relative p-4 rounded-xl border transition-all text-center h-full flex flex-col items-center justify-center gap-2 ${goal === item.id
                                            ? "border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 ring-1 ring-orange-500"
                                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700"
                                            }`}
                                    >
                                        {goal === item.id && (
                                            <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full" />
                                        )}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 text-xl ${goal === item.id ? "bg-white dark:bg-gray-800 shadow-sm" : "bg-gray-100 dark:bg-gray-800"}`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{item.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>


                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <span className="text-sm font-bold">🚫</span>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chế độ ăn & Dị ứng</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">Chế độ ăn đặc biệt</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Ăn chay thuần", "Ăn chay", "Keto", "Ít carb", "Ăn sạch"].map(item => (
                                            <button
                                                key={item}
                                                onClick={() => toggleDiet(item)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${diets.includes(item)
                                                    ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">Dị ứng thực phẩm</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {["Hải sản", "Đậu phộng", "Sữa", "Trứng", "Gluten", "Đậu nành", "Lúa mì", "Hạt"].map(item => (
                                            <button
                                                key={item}
                                                onClick={() => toggleAllergy(item)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${allergies.includes(item)
                                                    ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-medium"
                                                    : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${allergies.includes(item) ? "border-red-500 bg-white dark:bg-gray-800" : "border-gray-300 dark:border-gray-600"}`}>
                                                    {allergies.includes(item) && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                                </div>
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>




                    </div>


                    <div className="lg:col-span-1 space-y-6">

                        <div className="bg-[#FFF8F3] dark:bg-orange-950/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100">SmartBite AI</h3>
                                    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium animate-pulse">Đang phân tích dữ liệu...</div>
                                </div>
                            </div>

                            <div className="space-y-6">

                                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-orange-50/50 dark:border-orange-900/10">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">BMI Ước tính</div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">22.5</span>
                                        <span className="text-sm font-semibold text-green-500 dark:text-green-400 mb-1.5">Bình thường</span>
                                    </div>

                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                                        <div className="w-[60%] h-full bg-green-500 rounded-full" />
                                    </div>
                                </div>


                                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-orange-50/50 dark:border-orange-900/10">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Calo khuyến nghị / ngày</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-extrabold text-orange-500 dark:text-orange-400">~2,100</span>
                                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1.5">kcal</span>
                                    </div>
                                </div>


                                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-orange-50/50 dark:border-orange-900/10">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Phân bổ Dinh dưỡng</div>
                                    <div className="grid grid-cols-3 gap-2 h-16 items-end">
                                        <div className="space-y-1 text-center">
                                            <div className="w-full bg-red-100 dark:bg-red-950/40 rounded-t-sm h-10 relative group">
                                                <div className="absolute inset-0 bg-red-200 dark:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Chất đạm</div>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <div className="w-full bg-yellow-100 dark:bg-yellow-950/40 rounded-t-sm h-14 relative group">
                                                <div className="absolute inset-0 bg-yellow-400 dark:bg-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />

                                                <div className="absolute inset-x-0 bottom-0 top-6 bg-yellow-400 dark:bg-yellow-500 rounded-t-sm" />
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-900 dark:text-gray-100 font-bold">Tinh bột</div>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <div className="w-full bg-blue-100 dark:bg-blue-950/40 rounded-t-sm h-8 relative group">
                                                <div className="absolute inset-0 bg-blue-200 dark:bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                                                <div className="absolute inset-x-0 bottom-0 top-4 bg-blue-400 dark:bg-blue-500 rounded-t-sm" />
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Chất béo</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-950/40 rounded-lg text-orange-500 dark:text-orange-400">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">Cần hỗ trợ?</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                                        Các chuyên gia dinh dưỡng của chúng tôi luôn sẵn sàng giúp đỡ.
                                    </p>
                                    <a
                                        href="https://www.facebook.com/tfonghjhj"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 hover:underline"
                                    >
                                        Chat ngay
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>

    );
}
