import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, HelpCircle, ChevronDown, ChevronUp, Mail, MessageCircle } from 'lucide-react';

export const HelpCenterView: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "Comment créer mon premier emoji ?",
      answer: "C'est très simple ! Téléchargez une photo de vous, choisissez un style (3D, Clay ou Anime), sélectionnez une humeur, et cliquez sur Générer. Votre emoji personnalisé sera créé en quelques secondes."
    },
    {
      id: 2,
      question: "Combien de crédits ai-je avec le plan gratuit ?",
      answer: "Le plan gratuit vous offre 6 crédits pour tester nos fonctionnalités. Chaque génération d'emoji consomme 1 crédit."
    },
    {
      id: 3,
      question: "Comment passer au plan Pro ?",
      answer: "Rendez-vous sur la page Tarifs, choisissez le plan Créateur (5000 FCFA/mois), et suivez le processus de paiement. Vous recevrez 50 crédits par mois avec tous les styles disponibles."
    },
    {
      id: 4,
      question: "Quels formats de photos sont acceptés ?",
      answer: "Nous acceptons les formats JPG, PNG et WebP. Pour de meilleurs résultats, utilisez une photo claire avec un bon éclairage et un visage bien visible."
    },
    {
      id: 5,
      question: "Puis-je utiliser mes emojis commercialement ?",
      answer: "Avec le plan Agence, vous bénéficiez d'une licence commerciale qui vous permet d'utiliser vos emojis à des fins commerciales. Le plan Créateur est pour un usage personnel uniquement."
    },
    {
      id: 6,
      question: "Comment supprimer mon compte ?",
      answer: "Contactez notre support à faustoswald@icloud.com avec votre demande de suppression de compte. Nous traiterons votre demande dans les plus brefs délais."
    }
  ];

  const categories = [
    { name: "Commencer", icon: "🚀", count: 5 },
    { name: "Paiements", icon: "💳", count: 3 },
    { name: "Compte", icon: "👤", count: 4 },
    { name: "Technique", icon: "⚙️", count: 6 }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Centre d'aide
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            Trouvez rapidement les réponses à vos questions
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher dans l'aide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-bold text-gray-900">{category.name}</div>
              <div className="text-sm text-gray-500">{category.count} articles</div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle size={24} className="text-primary" />
            Questions fréquentes
          </h2>
          
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-gray-500">Aucun résultat trouvé pour "{searchQuery}"</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                  {openFaq === faq.id ? (
                    <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                  )}
                </button>
                {openFaq === faq.id && (
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Besoin d'aide supplémentaire ?</h3>
          <p className="text-white/90 mb-6">
            Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:faustoswald@icloud.com"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              <Mail size={20} />
              Envoyer un email
            </a>
            <button className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors">
              <MessageCircle size={20} />
              Chat en direct
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

