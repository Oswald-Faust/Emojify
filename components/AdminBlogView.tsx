import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { useApp } from '../src/context/AppContext';

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
  updated_at: string;
}

export const AdminBlogView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Actualités',
    featured_image_url: '',
    published: false
  });

  useEffect(() => {
    checkAdminStatus();
    fetchArticles();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profile?.is_admin) {
      setIsAdmin(true);
    } else {
      alert('Accès refusé. Cette page est réservée aux administrateurs.');
      navigate('/');
    }
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des articles:', error);
    } else {
      setArticles(data || []);
    }
    setIsLoading(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Actualités',
      featured_image_url: '',
      published: false
    });
  };

  const handleEdit = (article: BlogArticle) => {
    setEditingArticle(article);
    setIsCreating(false);
    setFormData({
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      category: article.category,
      featured_image_url: article.featured_image_url || '',
      published: article.published
    });
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.title || !formData.content) {
      alert('Veuillez remplir le titre et le contenu');
      return;
    }

    const articleData = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
      category: formData.category,
      featured_image_url: formData.featured_image_url || null,
      published: formData.published,
      published_at: formData.published ? new Date().toISOString() : null
    };

    if (editingArticle) {
      // Update existing article
      const { error } = await supabase
        .from('blog_articles')
        .update(articleData)
        .eq('id', editingArticle.id);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour de l\'article');
      } else {
        alert('Article mis à jour avec succès !');
        setEditingArticle(null);
        setIsCreating(false);
        fetchArticles();
      }
    } else {
      // Create new article
      const { error } = await supabase
        .from('blog_articles')
        .insert(articleData);

      if (error) {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création de l\'article');
      } else {
        alert('Article créé avec succès !');
        setIsCreating(false);
        fetchArticles();
      }
    }

    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Actualités',
      featured_image_url: '',
      published: false
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    const { error } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'article');
    } else {
      alert('Article supprimé avec succès !');
      fetchArticles();
    }
  };

  const togglePublish = async (article: BlogArticle) => {
    const { error } = await supabase
      .from('blog_articles')
      .update({
        published: !article.published,
        published_at: !article.published ? new Date().toISOString() : article.published_at
      })
      .eq('id', article.id);

    if (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    } else {
      fetchArticles();
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Nouvel article
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-8">
          Administration du Blog
        </h1>

        {/* Create/Edit Form */}
        {(isCreating || editingArticle) && (
          <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingArticle(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Titre de l'article"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Extrait</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  rows={3}
                  placeholder="Court résumé de l'article"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contenu *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  rows={10}
                  placeholder="Contenu de l'article (Markdown supporté)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="Actualités">Actualités</option>
                    <option value="Tutoriel">Tutoriel</option>
                    <option value="Guide">Guide</option>
                    <option value="Astuces">Astuces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">URL de l'image</label>
                  <input
                    type="text"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-gray-700">Publier immédiatement</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  <Save size={20} />
                  {editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingArticle(null);
                  }}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Articles List */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles ({articles.length})</h2>
          
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Aucun article pour le moment</p>
              <button
                onClick={handleCreate}
                className="text-primary font-bold hover:underline"
              >
                Créer votre premier article
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{article.title}</h3>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {article.category}
                      </span>
                      {article.published ? (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                          <Eye size={12} />
                          Publié
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1">
                          <EyeOff size={12} />
                          Brouillon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{article.excerpt || 'Aucun extrait'}</p>
                    <p className="text-xs text-gray-400">
                      Par {article.author_name} • {new Date(article.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublish(article)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title={article.published ? 'Dépublier' : 'Publier'}
                    >
                      {article.published ? <EyeOff size={18} className="text-gray-600" /> : <Eye size={18} className="text-green-600" />}
                    </button>
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Modifier"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

