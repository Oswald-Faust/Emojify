import React from 'react';
import { AppState, View } from '../types';
import { ImageUploader } from './ImageUploader';
import { LoadingState } from './LoadingState';
import { ResultView } from './ResultView';
import { VideoResultView } from './VideoResultView';
import { ConfigPanel } from './ConfigPanel';
import { MotionPanel } from './MotionPanel';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../src/context/AppContext';

interface StudioProps {
  mode: 'image' | 'video';
}

export const Studio: React.FC<StudioProps> = ({ mode }) => {
  const {
    credits,
    appState,
    setAppState,
    originalImage,
    setOriginalImage,
    generatedImage,
    generatedVideo,
    error,
    setError,
    selectedStyle,
    setSelectedStyle,
    selectedMood,
    setSelectedMood,
    selectedMotion,
    setSelectedMotion,
    generateImage,
    generateVideo,
    resetGenerator
  } = useApp();

  const handleImageSelected = (base64: string) => {
    setOriginalImage(base64);
    setAppState(AppState.CONFIGURING);
    setError(null);
  };

  const handleGenerate = () => {
    if (mode === 'video') {
      generateVideo();
    } else {
      generateImage();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[10%] right-[10%] w-[300px] h-[300px] rounded-full blur-3xl ${mode === 'video' ? 'bg-purple-500/5' : 'bg-primary/5'}`}></div>
        <div className={`absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full blur-3xl ${mode === 'video' ? 'bg-indigo-500/5' : 'bg-secondary/5'}`}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        
        {/* App Header inside Studio */}
        {appState === AppState.IDLE && (
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              {mode === 'video' ? 'Motion Studio' : 'Photo Studio'}
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Il vous reste <span className="font-bold text-primary">{credits} crédits</span>.
              {mode === 'video' && " (Vidéos powered by Veo)"}
            </p>
          </div>
        )}

        {/* Content State Machine */}
        <div className="flex justify-center w-full">
          
          {appState === AppState.IDLE && (
            <div className="w-full max-w-lg">
               <ImageUploader onImageSelected={handleImageSelected} />
               
               {/* Steps Indicator */}
               <div className="mt-8 flex justify-center gap-8 opacity-50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">📸</div>
                    <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
                  </div>
                  <div className="h-12 border-r border-gray-300 rotate-12"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
                       {mode === 'video' ? '🎬' : '🎨'}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">
                       {mode === 'video' ? 'Action' : 'Style'}
                    </span>
                  </div>
               </div>
            </div>
          )}

          {appState === AppState.CONFIGURING && (
            <>
              {mode === 'video' ? (
                 <MotionPanel
                   selectedMotion={selectedMotion}
                   onMotionChange={setSelectedMotion}
                   onGenerate={handleGenerate}
                   onBack={() => setAppState(AppState.IDLE)}
                 />
              ) : (
                 <ConfigPanel 
                   selectedStyle={selectedStyle}
                   selectedMood={selectedMood}
                   onStyleChange={setSelectedStyle}
                   onMoodChange={setSelectedMood}
                   onGenerate={handleGenerate}
                   onBack={() => setAppState(AppState.IDLE)}
                 />
              )}
            </>
          )}

          {appState === AppState.PROCESSING && (
            <LoadingState />
          )}

          {appState === AppState.SUCCESS && originalImage && (
            <>
              {mode === 'video' && generatedVideo ? (
                 <VideoResultView
                   originalImage={originalImage}
                   videoUrl={generatedVideo}
                   onReset={resetGenerator}
                 />
              ) : generatedImage ? (
                 <ResultView 
                   originalImage={originalImage}
                   generatedImage={generatedImage}
                   onReset={resetGenerator}
                 />
              ) : null}
            </>
          )}

          {appState === AppState.ERROR && (
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-red-50 max-w-md animate-shake">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur de création</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button 
                onClick={() => setAppState(AppState.CONFIGURING)}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black w-full"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  );
};
