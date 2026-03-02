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
                    <h1 className="text-3xl font-bold text-gray-900">Dữ liệu khách hàng</h1>
                    <p className="text-gray-500 mt-1">Quản lý thông tin khách hàng</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <h3 className="font-bold text-gray-900 text-lg">Danh sách khách hàng đăng kí ({customers.length})</h3>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm bởi tên, email, số điện thoại..."
                            className="pl-9 h-10 border-gray-200 bg-gray-50 focus-visible:ring-orange-100 rounded-xl"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold border-b border-gray-100">
                                <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Thông tin khách hàng</th>
                                <th className="px-6 py-4 whitespace-nowrap">Liên hệ</th>
                                <th className="px-6 py-4 whitespace-nowrap">Địa chỉ giao hàng</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Đơn hàng</th>
                                <th className="px-6 py-4 rounded-tr-xl whitespace-nowrap text-right">Tổng chi tiêu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500">
                                        Không tìm thấy khách hàng.
                                    </td>
                                </tr>
                            ) : null}
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{customer.name}</span>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="truncate max-w-[180px]">{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{customer.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-2 text-sm text-gray-600 max-w-[250px]">
                                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{customer.address || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold text-sm border border-orange-100">
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            {customer.orderCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-gray-900 text-lg">{formatPrice(customer.totalSpent)}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Value</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
