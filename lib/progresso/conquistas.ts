import { somarDias } from './datas';

export const DIAS_DA_SEQUENCIA = 3;

export const CONQUISTAS = [
  { id: 'primeiro-desafio', titulo: 'Primeiro desafio resolvido' },
  { id: 'primeira-trilha', titulo: 'Primeira trilha concluída' },
  { id: 'sequencia-3-dias', titulo: `${DIAS_DA_SEQUENCIA} dias de estudo seguidos` },
] as const;

export type IdConquista = (typeof CONQUISTAS)[number]['id'];

export type TrilhaResumo = {
  slug: string;
  desafioSlugs: string[];
};

export type SituacaoDeEstudo = {
  desafiosResolvidos: string[];
  diasDeEstudo: string[];
};

export function sequenciaAtual(diasDeEstudo: string[], hoje: string): number {
  let dias = 0;
  let dia = hoje;

  while (diasDeEstudo.includes(dia)) {
    dias += 1;
    dia = somarDias(dia, -1);
  }

  return dias;
}

export function conquistasAlcancadas(
  situacao: SituacaoDeEstudo,
  trilhas: TrilhaResumo[],
  hoje: string,
): IdConquista[] {
  const alcancadas: IdConquista[] = [];

  if (situacao.desafiosResolvidos.length >= 1) {
    alcancadas.push('primeiro-desafio');
  }

  const temTrilhaConcluida = trilhas.some(
    (trilha) =>
      trilha.desafioSlugs.length > 0 &&
      trilha.desafioSlugs.every((slug) => situacao.desafiosResolvidos.includes(slug)),
  );
  if (temTrilhaConcluida) {
    alcancadas.push('primeira-trilha');
  }

  if (sequenciaAtual(situacao.diasDeEstudo, hoje) >= DIAS_DA_SEQUENCIA) {
    alcancadas.push('sequencia-3-dias');
  }

  return alcancadas;
}
