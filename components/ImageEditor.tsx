import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Image as FabricImage, Textbox, Circle, Rect, PencilBrush } from 'fabric';
import { 
  Download, 
  Undo, 
  Redo, 
  Type, 
  Circle as CircleIcon, 
  Square, 
  PenTool, 
  Eraser,
  Image as ImageIcon,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Send,
  Sparkles,
  X,
  Share2
} from 'lucide-react';
import { modifyImageWithAI } from '../services/imageModificationService';

interface ImageEditorProps {
  imageUrl: string;
  imageId?: string;
  onSave: (editedImageUrl: string) => void;
  onClose: () => void;
  isPro?: boolean;
}

type Tool = 'select' | 'brush' | 'text' | 'circle' | 'rect' | 'eraser' | 'image';

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, imageId, onSave, onClose, isPro = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const historyIndexRef = useRef(-1);
  const loadedImageUrlRef = useRef<string | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [brushWidth, setBrushWidth] = useState(10);
  const [brushColor, setBrushColor] = useState('#000000');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [showChatbot, setShowChatbot] = useState(true);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialiser le canvas Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;

    // Si l'imageUrl n'a pas changé et le canvas existe déjà, juste re-rendre
    if (fabricCanvasRef.current && loadedImageUrlRef.current === imageUrl) {
      // Re-rendre le canvas pour s'assurer qu'il est visible
      fabricCanvasRef.current.renderAll();
      return;
    }

    // Ne pas afficher le loader, charger en arrière-plan
    setLoadError(null);

    // Nettoyer le canvas précédent s'il existe et si l'imageUrl a changé
    if (fabricCanvasRef.current && loadedImageUrlRef.current !== imageUrl) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    // Créer le canvas seulement s'il n'existe pas déjà
    if (!fabricCanvasRef.current) {
      const canvas = new Canvas(canvasRef.current, {
        width: 1200,
        height: 1200,
        backgroundColor: '#ffffff',
      });

      fabricCanvasRef.current = canvas;

      // Ajouter les event listeners une seule fois
      const updateHistory = () => {
        if (!fabricCanvasRef.current) return;
        const json = JSON.stringify(fabricCanvasRef.current.toJSON());
        setHistory(prev => {
          const newHistory = prev.slice(0, historyIndexRef.current + 1);
          newHistory.push(json);
          const newIndex = newHistory.length - 1;
          historyIndexRef.current = newIndex;
          setHistoryIndex(newIndex);
          return newHistory;
        });
      };

      canvas.on('path:created', updateHistory);
      canvas.on('object:added', updateHistory);
      canvas.on('object:modified', updateHistory);
    }

    const canvas = fabricCanvasRef.current;

    // Calculer la taille du canvas en fonction de la taille de l'écran
    const updateCanvasSize = () => {
      if (!fabricCanvasRef.current) return;
      const container = canvasRef.current?.parentElement;
      if (!container) return;
      
      // Utiliser plus d'espace disponible
      const maxWidth = Math.min(1200, container.clientWidth - 16);
      const maxHeight = Math.min(1200, window.innerHeight - 150);
      const size = Math.min(maxWidth, maxHeight);
      
      fabricCanvasRef.current.setDimensions({
        width: size,
        height: size
      });
      fabricCanvasRef.current.renderAll();
    };

    // Ajuster la taille du canvas immédiatement
    updateCanvasSize();

    // Variable pour annuler le chargement si le composant est démonté
    let isCancelled = false;

    // Ne charger l'image que si elle n'est pas déjà chargée
    if (loadedImageUrlRef.current !== imageUrl) {
      // Charger l'image avec gestion d'erreur
      FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous'
      })
      .then((img) => {
        if (isCancelled || !fabricCanvasRef.current) return;
        
        // Ajuster la taille du canvas d'abord
        updateCanvasSize();
        
        // Ajuster la taille de l'image pour qu'elle s'adapte au canvas
        const scale = Math.min(
          (canvas.width! - 40) / img.width!,
          (canvas.height! - 40) / img.height!
        );
        img.scale(scale);
        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        
        // Sauvegarder l'état initial
        const json = JSON.stringify(canvas.toJSON());
        setHistory([json]);
        historyIndexRef.current = 0;
        setHistoryIndex(0);
        
        // Marquer cette imageUrl comme chargée
        loadedImageUrlRef.current = imageUrl;
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error('Erreur lors du chargement de l\'image:', error);
        setLoadError('Impossible de charger l\'image. Veuillez réessayer.');
      });
    }

    // Écouter les changements de taille de fenêtre
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', updateCanvasSize);
      // Ne pas disposer le canvas si c'est juste un re-render avec la même imageUrl
      // Le canvas sera nettoyé seulement si l'imageUrl change vraiment
    };
  }, [imageUrl]);

  // Synchroniser la ref avec l'état historyIndex
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Mettre à jour le pinceau quand les paramètres changent
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    
    if (currentTool === 'brush') {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = brushWidth;
        canvas.freeDrawingBrush.color = brushColor;
      }
    } else {
      canvas.isDrawingMode = false;
    }
  }, [currentTool, brushWidth, brushColor]);

  // Changer la couleur de fond de l'image (pas du canvas)
  const changeBackgroundColor = (color: string) => {
    if (!fabricCanvasRef.current) return;
    setBackgroundColor(color);
    
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    
    // Chercher le rectangle de fond ou l'image principale
    const mainImage = objects.find(obj => obj.type === 'image');
    
    if (mainImage) {
      // Chercher un rectangle de fond existant
      let bgRect = objects.find(obj => obj.type === 'rect' && obj.name === 'background');
      
      if (!bgRect) {
        // Créer un rectangle de fond
        bgRect = new Rect({
          left: mainImage.left,
          top: mainImage.top,
          width: mainImage.getScaledWidth(),
          height: mainImage.getScaledHeight(),
          fill: color,
          selectable: true,
          name: 'background',
          originX: 'center',
          originY: 'center',
        });
        canvas.add(bgRect);
        // Mettre le rectangle derrière l'image
        canvas.sendToBack(bgRect);
      } else {
        // Mettre à jour la couleur du rectangle existant
        bgRect.set('fill', color);
      }
    }
    
    canvas.renderAll();
    const json = JSON.stringify(canvas.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndexRef.current + 1);
      newHistory.push(json);
      const newIndex = newHistory.length - 1;
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      return newHistory;
    });
  };

  const undo = () => {
    if (historyIndex > 0 && fabricCanvasRef.current) {
      const newIndex = historyIndex - 1;
      fabricCanvasRef.current.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll();
        historyIndexRef.current = newIndex;
      });
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && fabricCanvasRef.current) {
      const newIndex = historyIndex + 1;
      fabricCanvasRef.current.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll();
        historyIndexRef.current = newIndex;
      });
      setHistoryIndex(newIndex);
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new Textbox('Tapez votre texte', {
      left: fabricCanvasRef.current.width! / 2,
      top: fabricCanvasRef.current.height! / 2,
      width: 200,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: fontFamily,
      originX: 'center',
      originY: 'center',
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    const circle = new Circle({
      left: fabricCanvasRef.current.width! / 2,
      top: fabricCanvasRef.current.height! / 2,
      radius: 50,
      fill: brushColor,
      stroke: brushColor,
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const addRect = () => {
    if (!fabricCanvasRef.current) return;
    const rect = new Rect({
      left: fabricCanvasRef.current.width! / 2,
      top: fabricCanvasRef.current.height! / 2,
      width: 100,
      height: 100,
      fill: brushColor,
      stroke: brushColor,
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const handleEraser = () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(json);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const zoomIn = () => {
    if (!fabricCanvasRef.current) return;
    const zoom = fabricCanvasRef.current.getZoom();
    fabricCanvasRef.current.setZoom(Math.min(zoom * 1.2, 5));
    fabricCanvasRef.current.renderAll();
  };

  const zoomOut = () => {
    if (!fabricCanvasRef.current) return;
    const zoom = fabricCanvasRef.current.getZoom();
    fabricCanvasRef.current.setZoom(Math.max(zoom / 1.2, 0.1));
    fabricCanvasRef.current.renderAll();
  };

  const rotate = () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.rotate((activeObject.angle || 0) + 90);
      fabricCanvasRef.current.renderAll();
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(json);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const flipHorizontal = () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.set('flipX', !activeObject.flipX);
      fabricCanvasRef.current.renderAll();
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(json);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const flipVertical = () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.set('flipY', !activeObject.flipY);
      fabricCanvasRef.current.renderAll();
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(json);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const handleSave = () => {
    if (!fabricCanvasRef.current) return;
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });
    onSave(dataURL);
  };

  const handleShare = async () => {
    if (!imageId) return;
    
    const shareUrl = `${window.location.origin}/app/edit/${imageId}`;
    
    try {
      // Essayer d'utiliser l'API Web Share si disponible
      if (navigator.share) {
        await navigator.share({
          title: 'Partager cette image',
          text: 'Venez voir cette image modifiée !',
          url: shareUrl,
        });
      } else {
        // Fallback : copier dans le presse-papiers
        await navigator.clipboard.writeText(shareUrl);
        alert('Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      // Si l'utilisateur annule le partage ou si ça échoue, copier dans le presse-papiers
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Lien copié dans le presse-papiers !');
      } catch (clipboardError) {
        console.error('Erreur lors de la copie:', clipboardError);
        alert('Impossible de copier le lien. Veuillez le copier manuellement : ' + shareUrl);
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessingAI || !fabricCanvasRef.current) return;

    const userMessage = chatInput.trim().toLowerCase();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsProcessingAI(true);

    try {
      // Analyser la demande et appliquer les modifications directement sur le canvas
      let modified = false;

      // Changer la couleur de fond
      if (userMessage.includes('fond') || userMessage.includes('background') || userMessage.includes('arrière-plan')) {
        const colors: { [key: string]: string } = {
          'bleu': '#3B82F6',
          'blue': '#3B82F6',
          'rouge': '#EF4444',
          'red': '#EF4444',
          'vert': '#10B981',
          'green': '#10B981',
          'jaune': '#FBBF24',
          'yellow': '#FBBF24',
          'rose': '#EC4899',
          'pink': '#EC4899',
          'violet': '#8B5CF6',
          'purple': '#8B5CF6',
          'orange': '#F97316',
          'noir': '#000000',
          'black': '#000000',
          'blanc': '#FFFFFF',
          'white': '#FFFFFF',
          'gris': '#6B7280',
          'gray': '#6B7280',
          'turquoise': '#14B8A6',
          'cyan': '#06B6D4',
        };

        for (const [colorName, colorCode] of Object.entries(colors)) {
          if (userMessage.includes(colorName)) {
            changeBackgroundColor(colorCode);
            modified = true;
            setChatMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `J'ai changé la couleur de fond en ${colorName} !` 
            }]);
            break;
          }
        }
      }

      // Si aucune modification n'a été appliquée, utiliser l'IA pour des modifications complexes
      if (!modified) {
        // Obtenir l'image actuelle du canvas
        const currentImageData = fabricCanvasRef.current.toDataURL({
          format: 'png',
          quality: 1,
        });

        // Appeler le service de modification IA
        const modifiedImageUrl = await modifyImageWithAI(currentImageData, userMessage);
        
        // Remplacer l'image sur le canvas
        const objects = fabricCanvasRef.current.getObjects();
        const imageObject = objects.find(obj => obj.type === 'image');
        
        if (imageObject) {
          FabricImage.fromURL(modifiedImageUrl).then((newImg) => {
            const scale = Math.min(
              (fabricCanvasRef.current!.width! - 40) / newImg.width!,
              (fabricCanvasRef.current!.height! - 40) / newImg.height!
            );
            newImg.scale(scale);
            newImg.set({
              left: imageObject.left,
              top: imageObject.top,
              originX: 'center',
              originY: 'center',
            });
            fabricCanvasRef.current!.remove(imageObject);
            fabricCanvasRef.current!.add(newImg);
            fabricCanvasRef.current!.setActiveObject(newImg);
            fabricCanvasRef.current!.renderAll();
            const json = JSON.stringify(fabricCanvasRef.current!.toJSON());
            setHistory(prev => {
              const newHistory = prev.slice(0, historyIndexRef.current + 1);
              newHistory.push(json);
              const newIndex = newHistory.length - 1;
              historyIndexRef.current = newIndex;
              setHistoryIndex(newIndex);
              return newHistory;
            });
          });
        }

        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `J'ai modifié l'image selon votre demande !` 
        }]);
      }
    } catch (error: any) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Désolé, une erreur s'est produite : ${error.message}` 
      }]);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Empêcher le scroll du body quand l'éditeur est ouvert
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-gray-900 z-[100] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            title="Menu outils"
          >
            <Layers className="w-5 h-5" />
          </button>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Éditeur d'Image</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {imageId && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
              title="Partager cette image"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Partager</span>
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 sm:gap-2 bg-primary hover:bg-primary/90 text-white px-3 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Enregistrer</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar gauche - Outils */}
        <div className={`${showLeftSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:static inset-y-0 left-0 z-[101] w-20 bg-gray-800 text-white flex flex-col items-center py-4 gap-2 overflow-y-auto transition-transform duration-300`}>
          <button
            onClick={() => setCurrentTool('select')}
            className={`p-3 rounded-lg transition ${currentTool === 'select' ? 'bg-primary' : 'hover:bg-gray-700'}`}
            title="Sélectionner"
          >
            <Layers className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentTool('brush')}
            className={`p-3 rounded-lg transition ${currentTool === 'brush' ? 'bg-primary' : 'hover:bg-gray-700'}`}
            title="Pinceau"
          >
            <PenTool className="w-5 h-5" />
          </button>
          <button
            onClick={addText}
            className={`p-3 rounded-lg transition ${currentTool === 'text' ? 'bg-primary' : 'hover:bg-gray-700'}`}
            title="Texte"
          >
            <Type className="w-5 h-5" />
          </button>
          <button
            onClick={addCircle}
            className={`p-3 rounded-lg transition ${currentTool === 'circle' ? 'bg-primary' : 'hover:bg-gray-700'}`}
            title="Cercle"
          >
            <CircleIcon className="w-5 h-5" />
          </button>
          <button
            onClick={addRect}
            className={`p-3 rounded-lg transition ${currentTool === 'rect' ? 'bg-primary' : 'hover:bg-gray-700'}`}
            title="Rectangle"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={handleEraser}
            className={`p-3 rounded-lg transition ${currentTool === 'eraser' ? 'bg-primary' : 'hover:bg-gray-700'}`}
            title="Gomme"
          >
            <Eraser className="w-5 h-5" />
          </button>
          <div className="border-t border-gray-700 my-2 w-full"></div>
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-3 rounded-lg transition hover:bg-gray-700 disabled:opacity-50"
            title="Annuler"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-3 rounded-lg transition hover:bg-gray-700 disabled:opacity-50"
            title="Refaire"
          >
            <Redo className="w-5 h-5" />
          </button>
          <div className="border-t border-gray-700 my-2 w-full"></div>
          <button
            onClick={zoomIn}
            className="p-3 rounded-lg transition hover:bg-gray-700"
            title="Zoomer"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={zoomOut}
            className="p-3 rounded-lg transition hover:bg-gray-700"
            title="Dézoomer"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={rotate}
            className="p-3 rounded-lg transition hover:bg-gray-700"
            title="Tourner"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={flipHorizontal}
            className="p-3 rounded-lg transition hover:bg-gray-700"
            title="Retourner horizontalement"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
          <button
            onClick={flipVertical}
            className="p-3 rounded-lg transition hover:bg-gray-700"
            title="Retourner verticalement"
          >
            <FlipVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Zone de travail centrale */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-2 sm:p-4 overflow-auto relative">
          <div className="bg-white rounded-lg shadow-2xl p-2 sm:p-3 w-full h-full flex items-center justify-center">
            <canvas ref={canvasRef} className="border border-gray-300 rounded"></canvas>
            
            {/* Message d'erreur */}
            {loadError && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-lg z-10">
                <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">Erreur de chargement</p>
                  <p className="text-gray-600">{loadError}</p>
                  <button
                    onClick={() => {
                      setLoadError(null);
                      // Forcer le rechargement
                      window.location.reload();
                    }}
                    className="mt-4 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bouton pour afficher la sidebar droite sur mobile */}
        {!showRightSidebar && (
          <button
            onClick={() => setShowRightSidebar(true)}
            className="lg:hidden fixed bottom-4 right-4 z-[102] bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition"
            title="Afficher les propriétés"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}

        {/* Sidebar droite - Propriétés et Chatbot */}
        <div className={`${showRightSidebar ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 absolute lg:static inset-y-0 right-0 z-[101] w-72 sm:w-80 bg-white border-l border-gray-200 flex flex-col transition-transform duration-300 shadow-xl lg:shadow-none`}>
          <div className="lg:hidden p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Propriétés</h3>
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Barre d'outils rapides */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Outils rapides</h3>
            
            <div className="space-y-3">
              {/* Couleur de fond */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Couleur de fond de l'image
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => changeBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => changeBackgroundColor(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              {/* Taille du pinceau */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Taille du pinceau: {brushWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Couleur du pinceau */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Couleur du pinceau
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Taille de police */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Taille du texte: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Police de texte */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Police du texte
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Impact">Impact</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                </select>
              </div>

              {/* Couleur du texte */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Couleur du texte
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot */}
          <div className="flex-1 flex flex-col border-t border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Assistant IA</h3>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRightSidebar(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded transition"
                  title="Fermer"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setShowChatbot(!showChatbot)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showChatbot ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>

            {showChatbot && (
              <>
                {!isPro ? (
                  <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
                    <div className="text-center max-w-xs">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">Assistant IA Premium</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        L'Assistant IA est réservé aux utilisateurs Mode Pro. Passez au Mode Pro pour débloquer cette fonctionnalité !
                      </p>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                      >
                        Passer au Mode Pro
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatMessages.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-8">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary opacity-50" />
                          <p>Dites-moi comment modifier votre image !</p>
                          <p className="text-xs mt-2">Exemple : "Change la couleur de fond en bleu"</p>
                        </div>
                      )}
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isProcessingAI && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg px-4 py-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Décrivez les modifications..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isProcessingAI}
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isProcessingAI}
                          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

