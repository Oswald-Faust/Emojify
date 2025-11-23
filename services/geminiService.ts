import { GoogleGenAI, Modality } from "@google/genai";
import { EmojiStyle, EmojiMood, MotionType } from "../types";

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

export const generateEmoji = async (base64Image: string, style: EmojiStyle, mood: EmojiMood): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("La clé API est manquante.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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

  } catch (error) {
    console.error("Erreur Gemini Image:", error);
    throw error;
  }
};

export const generateAvatarAnimation = async (base64Image: string, motion: MotionType): Promise<string> => {
  // Veo requires user selected API Key
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Check again after dialog might have closed (though we can't be sure if they selected one, we proceed)
    }
  }
  
  // Always create a new instance to pick up the potentially newly selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
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
