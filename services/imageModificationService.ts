import { GoogleGenAI, Modality } from "@google/genai";

const stripBase64Header = (base64String: string): string => {
  return base64String.replace(/^data:image\/[a-z]+;base64,/, "");
};

const getApiKey = async (): Promise<string> => {
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    try {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (hasKey) {
        const selectedKey = await aistudio.getSelectedApiKey();
        if (selectedKey) {
          console.log("🔑 Utilisation de la clé API d'AI Studio");
          return selectedKey;
        }
      } else {
        await aistudio.openSelectKey();
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
  
  if (process.env.API_KEY) {
    console.log("🔑 Utilisation de la clé API d'environnement");
    return process.env.API_KEY;
  }
  
  throw new Error("Aucune clé API disponible.");
};

export const modifyImageWithAI = async (
  base64Image: string,
  modificationPrompt: string
): Promise<string> => {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const cleanBase64 = stripBase64Header(base64Image);

  const prompt = `
    Modifie cette image selon la demande suivante : "${modificationPrompt}"
    
    INSTRUCTIONS IMPORTANTES :
    1. Conserve le style et l'esthétique générale de l'image originale (emoji/avatar)
    2. Applique uniquement les modifications demandées par l'utilisateur
    3. Garde la même résolution et qualité
    4. Si la demande concerne des éléments spécifiques (couleur, taille, ajout d'éléments), applique-les précisément
    5. Retourne une image modifiée de haute qualité
  `;

  // Liste des modèles à essayer
  const modelsToTry = [
    'gemini-2.5-flash-image',
    'imagen-3.0-generate-001',
    'imagen-3.0-fast-generate-001',
    'imagen-3.0-generate-002',
    'gemini-2.5-flash-exp',
    'gemini-2.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`🔄 Tentative de modification avec le modèle: ${model}`);
      
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: 'image/png',
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
        console.log(`✅ Modification réussie avec le modèle: ${model}`);
        return `data:image/png;base64,${part.inlineData.data}`;
      }

      throw new Error("Format de réponse inattendu.");
    } catch (error: any) {
      const errorMsg = error?.message || error?.error?.message || String(error);
      console.warn(`❌ Échec avec ${model}:`, errorMsg);
      lastError = error;
      
      // Si c'est une erreur de quota, on arrête immédiatement
      if (error?.code === 429 || error?.error?.code === 429 || 
          errorMsg?.includes('429') || errorMsg?.includes('quota')) {
        throw new Error("Quota API dépassé. Veuillez réessayer plus tard.");
      }
      
      // Si c'est une erreur 400 "text output only", on continue
      if (error?.code === 400 || error?.error?.code === 400) {
        if (errorMsg?.includes('text output') || errorMsg?.includes('only supports text')) {
          continue;
        }
      }
      
      // Si c'est une erreur 404 (modèle non trouvé), on continue
      if (error?.code === 404 || error?.error?.code === 404) {
        continue;
      }
      
      continue;
    }
  }

  // Si tous les modèles ont échoué
  throw new Error(
    `Impossible de modifier l'image avec l'IA. Veuillez vérifier votre clé API et réessayer.`
  );
};

