import { GoogleGenAI, Modality } from "@google/genai";
import { EmojiStyle, EmojiMood, MotionType } from "../types";

// Fonction utilitaire pour lister les modèles disponibles
export const listAvailableModels = async (): Promise<void> => {
  if (!process.env.API_KEY) {
    console.error("La clé API est manquante.");
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Note: La méthode listModels pourrait ne pas être disponible dans @google/genai
    // On va essayer une approche différente
    console.log("🔍 Recherche des modèles disponibles...");
    console.log("Note: Cette fonction peut nécessiter une API différente pour lister les modèles.");
  } catch (error) {
    console.error("Erreur lors de la liste des modèles:", error);
  }
};

const stripBase64Header = (base64String: string): string => {
  return base64String.replace(/^data:image\/[a-z]+;base64,/, "");
};

const getStylePrompt = (style: EmojiStyle): string => {
  switch (style) {
    case 'CLAY': return "style pâte à modeler (claymation), texture 'stop-motion' comme Aardman, éclairage doux, look artisanal";
    case 'PIXEL': return "style Pixel Art haute qualité, rétro 16-bit, couleurs vibrantes, contours nets";
    case 'ANIME': return "style Anime Japonais moderne, grands yeux expressifs, ombrage cel-shading, ligne claire";
    case '3D':
    default: return "style film d'animation 3D (Pixar/Disney), rendu Octane, éclairage studio, textures lisses et mignonnes";
  }
};

const getMoodPrompt = (mood: EmojiMood): string => {
  switch (mood) {
    case 'COOL': return "expression très cool, port des lunettes de soleil, petit sourire en coin, attitude confiante";
    case 'SURPRISED': return "expression très choquée, bouche ouverte, yeux grands ouverts, mains sur les joues si visible";
    case 'LOVE': return "expression amoureuse, yeux en forme de cœur ou brillants, grand sourire, joues rouges";
    case 'ANGRY': return "expression comique de colère, sourcils froncés, petite fumée sortant des oreilles (style cartoon)";
    case 'HAPPY':
    default: return "expression très joyeuse, grand sourire éclatant, yeux pétillants de bonheur";
  }
};

const getMotionPrompt = (motion: MotionType): string => {
  switch (motion) {
    case 'WINK': return "The character gives a friendly wink with one eye and smiles slightly. The movement is smooth and charming.";
    case 'WAVE': return "The character waves their hand in a friendly greeting gesture. The movement is cheerful and welcoming.";
    case 'LAUGH': return "The character laughs heartily, head tilting back slightly, shoulders moving. An expression of pure joy.";
    case 'DANCE': return "The character does a small, happy dance bobbing their head to the rhythm. Fun and energetic movement.";
    case 'NOD': return "The character nods their head in agreement, looking attentive and positive.";
    default: return "The character smiles gently and looks around.";
  }
};

const tryGenerateWithModel = async (
  ai: GoogleGenAI,
  model: string,
  cleanBase64: string,
  prompt: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("Aucune image générée.");
  }

  const part = parts[0];
  if (part.inlineData && part.inlineData.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }

  throw new Error("Format de réponse inattendu.");
};

// Tentative avec l'API REST Imagen directement
const tryImagenREST = async (prompt: string, base64Image: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;

  try {
    // Essai avec l'endpoint Imagen via l'API REST
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${process.env.API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt,
            image: {
              bytesBase64Encoded: base64Image,
            },
          }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    // Traitement de la réponse Imagen
    if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
      return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
    }
    return null;
  } catch (error) {
    console.warn("Tentative Imagen REST échouée:", error);
    return null;
  }
};

