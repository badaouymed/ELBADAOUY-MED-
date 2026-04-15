# Portfolio CV

Site unique avec page d'accueil + page CV, pensé pour garder une forme visuelle stable et faire varier le contenu selon 3 profils.

## Objectif

- Garder un seul site.
- Garder la forme actuelle du CV.
- Basculer entre 3 versions de contenu CV via `activeProfile`.
- Déployer gratuitement via GitHub + Vercel.

## Architecture actuelle

- `index.html`: page d'accueil (2 boutons: Portfolio et CV)
- `cv.html`: page CV complète avec la forme historique
- `data.json`: source de données unique avec 3 profils et un profil actif
- `main.js`: rendu dynamique du CV selon `activeProfile`
- `styles.css`: identité visuelle + styles de la page d'accueil

## Profils CV disponibles

- `methodes_indus`
- `conception_mecanique`
- `conception_generale`

Le profil public affiché est défini par:

```json
"activeProfile": "methodes_indus"
```

## Lancer en local

Tu peux ouvrir `index.html` directement dans le navigateur, ou lancer un serveur statique simple:

```bash
npx serve .
```

## Switch admin (simple et gratuit)

Méthode retenue: switch admin via GitHub.

1. Ouvrir `data.json` dans GitHub ou VS Code.
2. Changer uniquement la valeur de `activeProfile`.
3. Commit + push sur une branche.
4. Vérifier l'URL Preview Vercel.
5. Merger sur `main` pour publier.

Exemple:

```json
"activeProfile": "conception_mecanique"
```

Cette méthode évite tout backend et reste compatible 100% gratuit.

## Déploiement conseillé (GitHub + Vercel)

1. Pousser le projet sur GitHub.
2. Importer le repo sur Vercel.
3. Laisser Vercel détecter le site statique.
4. Activer les previews de branche (PR).
5. Publier automatiquement depuis `main`.

Si tu veux rester sur GitHub uniquement, utilise GitHub Pages:

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

- ajuster les contenus finaux des 3 profils dans `data.json`
- garder la procédure `activeProfile` pour publication rapide
- ajouter plus tard de nouvelles pages sans casser l'existant
