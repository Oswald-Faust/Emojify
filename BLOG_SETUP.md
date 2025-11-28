# Configuration du Système de Blog

## 1. Création de la table dans Supabase

Exécutez le script SQL `supabase_blog.sql` dans votre base de données Supabase :

1. Connectez-vous à votre projet Supabase
2. Allez dans l'éditeur SQL
3. Copiez-collez le contenu de `supabase_blog.sql`
4. Exécutez le script

Ce script va :
- Créer la table `blog_articles`
- Ajouter la colonne `is_admin` à la table `profiles`
- Configurer les politiques RLS (Row Level Security)
- Créer les triggers nécessaires

## 2. Rendre un utilisateur administrateur

Pour rendre un utilisateur administrateur, exécutez cette requête SQL dans Supabase :

```sql
-- Remplacez 'USER_EMAIL@example.com' par l'email de l'utilisateur que vous voulez rendre admin
UPDATE profiles
SET is_admin = true
WHERE email = 'USER_EMAIL@example.com';
```

Ou directement via l'interface Supabase :
1. Allez dans Table Editor > profiles
2. Trouvez l'utilisateur
3. Modifiez la colonne `is_admin` et mettez-la à `true`

## 3. Accéder au dashboard admin

Une fois qu'un utilisateur est admin, il peut accéder au dashboard via :
- URL : `/admin/blog`
- Ou ajoutez un lien dans votre interface pour les admins

## 4. Fonctionnalités du dashboard admin

Le dashboard permet de :
- ✅ Créer de nouveaux articles
- ✅ Modifier des articles existants
- ✅ Supprimer des articles
- ✅ Publier/Dépublier des articles
- ✅ Gérer les catégories (Actualités, Tutoriel, Guide, Astuces)
- ✅ Ajouter des images de couverture

## 5. Structure des articles

Chaque article contient :
- **Titre** (obligatoire)
- **Extrait** (optionnel, affiché dans la liste)
- **Contenu** (obligatoire, supporte le Markdown)
- **Catégorie** (Actualités, Tutoriel, Guide, Astuces)
- **Image de couverture** (URL optionnelle)
- **Statut de publication** (Publié/Brouillon)

## 6. Affichage sur le blog public

- Seuls les articles avec `published = true` sont visibles sur `/blog`
- Les articles sont triés par date de publication (plus récents en premier)
- Les articles non publiés ne sont visibles que par les admins

## 7. Sécurité

- Seuls les utilisateurs avec `is_admin = true` peuvent accéder au dashboard
- Les politiques RLS garantissent que seuls les admins peuvent créer/modifier/supprimer
- Les utilisateurs non-admin sont automatiquement redirigés s'ils tentent d'accéder au dashboard

