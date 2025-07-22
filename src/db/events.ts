import { Event } from "./interface";

export const events: Event[] = [
  {
    id: "3c1c7414-2071-4e4c-9fc3-e9af8411e42f",
    artists: [
      { name: "Sarah Chen", description: "Arte Generado por IA" },
      {
        name: "Marcus Rivera",
        description: "Instalaciones de Realidad Virtual",
      },
    ],
    category: "Crypto",
    collectionName: "DeFiS",
    collectionSymbol: "DEFI",
    createdAt: 1732388398000,
    date: "15 de Junio, 2024",
    description:
      "Únete al principal evento de arte digital de 2024. La Cumbre de Arte Digital reúne a artistas líderes, coleccionistas y entusiastas en un entorno virtual inmersivo. Experimenta exposiciones innovadoras, participa en talleres interactivos y conéctate con la comunidad global de arte digital.",
    edition: 1,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
    location: "Sala La Tebaida",
    name: "DeFi Summit 2024",
    tickets: [
      {
        id: "1a320086-75cb-4183-8c32-cfbda001df50",
        name: "General",
        description: "Entrada General + Consumisión",
        price: 100,
        tax: 10,
        priceWithoutTax: 90,
      },
      {
        id: "c23b2782-414e-44ef-9696-067fd983cee5",
        name: "VIP",
        description: "Entrada VIP + Consumisión",
        price: 200,
        tax: 10,
        priceWithoutTax: 180,
      },
    ],
    time: "14:00 hs",
  },
  {
    id: "4421cb3d-a0cf-4e29-8250-51767063cd62",
    artists: [{ name: "DJ's en vivo", description: "" }],
    category: "Sunset",
    collectionName: "Wine Activity #1",
    collectionSymbol: "WINE",
    createdAt: 1732388398000,
    date: "09 de Agosto, 2025",
    description:
      "Sunset wine & after orgnanizado por Paax Producciones.\n Degustación de más de 10 bodegas, plan Bonarda, dirección de Turismo y dirección de Cultura.\n YO 🤍 BONARDA",
    edition: 1,
    image: "/wine-activity-1.webp",
    location: "Centro de congreso y exposiciones Francisco",
    name: "Wine Activity",
    tickets: [
      {
        id: "d98c69a9-79f7-432c-a4f2-5e1e4bbd2cf5",
        name: "General",
        description: "Incluye copa de vino",
        // price: 17250,
        // tax: 2250,
        // priceWithoutTax: 15000,
        price: 172.5,
        tax: 22.5,
        priceWithoutTax: 150.0,
      },
    ],
    time: "19:00 hs - 02:00 hs",
  },
];
