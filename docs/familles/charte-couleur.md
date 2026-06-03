# Charte couleur Azelize — combinaisons retenues (figé)

> Issu du tri exhaustif des 5 familles fruit × 36 couples × 4 régimes (720 visualisations).
> **17 combinaisons** retenues au total. Toute couleur provient de la matrice 3×3 de la famille
> (9 nuances `sXX-bYY`) ; aucune couleur inventée. Ratios WCAG vérifiés.

## Vocabulaire

- **Nuance** : `sXX-bYY` — `s` = saturation (25/50/100), `b` = luminosité (25/50/100).
- **Tint (clair)** : la nuance la plus claire du couple → surface tintée.
- **Profond** : la nuance la plus foncée du couple → surface saturée.
- **Régime** : disposition des deux nuances —
  - `Doux` : carte = **tint** sur **blanc**.
  - `Profond` : carte = **profond** sur **blanc**.
  - `Carte claire / fond foncé` : carte = **tint** posée sur un sol = **profond**.
  - `Carte foncée / fond clair` : carte = **profond** posée sur un sol = **tint**.

---

## Les règles (déduites des 17 retenues)

1. **Tint = luminosité max (`b100`)** — 15/17. Le tint est presque toujours une nuance `b100`,
   le plus souvent **`s25-b100`** (clair peu saturé). → la surface claire doit être lumineuse.
2. **Profond = saturé et foncé** — profond en `s100` dans 12/17, et `b25`/`b50` dans 13/17
   (`s100-b25` en tête). → la surface profonde doit être saturée et sombre.
3. **Fort écart de luminance** — une combinaison tient par le **contraste** tint clair × profond
   foncé, pas par l'harmonie de teinte.
4. **Carte sur couleur > carte sur blanc** — 13/17 en régimes *Carte claire/foncée*.
   `Doux` et `Profond` (sur blanc) restent l'exception (2 + 2), réservés aux fruits clairs.
5. **À bannir** : tint en `b25`/`b50` sombre, profond clair en `b100`, et le régime `Profond`
   pour les fruits foncés (bleu/rouge ne tiennent pas sur blanc).
6. **Texte & accent 100 % matrice, cible AAA** : l'accent (logo + eyebrow) vise un ratio ≥ 7 ;
   s'il est impossible dans la matrice, dernier recours noir/blanc. *(Limite physique : sur un
   fond rouge pur `s100-b100`, AAA est inatteignable même en noir.)*

---

## Combinaisons retenues par famille

### Menthe (bleu · H=225 · marque) — 2
| Tint | Profond | Régime |
|---|---|---|
| s25-b100 | s100-b100 | Profond |
| s25-b100 | s100-b50 | Carte foncée / fond clair |

### Fraise (rouge · H=0) — 3
| Tint | Profond | Régime |
|---|---|---|
| s25-b100 | s100-b25 | Carte claire / fond foncé |
| s25-b100 | s100-b50 | Carte foncée / fond clair |
| s50-b50 | s100-b50 | Profond |

### Miel (orange · H=25) — 3
| Tint | Profond | Régime |
|---|---|---|
| s100-b100 | s100-b25 | Carte foncée / fond clair |
| s25-b100 | s100-b100 | Carte claire / fond foncé |
| s25-b100 | s50-b100 | Doux |

### Citron (jaune · H=50) — 3
| Tint | Profond | Régime |
|---|---|---|
| s100-b100 | s50-b25 | Carte claire / fond foncé |
| s25-b100 | s100-b100 | Carte claire / fond foncé |
| s50-b100 | s100-b25 | Carte foncée / fond clair |

### Kiwi (vert · H=75) — 6
| Tint | Profond | Régime |
|---|---|---|
| s100-b100 | s100-b25 | Carte foncée / fond clair |
| s100-b100 | s50-b25 | Carte claire / fond foncé |
| s25-b50 | s25-b25 | Carte foncée / fond clair |
| s50-b100 | s100-b25 | Carte claire / fond foncé |
| s50-b100 | s100-b25 | Carte foncée / fond clair |
| s50-b100 | s25-b25 | Doux |

