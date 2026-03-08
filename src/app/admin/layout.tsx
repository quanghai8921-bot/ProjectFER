"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    UtensilsCrossed,
    ShoppingBag,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Search,
    Bell,
    Star,
    Ticket,
    Sun,
    Moon,
    Menu,
    X,
    Utensils
} from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { theme, toggleTheme } = useTheme()
    const router = useRouter()
    const pathname = usePathname()
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault()
        await fetch('/api/auth/logout', { method: 'POST' })
        localStorage.removeItem('user')
        window.dispatchEvent(new Event("authChange"))
        router.push('/auth/login')
    }

    const isActive = (path: string) => pathname === path

    return (
        <div className="flex min-h-screen bg-[#FDFDFD] dark:bg-gray-950 transition-colors duration-300">
            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Mobile) */}
            <aside className={`fixed left-0 top-0 z-50 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    <Link href="/admin" className="flex items-center gap-3 mb-10">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <UtensilsCrossed className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">SmartBite Admin</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Giao hàng Thực phẩm Khỏe mạnh</span>
                        </div>
                    </Link>

                    <nav className="space-y-1">
                        <Link
                            href="/admin"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin')
                                ? 'bg-orange-500 text-white shadow-lg dark:shadow-orange-900/40'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            <span className="font-medium">Tổng quan</span>
                        </Link>

                        <Link
                            href="/admin/menu"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/menu')
                                ? 'bg-orange-500 text-white shadow-lg dark:shadow-orange-900/40'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <UtensilsCrossed className="h-5 w-5" />
                            <span className="font-medium">Quản lý Thực đơn</span>
                        </Link>

                        <Link
                            href="/admin/orders"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/orders')
                                ? 'bg-orange-500 text-white shadow-lg dark:shadow-orange-900/40'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            <span className="font-medium">Quản lý Đơn hàng</span>
                        </Link>

                        <Link
                            href="/admin/customers"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/customers')
                                ? 'bg-orange-500 text-white shadow-lg dark:shadow-orange-900/40'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <Users className="h-5 w-5" />
                            <span className="font-medium">Dữ liệu Khách hàng</span>
                        </Link>

                        <Link
                            href="/admin/reports"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/reports')
                                ? 'bg-orange-500 text-white shadow-lg dark:shadow-orange-900/40'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span className="font-medium">Báo cáo</span>
                        </Link>

                        <Link
                            href="/admin/reviews"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/reviews')
                                ? 'bg-orange-500 text-white shadow-lg dark:shadow-orange-900/40'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <Star className="h-5 w-5" />
                            <span className="font-medium">Đánh giá Khách hàng</span>
                        </Link>

                        <Link
                            href="/admin/vouchers"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/vouchers')
                                ? 'bg-orange-500 text-white shadow-lg dark:shadow-orange-900/40'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <Ticket className="h-5 w-5" />
                            <span className="font-medium">Quản lý Khuyến mãi</span>
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-4">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-700">
                            <AvatarImage src="/images/avatar-placeholder.jpg" />
                            <AvatarFallback>AR</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">Quang Vinh</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Quản trị viên tối cao</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors w-full px-2"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>


            <div className="lg:ml-72 flex-1 flex flex-col min-h-screen">

                <header className="bg-white dark:bg-gray-900 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-50 dark:border-gray-800 sticky top-0 z-30 transition-colors">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 lg:hidden rounded-lg"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                            {isActive('/admin') ? 'Tổng quan' :
                                isActive('/admin/menu') ? 'Thực đơn' :
                                    isActive('/admin/orders') ? 'Đơn hàng' :
                                        isActive('/admin/customers') ? 'Khách hàng' :
                                            isActive('/admin/reports') ? 'Báo cáo' :
                                                isActive('/admin/reviews') ? 'Đánh giá' :
                                                    isActive('/admin/vouchers') ? 'Voucher' : 'Quản trị'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">


                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                                title={theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
                            >
                                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            </button>
                            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 bg-[#FDFDFD] dark:bg-gray-950 transition-colors">
                    {children}
                </main>
            </div >
        </div >
    )
}
