import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

export const LegalView: React.FC = () => {
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
            <Scale className="text-primary" size={32} />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
              Mentions Légales
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Éditeur du site</h2>
              <div className="text-gray-600 space-y-2">
                <p><strong>Nom :</strong> Emojify</p>
                <p><strong>Description :</strong> Plateforme de création d'emojis personnalisés avec intelligence artificielle</p>
                <p><strong>Email :</strong> <a href="mailto:faustoswald@icloud.com" className="text-primary hover:underline">faustoswald@icloud.com</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Directeur de publication</h2>
              <p className="text-gray-600">
                Le directeur de publication est responsable du contenu éditorial du site Emojify.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Hébergement</h2>
              <p className="text-gray-600 mb-4">
                Ce site est hébergé par :
              </p>
              <div className="text-gray-600 space-y-2">
                <p><strong>Supabase</strong></p>
                <p>Infrastructure cloud pour le backend et la base de données</p>
                <p>Pour plus d'informations : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://supabase.com</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
              <p className="text-gray-600 mb-4">
                L'ensemble du contenu de ce site (textes, images, logos, icônes, vidéos, etc.) est la propriété exclusive d'Emojify, sauf mention contraire. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Protection des données personnelles</h2>
              <p className="text-gray-600 mb-4">
                Conformément à la réglementation en vigueur sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous concernant. Pour exercer ces droits, contactez-nous à l'adresse : <a href="mailto:faustoswald@icloud.com" className="text-primary hover:underline">faustoswald@icloud.com</a>
              </p>
              <p className="text-gray-600">
                Pour plus d'informations, consultez notre <a href="/privacy" className="text-primary hover:underline">Politique de Confidentialité</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
              <p className="text-gray-600 mb-4">
                Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies conformément à notre politique de confidentialité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Responsabilité</h2>
              <p className="text-gray-600 mb-4">
                Emojify s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Emojify ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
              </p>
              <p className="text-gray-600">
                Emojify ne pourra être tenu responsable des dommages directs ou indirects causés au matériel de l'utilisateur lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, soit de l'apparition d'un bug ou d'une incompatibilité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Liens externes</h2>
              <p className="text-gray-600 mb-4">
                Le site peut contenir des liens vers d'autres sites. Emojify n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leur accessibilité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Droit applicable</h2>
              <p className="text-gray-600 mb-4">
                Les présentes mentions légales sont régies par le droit applicable dans le pays d'établissement d'Emojify. Tout litige relatif à l'utilisation du site sera soumis à la compétence exclusive des tribunaux compétents.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-600 mb-4">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:faustoswald@icloud.com" className="text-primary hover:underline">faustoswald@icloud.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

