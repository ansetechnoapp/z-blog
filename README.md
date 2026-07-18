# ELEVARE — interface éditoriale

Cette version est une démonstration autonome en HTML, CSS et JavaScript natifs.

## Exécution locale

Depuis le dossier du projet :

```bash
python3 -m http.server 4173
```

Puis ouvrir [http://localhost:4173](http://localhost:4173).

Un serveur HTTP est recommandé plutôt que l’ouverture directe du fichier HTML : il permet de charger correctement le script et les ressources dans tous les navigateurs modernes.

## Organisation

- `index.html` : point d'entrée minimal de l'application.
- `styles/main.css` : design system ELEVARE, composants, états et responsive desktop/tablette/mobile.
- `js/elevare.js` : données, composants partagés et navigation SPA pour accueil, articles, article, catégorie, auteur, recherche, archives, à propos, contact, newsletter, connexion, inscription, compte, administration, 404 et maintenance.

Les images de démonstration sont chargées depuis des URL publiques (`picsum.photos`). Pour une version totalement hors ligne, remplacer ces URL par des fichiers locaux.

## Vérifications effectuées

- Syntaxe JavaScript validée avec `node --check js/elevare.js`.
- Chargement HTTP local vérifié avec `python3 -m http.server` et une requête `curl`.
- Le CSS contient des paliers responsive à 1000 px, 720 px et 420 px.
- Smoke E2E Chromium validé sur l'accueil, une page article, la recherche, le formulaire contact, les routes principales et le menu mobile.

Le test E2E a été exécuté dans Chromium. Une vérification visuelle manuelle reste recommandée dans Firefox, Safari et Edge sur les appareils cibles.
