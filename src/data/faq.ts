/**
 * FAQ de la home — source unique consommée par `home/Faq.astro` (affichage) et
 * `pages/index.astro` (FAQPage JSON-LD). Le contenu rendu et le JSON-LD DOIVENT
 * être identiques (règle Google pour les rich results FAQ).
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const homeFaq: FaqItem[] = [
  {
    q: 'Quand est-ce que je commence à payer ?',
    a: "Le 1er mois est toujours offert. Tant que le site ne vous a pas amené au moins 2 demandes dans le mois, on vous offre le mois suivant — on ne facture rien tant que ça n'a pas décollé. Dès qu'il démarre, on vous propose de continuer : l'abonnement commence le mois d'après, si vous le voulez. Seuls frais au départ : 50 € pour le nom de domaine, une seule fois.",
  },
  {
    q: 'Je suis engagé combien de temps ?',
    a: "Aucun engagement. Vous arrêtez quand vous voulez, d'un mois sur l'autre.",
  },
  {
    q: "Si j'arrête, je garde mon site ?",
    a: 'À préciser ensemble selon votre formule — on en parle franchement dès le premier appel, sans piège.',
  },
  {
    q: 'En combien de temps je suis en ligne ?',
    a: 'Votre site est en ligne en 2 semaines environ — on vous donne une date précise dès le point de départ.',
  },
  {
    q: "C'est pour quels métiers ?",
    a: 'Bâtiment, finitions, services techniques : maçons, électriciens, plombiers, peintres, applicateurs de résine…',
  },
  {
    q: 'Pourquoi pas juste payer un site une fois ?',
    a: "Parce qu'un site livré puis abandonné se dégrade : il décroche sur Google, ses infos datent. L'abonnement le garde vivant et visible — c'est tout l'intérêt.",
  },
];
