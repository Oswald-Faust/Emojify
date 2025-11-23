
import React from 'react';
import { Download, RefreshCw, PlayCircle } from 'lucide-react';

interface VideoResultViewProps {
  originalImage: string;
  videoUrl: string;
  onReset: () => void;
}

export const VideoResultView: React.FC<VideoResultViewProps> = ({ originalImage, videoUrl, onReset }) => {
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `emojify-motion-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
          Action ! 🎬
        </h2>
        <p className="text-gray-600">Votre avatar est vivant !</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full mb-10">
        {/* Original */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative bg-white p-2 rounded-3xl ring-1 ring-gray-900/5 shadow-lg">
            <div className="w-48 h-48 rounded-2xl overflow-hidden relative">
              <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-bold py-1 text-center backdrop-blur-sm">
                SOURCE
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Icon for Desktop */}
        <div className="hidden md:flex text-gray-300">
           <svg className="w-10 h-10 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
        </div>

        {/* Generated Video */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur opacity-75 animate-pulse group-hover:opacity-100 transition duration-200"></div>
          <div className="relative bg-white p-2 rounded-3xl ring-1 ring-gray-900/5 shadow-2xl transform transition hover:scale-[1.02] duration-300">
            <div className="w-64 h-[22rem] rounded-2xl overflow-hidden relative bg-gray-900 flex items-center justify-center">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl active:scale-95"
        >
          <Download className="w-5 h-5" />
          Télécharger MP4
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-full font-bold shadow-sm transform transition hover:-translate-y-1 hover:shadow-md active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
          Autre animation
        </button>
      </div>
    </div>
  );
};
