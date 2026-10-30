import { somarDias } from './datas';
import type { Progresso, ProgressRepository, Revisao } from './progress-repository';
import { calcularProximaRevisao, type Classificacao } from './revisao';

export const XP_POR_DESAFIO = 10;
export const XP_POR_REVISAO = 5;

export type ResultadoResolucao = {
  xpGanho: number;
  progresso: Progresso;
};

export interface ProgressService {
  obterProgresso(): Progresso;
  registrarResolucao(desafioSlug: string, hoje: string): ResultadoResolucao;
  revisoesVencidas(hoje: string): Revisao[];
  classificarRevisao(desafioSlug: string, classificacao: Classificacao, hoje: string): ResultadoResolucao;
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
        revisoes: [
          ...atual.revisoes,
          { desafioSlug, proximaData: somarDias(hoje, 1), intervaloDias: 1, classificacoes: 0 },
        ],
      };
      repositorio.salvar(progresso);

      return { xpGanho: XP_POR_DESAFIO, progresso };
    },
    revisoesVencidas(hoje) {
      return repositorio.carregar().revisoes.filter((revisao) => revisao.proximaData <= hoje);
    },
    classificarRevisao(desafioSlug, classificacao, hoje) {
      const atual = repositorio.carregar();
      const revisao = atual.revisoes.find((item) => item.desafioSlug === desafioSlug);

      if (!revisao || revisao.proximaData > hoje) {
        return { xpGanho: 0, progresso: atual };
      }

      const progresso: Progresso = {
        xp: atual.xp + XP_POR_REVISAO,
        desafiosResolvidos: atual.desafiosResolvidos,
        revisoes: atual.revisoes.map((item) =>
          item.desafioSlug === desafioSlug ? calcularProximaRevisao(item, classificacao, hoje) : item,
        ),
      };
      repositorio.salvar(progresso);

      return { xpGanho: XP_POR_REVISAO, progresso };
    },
  };
}
