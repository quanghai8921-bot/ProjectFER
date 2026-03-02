"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
    images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0)

    return (
        <div className="flex flex-col gap-4">

            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 relative group">
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        AI khuyên dùng
                    </div>
                </div>
                <img
                    src={images[selectedImage]}
                    alt="Product image"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button className="absolute bottom-4 right-16 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                </button>
                <button className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
                </button>
            </div>


            <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                            "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                            selectedImage === index
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent hover:border-gray-200"
                        )}
                    >
                        <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}

                {images.length > 3 && (
                    <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                        +{images.length - 3} ảnh
                    </div>
                )}
            </div>
        </div>
    )
}
