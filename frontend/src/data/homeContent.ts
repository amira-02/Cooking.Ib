// Contenu éditorial de la page d'accueil.
// ➜ Les photos se changent depuis l'admin (Admin › Page d'accueil) : tant qu'aucune
//   photo n'est choisie pour un emplacement, la photo d'exemple ci-dessous s'affiche.
// ➜ Remplacez les valeurs marquées « À PERSONNALISER » avant la mise en ligne.

function unsplash(id: string, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;
}

export const BRAND = {
  name: "Cooking Ib",
  tagline:
    "Pâtisserie artisanale & trompe-l'œil. Des créations faites main, pensées pour surprendre et régaler.",
};

// À PERSONNALISER
export const CONTACT = {
  phone: "01 23 45 67 89",
  email: "contact@cooking-ib.fr",
  address: "12 rue des Pâtissiers, 75000 Paris",
  instagramHandle: "@cooking.ib",
  instagramUrl: "https://www.instagram.com/",
  facebookUrl: "https://www.facebook.com/",
  tiktokUrl: "https://www.tiktok.com/",
};

// Emplacements de photos modifiables depuis l'admin.
// Les clés doivent correspondre à IMAGE_SLOTS dans backend/services/homepageService.js
export const HOME_IMAGE_SLOTS = {
  hero: { label: "Photo principale", section: "En-tête", format: "Portrait 4:5", example: unsplash("1622621746668-59fb299bc4d7", 1400) },
  categoryTrompe: { label: "Trompe-l'œil", section: "Catégories", format: "Portrait 3:4", example: unsplash("1553279768-865429fa0078", 800) },
  categoryGateaux: { label: "Gâteaux", section: "Catégories", format: "Portrait 3:4", example: unsplash("1578985545062-69928b1d9587", 800) },
  categoryEntremets: { label: "Entremets", section: "Catégories", format: "Portrait 3:4", example: unsplash("1611293388250-580b08c4a145", 800) },
  categoryCoffrets: { label: "Coffrets", section: "Catégories", format: "Portrait 3:4", example: unsplash("1558326567-98ae2405596b", 800) },
  savoirFaire: { label: "L'atelier", section: "Savoir-faire", format: "Portrait 4:5", example: unsplash("1517686469429-8bdb88b9f907", 1200) },
  customOrder: { label: "Gâteau sur mesure", section: "Commande personnalisée", format: "Paysage ou carré", example: unsplash("1559620192-032c4bc4674e", 1200) },
  gallery1: { label: "Grande photo", section: "Galerie Instagram", format: "Carré", example: unsplash("1565958011703-44f9829ba187", 800) },
  gallery2: { label: "Photo 2", section: "Galerie Instagram", format: "Carré", example: unsplash("1519915028121-7d3463d20b13", 600) },
  gallery3: { label: "Photo 3", section: "Galerie Instagram", format: "Carré", example: unsplash("1569864358642-9d1684040f43", 600) },
  gallery4: { label: "Photo 4", section: "Galerie Instagram", format: "Carré", example: unsplash("1495147466023-ac5c588e2e94", 600) },
  gallery5: { label: "Photo 5", section: "Galerie Instagram", format: "Carré", example: unsplash("1578775887804-699de7086ff9", 600) },
  cta: { label: "Bannière finale", section: "Bannière « Découvrir la boutique »", format: "Paysage large", example: unsplash("1535141192574-5d4897c12636", 1600) },
};

export type HomeImageSlot = keyof typeof HOME_IMAGE_SLOTS;

// Photo à afficher pour chaque emplacement (undefined pendant le chargement)
export type HomeImages = Partial<Record<HomeImageSlot, string>>;

// `keyword` sert à ouvrir la boutique filtrée sur la catégorie dont le nom le contient
export const CATEGORY_CARDS = [
  {
    title: "Trompe-l'œil",
    description: "Fruits et objets plus vrais que nature",
    keyword: "trompe",
    imageSlot: "categoryTrompe" as HomeImageSlot,
  },
  {
    title: "Gâteaux",
    description: "Anniversaires, mariages et fêtes",
    keyword: "gateau",
    imageSlot: "categoryGateaux" as HomeImageSlot,
  },
  {
    title: "Entremets",
    description: "Mousses, inserts et glaçages miroir",
    keyword: "entremets",
    imageSlot: "categoryEntremets" as HomeImageSlot,
  },
  {
    title: "Coffrets",
    description: "Assortiments à offrir ou à partager",
    keyword: "douceurs",
    imageSlot: "categoryCoffrets" as HomeImageSlot,
  },
];

export const SAVOIR_FAIRE = {
  values: [
    { number: "01", title: "Créativité", text: "Des créations originales et surprenantes, imaginées pièce par pièce." },
    { number: "02", title: "Savoir-faire", text: "Une fabrication soignée et artisanale, du moulage au glaçage." },
    { number: "03", title: "Qualité", text: "Des ingrédients sélectionnés avec attention, au fil des saisons." },
  ],
};

export const CUSTOM_ORDER = {
  occasions: ["Anniversaire", "Mariage", "Baptême", "Événement d'entreprise"],
};

// À PERSONNALISER : remplacez par de vrais avis clients (les faux avis sont interdits en France)
export const TESTIMONIALS = [
  {
    name: "Camille R.",
    occasion: "Anniversaire",
    rating: 5,
    text: "Tout le monde a cru que c'était un vrai citron avant de couper dedans. Bluffant, et surtout délicieux !",
  },
  {
    name: "Julien M.",
    occasion: "Mariage",
    rating: 5,
    text: "Notre wedding cake était exactement comme imaginé. Des échanges très à l'écoute et un résultat magnifique.",
  },
  {
    name: "Sarah B.",
    occasion: "Coffret cadeau",
    rating: 5,
    text: "Un coffret offert à ma mère : présentation soignée, saveurs fines. On sent le travail artisanal.",
  },
];

export const GALLERY_SLOTS: HomeImageSlot[] = ["gallery1", "gallery2", "gallery3", "gallery4", "gallery5"];
