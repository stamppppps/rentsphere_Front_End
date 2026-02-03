import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && file.size <= 3 * 1024 * 1024) { // 3 MB limit
      setFileName(file.name);
      onFileSelect(file);
    } else if (file) {
      alert('File size should not exceed 1 MB.');
      setFileName(null);
      onFileSelect(null);
       if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        โลโก้คอนโดมิเนียม
      </label>
      <div
        onClick={handleAreaClick}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-sky-500"
      >
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-600">
            <span className="relative rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none">
              เลือกรูปโลโก้
            </span>
            <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
          </div>
          <p className="text-xs text-gray-500">
            {fileName ? fileName : "รองรับไฟล์รูปภาพ .jpg, .png, .gif ไม่เกิน 3 mb"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
