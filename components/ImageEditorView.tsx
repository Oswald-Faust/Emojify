import React, { useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../src/context/AppContext';
import { AlertCircle, Image as ImageIcon, Sparkles } from 'lucide-react';
import { AppState } from '../types';
import { ImageEditor } from './ImageEditor';

export const ImageEditorView: React.FC = () => {
  const navigate = useNavigate();
  const { imageId } = useParams<{ imageId: string }>();
  const { galleryItems, generatedImage, setGeneratedImage, isLoadingGallery, appState, setAppState, isPro } = useApp();

  // S'assurer que l'appState n'est pas en PROCESSING quand on arrive sur l'éditeur
  useEffect(() => {
    if (appState === AppState.PROCESSING) {
      // Si on est en train de générer, on ne devrait pas être dans l'éditeur
      // Réinitialiser l'état pour éviter les conflits
      setAppState(AppState.IDLE);
    }
  }, [appState, setAppState]);

  // Trouver l'image dans la galerie ou utiliser l'image générée actuelle
  const imageToEdit = useMemo(() => {
    if (imageId) {
      // Chercher dans la galerie
      const galleryItem = galleryItems.find(item => item.id === imageId);
      if (galleryItem) {
        return galleryItem.generatedImage;
      }
    }
    // Fallback sur l'image générée actuelle
    return generatedImage;
  }, [imageId, galleryItems, generatedImage]);

  // Attendre que la galerie soit chargée uniquement si on cherche une image spécifique
  // Si on a déjà une image générée, on peut l'utiliser directement
  if (isLoadingGallery && imageId && !imageToEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-50 animate-pulse rounded-full"></div>
          <div className="relative w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-primary/20">
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 text-secondary w-6 h-6 animate-pulse" />
          <Sparkles className="absolute bottom-0 -left-3 text-accent w-5 h-5 animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chargement de l'éditeur...</h2>
        <p className="text-gray-500">Préparation de votre image</p>
      </div>
    );
  }

  // Si pas d'image à éditer, rediriger vers /app
  if (!imageToEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="text-red-500 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Image introuvable</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          {imageId 
            ? "L'image demandée n'a pas été trouvée dans votre galerie."
            : "Vous devez d'abord générer une image avant de pouvoir la modifier."}
        </p>
        <button
          onClick={() => navigate('/app')}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primaryDark transition-colors"
        >
          Créer une image
        </button>
      </div>
    );
  }

  return (
    <ImageEditor
      imageUrl={imageToEdit}
      imageId={imageId || undefined}
      isPro={isPro || false}
      onSave={(editedImageUrl) => {
        setGeneratedImage(editedImageUrl);
        navigate(-1); // Retour à la page précédente
      }}
      onClose={() => navigate(-1)} // Retour à la page précédente
    />
  );
};