// Fonction pour obtenir la clé API (priorité à AI Studio si disponible)
const getApiKey = async (): Promise<string> => {
  // D'abord, essayer d'utiliser la clé d'AI Studio si disponible
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    try {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (hasKey) {
        // Récupérer la clé sélectionnée dans AI Studio
        const selectedKey = await aistudio.getSelectedApiKey();
        if (selectedKey) {
          console.log("🔑 Utilisation de la clé API d'AI Studio");
          return selectedKey;
        }
      } else {
        // Demander à l'utilisateur de sélectionner une clé
        await aistudio.openSelectKey();
        // Attendre un peu pour que l'utilisateur sélectionne
        await new Promise(resolve => setTimeout(resolve, 1000));
        const selectedKey = await aistudio.getSelectedApiKey();
        if (selectedKey) {
          console.log("🔑 Utilisation de la clé API d'AI Studio (après sélection)");
          return selectedKey;
        }
      }
    } catch (error) {
      console.warn("Impossible d'utiliser la clé AI Studio:", error);
    }
  }
  
  // Fallback sur la clé d'environnement
  if (process.env.API_KEY) {
    console.log("🔑 Utilisation de la clé API d'environnement");
    return process.env.API_KEY;
  }
  
  throw new Error("Aucune clé API disponible. Veuillez configurer GEMINI_API_KEY dans .env.local ou sélectionner une clé dans AI Studio.");
};

