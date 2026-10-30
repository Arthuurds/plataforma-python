import { somarDias } from './datas';
import type { Revisao } from './progress-repository';

export type Classificacao = 'errei' | 'dificil' | 'bom' | 'facil';

const INTERVALO_INICIAL_DIAS: Record<Classificacao, number> = {
  errei: 1,
  dificil: 2,
  bom: 4,
  facil: 8,
};

const MULTIPLICADOR_DO_INTERVALO: Record<Classificacao, number> = {
  errei: 0,
  dificil: 1.2,
  bom: 2,
  facil: 2.5,
};

export function calcularProximaRevisao(revisao: Revisao, classificacao: Classificacao, hoje: string): Revisao {
  const intervaloDias = calcularIntervalo(revisao, classificacao);

  return {
    desafioSlug: revisao.desafioSlug,
    proximaData: somarDias(hoje, intervaloDias),
    intervaloDias,
    classificacoes: revisao.classificacoes + 1,
  };
}

function calcularIntervalo(revisao: Revisao, classificacao: Classificacao): number {
  if (classificacao === 'errei') {
    return 1;
  }

  if (revisao.classificacoes === 0) {
    return INTERVALO_INICIAL_DIAS[classificacao];
  }

  return Math.max(1, Math.round(revisao.intervaloDias * MULTIPLICADOR_DO_INTERVALO[classificacao]));
}
