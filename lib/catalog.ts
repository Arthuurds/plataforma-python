export type Teste = {
  nome: string;
  codigo: string;
};

export type Desafio = {
  slug: string;
  titulo: string;
  enunciado: string;
  testes: Teste[];
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
  {
    slug: 'soma-de-dois-numeros',
    titulo: 'Soma de dois números',
    enunciado: 'Escreva a função `soma(a, b)` que retorna a soma de dois números.',
    testes: [
      { nome: 'soma simples', codigo: 'assert soma(2, 3) == 5' },
      { nome: 'soma com negativos', codigo: 'assert soma(-1, 1) == 0' },
    ],
  },
  {
    slug: 'filtrar-lista-paridade',
    titulo: 'Filtrar lista por paridade',
    enunciado: 'Escreva a função `filtrar_pares(lista)` que retorna apenas os números pares, na mesma ordem.',
    testes: [
      { nome: 'mantém os pares', codigo: 'assert filtrar_pares([1, 2, 3, 4]) == [2, 4]' },
      { nome: 'lista vazia', codigo: 'assert filtrar_pares([]) == []' },
    ],
  },
  {
    slug: 'contar-palavras',
    titulo: 'Contar palavras',
    enunciado: 'Escreva a função `contar_palavras(texto)` que retorna quantas palavras há no texto, separadas por espaços.',
    testes: [
      { nome: 'três palavras', codigo: "assert contar_palavras('um dois três') == 3" },
      { nome: 'texto vazio', codigo: "assert contar_palavras('') == 0" },
    ],
  },
  {
    slug: 'dicionario-de-frequencia',
    titulo: 'Dicionário de frequência',
    enunciado: 'Escreva a função `frequencia(palavras)` que retorna um dicionário com quantas vezes cada palavra aparece.',
    testes: [
      { nome: 'conta repetições', codigo: "assert frequencia(['a', 'b', 'a']) == {'a': 2, 'b': 1}" },
      { nome: 'lista vazia', codigo: 'assert frequencia([]) == {}' },
    ],
  },
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

export function listarTrilhasResumo(): { slug: string; desafioSlugs: string[] }[] {
  return trilhas.map((trilha) => ({
    slug: trilha.slug,
    desafioSlugs: listarDesafiosDaTrilha(trilha.slug).map((desafio) => desafio.slug),
  }));
}

export function getTrilha(slug: string): Trilha | undefined {
  return trilhas.find((trilha) => trilha.slug === slug);
}

export function getDesafio(slug: string): Desafio | undefined {
  return desafios.find((desafio) => desafio.slug === slug);
}

export function listarDesafios(): Desafio[] {
  return desafios;
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
