# Déploiement Cloudflare de ELEVARE

Le site de production est `https://blog.zodev.live`. Il est déployé par
**Cloudflare Workers Builds** depuis le dépôt GitHub
`ansetechnoapp/z-blog`, branche `main`. Le chemin local
`/opt/zodback/dev/z-blog` n’est pas l’hébergement et ne déclenche aucun
déploiement à lui seul.

Le Worker défini dans `worker.js` sert les assets statiques et proxyfie
uniquement `/api/blog/v1/public/*` vers
`https://integrations-api.zodev.live`. Cette API est le module Blog ZodBack
avec `X-Project-Id: 1`.

## Configuration Cloudflare

Dans le Worker `z-blog` :

```text
Settings → Variables and secrets → Add
```

Ajouter dans l’environnement **Production**, comme secrets runtime :

- `ZODBACK_API_BASE_URL` : `https://integrations-api.zodev.live`
- `ZODBACK_API_TOKEN` : token `blog3`, project-scoped, projet `1`, entité `blog`, permission `read` uniquement
- `ZODBACK_PROJECT_ID` : `1`

Ces trois noms doivent rester alignés avec `secrets.required` dans `wrangler.jsonc`.

Dans `Settings → Build` :

- branche de production : `main` ;
- commande de déploiement configurée dans Cloudflare : `npx wrangler deploy` ;
- désactiver les builds des branches non-production tant que les previews ne sont pas nécessaires ;
- garder un seul système de déploiement : Cloudflare Workers Builds.

La commande affichée dans le dashboard Cloudflare concerne son environnement
de build géré. Elle ne change pas la règle du workspace local : les contrôles
locaux utilisent `bun`.

Le workflow GitHub Actions de déploiement a été archivé dans `useless/github-workflows/deploy.yml` pour éviter une double publication concurrente.

## Assets publics

Le répertoire d’assets est la racine du dépôt pour conserver le site statique existant. `.assetsignore` exclut les fichiers internes qui ne doivent jamais être publiés : dépôt Git, configuration Wrangler, Worker serveur, tests, documentation et archives.

Les anciens tokens `blog1` et `blog2` ont été révoqués. Aucun token, header
`Authorization` ou header `x-api-key` ne doit apparaître dans le bundle SPA.

Les réglages SEO du projet `1` doivent utiliser `https://blog.zodev.live` comme
URL canonique. Le sitemap, robots.txt et RSS ne doivent jamais retomber sur
`blog-1.example.com`.

## Vérifications locales

```bash
bun test
bun scripts/verify-production.js
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
curl -i https://blog.zodev.live/api/blog/v1/public/seo/sitemap.xml
curl -i https://blog.zodev.live/api/blog/v1/public/seo/robots.txt
curl -i https://blog.zodev.live/api/blog/v1/public/seo/rss.xml
```

Le script de vérification doit confirmer `metadata.projectId === 1`, un article
publié et des réponses `200` pour les parcours accueil, article, catégorie,
auteur, recherche, archives et SEO. Le Worker doit retourner `405` pour une
écriture publique et `404` pour ses fichiers internes (`worker.js`,
`wrangler.jsonc`).
