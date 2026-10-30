export type Revisao = {
  desafioSlug: string;
  proximaData: string;
  intervaloDias: number;
  classificacoes: number;
};

export type Progresso = {
  xp: number;
  desafiosResolvidos: string[];
  revisoes: Revisao[];
  diasDeEstudo: string[];
  conquistas: string[];
};

export interface ProgressRepository {
  carregar(): Progresso;
  salvar(progresso: Progresso): void;
}

type StorageMinimo = {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
};

const CHAVE_PADRAO = 'plataforma-python:progresso';

export const PROGRESSO_INICIAL: Progresso = {
  xp: 0,
  desafiosResolvidos: [],
  revisoes: [],
  diasDeEstudo: [],
  conquistas: [],
};

export function criarRepositorioLocalStorage(
  storage: StorageMinimo,
  chave: string = CHAVE_PADRAO,
): ProgressRepository {
  return {
    carregar() {
      try {
        const bruto = storage.getItem(chave);
        if (bruto === null) {
          return PROGRESSO_INICIAL;
        }
        const progresso = JSON.parse(bruto) as Partial<Progresso>;
        return {
          xp: progresso.xp ?? 0,
          desafiosResolvidos: progresso.desafiosResolvidos ?? [],
          revisoes: (progresso.revisoes ?? []).map((revisao) => ({
            desafioSlug: revisao.desafioSlug,
            proximaData: revisao.proximaData,
            intervaloDias: revisao.intervaloDias ?? 1,
            classificacoes: revisao.classificacoes ?? 0,
          })),
          diasDeEstudo: progresso.diasDeEstudo ?? [],
          conquistas: progresso.conquistas ?? [],
        };
      } catch {
        return PROGRESSO_INICIAL;
      }
    },
    salvar(progresso) {
      try {
        storage.setItem(chave, JSON.stringify(progresso));
      } catch {
        // Sem armazenamento disponível, o progresso vale só nesta sessão da página.
      }
    },
  };
}
