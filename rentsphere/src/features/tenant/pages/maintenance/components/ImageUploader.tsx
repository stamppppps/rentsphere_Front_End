import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

function cx(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
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
        <label className="text-[13px] font-black text-slate-700">แนบรูปประกอบ</label>
        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#EAF0FF] border border-blue-100/70 text-blue-700">
          {images.length} / {maxImages} รูป
        </span>
      </div>
      <div className="text-[11px] font-bold text-slate-400">สูงสุด {maxImages} รูป • ช่วยให้ช่างเตรียมอุปกรณ์ได้แม่นยำขึ้น</div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-blue-100/70 shadow-sm group">
            <img src={img} alt={`upload-${index}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1.5 right-1.5 p-1.5 bg-black/50 backdrop-blur text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cx(
              "aspect-square flex flex-col items-center justify-center",
              "border-2 border-dashed border-blue-200/70 rounded-2xl",
              "bg-[#F8FAFF] hover:bg-[#EEF3FF] hover:border-[#2F6BFF]/40",
              "transition-all group cursor-pointer"
            )}
          >
            <div className="w-10 h-10 bg-white rounded-xl border border-blue-100/70 shadow-inner flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Camera size={20} className="text-[#2F6BFF]" />
            </div>
            <span className="text-[10px] font-black text-slate-700">เพิ่มรูปภาพ</span>
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
