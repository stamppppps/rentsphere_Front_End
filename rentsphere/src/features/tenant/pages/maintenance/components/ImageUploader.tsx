import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange, maxImages = 5 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length + images.length > maxImages) {
      alert(`คุณสามารถอัปโหลดรูปภาพได้สูงสุด ${maxImages} รูป`);
      return;
    }

    const newImages: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          onChange([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">แนบรูปประกอบ</label>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          {images.length} / {maxImages} รูป
        </span>
      </div>
      <p className="text-[10px] text-gray-400">สูงสุด {maxImages} รูป (จำกัด 5MB/รูป)</p>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
            <img src={img} alt={`upload-${index}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-all group"
          >
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Camera size={20} className="text-gray-400 group-hover:text-blue-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-800">กดที่นี่เพื่อเพิ่มรูปภาพ</span>
            <span className="text-[9px] text-gray-400 mt-0.5">ช่วยให้ช่างเตรียมอุปกรณ์ได้แม่นยำขึ้น</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
