/**
 * Service KkiaPay pour la gestion des paiements Mobile Money
 * Documentation: https://docs.kkiapay.me
 */

export interface KkiaPayConfig {
  apikey: string;
  amount: number;
  phone?: string;
  email?: string;
  name?: string;
  data?: string;
  sandbox?: boolean;
}

export interface KkiaPayResponse {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  message?: string;
}

/**
 * Initialise un paiement KkiaPay
 * @param config Configuration du paiement
 * @returns Promise avec l'URL de redirection ou l'ID de transaction
 */
export const initializeKkiaPayPayment = async (
  config: KkiaPayConfig
): Promise<string> => {
  const {
    apikey,
    amount,
    phone,
    email,
    name,
    data,
    sandbox = import.meta.env.MODE === 'development',
  } = config;

  // KkiaPay utilise un widget JavaScript qui s'intègre directement
  // Pour une intégration complète, on peut utiliser leur API REST
  const baseUrl = sandbox
    ? 'https://api-sandbox.kkiapay.me'
    : 'https://api.kkiapay.me';

  try {
    // Créer une transaction via l'API REST
    const response = await fetch(`${baseUrl}/api/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`,
      },
      body: JSON.stringify({
        amount: amount,
        phone: phone,
        email: email,
        name: name,
        data: data || JSON.stringify({ type: 'pro_plan', credits: 50 }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la création de la transaction');
    }

    const data = await response.json();
    return data.transactionId || data.id;
  } catch (error: any) {
    console.error('Erreur KkiaPay:', error);
    throw new Error(error.message || 'Erreur lors de l\'initialisation du paiement');
  }
};

/**
 * Vérifie le statut d'une transaction KkiaPay
 * @param transactionId ID de la transaction
 * @param apikey Clé API KkiaPay
 * @param sandbox Mode sandbox ou production
 * @returns Promise avec le statut de la transaction
 */
export const verifyKkiaPayTransaction = async (
  transactionId: string,
  apikey: string,
  sandbox: boolean = (import.meta as any).env?.DEV || false
): Promise<KkiaPayResponse> => {
  const baseUrl = sandbox
    ? 'https://api-sandbox.kkiapay.me'
    : 'https://api.kkiapay.me';

  try {
    const response = await fetch(`${baseUrl}/api/v1/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apikey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Transaction non trouvée');
    }

    const data = await response.json();
    
    return {
      transactionId: data.id || transactionId,
      status: data.status === 'SUCCESS' ? 'SUCCESS' : data.status === 'FAILED' ? 'FAILED' : 'PENDING',
      message: data.message,
    };
  } catch (error: any) {
    console.error('Erreur vérification KkiaPay:', error);
    throw new Error(error.message || 'Erreur lors de la vérification de la transaction');
  }
};

/**
 * Charge le widget KkiaPay dans le DOM
 * Cette fonction charge le script KkiaPay et initialise le widget
 */
export const loadKkiaPayWidget = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Vérifier si le script est déjà chargé ET si les fonctions sont disponibles
    if (document.getElementById('kkiapay-script') && typeof (window as any).openKkiapayWidget !== 'undefined') {
      resolve();
      return;
    }

    // Si le script est chargé mais les fonctions ne sont pas encore disponibles, attendre
    if (document.getElementById('kkiapay-script')) {
      let retries = 0;
      const checkInterval = setInterval(() => {
        retries++;
        if (typeof (window as any).openKkiapayWidget !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        } else if (retries > 20) {
          clearInterval(checkInterval);
          reject(new Error('Widget KkiaPay chargé mais fonctions non disponibles'));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = 'kkiapay-script';
    // URL du widget KkiaPay selon leur documentation
    // Note: Si cette URL ne fonctionne pas, vérifiez la documentation officielle
    script.src = 'https://cdn.kkiapay.me/k.js';
    script.async = true;
    script.defer = false; // Ne pas utiliser defer pour avoir un contrôle immédiat
    script.onload = () => {
      console.log('📦 Script KkiaPay chargé, attente de la classe...');
      // Attendre que la classe soit disponible après le chargement du script
      let retries = 0;
      const checkInterval = setInterval(() => {
        retries++;
        // KkiaPay expose des fonctions globales, pas une classe
        const hasKkiapayFunctions = typeof (window as any).openKkiapayWidget !== 'undefined' ||
                                    typeof (window as any).openkkiapayWidget !== 'undefined';
        
        if (hasKkiapayFunctions) {
          clearInterval(checkInterval);
          console.log('✅ Fonctions KkiaPay disponibles après', retries, 'tentatives');
          resolve();
        } else if (retries > 30) {
          clearInterval(checkInterval);
          console.error('❌ Fonctions KkiaPay non disponibles après 30 tentatives');
          const availableFunctions = Object.keys(window).filter(k => 
            typeof k === 'string' && (k.toLowerCase().includes('kkia') || k.toLowerCase().includes('pay')));
          console.log('Fonctions window disponibles:', availableFunctions);
          reject(new Error('Script chargé mais fonctions KkiaPay non disponibles après 3 secondes'));
        }
      }, 100);
    };
    script.onerror = () => reject(new Error('Impossible de charger le widget KkiaPay'));
    document.head.appendChild(script);
  });
};

/**
 * Ouvre le widget KkiaPay pour le paiement
 * @param config Configuration du paiement
 */
export const openKkiaPayWidget = (config: KkiaPayConfig): void => {
  const {
    apikey,
    amount,
    phone,
    email,
    name,
    data,
    sandbox = import.meta.env.MODE === 'development',
  } = config;

  // Vérifier que le widget est chargé
  if (typeof (window as any).Kkiapay === 'undefined') {
    console.error('Widget KkiaPay non chargé');
    return;
  }

  const kkiapay = new (window as any).Kkiapay({
    apikey: apikey,
    amount: amount,
    phone: phone,
    email: email,
    name: name,
    data: data,
    sandbox: sandbox,
    callback: (response: any) => {
      console.log('Réponse KkiaPay:', response);
      // Le callback sera géré par le composant parent
    },
  });

  kkiapay.open();
};

