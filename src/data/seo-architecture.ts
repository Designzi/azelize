/**
 * Registre SEO — SOURCE DE VÉRITÉ UNIQUE de l'architecture en couches (Partie B).
 *
 * Encode toute la matrice (services × villes × métiers) avec un STATUT par cellule.
 * Règle d'or anti-doorway : seules les pages `ship` sont générées, indexées et au
 * sitemap. `conditionnel` = en attente d'un contenu réel (cas client / FAQ locale)
 * → non buildées (donc absentes du sitemap, jamais doorway). `exclu` = jamais créées.
 *
 * Transposé du `seo-config.ts` de far (resinefar.fr) : la curation pilote le build.
 *
 * ⚠️ Ne JAMAIS faire passer une cellule à `ship` sans contenu unique réel
 * (≥1 cas local OU FAQ métier distincte) — cf. Axe 1 (doorway) de la Revue d'état.
 */
import type { SectionData } from '@lib/sections';

export type Statut = 'ship' | 'conditionnel' | 'exclu';

// ── Couche 1 : SERVICES ──────────────────────────────────────────────────────

export interface Service {
  slug: string;
  nom: string; // libellé affiché, ex. « Création de site internet »
  court: string; // libellé court (nav, fil d'Ariane), ex. « Création de site »
  resume: string; // meta description / résumé hub
  statut: Statut;
  /** Le service ouvre-t-il une matrice ville / métier (couches 2–4) ? */
  matrice: { ville: boolean; metier: boolean };
  /** Contenu éditorial du hub (blocs composés, rendus par Blocks.astro). */
  hub: SectionData[];
}

