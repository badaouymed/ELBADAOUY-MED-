# Portfolio CV

Site CV / portfolio éditorial pour Mohammed El Badaouy, pensé pour une lecture rapide, un rendu premium et une mise en ligne simple.

## Objectif

Présenter un profil d’ingénieur méthodes et industrialisation avec une direction visuelle sobre, inspirée d’un site éditorial, tout en gardant une maintenance minimale dans VS Code.

## Contenu actuel

- Hero avec présentation, CTA et téléchargement du CV PDF
- Section à propos
- Parcours professionnel
- Parcours scolaire
- Projets sélectionnés
- Compétences par usage
- Certifications
- Bloc contact et footer de conversion
- Navigation mobile et animations légères au scroll

## Fichiers principaux

- `index.html` pour la structure et le contenu
- `styles.css` pour toute l’identité visuelle
- `main.js` pour le menu mobile, les animations et les compteurs
- `Img/` pour les logos, badges et la photo de profil

## Lancer en local

Tu peux ouvrir `index.html` directement dans le navigateur, ou lancer un serveur statique simple:

```bash
npx serve .
```

## Déploiement conseillé

La configuration la plus simple avec un domaine `.me` chez Namecheap est:

1. Déposer le projet sur GitHub.
2. Connecter le repo à Vercel ou Netlify.
3. Pointer le domaine Namecheap vers l’hébergeur choisi.

Si tu veux rester sur GitHub pour le déploiement, utilise GitHub Pages:

1. Pousse le projet sur un dépôt GitHub public.
2. Va dans `Settings` > `Pages`.
3. Dans `Build and deployment`, choisis `Deploy from a branch`.
4. Sélectionne `main` puis le dossier `/root`.
5. Enregistre et attends l’URL GitHub Pages.
6. Dans GitHub, ajoute ensuite ton domaine personnalisé dans `Pages`.
7. Crée un fichier `CNAME` à la racine du projet avec ton domaine final, par exemple `cv.tondomaine.me`.

### DNS Namecheap vers Vercel

- `A` pour `@` vers `76.76.21.21`
- `CNAME` pour `www` vers `cname.vercel-dns.com`

### DNS Namecheap vers GitHub Pages

- `A` pour `@` vers `185.199.108.153`
- `A` pour `@` vers `185.199.109.153`
- `A` pour `@` vers `185.199.110.153`
- `A` pour `@` vers `185.199.111.153`
- `CNAME` pour `www` vers `<ton-login>.github.io`

Si tu utilises un sous-domaine comme `cv.tondomaine.me`, crée plutôt un `CNAME` pour `cv` vers `<ton-login>.github.io`.

### Suite logique

- remplacer les liens `LinkedIn`, `GitHub` et portfolio par les URLs finales
- vérifier le CV PDF associé au bouton de téléchargement
- ajouter éventuellement une page projet détaillée ou un formulaire de contact
