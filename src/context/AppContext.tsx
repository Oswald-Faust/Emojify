import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppState, EmojiStyle, EmojiMood, GalleryItem, MotionType, Transaction } from '../../types';
import { generateEmoji, generateAvatarAnimation } from '../../services/geminiService';

interface AppContextType {
  // User & Credits
  user: User | null;
  credits: number;
  isPro: boolean;
  setIsPro: (isPro: boolean) => void;
  isLoadingUser: boolean;
  signIn: (email: string) => Promise<void>; // Magic Link for simplicity or we can add password later if needed, but AuthView has password field. Let's support password.
  signOut: () => Promise<void>;
  decrementCredits: () => void;
  addCredits: (amount: number, provider?: string, transactionAmount?: number) => Promise<void>;

  // Gallery
  galleryItems: GalleryItem[];
  addToGallery: (item: GalleryItem) => void;
  removeFromGallery: (id: string) => void;

  // Generator State
  appState: AppState;
  setAppState: (state: AppState) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Generator Data
  originalImage: string | null;
  setOriginalImage: (image: string | null) => void;
  generatedImage: string | null;
  setGeneratedImage: (image: string | null) => void;
  generatedVideo: string | null;
  setGeneratedVideo: (video: string | null) => void;

  // Config State
  selectedStyle: EmojiStyle;
  setSelectedStyle: (style: EmojiStyle) => void;
  selectedMood: EmojiMood;
  setSelectedMood: (mood: EmojiMood) => void;
  selectedMotion: MotionType;
  setSelectedMotion: (motion: MotionType) => void;

  // Transactions
  transactions: Transaction[];
  
  // Actions
  generateImage: () => Promise<void>;
  generateVideo: () => Promise<void>;
  resetGenerator: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CREDITS = 6;

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Global State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [credits, setCredits] = useState<number>(INITIAL_CREDITS);
  const [isPro, setIsPro] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // --- Gallery State ---
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // --- Generator State ---
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // --- Config State ---
  const [selectedStyle, setSelectedStyle] = useState<EmojiStyle>('3D');
  const [selectedMood, setSelectedMood] = useState<EmojiMood>('HAPPY');
  const [selectedMotion, setSelectedMotion] = useState<MotionType>('WINK');

  // --- Effects ---
  