export const SERVICES: Service[] = [
  {
    slug: 'creation-site-internet',
    nom: 'Création de site internet',
    court: 'Création de site',
    resume:
      'Un site professionnel créé, référencé et tenu pour vous chaque mois. Pensé pour les artisans : rapide, clair, taillé pour amener des clients.',
    statut: 'ship',
    matrice: { ville: true, metier: true },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Création de site internet',
        title: 'Un site professionnel, créé et tenu pour vous.',
        lead: "Vous ne payez l'abonnement qu'une fois que le site vous amène des clients. On crée, on référence, on entretient — vous gardez votre métier.",
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'kiwi',
        items: [
          'Un site clair, rapide et fidèle à votre métier',
          'Référencement local soigné dès la mise en ligne',
          'Demande de devis et appel en évidence',
          'Suivi et mises à jour chaque mois',
        ],
        note: 'Sans engagement — vous arrêtez quand vous voulez.',
      },
      {
        type: 'timeline',
        eyebrow: 'La méthode',
        title: 'Comment on travaille',
        accent: 'miel',
        steps: [
          { num: '1', title: 'On cadre', body: 'Votre métier, vos clients, vos zones — en un appel de 15 minutes.' },
          { num: '2', title: 'On construit', body: 'Site en ligne en deux semaines environ, avec du contenu réel.' },
          { num: '3', title: 'On entretient', body: 'On suit, on ajuste, on fait évoluer — chaque mois.' },
        ],
      },
    ],
  },
  {
    slug: 'referencement-seo',
    nom: 'Référencement SEO local',
    court: 'Référencement SEO',
    resume:
      'Être trouvé sur Google quand un client cherche votre métier près de chez lui. Référencement local suivi et entretenu mois après mois.',
    statut: 'ship',
    matrice: { ville: true, metier: true },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Référencement SEO local',
        title: 'Être trouvé au moment où le client cherche.',
        lead: '81 % des clients cherchent sur Google avant d’appeler un artisan. Si vous n’êtes pas dans les premiers, vous perdez l’appel. On vous y met, et on vous y tient.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce qu’on met en place',
        accent: 'menthe',
        items: [
          'Référencement sur vos villes et vos prestations',
          'Fiche Google et avis travaillés',
          'Contenu local utile, jamais des pages creuses',
          'Suivi des positions et ajustements mensuels',
        ],
        note: 'Le SEO se gagne dans la durée — d’où le suivi mensuel.',
      },
    ],
  },
  {
    slug: 'identite-visuelle',
    nom: 'Identité visuelle',
    court: 'Identité visuelle',
    resume:
      'Logo, couleurs, typographies : une identité cohérente qui inspire confiance, sur votre site comme sur vos supports.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Identité visuelle',
        title: 'Une image pro, cohérente partout.',
        lead: 'Un logo et une charte clairs, déclinés sur votre site, vos devis et vos véhicules. La confiance commence par l’apparence.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'citron',
        items: [
          'Logo et déclinaisons (couleur, monochrome, favicon)',
          'Charte : couleurs, typographies, usages',
          'Cohérence avec votre site et vos supports',
          'Fichiers sources livrés',
        ],
      },
    ],
  },
  {
    slug: 'habillage-vehicule-covering',
    nom: 'Habillage véhicule & covering',
    court: 'Covering',
    resume:
      'Votre véhicule devient une publicité roulante : marquage et covering cohérents avec votre identité.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Habillage véhicule & covering',
        title: 'Votre camion travaille pour vous, même à l’arrêt.',
        lead: 'Marquage, covering, lettrage : un véhicule habillé, c’est des centaines de clients croisés chaque jour, dans votre identité.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'fraise',
        items: [
          'Conception cohérente avec votre identité',
          'Marquage partiel ou covering total',
          'Coordonnées et services bien lisibles',
          'Pose soignée et durable',
        ],
      },
    ],
  },
  {
    slug: 'production-video',
    nom: 'Production vidéo',
    court: 'Vidéo',
    resume:
      'Une vidéo courte qui montre votre travail et inspire confiance — pour votre site, Google et les réseaux.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Production vidéo',
        title: 'Montrer vaut mieux que raconter.',
        lead: 'Une vidéo de présentation ou de chantier, courte et nette, qui rassure le client avant même l’appel.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'kiwi',
        items: [
          'Vidéo de présentation ou de chantier',
          'Format adapté site, Google et réseaux',
          'Montage soigné, durée maîtrisée',
          'Sous-titres et image de marque',
        ],
      },
    ],
  },
  {
    slug: 'supports-print',
    nom: 'Supports print',
    court: 'Print',
    resume:
      'Cartes, flyers, devis, signalétique : des supports imprimés cohérents avec votre identité et votre site.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Supports print',
        title: 'Le papier qui prolonge votre image.',
        lead: 'Cartes de visite, flyers, devis, panneaux de chantier : des supports cohérents avec votre identité, prêts à imprimer.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'miel',
        items: [
          'Cartes de visite, flyers, plaquettes',
          'Modèles de devis et factures à votre image',
          'Signalétique et panneaux de chantier',
          'Fichiers prêts pour l’impression',
        ],
      },
    ],
  },
  {
    slug: 'templates-canva',
    nom: 'Templates Canva',
    court: 'Templates Canva',
    resume:
      'Des modèles Canva prêts à l’emploi pour communiquer vite : publications réseaux, devis, flyers. Vous personnalisez en quelques clics, sans designer.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Templates Canva',
        title: 'Communiquez vite, sans designer.',
        lead: 'Des modèles Canva prêts à l’emploi, à votre image : publications réseaux, devis, flyers. Vous changez le texte et la photo, c’est publié.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'citron',
        items: [
          'Des modèles aux couleurs et au logo de votre métier',
          'Publications réseaux prêtes à poster',
          'Devis, flyers et affichettes à compléter',
          'Tout reste modifiable dans Canva, à votre rythme',
        ],
        note: 'Modèles éprouvés — plus de 6 millions de téléchargements côté studio.',
      },
      {
        type: 'timeline',
        eyebrow: 'Comment ça marche',
        title: 'De zéro à publié en quelques minutes',
        accent: 'miel',
        steps: [
          { num: '1', title: 'Vous recevez vos modèles', body: 'Une sélection à votre image, ouverte dans votre compte Canva.' },
          { num: '2', title: 'Vous personnalisez', body: 'Vous changez le texte, la photo, l’offre du moment — sans toucher à la mise en page.' },
          { num: '3', title: 'Vous publiez', body: 'Réseaux, impression, devis client : exporté et prêt en quelques clics.' },
        ],
      },
      {
        type: 'compare',
        eyebrow: 'Pourquoi des modèles',
        title: 'Partir d’une page blanche, ou d’un modèle qui marche',
        accent: 'fraise',
        bad: {
          title: 'Sans modèle',
          items: [
            'Une page blanche à chaque publication',
            'Un rendu différent à chaque fois',
            'Du temps perdu, ou un designer à payer',
          ],
        },
        good: {
          title: 'Avec vos modèles Canva',
          items: [
            'Une base soignée, prête à compléter',
            'Une image cohérente à chaque support',
            'Quelques minutes, en autonomie',
          ],
        },
        close: 'Vous gardez la main : on prépare la base, vous gardez votre métier.',
      },
      {
        type: 'faq',
        eyebrow: 'Questions fréquentes',
        title: 'Ce qu’on nous demande souvent',
        items: [
          {
            q: 'Faut-il savoir utiliser Canva ?',
            a: 'Non. Si vous savez changer un texte et glisser une photo, vous savez utiliser vos modèles. Tout le reste est déjà calé.',
          },
          {
            q: 'Les modèles sont-ils à mon image ?',
            a: 'Oui. On les prépare avec vos couleurs et votre logo, pour que chaque publication reste cohérente avec votre site et vos supports.',
          },
          {
            q: 'Puis-je les modifier autant que je veux ?',
            a: 'Oui. Les modèles restent dans votre compte Canva : vous les réutilisez et les adaptez à chaque nouvelle offre, sans repartir de zéro.',
          },
        ],
      },
    ],
  },
  {
    slug: 'saas-outils',
    nom: 'SaaS & outils sur-mesure',
    court: 'SaaS & outils',
    resume:
      'Prise de RDV, suivi de chantier, devis en ligne : un outil sur-mesure qui vous fait gagner du temps et professionnalise la relation client. Créé et tenu chaque mois.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'SaaS & outils sur-mesure',
        title: 'Un outil taillé pour votre façon de travailler.',
        lead: 'Prise de rendez-vous, suivi de chantier, devis en ligne, espace client : on construit l’outil qui vous fait gagner du temps et rassure vos clients. Vous gardez votre métier, on tient l’outil.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'kiwi',
        items: [
          'Un outil pensé sur vos gestes réels, pas un logiciel générique',
          'Espace client clair : suivi de chantier, documents, échanges',
          'Prise de rendez-vous et devis en ligne reliés à votre site',
          'Hébergement, sauvegardes et mises à jour assurés chaque mois',
        ],
        note: 'Sans engagement — vous arrêtez quand vous voulez, vos données restent les vôtres.',
      },
      {
        type: 'grid',
        eyebrow: 'Les usages',
        title: 'Ce qu’on peut construire pour vous',
        accent: 'menthe',
        cols: 3,
        items: [
          {
            title: 'Prise de rendez-vous',
            body: 'Vos clients réservent un créneau en ligne, selon vos disponibilités réelles — fini les allers-retours par téléphone.',
          },
          {
            title: 'Suivi de chantier',
            body: 'Un espace où le client voit l’avancement, les photos et les documents. Moins d’appels, plus de confiance.',
          },
          {
            title: 'Devis en ligne',
            body: 'Le client remplit sa demande, vous recevez tout au clair et envoyez un devis propre, à votre image.',
          },
          {
            title: 'Espace client',
            body: 'Factures, devis et échanges réunis au même endroit, accessibles à tout moment par votre client.',
          },
          {
            title: 'Tableau de bord',
            body: 'Vos rendez-vous, demandes et chantiers en cours d’un coup d’œil, depuis votre téléphone.',
          },
          {
            title: 'Relances automatiques',
            body: 'Rappels de rendez-vous et relances de devis envoyés tout seuls, pour ne plus rien laisser filer.',
          },
        ],
      },
      {
        type: 'timeline',
        eyebrow: 'La méthode',
        title: 'Comment on construit votre outil',
        accent: 'miel',
        steps: [
          {
            num: '1',
            title: 'On observe',
            body: 'On part de votre quotidien : ce qui vous prend du temps, ce que vos clients réclament. Pas de fonction inutile.',
          },
          {
            num: '2',
            title: 'On construit',
            body: 'Une première version utile, mise en service vite, puis ajustée avec vous au fil des retours.',
          },
          {
            num: '3',
            title: 'On entretient',
            body: 'Hébergement, sauvegardes, corrections et évolutions : tout est suivi chaque mois.',
          },
        ],
      },
      {
        type: 'faq',
        eyebrow: 'Questions fréquentes',
        title: 'Ce qu’on nous demande souvent',
        accent: 'citron',
        items: [
          {
            q: 'Je n’ai pas le temps de gérer un logiciel. C’est compliqué pour moi ?',
            a: 'Non. L’outil est pensé pour être pris en main en quelques minutes, et c’est nous qui le tenons : mises à jour, sauvegardes et corrections sont comprises dans l’abonnement.',
          },
          {
            q: 'Est-ce que ça se relie à mon site existant ?',
            a: 'Oui. Prise de rendez-vous, devis en ligne ou espace client s’intègrent à votre site et à votre identité, sans rupture pour vos clients.',
          },
          {
            q: 'À qui appartiennent les données de mes clients ?',
            a: 'Elles restent les vôtres. Si vous arrêtez l’abonnement, on vous les remet dans un format réutilisable — vous n’êtes jamais prisonnier de l’outil.',
          },
        ],
      },
    ],
  },
  {
    slug: 'automatisations',
    nom: 'Automatisations',
    court: 'Automatisations',
    resume:
      'Relances de devis, demandes d’avis, e-mails et rappels : on automatise les tâches répétitives pour vous rendre du temps. Mis en place et suivi chaque mois.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Automatisations',
        title: 'Les relances se font toutes seules, vous gardez le chantier.',
        lead: 'Un devis envoyé qu’on oublie de relancer, c’est un client perdu. On automatise les tâches répétitives — relances, avis, rappels — et on suit le tout chaque mois. Vous, vous restez sur votre métier.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce qu’on met en place',
        accent: 'menthe',
        items: [
          'Relance automatique des devis sans réponse',
          'Demande d’avis envoyée après chaque chantier terminé',
          'E-mails et rappels de rendez-vous au bon moment',
          'Réglages et suivi des automatisations chaque mois',
        ],
        note: 'Sans engagement — vous arrêtez quand vous voulez.',
      },
      {
        type: 'grid',
        eyebrow: 'Les usages',
        title: 'Ce qu’on automatise pour vous',
        intro: 'Des tâches simples mais chronophages, qu’on enlève de votre liste une bonne fois.',
        cols: 2,
        accent: 'miel',
        items: [
          {
            title: 'Relances de devis',
            body: 'Un rappel poli part tout seul si le client n’a pas répondu sous quelques jours. Vous ne laissez plus filer un devis.',
          },
          {
            title: 'Avis clients',
            body: 'Une demande d’avis envoyée au bon moment, juste après le chantier. Plus d’avis, mieux placé sur Google.',
          },
          {
            title: 'Rappels de rendez-vous',
            body: 'Le client reçoit un rappel avant votre passage. Moins de rendez-vous oubliés, moins de déplacements pour rien.',
          },
          {
            title: 'E-mails de suivi',
            body: 'Confirmation, remerciement, suivi après intervention : les messages utiles partent au bon moment, sans y penser.',
          },
        ],
      },
      {
        type: 'compare',
        eyebrow: 'Avant / après',
        title: 'Ce que ça change concrètement',
        accent: 'fraise',
        bad: {
          title: 'Aujourd’hui, à la main',
          items: [
            'Des devis qui dorment, faute de temps pour relancer',
            'Peu d’avis, parce qu’on n’ose pas les demander',
            'Des rendez-vous oubliés et des trajets pour rien',
            'Le soir passé à rattraper les e-mails en retard',
          ],
        },
        good: {
          title: 'Avec les automatisations',
          items: [
            'Chaque devis est relancé, sans y penser',
            'Les avis arrivent au bon moment, tout seuls',
            'Les clients sont rappelés avant chaque passage',
            'Le suivi tourne pendant que vous êtes sur le chantier',
          ],
        },
        close: 'On règle, on teste, on suit : vous récupérez vos soirées.',
      },
      {
        type: 'faq',
        eyebrow: 'Questions fréquentes',
        title: 'Ce qu’on nous demande souvent',
        tone: 'parchment',
        items: [
          {
            q: 'Ça ne va pas faire « robot » auprès de mes clients ?',
            a: 'Non. Les messages sont rédigés à votre nom, dans un ton simple et humain. Le client reçoit le bon message au bon moment — il ne voit pas la mécanique derrière.',
          },
          {
            q: 'Je dois installer un logiciel ou apprendre un outil ?',
            a: 'Non. On met tout en place et on s’occupe des réglages. De votre côté, rien à gérer : les automatisations tournent en arrière-plan et on vous fait un point chaque mois.',
          },
          {
            q: 'Et si je veux modifier ou couper une relance ?',
            a: 'Vous nous le dites, on ajuste. Tout est réglable : le délai, le texte, les destinataires. Et comme c’est sans engagement, vous pouvez tout arrêter quand vous voulez.',
          },
        ],
      },
    ],
  },
  {
    slug: 'templates-email',
    nom: 'Templates e-mail',
    court: 'Templates e-mail',
    resume:
      'Signatures et modèles d’e-mails professionnels, cohérents avec votre identité. Une image soignée à chaque envoi, prête à coller dans votre messagerie.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Templates e-mail',
        title: 'Chaque e-mail renvoie une image pro.',
        lead: 'Signature soignée, modèles de réponse prêts à l’emploi : vos clients reçoivent la même image que sur votre site, du devis à la relance.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'citron',
        items: [
          'Signature e-mail à votre identité (logo, couleurs, coordonnées)',
          'Modèles de réponse : devis, prise de rendez-vous, relance, remerciement',
          'Mise en page compatible Gmail, Outlook et mobile',
          'Notice d’installation simple, pour vous comme pour votre équipe',
        ],
        note: 'Sans engagement — vous arrêtez quand vous voulez.',
      },
      {
        type: 'timeline',
        eyebrow: 'La méthode',
        title: 'Comment on travaille',
        accent: 'miel',
        steps: [
          { num: '1', title: 'On cadre', body: 'Vos envois courants, votre identité, votre messagerie — en un appel de 15 minutes.' },
          { num: '2', title: 'On rédige', body: 'Signature et modèles écrits à votre voix, fidèles à votre image.' },
          { num: '3', title: 'On installe', body: 'On pose le tout dans votre messagerie et on ajuste avec vous.' },
        ],
      },
      {
        type: 'compare',
        eyebrow: 'La différence',
        title: 'Avant / après',
        accent: 'kiwi',
        bad: {
          title: 'Sans modèles',
          items: [
            'Une signature bricolée, ou pas de signature du tout',
            'Chaque e-mail réécrit de zéro, fautes comprises',
            'Logo flou, coordonnées qui changent d’un envoi à l’autre',
          ],
        },
        good: {
          title: 'Avec vos templates',
          items: [
            'Une signature nette, identique sur chaque message',
            'Des réponses prêtes : il ne reste qu’à compléter',
            'La même image que votre site, à chaque échange',
          ],
        },
        close: 'Un e-mail soigné, c’est un client rassuré avant même de vous rencontrer.',
      },
      {
        type: 'faq',
        eyebrow: 'Questions fréquentes',
        title: 'Ce qu’on nous demande',
        items: [
          {
            q: 'Ça marche avec ma messagerie actuelle ?',
            a: 'Oui. Les signatures et modèles sont compatibles Gmail, Outlook et les messageries mobiles. On vous remet une notice simple, ou on les installe avec vous.',
          },
          {
            q: 'Je peux modifier les textes moi-même ?',
            a: 'Bien sûr. Les modèles sont pensés pour être complétés en quelques mots avant l’envoi. La structure et l’image restent en place, vous gardez la main sur le contenu.',
          },
          {
            q: 'C’est compris dans l’abonnement ?',
            a: 'Oui, comme le reste : on crée vos templates, on les tient à jour et on les fait évoluer chaque mois. Sans engagement, vous arrêtez quand vous voulez.',
          },
        ],
      },
    ],
  },
  {
    slug: 'catalogues-produit',
    nom: 'Catalogues produit',
    court: 'Catalogues',
    resume:
      'Vos catalogues produit imprimés, PDF et web, tenus à jour chaque mois. Pour présenter votre gamme clairement à vos clients, sans la refaire à chaque changement de prix.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Catalogues produit',
        title: 'Votre gamme présentée clairement, partout.',
        lead: 'Un catalogue imprimé à laisser au client, un PDF à envoyer, une version web à jour. On le conçoit, et on le tient à jour mois après mois — vous gardez votre métier.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'miel',
        items: [
          'Un catalogue clair, fidèle à votre gamme et à votre image',
          'Trois versions : imprimé, PDF à envoyer, page web',
          'Prix, références et photos à jour chaque mois',
          'Fichiers prêts pour l’impression livrés',
        ],
        note: 'Sans engagement — vous arrêtez quand vous voulez.',
      },
      {
        type: 'grid',
        eyebrow: 'Trois usages',
        title: 'Un catalogue, trois façons de s’en servir',
        intro: 'La même gamme, déclinée là où vos clients la regardent.',
        accent: 'citron',
        cols: 3,
        items: [
          {
            title: 'Imprimé',
            body: 'À poser sur le comptoir ou à glisser dans la main du client. Le support qui reste après la visite.',
          },
          {
            title: 'PDF',
            body: 'À envoyer par mail ou message en deux secondes. Le client garde votre gamme sous les yeux.',
          },
          {
            title: 'Web',
            body: 'Une page intégrée à votre site, toujours à jour. Trouvable sur Google, partageable par lien.',
          },
        ],
      },
      {
        type: 'compare',
        eyebrow: 'La différence',
        title: 'Un catalogue tenu, pas un catalogue figé',
        accent: 'fraise',
        bad: {
          title: 'Le catalogue qu’on refait une fois',
          items: [
            'Prix dépassés au bout de six mois',
            'Produits retirés encore présentés',
            'Une seule version, vite perdue ou périmée',
            'Tout à refaire au moindre changement',
          ],
        },
        good: {
          title: 'Le catalogue qu’on tient avec vous',
          items: [
            'Prix et références à jour chaque mois',
            'Gamme qui suit vos nouveautés et vos retraits',
            'Imprimé, PDF et web cohérents entre eux',
            'Une demande, on met à jour — vous n’y touchez pas',
          ],
        },
        close: 'Un catalogue n’est utile que s’il est juste. C’est pour ça qu’on le tient.',
      },
      {
        type: 'faq',
        eyebrow: 'Questions fréquentes',
        title: 'Ce qu’on nous demande souvent',
        items: [
          {
            q: 'Et si mes prix changent en cours de mois ?',
            a: 'Vous nous le signalez, on met à jour le PDF et la version web aussitôt. L’imprimé est recalé à la prochaine réimpression, quand vous en avez besoin.',
          },
          {
            q: 'Je n’ai pas de belles photos de mes produits — c’est bloquant ?',
            a: 'Non. On part de ce que vous avez et on cadre proprement. Si une gamme mérite mieux, on en discute, mais on ne vous bloque jamais sur une photo.',
          },
          {
            q: 'Le catalogue web, c’est une boutique en ligne ?',
            a: 'Non, c’est une vitrine : on présente la gamme clairement, le client vous contacte. Pas de paiement ni de stock à gérer — juste votre offre, lisible et à jour.',
          },
        ],
      },
    ],
  },
];

