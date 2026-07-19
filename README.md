# ELEVARE — blog public alimenté par ZodBack

Ce dépôt est la source GitHub `ansetechnoapp/z-blog` du Worker Cloudflare qui sert
`https://blog.zodev.live`. `/opt/zodback/dev/z-blog` est uniquement un checkout
local de ce dépôt : une modification locale n’arrive en production qu’après un
push sur `main`, puis le build Cloudflare Workers Builds.

## Flux de données de production

```text
navigateur
  └─ /api/blog/v1/public/* (same-origin)
       └─ worker.js
            └─ integrations-api.zodev.live
                 └─ ZodBack — module Blog — projet 1
```

Le navigateur ne connaît ni l’URL interne de l’API ni le token. Le Worker
injecte `ZODBACK_API_TOKEN` et `ZODBACK_PROJECT_ID` côté serveur. L’entrée active
est `index.html` → `js/elevare.js` → `js/elevare-api.js`.

Les fichiers `js/app.js`, `js/api.js`, `css/` et `js/views/` proviennent de
l’ancienne interface Blog et ne sont pas chargés par l’entrée ELEVARE actuelle.
Ils sont conservés pour compatibilité historique, mais ne doivent pas être
utilisés pour diagnostiquer le runtime de production.

## Vérifications avec Bun

```bash
bun test
bun scripts/verify-production.js
```

Le second contrôle vérifie la page live, le bundle public, l’agrégat Blog du
projet `1`, le détail d’article, les taxonomies, la recherche, les archives et
les flux SEO. Il ne nécessite aucun secret.

Pour un aperçu statique local, utiliser un serveur HTTP (par exemple
`bunx serve .`). Cela ne reproduit pas le proxy Cloudflare ; la vérification
réelle du raccordement API est `bun scripts/verify-production.js`.
