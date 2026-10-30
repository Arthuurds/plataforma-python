import { describe, expect, it } from 'vitest';
import {
  criarRepositorioLocalStorage,
  PROGRESSO_INICIAL,
  type Progresso,
} from '../lib/progresso/progress-repository';

function storageEmMemoria(valores: Record<string, string> = {}) {
  return {
    getItem: (chave: string) => (chave in valores ? valores[chave] : null),
    setItem: (chave: string, valor: string) => {
      valores[chave] = valor;
    },
  };
}

function storageQueFalha() {
  return {
    getItem: () => {
      throw new Error('acesso bloqueado');
    },
    setItem: () => {
      throw new Error('cota excedida');
    },
  };
}

describe('criarRepositorioLocalStorage', () => {
  it('devolve o progresso inicial quando nada foi gravado', () => {
    const repositorio = criarRepositorioLocalStorage(storageEmMemoria());

    expect(repositorio.carregar()).toEqual(PROGRESSO_INICIAL);
  });

  it('o progresso gravado é lido de volta, como se a página tivesse sido recarregada', () => {
    const storage = storageEmMemoria();
    const progresso: Progresso = {
      xp: 10,
      desafiosResolvidos: ['soma-de-dois-numeros'],
      revisoes: [{ desafioSlug: 'soma-de-dois-numeros', proximaData: '2026-03-11' }],
    };

    criarRepositorioLocalStorage(storage).salvar(progresso);

    expect(criarRepositorioLocalStorage(storage).carregar()).toEqual(progresso);
  });

  it('progresso gravado antes das revisões existirem é lido com fila vazia', () => {
    const storage = storageEmMemoria({
      'plataforma-python:progresso': JSON.stringify({ xp: 10, desafiosResolvidos: ['soma-de-dois-numeros'] }),
    });

    expect(criarRepositorioLocalStorage(storage).carregar()).toEqual({
      xp: 10,
      desafiosResolvidos: ['soma-de-dois-numeros'],
      revisoes: [],
    });
  });

  it('dados corrompidos no storage voltam para o progresso inicial', () => {
    const repositorio = criarRepositorioLocalStorage(storageEmMemoria({ 'plataforma-python:progresso': '{nao-e-json' }));

    expect(repositorio.carregar()).toEqual(PROGRESSO_INICIAL);
  });

  it('acesso bloqueado ao storage não quebra a leitura', () => {
    const repositorio = criarRepositorioLocalStorage(storageQueFalha());

    expect(repositorio.carregar()).toEqual(PROGRESSO_INICIAL);
  });

  it('falha ao gravar não lança erro para quem chama', () => {
    const repositorio = criarRepositorioLocalStorage(storageQueFalha());

    expect(() => repositorio.salvar({ xp: 10, desafiosResolvidos: [], revisoes: [] })).not.toThrow();
  });
});
