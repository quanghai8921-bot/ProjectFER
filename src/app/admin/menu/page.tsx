"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Utensils,
    Beef,
    Carrot,
    Egg,
    Fish,
    Wheat,
    Leaf,
    Drumstick,
    Coffee,
    Cake,
    Apple,
    Upload
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"


const INGREDIENT_ICONS = [
    { label: "General", value: "box", icon: Utensils },
    { label: "Meat", value: "meat", icon: Beef },
    { label: "Fruit", value: "fruit", icon: Apple },
    { label: "Veggie", value: "leaf", icon: Leaf },
    { label: "Egg", value: "egg", icon: Egg },
    { label: "Fish", value: "fish", icon: Fish },
    { label: "Grain", value: "wheat", icon: Wheat },
]

interface Ingredient {
    name: string
    amount: string
    icon: string
}

interface Extra {
    name: string
    price: string
}

interface Category {
    categoryid: string
    categoryname: string
}

interface Dish {
    id: string
    title: string
    desc: string
    rating: number
    calories: string
    time: string
    price: string
    slug: string
    image: string
    category: string
    dietaryBalance: string
    aiReview: {
        summary: string
        tags: string[]
    }
    ingredients: Ingredient[]
    extras: Extra[]
    diets: string[]
    allergies: string[]
    flavors: string[]
    foodstatus: string
}

const DEFAULT_DISH: Partial<Dish> = {
    title: "",
    desc: "",
    price: "",
    time: "",
    calories: "",
    image: "/images/bunchahanoi.jpg",
    rating: 5,
    category: "",
    dietaryBalance: "Cân bằng",
    aiReview: { summary: "", tags: [] },
    ingredients: [],
    extras: [],
    diets: [],
    allergies: [],
    flavors: [],
    foodstatus: "Available"
}

const FLAVORS = ["Ngọt", "Chua", "Cay", "Mặn", "Đắng"]
const DIETARY_BALANCE = ["Cân bằng", "Vừa phải", "Nuông chiều"]
const DIETS = ["Thuần chay", "Keto", "Ít carb", "Thực phẩm sạch"]
const ALLERGIES = ["Hải sản", "Đậu phộng", "Sữa", "Trứng", "Gluten", "Đậu nành", "Lúa mì", "Hạt"]
const PREDEFINED_TAGS = ["Nhiều Protein", "Ít béo", "Cân bằng Carb", "Nhiều chất xơ", "Ít đường", "Ít Calo"]

const CATEGORY_ICON_MAP: Record<string, any> = {
    "Món chính": Beef,
    "Main Course": Beef,
    "Sức khỏe": Leaf,
    "Healthy Food": Leaf,
    "Đồ uống": Coffee,
    "Drinks": Coffee,
    "Tráng miệng": Cake,
    "Dessert": Cake,
    "Mặc định": Utensils
}

const CATEGORY_NAME_TRANSLATIONS: Record<string, string> = {
    "Main Course": "Món chính",
    "Healthy Food": "Sức khỏe",
    "Drinks": "Đồ uống",
    "Dessert": "Tráng miệng",
    "Food": "Món ăn"
}

