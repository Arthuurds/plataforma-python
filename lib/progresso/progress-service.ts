import { somarDias } from './datas';
import type { Progresso, ProgressRepository, Revisao } from './progress-repository';

export const XP_POR_DESAFIO = 10;

export type ResultadoResolucao = {
  xpGanho: number;
  progresso: Progresso;
};

export interface ProgressService {
  obterProgresso(): Progresso;
  registrarResolucao(desafioSlug: string, hoje: string): ResultadoResolucao;
  revisoesVencidas(hoje: string): Revisao[];
}

export function criarProgressService(repositorio: ProgressRepository): ProgressService {
  return {
    obterProgresso() {
      return repositorio.carregar();
    },
    registrarResolucao(desafioSlug, hoje) {
      const atual = repositorio.carregar();

      if (atual.desafiosResolvidos.includes(desafioSlug)) {
        return { xpGanho: 0, progresso: atual };
      }

      const progresso: Progresso = {
        xp: atual.xp + XP_POR_DESAFIO,
        desafiosResolvidos: [...atual.desafiosResolvidos, desafioSlug],
        revisoes: [...atual.revisoes, { desafioSlug, proximaData: somarDias(hoje, 1) }],
      };
      repositorio.salvar(progresso);

      return { xpGanho: XP_POR_DESAFIO, progresso };
    },
    revisoesVencidas(hoje) {
      return repositorio.carregar().revisoes.filter((revisao) => revisao.proximaData <= hoje);
    },
  };
}
