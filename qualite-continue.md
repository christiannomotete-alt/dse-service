# Qualité Continue - Contrôle avant mise en ligne

Commande:

```powershell
powershell -ExecutionPolicy Bypass -File .\predeploy-check.ps1
```

Le script vérifie automatiquement:
- liens internes cassés (`href`/`src` locaux),
- présence des balises SEO essentielles (`title`, `meta description`, `canonical`) sur chaque page HTML,
- cohérence `sitemap.xml` (URL -> fichier existant),
- présence de la directive sitemap dans `robots.txt`.

Résultat:
- `Errors > 0` -> bloquer la mise en ligne.
- `Warnings > 0` -> valider ou corriger selon priorité métier.
