"use client"

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
    Ticket
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault()
        await fetch('/api/auth/logout', { method: 'POST' })
        localStorage.removeItem('user')
        window.dispatchEvent(new Event("authChange"))
        router.push('/auth/login')
    }

    const isActive = (path: string) => pathname === path

    return (
        <div className="flex min-h-screen bg-[#FDFDFD]">

            <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col">
                <div className="p-6">
                    <Link href="/admin" className="flex items-center gap-3 mb-10">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <UtensilsCrossed className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900 leading-none">SmartBite Admin</span>
                            <span className="text-xs text-gray-500 mt-1">Giao hàng Thực phẩm Khỏe mạnh</span>
                        </div>
                    </Link>

                    <nav className="space-y-1">
                        <Link
                            href="/admin"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin')
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            <span className="font-medium">Tổng quan</span>
                        </Link>

                        <Link
                            href="/admin/menu"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/menu')
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <UtensilsCrossed className="h-5 w-5" />
                            <span className="font-medium">Quản lý Thực đơn</span>
                        </Link>

                        <Link
                            href="/admin/orders"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/orders')
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            <span className="font-medium">Quản lý Đơn hàng</span>
                        </Link>

                        <Link
                            href="/admin/customers"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/customers')
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Users className="h-5 w-5" />
                            <span className="font-medium">Dữ liệu Khách hàng</span>
                        </Link>

                        <Link
                            href="/admin/reports"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/reports')
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span className="font-medium">Báo cáo</span>
                        </Link>

                        <Link
                            href="/admin/reviews"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/reviews')
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Star className="h-5 w-5" />
                            <span className="font-medium">Đánh giá Khách hàng</span>
                        </Link>

                        <Link
                            href="/admin/vouchers"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/vouchers')
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Ticket className="h-5 w-5" />
                            <span className="font-medium">Quản lý Khuyến mãi</span>
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                        <Avatar className="h-10 w-10 border-2 border-white">
                            <AvatarImage src="/images/avatar-placeholder.jpg" />
                            <AvatarFallback>AR</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">Quang Vinh</p>
                            <p className="text-xs text-gray-500 truncate">Quản trị viên tối cao</p>
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

                <header className="bg-white px-8 py-5 flex items-center justify-between border-b border-gray-50 sticky top-0 z-30">
                    <h1 className="text-2xl font-bold text-gray-900">Tổng quan Hệ thống</h1>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm đơn hàng, khách hàng..."
                                className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                                <Settings className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 bg-[#FDFDFD]">
                    {children}
                </main>
            </div>
        </div>
    )
}
