# Déploiement Cloudflare de ELEVARE

Le site doit être déployé avec le Worker défini dans `worker.js` et `wrangler.jsonc`. Le navigateur ne connaît que `/api/blog/v1/public/*`; le Worker appelle `https://integrations-api.zodev.live` avec le token Blog du projet `1`.

Configurer les secrets dans l’environnement Cloudflare, jamais dans un fichier JavaScript public :

```bash
wrangler secret put ZODBACK_API_TOKEN
wrangler secret put ZODBACK_API_BASE_URL
wrangler secret put ZODBACK_PROJECT_ID
```

Valeurs attendues :

- `ZODBACK_API_BASE_URL` : `https://integrations-api.zodev.live` ;
- `ZODBACK_PROJECT_ID` : `1` ;
- `ZODBACK_API_TOKEN` : nouveau token API project-scoped, entité `blog`, permission `read`.

Le token qui était présent dans l’ancien `js/config.js` doit être révoqué avant le déploiement. Vérifier ensuite que le bundle SPA ne contient ni token, ni `Authorization`, ni `x-api-key`.

Déploiement depuis ce checkout :

```bash
bun build js/elevare.js --outfile /tmp/elevare.bundle.js
bun build worker.js --outfile /tmp/blog-worker.bundle.js
bun test
wrangler deploy
```

Contrôles post-déploiement :

```bash
curl -I https://blog.zodev.live/
curl -i https://blog.zodev.live/api/blog/v1/public/all
curl -i 'https://blog.zodev.live/api/blog/v1/public/search?q=ELEVARE'
```

Le second appel doit être contrôlé avec le Worker configuré : il ne doit pas exposer le token dans la réponse et le backend doit fournir le contrat JSON du module Blog. Les parcours accueil, article, catégorie, auteur, recherche et archives doivent être testés dans un navigateur.
