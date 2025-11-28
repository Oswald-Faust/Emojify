import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, BookOpen, Video } from 'lucide-react';

export const TutorialsView: React.FC = () => {
  const navigate = useNavigate();

  const tutorials = [
    {
      id: 1,
      title: "Premiers pas avec Emojify",
      description: "Apprenez les bases pour créer votre premier emoji personnalisé en quelques minutes.",
      duration: "5 min",
      type: "vidéo",
      level: "Débutant"
    },
    {
      id: 2,
      title: "Maîtriser les styles 3D",
      description: "Découvrez comment créer des emojis en 3D avec des résultats professionnels.",
      duration: "10 min",
      type: "vidéo",
      level: "Intermédiaire"
    },
    {
      id: 3,
      title: "Guide du style Clay",
      description: "Tout ce que vous devez savoir sur le style Clay et comment l'utiliser efficacement.",
      duration: "8 min",
      type: "article",
      level: "Débutant"
    },
    {
      id: 4,
      title: "Créer des animations avec Motion Studio",
      description: "Transformez vos emojis en animations captivantes avec notre Motion Studio.",
      duration: "15 min",
      type: "vidéo",
      level: "Avancé"
    },
    {
      id: 5,
      title: "Optimiser vos photos pour de meilleurs résultats",
      description: "Conseils et astuces pour préparer vos photos et obtenir les meilleurs résultats.",
      duration: "7 min",
      type: "article",
      level: "Débutant"
    },
    {
      id: 6,
      title: "Utiliser l'API Emojify",
      description: "Intégrez Emojify dans vos applications avec notre API complète.",
      duration: "20 min",
      type: "article",
      level: "Avancé"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Tutoriels
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Apprenez à utiliser toutes les fonctionnalités d'Emojify avec nos guides pas à pas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {tutorial.type === 'vidéo' ? (
                    <Video className="text-primary" size={24} />
                  ) : (
                    <BookOpen className="text-secondary" size={24} />
                  )}
                  <span className="text-xs font-bold uppercase text-gray-400">
                    {tutorial.type}
                  </span>
                </div>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                  {tutorial.level}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {tutorial.title}
              </h3>
              
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {tutorial.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <PlayCircle size={14} />
                  {tutorial.duration}
                </span>
                <span className="text-primary text-sm font-bold group-hover:underline">
                  Voir →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

