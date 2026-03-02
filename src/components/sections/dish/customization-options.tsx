"use client"

import { useState } from "react"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Extra {
    name: string
    price: string
}

interface CustomizationOptionsProps {
    extras?: Extra[]
    selectedExtras: Record<number, boolean>
    onToggleExtra: (idx: number) => void
}

export function CustomizationOptions({ extras, selectedExtras, onToggleExtra }: CustomizationOptionsProps) {

    if (!extras || extras.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Tùy chọn thêm</h3>
            <div className="space-y-3">
                {extras.map((extra, idx) => {
                    const isSelected = !!selectedExtras[idx]
                    return (
                        <div
                            key={idx}
                            onClick={() => onToggleExtra(idx)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-100 hover:border-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                    isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                                )}>
                                    {isSelected && <Check className="w-3 h-3" />}
                                </div>
                                <span className="text-gray-700 font-medium">{extra.name}</span>
                            </div>
                            <span className="text-gray-900 font-semibold">
                                {extra.price}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
