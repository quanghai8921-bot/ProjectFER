"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
    Flame,
    Plus,
    Search,
    ChevronDown,
    UtensilsCrossed,
    Beef,
    Coffee,
    Cake,
    Leaf,
    Dumbbell,
    Zap,
    Clock,
} from "lucide-react";


type BalanceType = "Cân bằng" | "Vừa phải" | "Nuông chiều";

interface Category {
    categoryid: string;
    categoryname: string;
}

const CATEGORY_ICON_MAP: Record<string, any> = {
    "Món chính": Beef,
    "Main Course": Beef,
    "Sức khỏe": Leaf,
    "Healthy Food": Leaf,
    "Đồ uống": Coffee,
    "Drinks": Coffee,
    "Tráng miệng": Cake,
    "Dessert": Cake,
    "Mặc định": UtensilsCrossed
}

const CATEGORY_NAME_TRANSLATIONS: Record<string, string> = {
    "Main Course": "Món chính",
    "Healthy Food": "Sức khỏe",
    "Drinks": "Đồ uống",
    "Dessert": "Tráng miệng",
    "Food": "Món ăn"
}

interface MenuItem {
    id: string;
    title: string;
    desc: string;
    price: string;
    calories: string;
    time: string;
    rating: number;
    image: string;
    categories?: string[];
    dietaryBalance?: string;
    aiReview?: {
        summary: string;
        tags: string[];
    };
    ingredients?: any[];
    diets?: string[];
    allergies?: string[];
    flavors?: string[];
    foodstatus?: string;
}