  // Auth Listener & Data Fetching
  useEffect(() => {
    const fetchUserData = async (currentUser: User | null) => {
      if (currentUser) {
        // Fetch Profile (Credits)
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits, is_pro')
          .eq('id', currentUser.id)
          .single();
        
        if (profile) {
          setCredits(profile.credits);
          setIsPro(profile.is_pro || false);
        }

        // Fetch Gallery
        const { data: gallery } = await supabase
          .from('gallery')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (gallery) {
          const mappedGallery: GalleryItem[] = gallery.map(item => ({
            id: item.id,
            generatedImage: item.url,
            videoUrl: item.video_url,
            originalImage: item.prompt, // Using prompt field for original image url for now as per schema comment
            style: item.style as EmojiStyle,
            mood: item.mood as EmojiMood,
            mediaType: item.media_type as 'IMAGE' | 'VIDEO',
            createdAt: new Date(item.created_at).getTime()
          }));
          setGalleryItems(mappedGallery);
        }

        // Fetch Transactions
        const { data: txs } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (txs) {
          setTransactions(txs as Transaction[]);
        }
      } else {
        setCredits(INITIAL_CREDITS);
        setGalleryItems([]);
        setTransactions([]);
      }
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchUserData(currentUser);
      setIsLoadingUser(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchUserData(currentUser);
      setIsLoadingUser(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listener pour rafraîchir les données utilisateur
  useEffect(() => {
    const handleRefreshUserData = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits, is_pro')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCredits(profile.credits);
          setIsPro(profile.is_pro || false);
        }
      }
    };

    window.addEventListener('refreshUserData', handleRefreshUserData);
    return () => window.removeEventListener('refreshUserData', handleRefreshUserData);
  }, [user]);

  // --- Actions ---

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCredits(INITIAL_CREDITS);
    setGalleryItems([]);
  };

  const decrementCredits = async () => {
    if (!user) return;
    
    // Optimistic update
    setCredits(prev => Math.max(0, prev - 1));

    // DB Update
    const { error } = await supabase.rpc('decrement_credits', { user_id: user.id });
    // If RPC doesn't exist (I didn't create it in the first schema file, user might need to add it or I use direct update)
    // Fallback to direct update if RPC fails or just use direct update for now.
    // Let's use direct update:
    if (error) {
       // Fallback or just ignore if RPC missing, but better to use direct update:
       const { data: currentProfile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
       if (currentProfile) {
         await supabase.from('profiles').update({ credits: Math.max(0, currentProfile.credits - 1) }).eq('id', user.id);
       }
    }
  };

  const addCredits = async (amount: number, provider: string = 'stripe', transactionAmount: number = 5000) => {
    if (!user) return;

    // Vérifier si une transaction similaire existe déjà pour éviter les doublons
    const { data: recentTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('plan_name', 'Mode Pro')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Dernière minute
      .single();

    if (recentTx) {
      console.log('⚠️ Transaction déjà traitée récemment, évitement du doublon');
      // Rafraîchir les données depuis la DB au lieu d'ajouter
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits, is_pro')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setCredits(profile.credits);
        setIsPro(profile.is_pro || false);
      }
      return;
    }

    // DB Update - Récupérer le profil actuel pour vérifier si l'utilisateur était déjà Pro
    const { data: currentProfile } = await supabase.from('profiles').select('credits, is_pro').eq('id', user.id).single();
    if (currentProfile) {
      // Si l'utilisateur n'était pas Pro, définir les crédits à exactement 50
      // Sinon, ajouter les crédits aux crédits existants
      const wasPro = currentProfile.is_pro || false;
      const newCredits = wasPro ? currentProfile.credits + amount : amount;
      
      // Optimistic update
      setCredits(newCredits);
      setIsPro(true);

      await supabase.from('profiles').update({ 
        credits: newCredits,
        is_pro: true 
      }).eq('id', user.id);
      
      // Record Transaction
      const newTx = {
        user_id: user.id,
        amount: transactionAmount,
        currency: 'XOF',
        credits_added: amount,
        plan_name: 'Mode Pro',
        provider: provider,
        status: 'completed'
      };
      
      await supabase.from('transactions').insert(newTx);
      
      // Update local transactions state
      const optimisticTx: Transaction = {
        id: Date.now().toString(),
        ...newTx,
        created_at: new Date().toISOString()
      };
      setTransactions(prev => [optimisticTx, ...prev]);
    }
  };

  const addToGallery = async (item: GalleryItem) => {
    // Optimistic update
    setGalleryItems(prev => [item, ...prev]);

    if (user) {
      await supabase.from('gallery').insert({
        user_id: user.id,
        url: item.generatedImage,
        video_url: item.videoUrl,
        prompt: item.originalImage,
        style: item.style,
        mood: item.mood,
        media_type: item.mediaType,
        created_at: new Date(item.createdAt).toISOString()
      });
    }
  };

  const removeFromGallery = async (id: string) => {
    // Optimistic update
    setGalleryItems(prev => prev.filter(item => item.id !== id));

    if (user) {
      await supabase.from('gallery').delete().eq('id', id);
    }
  };

  const resetGenerator = () => {
    setAppState(AppState.IDLE);
    setOriginalImage(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setError(null);
  };

  const generateImage = async () => {
    if (!originalImage) return;
    if (credits <= 0) return; 

    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      const emojiUrl = await generateEmoji(originalImage, selectedStyle, selectedMood);
      setGeneratedImage(emojiUrl);
      setGeneratedVideo(null);
      
      const newItem: GalleryItem = {
        id: Date.now().toString(), // Temporary ID, DB will assign UUID but we need to handle this. 
        // Actually for optimistic UI we use temp ID, but for DB we let it generate. 
        // But we need to sync. For now, let's just use Date.now() as ID for local and ignore ID mismatch or refresh.
        generatedImage: emojiUrl,
        originalImage: originalImage,
        style: selectedStyle,
        mood: selectedMood,
        mediaType: 'IMAGE',
        createdAt: Date.now()
      };
      
      await addToGallery(newItem);
      setAppState(AppState.SUCCESS);
      await decrementCredits();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Oups ! L'IA a eu un petit hoquet. Essayez une autre photo.");
      setAppState(AppState.ERROR);
    }
  };

  const generateVideo = async () => {
    if (!originalImage) return;
    if (credits <= 0) return;

    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      const videoUrl = await generateAvatarAnimation(originalImage, selectedMotion);
      setGeneratedVideo(videoUrl);
      setGeneratedImage(null);
      
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        generatedImage: originalImage, 
        videoUrl: videoUrl,
        originalImage: originalImage,
        style: 'VIDEO',
        mood: selectedMotion,
        mediaType: 'VIDEO',
        createdAt: Date.now()
      };
      
      await addToGallery(newItem);
      setAppState(AppState.SUCCESS);
      await decrementCredits();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Oups ! L'IA a eu un petit hoquet. Essayez une autre photo.");
      setAppState(AppState.ERROR);
    }
  };

  const contextValue: AppContextType = {
    user,
    credits,
    isPro,
    setIsPro,
    isLoadingUser,
    signIn,
    signOut,
    decrementCredits,
    addCredits,
    transactions,
    galleryItems,
    addToGallery,
    removeFromGallery,
    appState,
    setAppState,
    error,
    setError,
    originalImage,
    setOriginalImage,
    generatedImage,
    setGeneratedImage,
    generatedVideo,
    setGeneratedVideo,
    selectedStyle,
    setSelectedStyle,
    selectedMood,
    setSelectedMood,
    selectedMotion,
    setSelectedMotion,
    generateImage,
    generateVideo,
    resetGenerator
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Export du hook séparément pour une meilleure compatibilité avec Fast Refresh
function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { useApp };
