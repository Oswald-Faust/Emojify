import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative w-full max-w-md h-80 rounded-3xl border-4 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center cursor-pointer overflow-hidden group
        ${isDragging 
          ? 'border-secondary bg-secondary/10 scale-105 shadow-xl' 
          : 'border-gray-300 bg-white hover:border-primary/50 hover:bg-gray-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="bg-gradient-to-tr from-primary to-secondary p-5 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
        <Upload className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-700 mb-2">Charge ta photo</h3>
      <p className="text-gray-500 text-center px-8">
        Glisse et dépose ta photo ici, ou clique pour parcourir.
      </p>
      
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};
