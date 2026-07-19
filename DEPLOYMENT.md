# Déploiement Cloudflare de ELEVARE

Le site est déployé par **Cloudflare Workers Builds**, connecté au dépôt GitHub `ansetechnoapp/z-blog`. Le Worker défini dans `worker.js` sert les assets statiques et proxyfie uniquement `/api/blog/v1/public/*` vers `https://integrations-api.zodev.live`.

## Configuration Cloudflare

Dans le Worker `z-blog` :

```text
Settings → Variables and secrets → Add
```

Ajouter dans l’environnement **Production**, comme secrets runtime :

- `ZODBACK_API_BASE_URL` : `https://integrations-api.zodev.live`
- `ZODBACK_API_TOKEN` : nouveau token project-scoped, projet `1`, entité `blog`, permission `read`
- `ZODBACK_PROJECT_ID` : `1`

Ces trois noms doivent rester alignés avec `secrets.required` dans `wrangler.jsonc`.

Dans `Settings → Build` :

- branche de production : `main` ;
- commande de déploiement : `npx wrangler deploy` ;
- désactiver les builds des branches non-production tant que les previews ne sont pas nécessaires ;
- garder un seul système de déploiement : Cloudflare Workers Builds.

Le workflow GitHub Actions de déploiement a été archivé dans `useless/github-workflows/deploy.yml` pour éviter une double publication concurrente.

## Assets publics

Le répertoire d’assets est la racine du dépôt pour conserver le site statique existant. `.assetsignore` exclut les fichiers internes qui ne doivent jamais être publiés : dépôt Git, configuration Wrangler, Worker serveur, tests, documentation et archives.

Le token présent dans l’ancien `js/config.js` doit être considéré comme compromis et révoqué après validation du nouveau Worker. Aucun token, header `Authorization` ou header `x-api-key` ne doit apparaître dans le bundle SPA.

## Vérifications locales

```bash
bun test
```

Les contrôles de bundle peuvent être exécutés avant une fusion :

```bash
bun build js/elevare.js --outfile /tmp/elevare.bundle.js
bun build worker.js --outfile /tmp/blog-worker.bundle.js
```

Contrôles post-déploiement :

```bash
curl -I https://blog.zodev.live/
curl -i https://blog.zodev.live/api/blog/v1/public/all
curl -i 'https://blog.zodev.live/api/blog/v1/public/search?q=ELEVARE'
```

Le second appel doit être contrôlé avec le Worker configuré : il ne doit pas exposer le token dans la réponse et le backend doit fournir le contrat JSON du module Blog. Les parcours accueil, article, catégorie, auteur, recherche et archives doivent être testés dans un navigateur.
