
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, ImageOff, Calendar, Play, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { GalleryItem } from '../types';

interface GalleryViewProps {
  items: GalleryItem[];
  onDelete: (id: string) => void;
  onNavigateToCreate: () => void;
}

export const GalleryView: React.FC = () => {
  const navigate = useNavigate();
  const { galleryItems, removeFromGallery } = useApp();
  
  // Backward compatibility for props if needed, but we use context now
  const items = galleryItems;
  const onDelete = removeFromGallery;
  const onNavigateToCreate = () => navigate('/app');

  const handleDownload = (item: GalleryItem) => {
    const link = document.createElement('a');
    if (item.mediaType === 'VIDEO' && item.videoUrl) {
      link.href = item.videoUrl;
      link.download = `emojify-motion-${item.createdAt}.mp4`;
    } else {
      link.href = item.generatedImage;
      link.download = `emojify-${item.createdAt}.png`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ImageOff className="text-gray-400 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre galerie est vide</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Vous n'avez pas encore généré d'émojis ou de vidéos. Créez votre premier chef-d'œuvre dès maintenant !
        </p>
        <button
          onClick={onNavigateToCreate}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primaryDark transition-colors"
        >
          Créer maintenant
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Ma Galerie</h2>
          <p className="text-gray-500">Retrouvez toutes vos créations photos et vidéos</p>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {items.length} création{items.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
            
            {/* Media Container */}
            <div className={`relative bg-gray-900 overflow-hidden ${item.mediaType === 'VIDEO' ? 'aspect-[9/16]' : 'aspect-square'}`}>
              
              {item.mediaType === 'VIDEO' && item.videoUrl ? (
                 <video 
                   src={item.videoUrl} 
                   className="w-full h-full object-cover"
                   muted
                   loop
                   onMouseOver={(e) => e.currentTarget.play()}
                   onMouseOut={(e) => e.currentTarget.pause()}
                 />
              ) : (
                 <img 
                   src={item.generatedImage} 
                   alt={`Generated ${item.style}`} 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 />
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 backdrop-blur-sm">
                <button 
                  onClick={() => handleDownload(item)}
                  className="p-3 bg-white text-gray-900 rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg transform hover:scale-110"
                  title="Télécharger"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-3 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-lg transform hover:scale-110"
                  title="Supprimer"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 backdrop-blur-md text-white text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1
                  ${item.mediaType === 'VIDEO' ? 'bg-purple-600/80' : 'bg-black/50'}
                `}>
                  {item.mediaType === 'VIDEO' ? <VideoIcon size={10} /> : <ImageIcon size={10} />}
                  {item.mediaType === 'VIDEO' ? 'MOTION' : item.style}
                </span>
              </div>
              
              {item.mediaType === 'VIDEO' && (
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur rounded-full p-1.5 text-white pointer-events-none">
                  <Play size={12} fill="currentColor" />
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="p-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                 <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(item.createdAt)}</span>
                 </div>
                 {item.mediaType === 'VIDEO' && <span className="text-purple-500 font-bold">{item.mood}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
