import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  category: string;
  featured_image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export const BlogView: React.FC = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des articles:', error);
    } else {
      setBlogPosts(data || []);
    }
    setIsLoading(false);
  };

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
            Blog Emojify
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Découvrez nos articles, tutoriels et actualités sur l'univers des emojis personnalisés
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des articles...</p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucun article disponible pour le moment.</p>
            <p className="text-gray-400">Revenez bientôt pour découvrir nos articles !</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              >
                {post.featured_image_url && (
                  <div className="mb-4 rounded-2xl overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-500 mb-4 line-clamp-3">
                  {post.excerpt || 'Aucun extrait disponible'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : new Date(post.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    {post.author_name}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

