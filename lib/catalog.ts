export type Desafio = {
  slug: string;
  titulo: string;
};

export type Trilha = {
  slug: string;
  titulo: string;
  descricao: string;
};

type VinculoTrilhaDesafio = {
  trilhaSlug: string;
  desafioSlug: string;
  posicao: number;
};

const trilhas: Trilha[] = [
  {
    slug: 'logica-basica',
    titulo: 'Lógica básica',
    descricao: 'Primeiros passos com variáveis, operações e listas.',
  },
  {
    slug: 'estruturas-de-dados',
    titulo: 'Estruturas de dados',
    descricao: 'Listas, dicionários e a organização de dados em Python.',
  },
];

const desafios: Desafio[] = [
  { slug: 'soma-de-dois-numeros', titulo: 'Soma de dois números' },
  { slug: 'filtrar-lista-paridade', titulo: 'Filtrar lista por paridade' },
  { slug: 'contar-palavras', titulo: 'Contar palavras' },
  { slug: 'dicionario-de-frequencia', titulo: 'Dicionário de frequência' },
];

const vinculos: VinculoTrilhaDesafio[] = [
  { trilhaSlug: 'logica-basica', desafioSlug: 'soma-de-dois-numeros', posicao: 1 },
  { trilhaSlug: 'logica-basica', desafioSlug: 'filtrar-lista-paridade', posicao: 2 },
  { trilhaSlug: 'estruturas-de-dados', desafioSlug: 'contar-palavras', posicao: 1 },
  { trilhaSlug: 'estruturas-de-dados', desafioSlug: 'dicionario-de-frequencia', posicao: 2 },
  { trilhaSlug: 'estruturas-de-dados', desafioSlug: 'filtrar-lista-paridade', posicao: 3 },
];

export function listarTrilhas(): Trilha[] {
  return trilhas;
}

export function getTrilha(slug: string): Trilha | undefined {
  return trilhas.find((trilha) => trilha.slug === slug);
}

export function listarDesafiosDaTrilha(trilhaSlug: string): Desafio[] {
  return vinculos
    .filter((vinculo) => vinculo.trilhaSlug === trilhaSlug)
    .sort((a, b) => a.posicao - b.posicao)
    .flatMap((vinculo) => {
      const desafio = desafios.find((d) => d.slug === vinculo.desafioSlug);
      return desafio ? [desafio] : [];
    });
}