function MenuContent() {
    const [dishes, setDishes] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");
    const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "All");
    const [selectedBalances, setSelectedBalances] = useState<string[]>([]);
    const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
    const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
    const [isPersonalized, setIsPersonalized] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [categoryParam]);

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            await Promise.all([fetchDishes(), fetchCategories()]);
            setIsLoading(false);
        };
        initData();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const fetchDishes = async () => {
        try {
            const res = await fetch("/api/dishes");
            if (!res.ok) throw new Error("Không thể tải");
            const data = await res.json();
            setDishes(data);
        } catch (error) {
            console.error("Lỗi khi tải món ăn:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleBalance = (balance: string) => {
        setSelectedBalances(cur => cur.includes(balance) ? cur.filter(b => b !== balance) : [...cur, balance]);
    };

    const toggleDiet = (diet: string) => {
        setSelectedDiets(cur => cur.includes(diet) ? cur.filter(b => b !== diet) : [...cur, diet]);
    };

    const toggleAllergy = (allergy: string) => {
        setSelectedAllergies(cur => cur.includes(allergy) ? cur.filter(b => b !== allergy) : [...cur, allergy]);
    };

    const toggleFlavor = (flavor: string) => {
        setSelectedFlavors(cur => cur.includes(flavor) ? cur.filter(b => b !== flavor) : [...cur, flavor]);
    };

    const filteredItems = dishes.filter((item) => {
        const itemCategories = item.categories || [];
        const itemBalance = item.dietaryBalance || "Cân bằng";

        const matchCategory = selectedCategory === "All" || itemCategories.includes(selectedCategory);
        const matchBalance = selectedBalances.length === 0 || selectedBalances.includes(itemBalance);

        const matchDiets = selectedDiets.length === 0 || selectedDiets.some(d => item.diets?.includes(d));

        const matchAllergies = selectedAllergies.length === 0 || !selectedAllergies.some(a => item.allergies?.includes(a));
        const matchFlavors = selectedFlavors.length === 0 || selectedFlavors.some(f => item.flavors?.includes(f));


        let matchPersonalized = true;
        if (isPersonalized) {
            const cals = parseInt((item.calories || "0").replace(/\D/g, '')) || 0;
            matchPersonalized = (itemCategories.includes("Food") || itemCategories.includes("mon-chinh") || itemCategories.includes("suc-khoe")) && cals > 0 && cals < 600;
        }

        const matchSearch = searchQuery === "" || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()));

        if (item.foodstatus === "Unavailable") return false;

        return matchCategory && matchBalance && matchDiets && matchAllergies && matchFlavors && matchPersonalized && matchSearch;
    });

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 font-sans transition-colors duration-300">
            <Navbar />


            <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-16 z-30 shadow-sm hidden md:block transition-colors">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 w-full max-w-md bg-gray-50 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <Search className="w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm món ăn giàu Protein..."
                            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Zap className="w-4 h-4 text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">


                <div className="w-full lg:w-72 flex-shrink-0 space-y-8">

                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex items-center gap-2 mb-4 text-orange-600 font-bold tracking-wide text-[10px] uppercase">
                            <Dumbbell className="w-3 h-3" />
                            Mục tiêu dinh dưỡng
                        </div>

                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Calo còn lại</span>
                            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-none">650 <span className="text-xs font-medium text-gray-400 dark:text-gray-500">kcal</span></span>
                        </div>

                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 w-[65%]" />
                        </div>

                        <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                            <span>1350 đã dùng</span>
                            <span>Mục tiêu: 2000</span>
                        </div>
                    </div>


                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Danh mục</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory("All")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${selectedCategory === "All"
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                    }`}
                            >
                                <UtensilsCrossed className="w-5 h-5" />
                                <span>Tất cả</span>
                            </button>

                            {categories.map((cat) => {
                                const Icon = (CATEGORY_ICON_MAP as any)[cat.categoryname] || UtensilsCrossed;
                                return (
                                    <button
                                        key={cat.categoryid}
                                        onClick={() => setSelectedCategory(cat.categoryid)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${selectedCategory === cat.categoryid
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{CATEGORY_NAME_TRANSLATIONS[cat.categoryname] || cat.categoryname}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    <Accordion type="multiple" defaultValue={["balance", "diet"]} className="space-y-4">
                        <AccordionItem value="balance" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 overflow-hidden">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <span className="text-base font-bold text-gray-900 dark:text-gray-100">Cân bằng dinh dưỡng</span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-3">
                                {["Cân bằng", "Vừa phải", "Nuông chiều"].map((type) => (
                                    <div key={type} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleBalance(type)}>
                                        <Checkbox
                                            id={`balance-${type}`}
                                            checked={selectedBalances.includes(type)}
                                            onCheckedChange={() => toggleBalance(type)}
                                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 border-gray-200 w-5 h-5 rounded-md transition-all"
                                        />
                                        <label
                                            htmlFor={`balance-${type}`}
                                            className="text-gray-500 dark:text-gray-400 font-medium group-hover:text-orange-500 transition-colors cursor-pointer select-none flex-1"
                                        >
                                            {type}
                                        </label>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="diet" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 overflow-hidden">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <span className="text-base font-bold text-gray-900 dark:text-gray-100">Chế độ ăn</span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-3">
                                {["Thuần chay", "Keto", "Ít carb", "Eat Clean"].map((type) => (
                                    <div key={type} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleDiet(type)}>
                                        <Checkbox
                                            id={`diet-${type}`}
                                            checked={selectedDiets.includes(type)}
                                            onCheckedChange={() => toggleDiet(type)}
                                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 border-gray-200 w-5 h-5 rounded-md transition-all"
                                        />
                                        <label
                                            htmlFor={`diet-${type}`}
                                            className="text-gray-500 font-medium group-hover:text-orange-500 transition-colors cursor-pointer select-none flex-1"
                                        >
                                            {type}
                                        </label>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="allergies" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 overflow-hidden">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <span className="text-base font-bold text-gray-900 dark:text-gray-100">Loại trừ dị ứng</span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-3">
                                {["Hải sản", "Đậu phộng", "Sữa", "Trứng", "Gluten", "Đậu nành", "Lúa mì", "Hạt"].map((type) => (
                                    <div key={type} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleAllergy(type)}>
                                        <Checkbox
                                            id={`allergy-${type}`}
                                            checked={selectedAllergies.includes(type)}
                                            onCheckedChange={() => toggleAllergy(type)}
                                            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 border-gray-200 w-5 h-5 rounded-md transition-all"
                                        />
                                        <label
                                            htmlFor={`allergy-${type}`}
                                            className="text-gray-500 font-medium group-hover:text-red-500 transition-colors cursor-pointer select-none flex-1"
                                        >
                                            {type}
                                        </label>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="flavor" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 overflow-hidden">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <span className="text-base font-bold text-gray-900 dark:text-gray-100">Hương vị</span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 flex flex-wrap gap-2">
                                {["Ngọt", "Chua", "Cay", "Mặn", "Đắng"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => toggleFlavor(type)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedFlavors.includes(type) ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>


                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Thực đơn của chúng tôi</h2>
                            <p className="text-gray-500 mt-1">Vui lòng chọn món ăn và đặt hàng ngay!</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sắp xếp theo:</span>
                            <button className="flex items-center gap-1 font-bold text-gray-900 dark:text-gray-100 hover:text-orange-500 transition-colors text-sm">
                                Liên quan <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>


                    {isLoading && (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Đang tải thực đơn...</p>
                        </div>
                    )}


                    {!isLoading && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item) => (
                                <Link href={`/dishes/${item.id}`} key={item.id} className="block group h-full">
                                    <Card className={`h-full overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 rounded-[2rem] flex flex-col p-0 gap-0 ${item.foodstatus === "Out of Stock" ? "grayscale opacity-60 relative after:absolute after:inset-0 after:bg-white/20 dark:after:bg-black/20 after:z-10" : ""}`}>

                                        <div className="relative aspect-[5/4] bg-gray-100 dark:bg-gray-800/50 overflow-hidden w-full">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                                    <UtensilsCrossed className="w-12 h-12" />
                                                </div>
                                            )}


                                            {item.foodstatus === "Out of Stock" ? (
                                                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-10 uppercase tracking-wide">
                                                    <Clock className="w-3 h-3 fill-current" />
                                                    Hết hàng
                                                </div>
                                            ) : item.aiReview?.tags && item.aiReview.tags.length > 0 && (
                                                <div className={`absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm z-10 uppercase tracking-wide`}>
                                                    <Zap className="w-3 h-3 fill-current" />
                                                    {item.aiReview.tags[0]}
                                                </div>
                                            )}
                                        </div>


                                        <CardContent className="p-6 pb-4 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-orange-500 transition-colors line-clamp-1 leading-tight">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                                    <span className="text-orange-500 text-[10px]">★</span>
                                                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{item.rating}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed flex-1">
                                                {item.desc}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-2 mb-5">
                                                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-[10px] font-bold">
                                                    <Flame className="w-3 h-3" />
                                                    {item.calories}
                                                </div>
                                                {item.time && (
                                                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-2 py-1 rounded-md text-[10px] font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        {item.time}
                                                    </div>
                                                )}
                                                {item.categories && item.categories.length > 0 && (
                                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold">
                                                        <UtensilsCrossed className="w-3 h-3" />
                                                        {item.categories.length} Danh mục
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50 dark:border-gray-800/50">
                                                <div className="font-bold text-xl text-orange-600">{item.price}</div>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    disabled={item.foodstatus === "Out of Stock"}
                                                    className={`h-10 w-10 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 hover:bg-black hover:text-white dark:hover:bg-orange-500 dark:hover:border-orange-500 hover:border-black transition-all shadow-sm group-hover:shadow-md ${item.foodstatus === "Out of Stock" ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : ""}`}
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Không tìm thấy món ăn</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                                {dishes.length === 0
                                    ? "Thực đơn hiện đang trống. Vui lòng truy cập Bảng quản trị để thêm món mới."
                                    : "Chúng tôi không tìm thấy món ăn nào phù hợp với bộ lọc của bạn."}
                            </p>
                            {dishes.length > 0 && (
                                <Button
                                    onClick={() => { setSelectedCategory("All"); setSelectedBalances([]) }}
                                    className="rounded-full px-8 bg-black text-white hover:bg-gray-800"
                                >
                                    Xóa tất cả bộ lọc
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div >
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        }>
            <MenuContent />
        </Suspense>
    );
}
