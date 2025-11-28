import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsView: React.FC = () => {
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
            <FileText className="text-primary" size={32} />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
              Conditions Générales d'Utilisation
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-500 mb-6">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
              <p className="text-gray-600 mb-4">
                En accédant et en utilisant Emojify, vous acceptez d'être lié par ces Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description du service</h2>
              <p className="text-gray-600 mb-4">
                Emojify est une plateforme qui permet aux utilisateurs de créer des emojis personnalisés à partir de leurs photos en utilisant l'intelligence artificielle. Le service comprend la génération d'emojis statiques et animés.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Compte utilisateur</h2>
              <p className="text-gray-600 mb-4">
                Pour utiliser notre service, vous devez créer un compte. Vous êtes responsable de :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Toutes les activités qui se produisent sous votre compte</li>
                <li>Fournir des informations exactes et à jour</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Utilisation du service</h2>
              <p className="text-gray-600 mb-4">
                Vous vous engagez à :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Utiliser le service uniquement à des fins légales</li>
                <li>Ne pas télécharger de contenu offensant, illégal ou protégé par des droits d'auteur</li>
                <li>Ne pas tenter d'accéder de manière non autorisée au service</li>
                <li>Respecter les droits de propriété intellectuelle</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Abonnements et paiements</h2>
              <p className="text-gray-600 mb-4">
                Les abonnements sont facturés mensuellement. Les paiements sont traités de manière sécurisée par nos prestataires de paiement. Vous pouvez annuler votre abonnement à tout moment, mais aucun remboursement ne sera effectué pour la période en cours.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriété intellectuelle</h2>
              <p className="text-gray-600 mb-4">
                Les emojis que vous créez vous appartiennent. Cependant, vous accordez à Emojify une licence pour utiliser, stocker et afficher ces emojis dans le cadre du service. Le contenu de la plateforme (design, code, marques) reste la propriété d'Emojify.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
              <p className="text-gray-600 mb-4">
                Emojify est fourni "en l'état". Nous ne garantissons pas que le service sera ininterrompu, sécurisé ou exempt d'erreurs. Nous ne serons pas responsables des dommages directs, indirects ou consécutifs résultant de l'utilisation du service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Résiliation</h2>
              <p className="text-gray-600 mb-4">
                Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation de ces conditions. Vous pouvez résilier votre compte à tout moment en nous contactant.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications des conditions</h2>
              <p className="text-gray-600 mb-4">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication. Votre utilisation continue du service constitue votre acceptation des conditions modifiées.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-600 mb-4">
                Pour toute question concernant ces conditions, contactez-nous à : <a href="mailto:faustoswald@icloud.com" className="text-primary hover:underline">faustoswald@icloud.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

