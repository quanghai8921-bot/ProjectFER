"use client"

import { useState, useEffect } from "react"
import { formatVnDateTime } from "@/utils/date-utils"
import { Search, CheckCircle2, Bike } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function OrderManagement() {
    const [orders, setOrders] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")


    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await fetch('/api/orders', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const localOrders = data.orders || [];





                    const formatted = localOrders.map((o: any) => {
                        const statusMap: Record<number, string> = {
                            0: 'cancelled',
                            1: 'pending',
                            2: 'accepted',
                            3: 'preparing',
                            4: 'delivering',
                            5: 'completed'
                        };

                        const rawStatus = Number(o.orderstatus);
                        const status = statusMap[rawStatus] || 'pending';


                        const paymentInfo = Array.isArray(o.payments) ? (o.payments.length > 0 ? o.payments[0] : null) : o.payments;
                        const pStatus = paymentInfo?.paymentstatus || 'pending';

                        return {
                            id: o.orderid,
                            customer: o.users?.fullname || "Guest",
                            email: o.users?.email,
                            items: (o.orderitems || []).map((oi: any) => {
                                const tStr = oi.orderitemtoppings?.map((t: any) => t.toppingoptions?.toppingname).filter(Boolean).join(", ");
                                return oi.fooditems?.foodname + (tStr ? ` (+${tStr})` : "");
                            }).filter(Boolean).join(", ") || "No items",
                            price: new Intl.NumberFormat('vi-VN').format(o.finalamount || 0) + 'đ',
                            time: formatVnDateTime(o.ordertime),
                            status: status,
                            paymentStatus: pStatus,
                            avatar: "/images/avatar-placeholder.jpg"
                        };
                    });
                    setOrders(formatted);
                }
            } catch (error) {
                console.error("Load Orders Error:", error);
            }
        }

        loadOrders()


        const interval = setInterval(loadOrders, 5000)

        return () => clearInterval(interval)
    }, [])

    const updateOrderStatus = async (id: string, newStatus: string) => {
        try {
            const statusMap: Record<string, number> = {
                'cancelled': 0,
                'pending': 1,
                'accepted': 2,
                'preparing': 3,
                'delivering': 4,
                'completed': 5
            };

            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: statusMap[newStatus] ?? 1 })
            });

            if (res.ok) {
                const result = await res.json();
                console.log("Cập nhật thành công:", result);

                setOrders(prev => prev.map(order => order.id === id ? { ...order, status: newStatus } : order));

                window.location.reload();
            } else {
                const errData = await res.json();
                alert("Lỗi cập nhật: " + (errData.error || "Không rõ nguyên nhân") + "\n" + (errData.debug ? JSON.stringify(errData.debug) : ""));
            }
        } catch (error) {
            console.error("Cập nhật thất bại:", error);
            alert("Lỗi kết nối máy chủ.");
        }
    }

    const filteredOrders = orders.filter(o =>
        o.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý đơn hàng</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý đơn hàng và chấp nhận thanh toán</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Đơn hàng mới</h3>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm theo khách hàng hoặc ID..."
                            className="pl-10 bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-orange-500 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-gray-800">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tổng cộng</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Thời gian</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                                                    <img src={order.avatar} alt={order.customer} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{order.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{order.items}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-gray-900 dark:text-gray-100">{order.price}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{order.time}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={order.status} paymentStatus={order.paymentStatus} />
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <ActionButtons order={order} updateOrderStatus={updateOrderStatus} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <img src={order.avatar} alt={order.customer} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-gray-100">{order.customer}</div>
                                        </div>
                                    </div>
                                    <StatusBadge status={order.status} paymentStatus={order.paymentStatus} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Món:</span> {order.items}</div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.time}</div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{order.price}</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-50 dark:border-gray-800">
                                    <ActionButtons order={order} updateOrderStatus={updateOrderStatus} mobile />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper components to reduce duplication and improve readability
const StatusBadge = ({ status, paymentStatus }: { status: string, paymentStatus: string }) => {
    if (status === 'cancelled') return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">Đã hủy</span>
    );
    if (status === 'pending') return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${paymentStatus === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
            {paymentStatus === 'completed' ? 'Đã thanh toán' : 'Chờ thanh toán QR'}
        </span>
    );
    if (status === 'accepted') return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Đã xác nhận</span>
    );
    if (status === 'preparing') return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Đang chuẩn bị</span>
    );
    if (status === 'delivering') return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Đang giao hàng</span>
    );
    if (status === 'completed') return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Hoàn thành</span>
    );
    return null;
}

const ActionButtons = ({ order, updateOrderStatus, mobile = false }: { order: any, updateOrderStatus: any, mobile?: boolean }) => {
    const containerClasses = mobile ? "flex flex-row gap-2" : "flex flex-col gap-2 scale-90";
    const buttonClasses = mobile ? "flex-1 py-2.5" : "px-4 py-2";

    if (order.status === 'pending') {
        if (order.paymentStatus === 'completed') {
            return (
                <div className={containerClasses}>
                    <button onClick={() => updateOrderStatus(order.id, 'accepted')} className={`inline-flex items-center justify-center font-bold text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm ${buttonClasses}`}>Xác nhận đơn hàng</button>
                    <button onClick={() => { if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) updateOrderStatus(order.id, 'cancelled') }} className={`inline-flex items-center justify-center font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors ${buttonClasses}`}>Hủy đơn hàng</button>
                </div>
            )
        }
        return <span className="text-xs text-gray-400 font-medium italic">Đang chờ khách thanh toán</span>;
    }
    if (order.status === 'accepted') return (
        <div className={containerClasses}>
            <button onClick={() => updateOrderStatus(order.id, 'preparing')} className={`inline-flex items-center justify-center font-bold text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors shadow-sm ${buttonClasses}`}>Nấu món ăn</button>
        </div>
    );
    if (order.status === 'preparing') return (
        <div className={containerClasses}>
            <button onClick={() => updateOrderStatus(order.id, 'delivering')} className={`inline-flex items-center justify-center font-bold text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm ${buttonClasses}`}>Đang giao hàng</button>
        </div>
    );
    if (order.status === 'delivering') return (
        <div className="flex items-center justify-center gap-1.5 text-blue-600 text-sm font-bold"><Bike className="w-4 h-4" /> Đang giao hàng</div>
    );
    if (order.status === 'completed') return (
        <div className="flex items-center justify-center gap-1.5 text-purple-600 text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> Hoàn thành</div>
    );
    if (order.status === 'cancelled') return (
        <div className="flex items-center justify-center gap-1.5 text-red-600 text-sm font-bold opacity-60">Đã hủy</div>
    );
    return null;
}
