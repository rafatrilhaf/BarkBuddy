export type Owner = { name: string; phone: string; address: string; email: string };
export type Pet = {
  id: string; name: string; age: number; breed: string; species: 'Cachorro' | 'Gato';
  color: string; birthDate: string; size: 'Pequeno'|'Médio'|'Grande';
  medicalInfo?: string; behavior?: string; photoUrl: string;
  owner: Owner; status: 'SEGURO'|'DESAPARECIDO';
};
export type Post = { id: string; user: string; text: string; images: string[]; createdAt: string };

export const owner: Owner = {
  name: 'Maria Hadassa',
  phone: '(11) ****-7457',
  address: 'Res. Beija-Flor - 15354-880 Itatiba/SP',
  email: 'mariahadassa@gmail.com',
};

export const pets: Pet[] = [
  {
    id: 'PET-001',
    name: 'Baden',
    age: 5,
    breed: 'Pinscher',
    species: 'Cachorro',
    color: 'Preto',
    birthDate: '2019-05-10',
    size: 'Pequeno',
    medicalInfo: 'Vacinado; alergia a frango',
    behavior: 'Sociável; tem medo de fogos',
    photoUrl: 'https://place-puppy.com/400x400',
    owner,
    status: 'SEGURO',
  },
  {
    id: 'PET-002',
    name: 'Luna',
    age: 1,
    breed: 'Husky',
    species: 'Cachorro',
    color: 'Preto/Branco',
    birthDate: '2024-01-22',
    size: 'Médio',
    photoUrl: 'https://place-puppy.com/401x401',
    owner,
    status: 'DESAPARECIDO',
  },
  {
    id: 'PET-003',
    name: 'Thor',
    age: 2,
    breed: 'Pastor Alemão',
    species: 'Cachorro',
    color: 'Caramelo/Preto',
    birthDate: '2023-02-10',
    size: 'Grande',
    photoUrl: 'https://place-puppy.com/402x402',
    owner,
    status: 'DESAPARECIDO',
  },
];

export const posts: Post[] = [
  { id: 'p1', user: 'user1234', text: 'Hoje a Mel saiu para ver flores!!',
    images: ['https://placekitten.com/300/200','https://placekitten.com/300/201'], createdAt: '10:18' },
  { id: 'p2', user: 'user5678', text: 'miau miau miau miau...',
    images: ['https://placekitten.com/301/200','https://placekitten.com/302/200'], createdAt: '10:18' },
];