export const getService = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);

/** Service consommant la collection `metiers` pour sa matrice métier (couche 3). */
export const SERVICE_AVEC_METIERS = 'creation-site-internet';

// ── Couches 2–4 : matrice locale (ROADMAP — pilotée, non encore buildée) ─────
//
// Encodage de la matrice Partie B. Aucune de ces cellules n'est `ship` à ce jour
// (contenu local / cas client à venir). Pour activer une page : passer à `ship`
// ET fournir le contenu unique réel, PUIS câbler la route correspondante.

export interface Ville {
  slug: string;
  nom: string;
  population: number;
  zone: 'siege' | 'bassin' | 'rayonnement';
}

export const VILLES: Ville[] = [
  { slug: 'lanester', nom: 'Lanester', population: 7200, zone: 'siege' },
  { slug: 'lorient', nom: 'Lorient', population: 57000, zone: 'bassin' },
  { slug: 'vannes', nom: 'Vannes', population: 47000, zone: 'rayonnement' },
  { slug: 'hennebont', nom: 'Hennebont', population: 12500, zone: 'bassin' },
  { slug: 'auray', nom: 'Auray', population: 13000, zone: 'rayonnement' },
  { slug: 'ploemeur', nom: 'Ploemeur', population: 4000, zone: 'bassin' },
  { slug: 'queven', nom: 'Quéven', population: 6000, zone: 'bassin' },
];

