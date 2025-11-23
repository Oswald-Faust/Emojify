import React from 'react';
import { Download, RefreshCw, Share2 } from 'lucide-react';

interface ResultViewProps {
  originalImage: string;
  generatedImage: string;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ originalImage, generatedImage, onReset }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `mon-emoji-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
          Tadaa ! Voici votre Emoji !
        </h2>
        <p className="text-gray-600">N'est-il pas magnifique ?</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full mb-10">
        {/* Original */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative bg-white p-2 rounded-3xl ring-1 ring-gray-900/5 shadow-lg">
            <div className="w-64 h-64 rounded-2xl overflow-hidden relative">
              <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-bold py-1 text-center backdrop-blur-sm">
                ORIGINAL
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Icon for Desktop */}
        <div className="hidden md:flex text-gray-300">
           <svg className="w-10 h-10 transform rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
        </div>

        {/* Generated Emoji */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur opacity-75 animate-pulse group-hover:opacity-100 transition duration-200"></div>
          <div className="relative bg-white p-2 rounded-3xl ring-1 ring-gray-900/5 shadow-2xl transform transition hover:scale-[1.02] duration-300">
            <div className="w-72 h-72 rounded-2xl overflow-hidden relative bg-gray-100">
              <img src={generatedImage} alt="Generated Emoji" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-sm font-bold py-2 text-center">
                VOTRE ÉMOJI
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-bold shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl active:scale-95"
        >
          <Download className="w-5 h-5" />
          Télécharger
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-full font-bold shadow-sm transform transition hover:-translate-y-1 hover:shadow-md active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
          Recommencer
        </button>
      </div>
    </div>
  );
};
