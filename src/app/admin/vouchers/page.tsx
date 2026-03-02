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
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Ticket,
    Percent,
    Banknote,
    Clock,
    Calendar,
    CheckCircle2,
    XCircle
} from "lucide-react"

interface Voucher {
    voucherid: string
    vouchercode: string
    vouchertype: string
    discountvalue: number
    minordervalue: number
    maxusage: number | null
    startdate: string
    enddate: string
    isactive: number
}

const DEFAULT_VOUCHER: Partial<Voucher> = {
    vouchercode: "",
    vouchertype: "Ship",
    discountvalue: 0,
    minordervalue: 0,
    maxusage: null,
    startdate: new Date().toISOString().split('T')[0],
    enddate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isactive: 1
}

export default function VouchersManagement() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newVoucher, setNewVoucher] = useState<Partial<Voucher>>(DEFAULT_VOUCHER)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null)

    useEffect(() => {
        fetchVouchers()
    }, [])

    const fetchVouchers = async () => {
        try {
            setIsLoading(true)
            const res = await fetch("/api/vouchers")
            if (res.ok) {
                const data = await res.json()
                setVouchers(data)
            }
        } catch (error) {
            console.error("Error fetching vouchers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setNewVoucher(prev => ({ ...prev, [name]: value }))
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewVoucher(prev => ({ ...prev, [name]: value === "" ? null : Number(value) }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = editingVoucherId ? `/api/vouchers/${editingVoucherId}` : "/api/vouchers"
            const method = editingVoucherId ? "PATCH" : "POST"


            const dataToSubmit = {
                ...newVoucher,
                vouchercode: newVoucher.vouchercode?.toUpperCase()
            }


            if (dataToSubmit.startdate) {

                const dateStr = dataToSubmit.startdate.split('T')[0];
                dataToSubmit.startdate = `${dateStr}T00:00:00.000+07:00`;
            }
            if (dataToSubmit.enddate) {
                const dateStr = dataToSubmit.enddate.split('T')[0];
                dataToSubmit.enddate = `${dateStr}T23:59:59.999+07:00`;
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSubmit)
            })

            if (res.ok) {
                alert(editingVoucherId ? "Cập nhật voucher thành công!" : "Tạo voucher thành công!")
                fetchVouchers()
                setIsDialogOpen(false)
                setNewVoucher(DEFAULT_VOUCHER)
                setEditingVoucherId(null)
            } else {
                const errorData = await res.json()
                alert(`Lỗi: ${errorData.error || "Không xác định"}`)
            }
        } catch (error: any) {
            console.error("Gửi voucher lỗi", error)
            alert("Đã xảy ra lỗi khi kết nối với máy chủ")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa voucher này vĩnh viễn?")) return

        try {
            const res = await fetch(`/api/vouchers/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                setVouchers(prev => prev.filter(v => v.voucherid !== id))
            } else {
                alert("Lỗi khi xóa voucher")
            }
        } catch (error) {
            console.error("Lỗi khi xóa voucher:", error)
        }
    }

    const handleUpdateStatus = async (id: string, newIsActive: number) => {
        try {
            const res = await fetch(`/api/vouchers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isactive: newIsActive })
            })
            if (res.ok) {
                setVouchers(prev => prev.map(v =>
                    v.voucherid === id ? { ...v, isactive: newIsActive } : v
                ))
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Voucher</h1>
                    <p className="text-gray-500">Quản lý mã khuyến mãi và giảm giá</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200"
                            onClick={() => {
                                setNewVoucher(DEFAULT_VOUCHER);
                                setEditingVoucherId(null);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tạo Voucher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>{editingVoucherId ? "Cập nhật Voucher" : "Tạo Voucher Mới"}</DialogTitle>
                            <DialogDescription>
                                Thiết lập các quy tắc, giới hạn và giá trị cho mã khuyến mãi này.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="vouchercode" className="font-semibold text-gray-700">Mã Voucher</Label>
                                    <div className="relative">
                                        <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="vouchercode"
                                            name="vouchercode"
                                            placeholder="FREESHIP50"
                                            className="pl-9 bg-gray-50 uppercase font-mono"
                                            value={newVoucher.vouchercode}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="vouchertype" className="font-semibold text-gray-700">Loại Voucher</Label>
                                    <select
                                        id="vouchertype"
                                        name="vouchertype"
                                        className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newVoucher.vouchertype}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Ship">Miễn phí / Giảm phí vận chuyển (Ship)</option>
                                        <option value="Food">Giảm giá món ăn (Food)</option>
                                        <option value="Drink">Giảm giá thức uống (Drink)</option>
                                        <option value="All">Giảm giá toàn bộ đơn (All)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="discountvalue" className="font-semibold text-gray-700">Giá trị giảm giá (VNĐ)</Label>
                                    <div className="relative">
                                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="discountvalue"
                                            name="discountvalue"
                                            type="number"
                                            min="0"
                                            className="pl-9 bg-gray-50"
                                            value={newVoucher.discountvalue || ''}
                                            onChange={handleNumberChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="minordervalue" className="font-semibold text-gray-700">Giá trị đơn hàng tối thiểu (VNĐ)</Label>
                                    <div className="relative">
                                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="minordervalue"
                                            name="minordervalue"
                                            type="number"
                                            min="0"
                                            className="pl-9 bg-gray-50"
                                            value={newVoucher.minordervalue || ''}
                                            onChange={handleNumberChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="maxusage" className="font-semibold text-gray-700">Giới hạn sử dụng</Label>
                                <Input
                                    id="maxusage"
                                    name="maxusage"
                                    type="number"
                                    min="1"
                                    placeholder="100"
                                    className="bg-gray-50"
                                    value={newVoucher.maxusage || ''}
                                    onChange={handleNumberChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startdate" className="font-semibold text-gray-700">Ngày bắt đầu</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="startdate"
                                            name="startdate"
                                            type="date"
                                            className="pl-9 bg-gray-50"
                                            value={newVoucher.startdate?.split('T')[0] || ''}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="enddate" className="font-semibold text-gray-700">Ngày kết thúc</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="enddate"
                                            name="enddate"
                                            type="date"
                                            className="pl-9 bg-gray-50"
                                            value={newVoucher.enddate?.split('T')[0] || ''}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="isactive" className="font-semibold text-gray-700">Trạng thái</Label>
                                <select
                                    id="isactive"
                                    name="isactive"
                                    className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={newVoucher.isactive !== undefined ? newVoucher.isactive.toString() : "1"}
                                    onChange={(e) => setNewVoucher(prev => ({ ...prev, isactive: Number(e.target.value) }))}
                                >
                                    <option value="1">Hoạt động</option>
                                    <option value="0">Vô hiệu hóa</option>
                                </select>
                            </div>

                            <DialogFooter className="mt-6 pt-4 border-t border-gray-100">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white">
                                    {isSubmitting ? "Đang lưu..." : (editingVoucherId ? "Cập nhật Voucher" : "Tạo Voucher")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Tất cả Voucher</CardTitle>
                        <div className="relative w-64 hidden md:block">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Tìm kiếm mã..." className="pl-8 bg-gray-50 border-gray-200 focus-visible:ring-orange-500" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Đang tải voucher...</div>
                    ) : (
                        <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="p-4">Mã</th>
                                        <th className="p-4">Loại</th>
                                        <th className="p-4">Giảm giá</th>
                                        <th className="p-4">Đơn hàng tối thiểu</th>
                                        <th className="p-4">Lượt sử dụng/Giới hạn</th>
                                        <th className="p-4">Thời gian</th>
                                        <th className="p-4">Trạng thái</th>
                                        <th className="p-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vouchers.map((voucher) => (
                                        <tr key={voucher.voucherid} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900 bg-gray-100/80 inline-block px-2.5 py-1 rounded-md tracking-widest font-mono text-xs border border-gray-200">
                                                    {voucher.vouchercode}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${voucher.vouchertype === "Ship" ? "bg-blue-50 text-blue-700" :
                                                        voucher.vouchertype === "Food" ? "bg-orange-50 text-orange-700" :
                                                            voucher.vouchertype === "Drink" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-700"}`}
                                                >
                                                    {voucher.vouchertype}
                                                </span>
                                            </td>
                                            <td className="p-4 text-orange-600 font-bold">
                                                {formatCurrency(voucher.discountvalue)}
                                            </td>
                                            <td className="p-4 text-gray-600 font-medium">
                                                {formatCurrency(voucher.minordervalue)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-600 font-medium">
                                                    {(!voucher.maxusage || voucher.maxusage <= 0) ? "Đã hết" : `${voucher.maxusage} lượt`}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col text-xs text-gray-500 gap-1">
                                                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {formatDate(voucher.startdate)}</span>
                                                    <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> {formatDate(voucher.enddate)}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={voucher.isactive?.toString() || "0"}
                                                    onChange={(e) => handleUpdateStatus(voucher.voucherid, Number(e.target.value))}
                                                    className={`text-xs font-bold rounded-full px-2 py-1.5 border focus:ring-2 focus:ring-orange-200 cursor-pointer outline-none transition-colors
                                                        ${voucher.isactive === 1 ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" :
                                                            "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                                                >
                                                    <option value="1">Hoạt động</option>
                                                    <option value="0">Vô hiệu hóa</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => {
                                                            setNewVoucher(voucher);
                                                            setEditingVoucherId(voucher.voucherid);
                                                            setIsDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(voucher.voucherid)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {vouchers.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-gray-500">
                                                <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                Chưa có voucher nào. Tạo voucher để bắt đầu!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
