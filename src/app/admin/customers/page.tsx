"use client"

import { useState, useEffect } from "react"
import { Search, Users, Mail, Phone, Calendar, MapPin, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function CustomerData() {
    const [customers, setCustomers] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setCustomers(data.customers || []);
                }
            } catch (error) {
                console.error("Load Customers Error:", error);
            }
        }
        loadStats();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dữ liệu khách hàng</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý thông tin khách hàng</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Danh sách khách hàng đăng kí ({customers.length})</h3>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm bởi tên, email, số điện thoại..."
                            className="pl-9 h-10 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-orange-100 dark:text-gray-100 rounded-xl"
                        />
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm font-semibold border-b border-gray-100 dark:border-gray-800/50">
                                <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Thông tin khách hàng</th>
                                <th className="px-6 py-4 whitespace-nowrap">Liên hệ</th>
                                <th className="px-6 py-4 whitespace-nowrap">Địa chỉ giao hàng</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Đơn hàng</th>
                                <th className="px-6 py-4 rounded-tr-xl whitespace-nowrap text-right">Tổng chi tiêu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500">
                                        Không tìm thấy khách hàng.
                                    </td>
                                </tr>
                            ) : null}
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-gray-100">{customer.name}</span>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                                <span className="truncate max-w-[180px]">{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                                <span>{customer.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 max-w-[250px]">
                                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{customer.address || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-semibold text-sm border border-orange-100 dark:border-orange-800">
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            {customer.orderCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{formatPrice(customer.totalSpent)}</span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Value</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredCustomers.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            Không tìm thấy khách hàng.
                        </div>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <div key={customer.id} className="p-4 space-y-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{customer.name}</span>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                            <Calendar className="w-3 h-3" />
                                            <span>{customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-bold text-[10px] border border-orange-100 dark:border-orange-800">
                                        <ShoppingBag className="w-3 h-3" />
                                        {customer.orderCount} đơn
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Liên hệ</p>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                <Mail className="w-3 h-3 text-gray-400" />
                                                <span className="truncate max-w-[120px]">{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                <Phone className="w-3 h-3 text-gray-400" />
                                                <span>{customer.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tổng chi tiêu</p>
                                        <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{formatPrice(customer.totalSpent)}</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-50 dark:border-gray-800/50">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Địa chỉ giao hàng</p>
                                    <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{customer.address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