export default function MenuManagement() {
    const [dishes, setDishes] = useState<Dish[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newDish, setNewDish] = useState<Partial<Dish>>(DEFAULT_DISH)
    const [categories, setCategories] = useState<Category[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadError, setUploadError] = useState("")
    const [editingDishId, setEditingDishId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const supabase = createClient()

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            await Promise.all([fetchDishes(), fetchCategories()]);
            setIsLoading(false);
        };
        initData();
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories")
            if (res.ok) {
                const data: Category[] = await res.json()
                setCategories(data)

                if (data.length > 0 && !newDish.category) {
                } {
                    // Start with no categories or the first one if we want a default
                    // For multi-select, it might be better to start empty or with a default
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const fetchDishes = async () => {
        try {
            const res = await fetch("/api/dishes")
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setDishes(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setNewDish(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            setUploadError("")
        }
    }

    const handleAiReviewChange = (field: 'summary' | 'tags', value: any) => {
        setNewDish(prev => ({
            ...prev,
            aiReview: { ...prev.aiReview, [field]: value } as any
        }))
    }

    const toggleTag = (tag: string) => {
        const currentTags = newDish.aiReview?.tags || []
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag]
        handleAiReviewChange('tags', newTags)
    }


    const addIngredient = () => {
        setNewDish(prev => ({
            ...prev,
            ingredients: [...(prev.ingredients || []), { name: "", amount: "", icon: "box" }]
        }))
    }

    const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
        const updatedIngredients = [...(newDish.ingredients || [])]
        updatedIngredients[index] = { ...updatedIngredients[index], [field]: value }
        setNewDish(prev => ({ ...prev, ingredients: updatedIngredients }))
    }

    const removeIngredient = (index: number) => {
        const updatedIngredients = [...(newDish.ingredients || [])]
        updatedIngredients.splice(index, 1)
        setNewDish(prev => ({ ...prev, ingredients: updatedIngredients }))
    }


    const addExtra = () => {
        setNewDish(prev => ({
            ...prev,
            extras: [...(prev.extras || []), { name: "", price: "" }]
        }))
    }

    const updateExtra = (index: number, field: keyof Extra, value: string) => {
        const updatedExtras = [...(newDish.extras || [])]
        updatedExtras[index] = { ...updatedExtras[index], [field]: value }
        setNewDish(prev => ({ ...prev, extras: updatedExtras }))
    }

    const removeExtra = (index: number) => {
        const updatedExtras = [...(newDish.extras || [])]
        updatedExtras.splice(index, 1)
        setNewDish(prev => ({ ...prev, extras: updatedExtras }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setUploadError("")

        if (!newDish.category) {
            alert("Vui lòng chọn ít nhất một danh mục cho món ăn!");
            setIsSubmitting(false);
            return;
        }

        try {
            let imageUrl = newDish.image


            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
                const filePath = `${fileName}`

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('food-images')
                    .upload(filePath, selectedFile)

                if (uploadError) {
                    console.error("Lỗi upload ảnh chi tiết:", uploadError)
                    setUploadError(`Lỗi tải ảnh: ${uploadError.message || JSON.stringify(uploadError)}`)
                    setIsSubmitting(false)
                    return
                }


                const { data: publicUrlData } = supabase.storage
                    .from('food-images')
                    .getPublicUrl(filePath)

                imageUrl = publicUrlData.publicUrl
            }


            const finalDish = { ...newDish, image: imageUrl }

            const url = editingDishId ? `/api/dishes/${editingDishId}` : "/api/dishes"
            const method = editingDishId ? "PUT" : "POST"

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalDish)
            })

            if (res.ok) {
                alert(editingDishId ? "Cập nhật món ăn thành công!" : "Lưu món ăn thành công!");
                await fetchDishes()
                setIsDialogOpen(false)
                setNewDish(DEFAULT_DISH)
                setEditingDishId(null)
                setSelectedFile(null)
            } else {
                const errorData = await res.json();
                alert(`Lỗi khi lưu món ăn: ${errorData.error || "Không xác định"}`);
            }
        } catch (error: any) {
            console.error("Lỗi khi lưu món ăn:", error)
            alert(`Đã xảy ra lỗi: ${error.message || "Không thể kết nối với máy chủ"}`);
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/dishes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ foodstatus: newStatus })
            })
            if (res.ok) {
                setDishes(prev => prev.map(dish =>
                    dish.id === id ? { ...dish, foodstatus: newStatus } : dish
                ))
            } else {
                const errorData = await res.json()
                alert(`Lỗi: ${errorData.error || "Không thể cập nhật trạng thái"}`)
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái món ăn:", error)
            alert("Đã xảy ra lỗi khi kết nối với máy chủ")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa món ăn này?")) return;

        await handleUpdateStatus(id, 'Không có sẵn');
    }

    const filteredDishes = dishes.filter(dish =>
        dish.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Quản lý Thực đơn</h1>
                    <p className="text-gray-500 dark:text-gray-400">Quản lý các món ăn trong nhà hàng của bạn</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg shadow-orange-200 dark:shadow-none font-bold group"
                            onClick={() => {
                                setNewDish(DEFAULT_DISH);
                                setEditingDishId(null);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Thêm món mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh] dark:bg-gray-950 dark:border-gray-800">
                        <DialogHeader>
                            <DialogTitle>{editingDishId ? "Chỉnh sửa món ăn" : "Thêm món mới"}</DialogTitle>
                            <DialogDescription>
                                {editingDishId ? "Cập nhật chi tiết món ăn, nguyên liệu và các tùy chọn thêm." : "Tạo món ăn mới với các bộ lọc, nguyên liệu chi tiết và tùy chọn thêm."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-6 py-4">

                            <div className="grid gap-4">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 border-b dark:border-gray-800 pb-2">Thông tin cơ bản</h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="dark:text-gray-300">Tên món ăn</Label>
                                    <Input id="title" name="title" value={newDish.title} onChange={handleInputChange} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc" className="dark:text-gray-300">Mô tả</Label>
                                    <Input id="desc" name="desc" value={newDish.desc} onChange={handleInputChange} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="price" className="dark:text-gray-300">Giá</Label>
                                        <Input id="price" name="price" value={newDish.price} onChange={handleInputChange} placeholder="v.d. 50.000 đ" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="time" className="dark:text-gray-300">Thời gian chuẩn bị</Label>
                                        <Input id="time" name="time" value={newDish.time} onChange={handleInputChange} placeholder="v.d. 15-20 phút" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="calories" className="dark:text-gray-300">Calories</Label>
                                        <Input id="calories" name="calories" value={newDish.calories} onChange={handleInputChange} placeholder="v.d. 450 kcal" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="image">Hình ảnh món ăn</Label>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                            {selectedFile && (
                                                <p className="text-xs text-orange-600 font-medium">
                                                    Đã chọn: {selectedFile.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Danh mục</Label>
                                    <div className="space-y-2">
                                        {categories.length > 0 ? (
                                            categories.map(cat => {
                                                const isSelected = newDish.category === cat.categoryid
                                                const Icon = CATEGORY_ICON_MAP[cat.categoryname] || CATEGORY_ICON_MAP["Mặc định"]
                                                return (
                                                    <div
                                                        key={cat.categoryid}
                                                        onClick={() => {
                                                            setNewDish(prev => ({
                                                                ...prev,
                                                                category: cat.categoryid
                                                            }))
                                                        }}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                            ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-300'
                                                            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        <Icon className={`h-5 w-5 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                                                        <span className="font-medium">{CATEGORY_NAME_TRANSLATIONS[cat.categoryname] || cat.categoryname}</span>
                                                        {isSelected && <div className="ml-auto w-2 h-2 rounded-full bg-orange-500" />}
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500 italic pb-2">Không tìm thấy danh mục. Vui lòng thêm trong Supabase.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Cân bằng dinh dưỡng</Label>
                                    <div className="space-y-2">
                                        {DIETARY_BALANCE.map(balance => (
                                            <div key={balance} className="flex items-center space-x-2 p-2">
                                                <Checkbox
                                                    id={`balance-${balance}`}
                                                    checked={newDish.dietaryBalance === balance}
                                                    onCheckedChange={() => setNewDish(prev => ({ ...prev, dietaryBalance: balance }))}
                                                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-full h-5 w-5"
                                                />
                                                <label htmlFor={`balance-${balance}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                    {balance}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>



                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Chế độ ăn</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {DIETS.map(diet => (
                                            <div key={diet} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
                                                <Checkbox
                                                    id={`diet-${diet}`}
                                                    checked={newDish.diets?.includes(diet)}
                                                    onCheckedChange={() => {
                                                        const current = newDish.diets || []
                                                        setNewDish(prev => ({
                                                            ...prev,
                                                            diets: current.includes(diet) ? current.filter(d => d !== diet) : [...current, diet]
                                                        }))
                                                    }}
                                                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-full"
                                                />
                                                <label htmlFor={`diet-${diet}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                    {diet}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Dị ứng thực phẩm</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {ALLERGIES.map(allergy => (
                                            <div key={allergy} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
                                                <Checkbox
                                                    id={`allergy-${allergy}`}
                                                    checked={newDish.allergies?.includes(allergy)}
                                                    onCheckedChange={() => {
                                                        const current = newDish.allergies || []
                                                        setNewDish(prev => ({
                                                            ...prev,
                                                            allergies: current.includes(allergy) ? current.filter(a => a !== allergy) : [...current, allergy]
                                                        }))
                                                    }}
                                                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-full"
                                                />
                                                <label htmlFor={`allergy-${allergy}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                    {allergy}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Hương vị</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {FLAVORS.map(flavor => (
                                            <div key={flavor} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
                                                <Checkbox
                                                    id={`flavor-${flavor}`}
                                                    checked={newDish.flavors?.includes(flavor)}
                                                    onCheckedChange={() => {
                                                        const current = newDish.flavors || []
                                                        setNewDish(prev => ({
                                                            ...prev,
                                                            flavors: current.includes(flavor) ? current.filter(f => f !== flavor) : [...current, flavor]
                                                        }))
                                                    }}
                                                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-full"
                                                />
                                                <label htmlFor={`flavor-${flavor}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer dark:text-gray-300">
                                                    {flavor}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>


                            <div className="grid gap-4">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 border-b dark:border-gray-800 pb-2 flex items-center gap-2">
                                    SmartBite AI đánh giá
                                    <span className="text-xs font-normal text-orange-500 bg-orange-50 dark:bg-orange-900/40 px-2 py-0.5 rounded-full">Tự động</span>
                                </h3>
                                <div className="space-y-2">
                                    <Label>Dinh dưỡng</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {PREDEFINED_TAGS.map(tag => (
                                            <div key={tag} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800">
                                                <Checkbox
                                                    id={`tag-${tag}`}
                                                    checked={newDish.aiReview?.tags?.includes(tag)}
                                                    onCheckedChange={() => toggleTag(tag)}
                                                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                />
                                                <label htmlFor={`tag-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer dark:text-gray-300">
                                                    {tag}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="aiSummary">Tóm tắt AI</Label>
                                    <textarea
                                        id="aiSummary"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background dark:bg-gray-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-100"
                                        value={newDish.aiReview?.summary}
                                        onChange={(e) => handleAiReviewChange('summary', e.target.value)}
                                        placeholder="Mô tả đánh giá từ AI..."
                                    ></textarea>
                                </div>
                            </div>


                            <div className="grid gap-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nguyên liệu chính</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="text-orange-600 border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                        <Plus className="h-3 w-3 mr-1" /> Thêm
                                    </Button>
                                </div>
                                {newDish.ingredients?.map((ing, idx) => (
                                    <div key={idx} className="flex gap-3 items-end p-3 bg-gray-50 dark:bg-gray-900 rounded-lg relative group border border-transparent dark:border-gray-800">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Biểu tượng</Label>
                                            <select
                                                className="w-full h-9 rounded-md border border-input bg-white dark:bg-gray-900 dark:border-gray-700 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:text-gray-100"
                                                value={ing.icon}
                                                onChange={(e) => updateIngredient(idx, 'icon', e.target.value)}
                                            >
                                                {INGREDIENT_ICONS.map(icon => (
                                                    <option key={icon.value} value={icon.value}>{icon.label === 'Meat' ? 'Thịt' : icon.label === 'Fruit' ? 'Trái cây' : icon.label === 'Veggie' ? 'Rau củ' : icon.label === 'Egg' ? 'Trứng' : icon.label === 'Fish' ? 'Cá' : icon.label === 'Grain' ? 'Ngũ cốc' : 'Chung'}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-[2] space-y-1">
                                            <Label className="text-xs">Tên</Label>
                                            <Input value={ing.name} onChange={(e) => updateIngredient(idx, 'name', e.target.value)} placeholder="v.d. Cơm trắng" className="h-9 bg-white dark:bg-gray-900 dark:border-gray-700" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Số lượng</Label>
                                            <Input value={ing.amount} onChange={(e) => updateIngredient(idx, 'amount', e.target.value)} placeholder="150g" className="h-9 bg-white dark:bg-gray-900 dark:border-gray-700" />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(idx)} className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {(!newDish.ingredients || newDish.ingredients.length === 0) && (
                                    <p className="text-sm text-gray-500 italic text-center py-2">Chưa có nguyên liệu nào.</p>
                                )}
                            </div>


                            <div className="grid gap-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tùy chọn thêm</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addExtra} className="text-orange-600 border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                        <Plus className="h-3 w-3 mr-1" /> Thêm
                                    </Button>
                                </div>
                                {newDish.extras?.map((extra, idx) => (
                                    <div key={idx} className="flex gap-3 items-end p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-transparent dark:border-gray-800">
                                        <div className="flex-[2] space-y-1">
                                            <Label className="text-xs">Tên</Label>
                                            <Input value={extra.name} onChange={(e) => updateExtra(idx, 'name', e.target.value)} placeholder="v.d. Thêm sốt Teriyaki" className="h-9 bg-white dark:bg-gray-900 dark:border-gray-700" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Giá</Label>
                                            <Input value={extra.price} onChange={(e) => updateExtra(idx, 'price', e.target.value)} placeholder="+5.000 đ" className="h-9 bg-white dark:bg-gray-900 dark:border-gray-700" />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExtra(idx)} className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {(!newDish.extras || newDish.extras.length === 0) && (
                                    <p className="text-sm text-gray-500 italic text-center py-2">Chưa có tùy chọn thêm nào.</p>
                                )}
                            </div>

                            <DialogFooter className="mt-6 sticky bottom-0 bg-white dark:bg-gray-950 pt-2 border-t dark:border-gray-800 flex flex-col sm:flex-row gap-2">
                                <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto">
                                    {isSubmitting ? "Đang lưu..." : (editingDishId ? "Cập nhật món ăn" : "Lưu món ăn")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>


            </div>

            <Card className="border-gray-100 dark:border-gray-800/50 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Thực đơn</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm món ăn..."
                                className="pl-10 bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-orange-500 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4 text-gray-500">Đang tải...</div>
                    ) : (
                        <div className="rounded-lg border border-gray-100 dark:border-gray-800/50 overflow-hidden">
                            <table className="w-full text-sm text-left hidden md:table">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm font-semibold border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="p-4 text-left">Ảnh</th>
                                        <th className="p-4 text-left">Tên món</th>
                                        <th className="p-4 text-left">Danh mục</th>
                                        <th className="p-4 text-left">Giá</th>
                                        <th className="p-4 text-left">Trạng thái</th>
                                        <th className="p-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {filteredDishes.map((dish) => (
                                        <tr key={dish.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border-2 border-transparent dark:border-transparent shadow-sm">
                                                    <img src={dish.image || "/images/dishes/placeholder.jpg"} alt={dish.title} className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{dish.title}</span>
                                            </td>
                                            <td className="p-4">
                                                {(() => {
                                                    const cat = categories.find(
                                                        c => String(c.categoryid) === String(dish.category)
                                                    )
                                                    if (!cat) {
                                                        return <span className="text-gray-400 text-xs italic">Chưa chọn</span>
                                                    }

                                                    const catName =
                                                        CATEGORY_NAME_TRANSLATIONS[cat.categoryname] || cat.categoryname

                                                    return (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                                                            {catName}
                                                        </span>
                                                    )
                                                })()}
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400 font-medium">{dish.price}</td>
                                            <td className="p-4">
                                                <select
                                                    value={dish.foodstatus}
                                                    onChange={(e) => handleUpdateStatus(dish.id, e.target.value)}
                                                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border appearance-none focus:ring-2 focus:ring-orange-200 cursor-pointer outline-none transition-all shadow-sm
                                                        ${dish.foodstatus === "Available" ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50" :
                                                            dish.foodstatus === "Out of Stock" ? "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/50" : "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50"}`}
                                                >
                                                    <option value="Available" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Còn bán</option>
                                                    <option value="Out of Stock" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Hết hàng</option>
                                                    <option value="Unavailable" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Ngừng bán</option>
                                                </select>
                                            </td>

                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={async () => {
                                                            try {
                                                                const res = await fetch(`/api/dishes/${dish.id}`);
                                                                if (res.ok) {
                                                                    const fullDish = await res.json();
                                                                    setNewDish(fullDish);
                                                                    setEditingDishId(dish.id);
                                                                    setIsDialogOpen(true);
                                                                } else {
                                                                    alert("Không thể tải chi tiết món ăn.");
                                                                }
                                                            } catch (error) {
                                                                console.error("Error fetching dish details:", error);
                                                                alert("Đã xảy ra lỗi khi tải chi tiết món ăn.");
                                                            }
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredDishes.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500">
                                                Không tìm thấy món ăn nào phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Mobile Card Layout */}
                            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredDishes.map((dish) => (
                                    <div key={dish.id} className="p-4 space-y-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                                                <img src={dish.image || "/images/dishes/placeholder.jpg"} alt={dish.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{dish.title}</h4>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(() => {
                                                        const cat = categories.find(
                                                            c => String(c.categoryid) === String(dish.category)
                                                        )

                                                        if (!cat) {
                                                            return <span className="text-gray-400 text-[9px] italic">Chưa chọn</span>
                                                        }

                                                        const catName = CATEGORY_NAME_TRANSLATIONS[cat.categoryname] || cat.categoryname

                                                        return (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800/50 capitalize">
                                                                {catName}
                                                            </span>
                                                        )
                                                    })()}
                                                </div>
                                                <p className="text-orange-600 dark:text-orange-400 font-bold text-sm mt-1">{dish.price}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800/50">
                                            <select
                                                value={dish.foodstatus}
                                                onChange={(e) => handleUpdateStatus(dish.id, e.target.value)}
                                                className={`text-[10px] font-bold rounded-full px-2 py-1 border focus:ring-2 focus:ring-orange-200 cursor-pointer outline-none transition-colors
                                                    ${dish.foodstatus === "Available" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400" :
                                                        dish.foodstatus === "Out of Stock" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400"}`}
                                            >
                                                <option value="Available">Còn bán</option>
                                                <option value="Out of Stock">Hết hàng</option>
                                                <option value="Unavailable">Ngừng bán</option>
                                            </select>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600"
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`/api/dishes/${dish.id}`);
                                                            if (res.ok) {
                                                                const fullDish = await res.json();
                                                                setNewDish(fullDish);
                                                                setEditingDishId(dish.id);
                                                                setIsDialogOpen(true);
                                                            } else {
                                                                alert("Không thể tải chi tiết món ăn.");
                                                            }
                                                        } catch (error) {
                                                            console.error("Lỗi khi tải món ăn:", error);
                                                        }
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500"
                                                    onClick={() => handleDelete(dish.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
