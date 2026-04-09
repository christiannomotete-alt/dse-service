# Automatisation Commerciale (Formspree + CRM)

## 1) Réponse automatique après formulaire

1. Ouvrir le formulaire `mqegovqg` dans Formspree.
2. Activer **Autoresponse**.
3. Utiliser l'objet:
`Votre demande a bien été reçue - DSE-SERVICE`
4. Utiliser ce message:

```text
Bonjour,

Nous avons bien reçu votre demande et vous remercions pour votre confiance.
Notre équipe revient vers vous sous 24h ouvrées.

Si votre besoin est urgent, contactez-nous au +228 96 95 10 73
ou sur WhatsApp: https://wa.me/22896951073

Cordialement,
DSE-SERVICE
```

## 2) Routage vers email / CRM

### Option A: Routage email simple
- Définir la notification principale vers `contact@dse-service.tg`.
- Ajouter une règle de filtre dans la messagerie selon le champ `service`:
`construction`, `maintenance`, `etudes-conseil`, `travaux-publics`, `autre`.

### Option B: Routage CRM (recommandé)
- Activer **Webhook** Formspree vers Make/Zapier.
- Mapper les champs: `name`, `email`, `message`, `service`, `lead_source`, `created_at`.
- Créer automatiquement un lead dans le CRM avec pipeline `Nouveau lead web`.
- Affectation:
  - `construction` -> Responsable Construction
  - `maintenance` -> Responsable Maintenance
  - `etudes-conseil` -> Responsable Études
  - `travaux-publics` -> Responsable TP
  - `autre` -> Responsable Commercial

## 3) Modèles de relance J+1 / J+3

### Relance J+1

Objet:
`Suite à votre demande - DSE-SERVICE`

Message:

```text
Bonjour {{prenom}},

Nous revenons vers vous suite à votre demande concernant {{service}}.
Pouvez-vous nous confirmer vos priorités (délai, budget, localisation) afin de vous proposer une réponse précise?

Cordialement,
DSE-SERVICE
```

### Relance J+3

Objet:
`Avez-vous toujours besoin d’un accompagnement ?`

Message:

```text
Bonjour {{prenom}},

Sans retour de votre part, nous clôturons temporairement votre demande.
Si vous souhaitez poursuivre, répondez simplement à ce message ou contactez-nous sur WhatsApp:
https://wa.me/22896951073

Cordialement,
DSE-SERVICE
```

## 4) Règles opérationnelles recommandées

- Créer une tâche de rappel automatique à J+1 si aucune réponse commerciale.
- Créer une tâche de clôture à J+3 si lead inactif.
- Tagger les leads avec `source=website-dse-service`.
