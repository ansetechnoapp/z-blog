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

## Déploiement automatique GitHub

Le workflow `.github/workflows/deploy.yml` déploie automatiquement chaque push sur `main` et peut aussi être lancé avec `workflow_dispatch`. Il exécute les tests, vérifie le bundle public, configure les secrets Worker puis lance Wrangler.

Configurer dans les paramètres GitHub du dépôt :

- `CLOUDFLARE_API_TOKEN` : token Cloudflare autorisé à déployer les Workers et leurs routes ;
- `CLOUDFLARE_ACCOUNT_ID` : identifiant du compte Cloudflare ;
- `ZODBACK_API_TOKEN` : nouveau token ZodBack project-scoped, projet `1`, entité `blog`, permission `read`.

Variables GitHub optionnelles :

- `ZODBACK_API_BASE_URL` (défaut : `https://integrations-api.zodev.live`) ;
- `ZODBACK_PROJECT_ID` (défaut : `1`).

Les secrets sont injectés par le workflow avec `wrangler secret put`. Ils ne sont ni commités dans GitHub, ni inclus dans les assets ou le bundle navigateur.

Contrôles post-déploiement :

```bash
curl -I https://blog.zodev.live/
curl -i https://blog.zodev.live/api/blog/v1/public/all
curl -i 'https://blog.zodev.live/api/blog/v1/public/search?q=ELEVARE'
```

Le second appel doit être contrôlé avec le Worker configuré : il ne doit pas exposer le token dans la réponse et le backend doit fournir le contrat JSON du module Blog. Les parcours accueil, article, catégorie, auteur, recherche et archives doivent être testés dans un navigateur.
