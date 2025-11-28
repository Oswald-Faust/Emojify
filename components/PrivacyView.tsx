import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="text-primary" size={32} />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
              Politique de Confidentialité
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-6">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                Emojify ("nous", "notre", "nos") s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informations que nous collectons</h2>
              <p className="text-gray-600 mb-4">
                Nous collectons les informations suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Informations de compte (nom, email, mot de passe)</li>
                <li>Photos que vous téléchargez pour créer des emojis</li>
                <li>Emojis générés et sauvegardés dans votre galerie</li>
                <li>Informations de paiement (traitées de manière sécurisée par nos prestataires)</li>
                <li>Données d'utilisation et de navigation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Utilisation des informations</h2>
              <p className="text-gray-600 mb-4">
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Fournir et améliorer nos services</li>
                <li>Traiter vos paiements et gérer votre abonnement</li>
                <li>Vous contacter concernant votre compte ou nos services</li>
                <li>Personnaliser votre expérience</li>
                <li>Assurer la sécurité de notre plateforme</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partage des informations</h2>
              <p className="text-gray-600 mb-4">
                Nous ne vendons jamais vos informations personnelles. Nous pouvons partager vos données uniquement dans les cas suivants :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Avec des prestataires de services de confiance (hébergement, paiement)</li>
                <li>Pour respecter des obligations légales</li>
                <li>Pour protéger nos droits et notre sécurité</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sécurité des données</h2>
              <p className="text-gray-600 mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations contre tout accès non autorisé, perte ou destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vos droits</h2>
              <p className="text-gray-600 mb-4">
                Vous avez le droit de :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Accéder à vos données personnelles</li>
                <li>Corriger vos informations</li>
                <li>Supprimer votre compte et vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Demander la portabilité de vos données</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <p className="text-gray-600 mb-4">
                Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
              <p className="text-gray-600 mb-4">
                Pour toute question concernant cette politique de confidentialité, contactez-nous à : <a href="mailto:faustoswald@icloud.com" className="text-primary hover:underline">faustoswald@icloud.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