export const generateEmoji = async (base64Image: string, style: EmojiStyle, mood: EmojiMood): Promise<string> => {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const cleanBase64 = stripBase64Header(base64Image);

  const styleDesc = getStylePrompt(style);
  const moodDesc = getMoodPrompt(mood);

  const prompt = `
    Transforme cette photo en un émoji/avatar incroyable.
    
    DIRECTIVES DE STYLE : ${styleDesc}.
    EXPRESSION/HUMEUR : ${moodDesc}.
    
    INSTRUCTIONS IMPORTANTES :
    1. Garde les caractéristiques physiques principales de la personne (couleur de peau, cheveux, barbe, lunettes de vue si présentes) pour qu'on la reconnaisse.
    2. Le fond doit être une couleur unie vive et complémentaire qui fait ressortir le personnage.
    3. Le cadrage doit être centré sur la tête et les épaules (format portrait/avatar).
    4. Rendu de très haute qualité.
  `;

  // D'abord, essayer l'API REST Imagen directement
  console.log("🔄 Tentative avec l'API REST Imagen...");
  const imagenResult = await tryImagenREST(prompt, cleanBase64);
  if (imagenResult) {
    console.log("✅ Succès avec l'API REST Imagen");
    return imagenResult;
  }

  // Liste complète des modèles à essayer dans l'ordre de préférence
  // Basée sur les modèles Gemini/Imagen qui supportent la génération d'images
  const modelsToTry = [
    'gemini-2.5-flash-image',            // Gemini 2.5 Flash Image - modèle spécialisé pour les images (priorité)
    'imagen-3.0-generate-001',           // Imagen 3 - modèle principal
    'imagen-3.0-fast-generate-001',     // Imagen 3 - version rapide
    'imagen-3.0-generate-002',          // Variante Imagen 3
    'imagen-3-generate-001',            // Format alternatif
    'imagen-3-fast-generate-001',       // Format alternatif rapide
    'gemini-2.0-flash-exp',              // Gemini expérimental (peut supporter les images)
    'gemini-2.5-flash-exp',              // Gemini 2.5 expérimental
    'gemini-2.5-flash',                  // Gemini 2.5 standard
    'gemini-1.5-pro',                    // Gemini 1.5 Pro (peut supporter les images)
    'gemini-1.5-flash',                  // Gemini 1.5 Flash
  ];
  
  let lastError: any = null;
  const errorsByModel: { [key: string]: string } = {};

  for (const model of modelsToTry) {
    try {
      console.log(`🔄 Tentative avec le modèle: ${model}`);
      const result = await tryGenerateWithModel(ai, model, cleanBase64, prompt);
      console.log(`✅ Succès avec le modèle: ${model}`);
      return result;
    } catch (error: any) {
      const errorMsg = error?.message || error?.error?.message || String(error);
      console.warn(`❌ Échec avec ${model}:`, errorMsg);
      errorsByModel[model] = errorMsg;
      lastError = error;
      
      // Si c'est une erreur de quota, on arrête immédiatement
      if (error?.code === 429 || error?.error?.code === 429 || 
          errorMsg?.includes('429') || errorMsg?.includes('quota') || 
          errorMsg?.includes('exceeded')) {
        throw new Error("Quota API dépassé. Veuillez vérifier votre plan et vos détails de facturation sur https://ai.google.dev/gemini-api/docs/rate-limits");
      }
      
      // Si c'est une erreur 400 "text output only", on continue avec le modèle suivant
      if (error?.code === 400 || error?.error?.code === 400) {
        if (errorMsg?.includes('text output') || errorMsg?.includes('only supports text')) {
          console.log(`⚠️  Le modèle ${model} ne supporte que la sortie texte, passage au suivant...`);
          continue;
        }
      }
      
      // Si c'est une erreur de modèle non trouvé (404), on continue
      if (error?.code === 404 || error?.error?.code === 404 || 
          errorMsg?.includes('not found') || errorMsg?.includes('404') || 
          errorMsg?.includes('Model') || errorMsg?.includes('does not exist')) {
        console.log(`⚠️  Le modèle ${model} n'existe pas, passage au suivant...`);
        continue;
      }
      
      // Pour les autres erreurs 400 (arguments invalides), on continue aussi
      if (error?.code === 400 || error?.error?.code === 400) {
        console.log(`⚠️  Le modèle ${model} a retourné une erreur 400, passage au suivant...`);
        continue;
      }
      
      // Pour les autres erreurs, on continue aussi pour essayer le modèle suivant
      continue;
    }
  }

  // Si tous les modèles ont échoué
  console.error("❌ Tous les modèles ont échoué. Détails:", errorsByModel);
  
  if (lastError?.code === 429 || lastError?.error?.code === 429 || 
      lastError?.message?.includes('429') || lastError?.message?.includes('quota')) {
    throw new Error("Quota API dépassé. Veuillez vérifier votre plan et vos détails de facturation sur https://ai.google.dev/gemini-api/docs/rate-limits");
  }
  
  // Construire un message d'erreur détaillé avec des solutions
  const errorDetails = Object.entries(errorsByModel)
    .map(([model, error]) => `  - ${model}: ${error}`)
    .join('\n');
  
  throw new Error(
    `❌ La génération d'images n'est pas disponible avec l'API Gemini actuelle.\n\n` +
    `PROBLÈME IDENTIFIÉ :\n` +
    `L'API Gemini (@google/genai) ne supporte PAS la génération d'images via generateContent(). ` +
    `Les modèles Gemini sont conçus pour ANALYSER les images, pas pour en générer.\n\n` +
    `SOLUTIONS POSSIBLES :\n` +
    `1. Utiliser l'API Imagen de Google Cloud Platform (nécessite un compte GCP et configuration Vertex AI)\n` +
    `2. Intégrer une autre API de génération d'images :\n` +
    `   - DALL-E (OpenAI) : https://platform.openai.com/docs/guides/images\n` +
    `   - Stable Diffusion (Stability AI)\n` +
    `   - Midjourney (via API tiers)\n` +
    `3. Vérifier si Google a ajouté le support de génération d'images dans une version récente\n\n` +
    `Modèles testés (tous ont échoué):\n${errorDetails}\n\n` +
    `Documentation : https://ai.google.dev/gemini-api/docs`
  );
};

export const generateAvatarAnimation = async (base64Image: string, motion: MotionType): Promise<string> => {
  // Utiliser la même fonction pour obtenir la clé API
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const cleanBase64 = stripBase64Header(base64Image);
  const motionPrompt = getMotionPrompt(motion);

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `${motionPrompt} The character style is 3D Pixar animation style, cute, vibrant colors, high quality render, 3d cartoon character.`,
      image: {
        imageBytes: cleanBase64,
        mimeType: 'image/jpeg', // Assuming jpeg from upload logic
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Portrait for mobile/social
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("La génération vidéo a échoué (pas de lien).");
    }

    // Fetch the actual video bytes
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!videoResponse.ok) {
      throw new Error("Impossible de télécharger la vidéo générée.");
    }
    
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error: any) {
    console.error("Erreur Gemini Video:", error);
    const aistudio = (window as any).aistudio;
    if (error.message?.includes("Requested entity was not found") && aistudio) {
       // Handle lost key / session issue
       await aistudio.openSelectKey();
       throw new Error("Veuillez resélectionner votre clé API et réessayer.");
    }
    throw error;
  }
};
