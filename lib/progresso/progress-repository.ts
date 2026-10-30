export type Progresso = {
  xp: number;
  desafiosResolvidos: string[];
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

export const PROGRESSO_INICIAL: Progresso = { xp: 0, desafiosResolvidos: [] };

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
        const progresso = JSON.parse(bruto) as Progresso;
        return { xp: progresso.xp, desafiosResolvidos: progresso.desafiosResolvidos };
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
