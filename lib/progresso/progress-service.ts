import { listarTrilhasResumo } from '../catalog';
import { conquistasAlcancadas, type IdConquista, type TrilhaResumo } from './conquistas';
import { somarDias } from './datas';
import type { Progresso, ProgressRepository, Revisao } from './progress-repository';
import { calcularProximaRevisao, type Classificacao } from './revisao';

export const XP_POR_DESAFIO = 10;
export const XP_POR_REVISAO = 5;

export type ResultadoAtividade = {
  xpGanho: number;
  progresso: Progresso;
  novasConquistas: IdConquista[];
};

export interface ProgressService {
  obterProgresso(): Progresso;
  registrarResolucao(desafioSlug: string, hoje: string): ResultadoAtividade;
  revisoesVencidas(hoje: string): Revisao[];
  classificarRevisao(desafioSlug: string, classificacao: Classificacao, hoje: string): ResultadoAtividade;
}

export function criarProgressService(
  repositorio: ProgressRepository,
  trilhas: TrilhaResumo[] = listarTrilhasResumo(),
): ProgressService {
  function registrarDiaDeEstudo(progresso: Progresso, hoje: string): ResultadoAtividade {
    const diasDeEstudo = progresso.diasDeEstudo.includes(hoje)
      ? progresso.diasDeEstudo
      : [...progresso.diasDeEstudo, hoje];

    const conquistasAtuais = conquistasAlcancadas({ ...progresso, diasDeEstudo }, trilhas, hoje);
    const novasConquistas = conquistasAtuais.filter((id) => !progresso.conquistas.includes(id));

    const atualizado: Progresso = {
      ...progresso,
      diasDeEstudo,
      conquistas: [...progresso.conquistas, ...novasConquistas],
    };
    repositorio.salvar(atualizado);

    return { xpGanho: 0, progresso: atualizado, novasConquistas };
  }

  return {
    obterProgresso() {
      return repositorio.carregar();
    },
    registrarResolucao(desafioSlug, hoje) {
      const atual = repositorio.carregar();

      if (atual.desafiosResolvidos.includes(desafioSlug)) {
        return { xpGanho: 0, progresso: atual, novasConquistas: [] };
      }

      const xpGanho = XP_POR_DESAFIO;
      const comResolucao: Progresso = {
        ...atual,
        xp: atual.xp + xpGanho,
        desafiosResolvidos: [...atual.desafiosResolvidos, desafioSlug],
        revisoes: [
          ...atual.revisoes,
          { desafioSlug, proximaData: somarDias(hoje, 1), intervaloDias: 1, classificacoes: 0 },
        ],
      };

      const resultado = registrarDiaDeEstudo(comResolucao, hoje);
      return { ...resultado, xpGanho };
    },
    revisoesVencidas(hoje) {
      return repositorio.carregar().revisoes.filter((revisao) => revisao.proximaData <= hoje);
    },
    classificarRevisao(desafioSlug, classificacao, hoje) {
      const atual = repositorio.carregar();
      const revisao = atual.revisoes.find((item) => item.desafioSlug === desafioSlug);

      if (!revisao || revisao.proximaData > hoje) {
        return { xpGanho: 0, progresso: atual, novasConquistas: [] };
      }

      const comRevisao: Progresso = {
        ...atual,
        xp: atual.xp + XP_POR_REVISAO,
        revisoes: atual.revisoes.map((item) =>
          item.desafioSlug === desafioSlug ? calcularProximaRevisao(item, classificacao, hoje) : item,
        ),
      };

      const resultado = registrarDiaDeEstudo(comRevisao, hoje);
      return { ...resultado, xpGanho: XP_POR_REVISAO };
    },
  };
}