/** Métiers BTP visés (couche 3). `statut` = intention; le BUILD suit la collection `metiers`. */
export interface MetierCible {
  slug: string;
  nom: string;
  statut: Statut; // ship = contenu rédigé (présent dans la collection metiers)
}

export const METIERS_CIBLES: MetierCible[] = [
  { slug: 'plombier', nom: 'Plombier', statut: 'ship' },
  { slug: 'electricien', nom: 'Électricien', statut: 'ship' },
  { slug: 'paysagiste', nom: 'Paysagiste', statut: 'ship' },
  { slug: 'menuisier', nom: 'Menuisier', statut: 'ship' },
  { slug: 'macon', nom: 'Maçon', statut: 'ship' },
  { slug: 'peintre', nom: 'Peintre', statut: 'ship' },
  { slug: 'carreleur', nom: 'Carreleur', statut: 'ship' },
  { slug: 'couvreur', nom: 'Couvreur', statut: 'ship' },
  { slug: 'plaquiste', nom: 'Plaquiste', statut: 'ship' },
  { slug: 'entreprise-renovation', nom: 'Entreprise de rénovation', statut: 'ship' },
];

/**
 * Matrice service × ville (couche 2) — statuts issus de la Partie B.
 * Clé = `${service}/${ville}`. Toutes `conditionnel`/`exclu` aujourd'hui :
 * en attente du cas client FAR + FAQ locale réelle (décision : scaffolder).
 */
export const MATRICE_VILLE: Record<string, Statut> = {
  'creation-site-internet/lanester': 'conditionnel',
  'creation-site-internet/lorient': 'conditionnel',
  'creation-site-internet/vannes': 'conditionnel',
  'creation-site-internet/hennebont': 'conditionnel',
  'creation-site-internet/auray': 'conditionnel',
  'creation-site-internet/ploemeur': 'exclu', // pop. < 5k, demande nulle, doorway
  'creation-site-internet/queven': 'exclu',
  'referencement-seo/lanester': 'conditionnel',
  'referencement-seo/lorient': 'conditionnel',
};