---

## Récap chiffré

| Famille | Retenues |
|---|---|
| Menthe | 2 |
| Fraise | 3 |
| Miel | 3 |
| Citron | 3 |
| Kiwi | 6 |
| **Total** | **17** |

**Régimes** : Carte foncée 7 · Carte claire 6 · Profond 2 · Doux 2.
**Tint** : `b100` 15/17 (dominante `s25-b100`).
**Profond** : `s100` 12/17, `b25`/`b50` 13/17 (dominante `s100-b25`).

---

## Sémantique & usage — quelle couleur, pourquoi

**Principe : 1 couleur de marque + 4 signaux émotionnels.** La **Menthe (bleu)** porte
l'identité et l'action (présente partout). Les quatre fruits ne s'emploient que quand leur
message est pertinent — jamais en décor.

> **Décision marque : Menthe (bleu).** Bleu = confiance, sérieux, fiabilité — le registre d'un
> service B2B qui prend en main la présence en ligne. On vend du *sérieux qui rassure*, pas de
> l'euphorie. C'est déjà la « famille de marque » du design system.

| Famille | Émotion | Message | Où l'utiliser | Dosage |
|---|---|---|---|---|
| **Menthe** (bleu) | Confiance, sérieux, calme | « On s'en occupe, professionnellement » | Marque : logo, nav, **CTA principaux**, liens — le fil constant | Partout (primaire) |
| **Fraise** (rouge) | Douleur, urgence, manque | « Le problème que vous vivez » | Sections **problème/douleur**, erreurs, alertes | Rare, par touches |
| **Miel** (orange) | Chaleur, accueil, humain | « C'est simple, on vous accompagne » | **Parcours / onboarding**, étapes, « comment ça marche » | Modéré |
| **Citron** (jaune) | Clarté, fraîcheur, attention | « Le point clé, ici » | **Accents / highlights** ponctuels | Très parcimonieux |
| **Kiwi** (vert) | Succès, validation, croissance | « Inclus / prouvé / ça marche » | Badges **« inclus »**, ✓, résultats, témoignages, garanties | Modéré à large |

### Arc émotionnel d'une page (du problème à l'action)

1. **Fraise** → ouvrir sur la douleur (« vos clients vous cherchent, vous n'y êtes pas »)
2. **Miel** → rassurer par le parcours (« voici comment, en 3 étapes »)
3. **Kiwi** → prouver (« ce qui est inclus », résultats, avis)
4. **Citron** → souligner un point clé au passage
5. **Menthe** → l'action et la signature (CTA, logo) — du début à la fin

### Dosage (proportions cibles)

- **Menthe ~60 %** — structure, marque, action.
- **Kiwi + Miel ~30 %** — preuve + parcours, le corps rassurant.
- **Fraise + Citron ~10 %** — douleur + accent, par touches (rouge lourd, jaune criard si surdosés).

### Combinaison concrète par rôle (piochée dans les 17)

| Rôle | Combinaison | Pourquoi |
|---|---|---|
| **CTA principal** | Menthe `s25-b100 × s100-b50` · Carte foncée | bleu profond sur tint clair = bouton fort, identitaire |
| **Section problème** | Fraise `s50-b50 × s100-b50` · Profond | rouge profond sobre, sans agresser |
| **Étapes / parcours** | Miel `s25-b100 × s50-b100` · Doux | orange clair accueillant sur blanc |
| **« Inclus » / preuve** | Kiwi `s50-b100 × s100-b25` · Carte foncée/claire | vert souple, le plus flexible (6 combos) |
| **Highlight** | Citron `s100-b100 × s50-b25` · Carte claire | jaune vif en touche d'attention |

---

Pages interactives : `docs/familles/<fruit>.html` (chaque page n'affiche que sa palette retenue).
