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
  X
} from 'lucide-react';
import { modifyImageWithAI } from '../services/imageModificationService';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onClose: () => void;
}

type Tool = 'select' | 'brush' | 'text' | 'circle' | 'rect' | 'eraser' | 'image';

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const historyIndexRef = useRef(-1);
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
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialiser le canvas Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;

    // Réinitialiser les états de chargement
    setIsLoading(true);
    setLoadError(null);

    // Nettoyer le canvas précédent s'il existe
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 800,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    // Calculer la taille du canvas en fonction de la taille de l'écran
    const updateCanvasSize = () => {
      if (!fabricCanvasRef.current) return;
      const container = canvasRef.current?.parentElement;
      if (!container) return;
      
      const maxWidth = Math.min(800, container.clientWidth - 32);
      const maxHeight = Math.min(800, window.innerHeight - 200);
      const size = Math.min(maxWidth, maxHeight);
      
      fabricCanvasRef.current.setDimensions({
        width: size,
        height: size
      });
      fabricCanvasRef.current.renderAll();
    };

    // Ajuster la taille du canvas immédiatement
    updateCanvasSize();

    // Charger l'image avec gestion d'erreur
    let isCancelled = false;
    
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
      setIsLoading(false);
    })
    .catch((error) => {
      if (isCancelled) return;
      console.error('Erreur lors du chargement de l\'image:', error);
      setLoadError('Impossible de charger l\'image. Veuillez réessayer.');
      setIsLoading(false);
    });

    // Écouter les changements de taille de fenêtre
    window.addEventListener('resize', updateCanvasSize);

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

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', updateCanvasSize);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
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
      const brush = canvas.freeDrawingBrush as PencilBrush;
      brush.width = brushWidth;
      brush.color = brushColor;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [currentTool, brushWidth, brushColor]);

  const undo = () => {
    if (historyIndex > 0 && fabricCanvasRef.current) {
      const newIndex = historyIndex - 1;
      fabricCanvasRef.current.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll();
      });
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && fabricCanvasRef.current) {
      const newIndex = historyIndex + 1;
      fabricCanvasRef.current.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll();
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
      fontFamily: 'Arial',
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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessingAI || !fabricCanvasRef.current) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsProcessingAI(true);

    try {
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
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(json);
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
          });
        });
      }

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `J'ai modifié l'image selon votre demande : "${userMessage}"` 
      }]);
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
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-auto relative">
          <div className="bg-white rounded-lg shadow-2xl p-2 sm:p-4 w-full max-w-full relative">
            <canvas ref={canvasRef} className="border border-gray-300 rounded max-w-full h-auto"></canvas>
            
            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-lg z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-700 font-medium">Chargement de l'image...</p>
                </div>
              </div>
            )}
            
            {/* Message d'erreur */}
            {loadError && !isLoading && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-lg z-10">
                <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">Erreur de chargement</p>
                  <p className="text-gray-600">{loadError}</p>
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      setLoadError(null);
                      // Forcer le rechargement en changeant légèrement l'imageUrl
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
          {/* Propriétés des outils */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Propriétés</h3>
            
            {currentTool === 'brush' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentTool === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille de police: {fontSize}px
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur du texte
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chatbot */}
          <div className="flex-1 flex flex-col border-t border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Assistant IA</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
};

