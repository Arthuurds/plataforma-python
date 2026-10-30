import type { Progresso, ProgressRepository } from './progress-repository';

export const XP_POR_DESAFIO = 10;

export type ResultadoResolucao = {
  xpGanho: number;
  progresso: Progresso;
};

export interface ProgressService {
  obterProgresso(): Progresso;
  registrarResolucao(desafioSlug: string): ResultadoResolucao;
}

export function criarProgressService(repositorio: ProgressRepository): ProgressService {
  return {
    obterProgresso() {
      return repositorio.carregar();
    },
    registrarResolucao(desafioSlug) {
      const atual = repositorio.carregar();

      if (atual.desafiosResolvidos.includes(desafioSlug)) {
        return { xpGanho: 0, progresso: atual };
      }

      const progresso: Progresso = {
        xp: atual.xp + XP_POR_DESAFIO,
        desafiosResolvidos: [...atual.desafiosResolvidos, desafioSlug],
      };
      repositorio.salvar(progresso);

      return { xpGanho: XP_POR_DESAFIO, progresso };
    },
  };
}
