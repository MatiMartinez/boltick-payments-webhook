import { Event } from './interface';

export const events: Event[] = [
  {
    id: '3c1c7414-2071-4e4c-9fc3-e9af8411e42f',
    artists: [
      { name: 'Sarah Chen', description: 'Arte Generado por IA' },
      { name: 'Marcus Rivera', description: 'Instalaciones de Realidad Virtual' },
    ],
    category: 'Crypto',
    collectionName: 'DeFiS',
    collectionSymbol: 'DEFI',
    createdAt: 1732388398000,
    date: '15 de Junio, 2024',
    description:
      'Únete al principal evento de arte digital de 2024. La Cumbre de Arte Digital reúne a artistas líderes, coleccionistas y entusiastas en un entorno virtual inmersivo. Experimenta exposiciones innovadoras, participa en talleres interactivos y conéctate con la comunidad global de arte digital.',
    edition: 1,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    location: 'Sala La Tebaida',
    name: 'DeFi Summit 2024',
    tickets: [
      {
        id: '1a320086-75cb-4183-8c32-cfbda001df50',
        name: 'General',
        description: 'Entrada General + Consumisión',
        price: 4000,
      },
      {
        id: 'c23b2782-414e-44ef-9696-067fd983cee5',
        name: 'VIP',
        description: 'Entrada VIP + Consumisión',
        price: 8000,
      },
    ],
    time: '14:00 hs',
  },
];
