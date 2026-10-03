// Données de test pour remplir la carte.
// Photos : Unsplash (licence libre, https://unsplash.com/license)

function img(id) {
  return `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
}

// Catégories existantes (créées depuis l'admin) : on ne les modifie pas
const EXISTING_CATEGORIES = {
  anniversaire: "J1lLguF8mn1XA0YWNSys",
  mariage: "hs3xGeTG2AhFsTBlWdiT",
  trompe: "LbgACfkDds70n0gaPMQG",
};

// Catégories créées par le script (supprimées avec --clean)
const categories = [
  { key: "entremets", name: "Entremets & tartes", description: "Nos créations de pâtissier", order: 3 },
  { key: "cupcakes", name: "Cupcakes", description: "Petits gâteaux à partager", order: 4 },
  { key: "douceurs", name: "Biscuits & douceurs", description: "Pour les petites faims", order: 5 },
];

const products = [
  // ---------- TROMPE-L'ŒIL ----------
  // Photos de vrais fruits utilisées comme illustration provisoire : à remplacer
  // par les photos de vos trompe-l'œil depuis le dashboard
  {
    key: "trompe-fraise",
    category: "trompe",
    name: "Trompe-l'œil Fraise",
    price: 8.9,
    servesCount: 1,
    description:
      "Une fraise plus vraie que nature : glaçage rouge brillant, akènes dorés et collerette en pâte d'amande.\n\nÀ l'intérieur, mousse vanille de Madagascar, cœur coulant fraise et sablé breton.",
    ingredients: ["Mousse vanille", "Insert fraise", "Sablé breton", "Glaçage miroir"],
    images: [img("1464965911861-746a04b4bca6")],
  },
  {
    key: "trompe-citron",
    category: "trompe",
    name: "Trompe-l'œil Citron",
    price: 8.9,
    servesCount: 1,
    description:
      "Un citron jaune au relief texturé, jusqu'aux pores de l'écorce.\n\nMousse citron de Menton, crémeux yuzu et biscuit amande.",
    ingredients: ["Mousse citron", "Crémeux yuzu", "Biscuit amande", "Velours chocolat blanc"],
    images: [img("1568569350062-ebfa3cb195df")],
  },
  {
    key: "trompe-pomme",
    category: "trompe",
    name: "Trompe-l'œil Pomme",
    price: 9.5,
    servesCount: 1,
    description:
      "Une pomme rouge éclatante avec sa tige en chocolat.\n\nMousse pomme verte, compotée de pommes caramélisées et sablé cannelle.",
    ingredients: ["Mousse pomme", "Pommes caramélisées", "Sablé cannelle", "Glaçage rouge"],
    images: [img("1567306226416-28f0efdc88ce")],
  },
  {
    key: "trompe-mangue",
    category: "trompe",
    name: "Trompe-l'œil Mangue",
    price: 9.5,
    servesCount: 1,
    description:
      "Une mangue dégradée du jaune au rouge, d'un réalisme bluffant.\n\nMousse mangue, cœur passion et biscuit coco.",
    ingredients: ["Mousse mangue", "Insert passion", "Biscuit coco", "Velours coloré"],
    images: [img("1553279768-865429fa0078")],
  },

  // ---------- GÂTEAUX ANNIVERSAIRE ----------
  {
    key: "fondant-chocolat",
    category: "anniversaire",
    name: "Fondant Chocolat Intense",
    price: 42,
    servesCount: 8,
    description:
      "Trois étages de génoise au cacao, ganache chocolat noir 70 % et coulis de chocolat sur le dessus.\n\nLe gâteau préféré des amateurs de chocolat, décoré de rosaces de crème au beurre cacao.",
    ingredients: ["Génoise cacao", "Ganache chocolat noir 70 %", "Crème au beurre cacao", "Glaçage miroir"],
    images: [img("1578985545062-69928b1d9587"), img("1602351447937-745cb720612f"), img("1586985289688-ca3cf47d3e6e")],
  },
  {
    key: "layer-cake-arc-en-ciel",
    category: "anniversaire",
    name: "Layer Cake Arc-en-ciel",
    price: 55,
    servesCount: 12,
    description:
      "Six couches de génoise vanille colorées, crème au mascarpone et éclats de sprinkles.\n\nUne surprise à la découpe qui fait toujours son effet auprès des enfants.",
    ingredients: ["Génoise vanille", "Crème mascarpone", "Sprinkles", "Colorants naturels"],
    images: [img("1464349095431-e9a21285b5f3")],
  },
  {
    key: "naked-cake-fraise",
    category: "anniversaire",
    name: "Naked Cake Fraise Framboise",
    price: 48,
    servesCount: 10,
    description:
      "Génoise légère, crème diplomate vanille et fruits rouges frais de saison.\n\nUn gâteau frais et gourmand, parfait pour les anniversaires de printemps et d'été.",
    ingredients: ["Génoise nature", "Crème diplomate vanille", "Fraises", "Framboises"],
    images: [img("1565958011703-44f9829ba187"), img("1488477304112-4944851de03d")],
  },
  {
    key: "drip-cake-caramel",
    category: "anniversaire",
    name: "Drip Cake Caramel Beurre Salé",
    price: 58,
    servesCount: 12,
    description:
      "Génoise vanille, crème au caramel beurre salé et coulure de chocolat blanc caramélisé.\n\nDécoré de macarons et de cornets gaufrés pour une fête réussie.",
    ingredients: ["Génoise vanille", "Caramel beurre salé", "Chocolat blanc", "Macarons", "Biscuit"],
    images: [img("1627834377411-8da5f4f09de8")],
  },
  {
    key: "gateau-cookies-cream",
    category: "anniversaire",
    name: "Gâteau Cookies & Cream",
    price: 45,
    servesCount: 8,
    description:
      "Génoise chocolat, crème vanille aux éclats de biscuits Oreo et ganache noire.\n\nCroquant, fondant et irrésistible.",
    ingredients: ["Génoise chocolat", "Crème vanille", "Biscuits cacao", "Ganache chocolat noir"],
    images: [img("1557925923-cd4648e211a0"), img("1612203985729-70726954388c")],
  },
  {
    key: "licorne-drip-rose",
    category: "anniversaire",
    name: "Gâteau Licorne Rose",
    price: 60,
    servesCount: 12,
    description:
      "Génoise vanille aux sprinkles, crème rose à la framboise et drip de chocolat rose.\n\nLe gâteau magique des petites princesses.",
    ingredients: ["Génoise vanille", "Crème framboise", "Chocolat blanc rose", "Sprinkles", "Cornet gaufré"],
    images: [img("1621303837174-89787a7d4729")],
    isAvailable: false,
  },

  // ---------- GÂTEAUX MARIAGE ----------
  {
    key: "wedding-fruits-rouges",
    category: "mariage",
    name: "Wedding Cake Fruits Rouges",
    price: 320,
    servesCount: 50,
    description:
      "Trois étages de génoise vanille, crème mascarpone et fruits rouges frais.\n\nPersonnalisable selon les couleurs de votre mariage. Commande au minimum 3 semaines à l'avance.",
    ingredients: ["Génoise vanille", "Crème mascarpone", "Fraises", "Myrtilles", "Framboises"],
    images: [img("1535141192574-5d4897c12636")],
  },
  {
    key: "wedding-fleurs-sauvages",
    category: "mariage",
    name: "Wedding Cake Fleurs Sauvages",
    price: 280,
    servesCount: 40,
    description:
      "Génoise citron, crème au fromage blanc et mûres, décor de fleurs comestibles.\n\nUn style champêtre et élégant.",
    ingredients: ["Génoise citron", "Crème fromage blanc", "Mûres", "Fleurs comestibles"],
    images: [img("1559620192-032c4bc4674e")],
  },
  {
    key: "mignardises-mariage",
    category: "mariage",
    name: "Plateau de Mignardises",
    price: 85,
    servesCount: 24,
    description:
      "24 tartelettes et macarons assortis pour accompagner votre pièce montée ou votre buffet.\n\nParfums au choix selon la saison.",
    ingredients: ["Pâte sablée", "Crème pâtissière", "Fruits frais", "Macarons", "Fleurs comestibles"],
    images: [img("1495147466023-ac5c588e2e94"), img("1569864358642-9d1684040f43")],
  },

  // ---------- ENTREMETS & TARTES ----------
  {
    key: "fraisier",
    category: "entremets",
    name: "Fraisier",
    price: 36,
    servesCount: 6,
    description:
      "Le grand classique : biscuit joconde, crème mousseline vanille et fraises entières.\n\nRecouvert d'une fine pâte d'amande rose.",
    ingredients: ["Biscuit joconde", "Crème mousseline", "Fraises", "Pâte d'amande"],
    images: [img("1611293388250-580b08c4a145")],
  },
  {
    key: "entremets-mangue",
    category: "entremets",
    name: "Entremets Mangue Passion",
    price: 38,
    servesCount: 6,
    description:
      "Mousse mangue, cœur coulant passion et biscuit coco, sous un glaçage miroir orangé.\n\nFrais, acidulé et tout en légèreté.",
    ingredients: ["Mousse mangue", "Insert passion", "Biscuit coco", "Glaçage miroir", "Fraises"],
    images: [img("1542826438-bd32f43d626f")],
  },
  {
    key: "tarte-citron",
    category: "entremets",
    name: "Tarte au Citron Meringuée",
    price: 28,
    servesCount: 8,
    description:
      "Pâte sablée, crème citron bien acidulée et meringue italienne flambée.\n\nUn équilibre parfait entre douceur et peps.",
    ingredients: ["Pâte sablée", "Crème citron", "Meringue italienne"],
    images: [img("1519915028121-7d3463d20b13")],
  },
  {
    key: "cheesecake-myrtille",
    category: "entremets",
    name: "Cheesecake Myrtille",
    price: 32,
    servesCount: 8,
    description:
      "Cheesecake new-yorkais crémeux sur biscuit spéculoos, nappé de compotée de myrtilles.\n\nCuit lentement pour une texture fondante.",
    ingredients: ["Fromage frais", "Biscuit spéculoos", "Myrtilles", "Vanille"],
    images: [img("1533134242443-d4fd215305ad"), img("1567171466295-4afa63d45416")],
  },
  {
    key: "tiramisu",
    category: "entremets",
    name: "Tiramisu Classique",
    price: 26,
    servesCount: 6,
    description:
      "Biscuits imbibés de café, crème mascarpone onctueuse et cacao amer.\n\nPréparé la veille pour plus de goût.",
    ingredients: ["Mascarpone", "Biscuits cuillère", "Café", "Cacao amer"],
    images: [img("1571877227200-a0d98ea607e9")],
  },
  {
    key: "verrines-panna-cotta",
    category: "entremets",
    name: "Verrines Panna Cotta Fraise",
    price: 18,
    servesCount: 6,
    description: "Six verrines de panna cotta vanille et coulis de fraise maison.",
    ingredients: ["Crème", "Vanille", "Fraises", "Coulis de fraise"],
    images: [img("1488477181946-6428a0291777")],
  },

  // ---------- CUPCAKES ----------
  {
    key: "cupcake-red-velvet",
    category: "cupcakes",
    name: "Cupcakes Red Velvet",
    price: 16,
    servesCount: 6,
    description: "Six cupcakes red velvet au cacao, glaçage cream cheese et éclats de génoise rouge.",
    ingredients: ["Génoise red velvet", "Cream cheese", "Cacao"],
    images: [img("1614707267537-b85aaf00c4b7")],
  },
  {
    key: "cupcake-vanille-sprinkles",
    category: "cupcakes",
    name: "Cupcakes Vanille Sprinkles",
    price: 14,
    servesCount: 6,
    description: "Six cupcakes vanille, crème au beurre légère et sprinkles multicolores.",
    ingredients: ["Génoise vanille", "Crème au beurre", "Sprinkles"],
    images: [img("1519869325930-281384150729"), img("1486427944299-d1955d23e34d")],
  },
  {
    key: "cupcake-chocolat",
    category: "cupcakes",
    name: "Cupcakes Chocolat Noisette",
    price: 16,
    servesCount: 6,
    description: "Six cupcakes chocolat, crème praliné noisette et copeaux de chocolat.",
    ingredients: ["Génoise chocolat", "Praliné noisette", "Copeaux de chocolat"],
    images: [img("1550617931-e17a7b70dce2")],
  },
  {
    key: "cupcake-fraise",
    category: "cupcakes",
    name: "Cupcakes Fraise",
    price: 15,
    servesCount: 6,
    description: "Six cupcakes vanille, crème à la fraise et fraise fraîche.",
    ingredients: ["Génoise vanille", "Crème fraise", "Fraises"],
    images: [img("1563729784474-d77dbb933a9e"), img("1599785209707-a456fc1337bb")],
  },
  {
    key: "cupcake-licorne",
    category: "cupcakes",
    name: "Cupcakes Licorne",
    price: 18,
    servesCount: 6,
    description: "Six cupcakes colorés, crème vanille pastel et décor arc-en-ciel en pâte à sucre.",
    ingredients: ["Génoise vanille", "Crème au beurre", "Pâte à sucre", "Sprinkles"],
    images: [img("1572451479139-6a308211d8be"), img("1607478900766-efe13248b125")],
  },
  {
    key: "cupcake-citron",
    category: "cupcakes",
    name: "Cupcakes Citron",
    price: 14,
    servesCount: 6,
    description: "Six cupcakes au citron, crème meringuée et zestes confits.",
    ingredients: ["Génoise citron", "Crème meringuée", "Zestes de citron"],
    images: [img("1576618148400-f54bed99fcfd")],
    isAvailable: false,
  },

  // ---------- BISCUITS & DOUCEURS ----------
  {
    key: "cookies",
    category: "douceurs",
    name: "Cookies Pépites de Chocolat",
    price: 12,
    servesCount: 6,
    description: "Six gros cookies moelleux à cœur, pépites de chocolat noir et au lait.",
    ingredients: ["Farine", "Beurre", "Sucre roux", "Pépites de chocolat"],
    images: [img("1558961363-fa8fdf82db35"), img("1499636136210-6f4ee915583e")],
  },
  {
    key: "brownie",
    category: "douceurs",
    name: "Brownie Noix de Pécan",
    price: 22,
    servesCount: 8,
    description: "Brownie fondant au chocolat noir et noix de pécan torréfiées, à partager.",
    ingredients: ["Chocolat noir", "Beurre", "Noix de pécan", "Œufs"],
    images: [img("1606313564200-e75d5e30476c"), img("1515037893149-de7f840978e2"), img("1624353365286-3f8d62daad51")],
  },
  {
    key: "macarons",
    category: "douceurs",
    name: "Coffret 12 Macarons",
    price: 24,
    servesCount: 4,
    description: "Douze macarons assortis : vanille, framboise, pistache, chocolat, citron et caramel.",
    ingredients: ["Poudre d'amande", "Blanc d'œuf", "Ganaches assorties"],
    images: [img("1569864358642-9d1684040f43")],
  },
  {
    key: "croissants",
    category: "douceurs",
    name: "Croissants Pur Beurre",
    price: 9,
    servesCount: 6,
    description: "Six croissants feuilletés au beurre AOP, cuits le matin même.",
    ingredients: ["Farine", "Beurre AOP", "Levure", "Lait"],
    images: [img("1623334044303-241021148842"), img("1555507036-ab1f4038808a")],
  },
  {
    key: "crepes",
    category: "douceurs",
    name: "Crêpes Fraise Chantilly",
    price: 14,
    servesCount: 4,
    description: "Quatre crêpes roulées, chantilly maison et fraises fraîches.",
    ingredients: ["Pâte à crêpes", "Chantilly", "Fraises"],
    images: [img("1587314168485-3236d6710814")],
  },
  {
    key: "coffret-chocolats",
    category: "douceurs",
    name: "Coffret Chocolats Fins",
    price: 29,
    servesCount: 6,
    description: "Assortiment de 16 bonbons de chocolat : pralinés, ganaches et caramels.",
    ingredients: ["Chocolat noir", "Chocolat au lait", "Praliné", "Caramel"],
    images: [img("1481391319762-47dff72954d9")],
  },
  {
    key: "donuts",
    category: "douceurs",
    name: "Donuts Glacés",
    price: 13,
    servesCount: 6,
    description: "Six donuts moelleux glacés au chocolat et aux sprinkles.",
    ingredients: ["Pâte levée", "Glaçage chocolat", "Sprinkles"],
    images: [img("1551024601-bec78aea704b")],
  },
];

module.exports = { EXISTING_CATEGORIES, categories, products };
