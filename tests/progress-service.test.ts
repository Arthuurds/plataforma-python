import { describe, expect, it } from 'vitest';
import { PROGRESSO_INICIAL, type Progresso, type ProgressRepository } from '../lib/progresso/progress-repository';
import { criarProgressService, XP_POR_DESAFIO } from '../lib/progresso/progress-service';

function repositorioEmMemoria(inicial: Progresso = PROGRESSO_INICIAL): ProgressRepository {
  let atual = inicial;
  return {
    carregar: () => atual,
    salvar: (progresso) => {
      atual = progresso;
    },
  };
}

describe('ProgressService', () => {
  it('a primeira resolução de um desafio concede XP', () => {
    const service = criarProgressService(repositorioEmMemoria());

    const resultado = service.registrarResolucao('soma-de-dois-numeros');

    expect(resultado.xpGanho).toBe(XP_POR_DESAFIO);
    expect(resultado.progresso.xp).toBe(XP_POR_DESAFIO);
  });

  it('resolver de novo o mesmo desafio não concede XP', () => {
    const service = criarProgressService(repositorioEmMemoria());
    service.registrarResolucao('soma-de-dois-numeros');

    const segunda = service.registrarResolucao('soma-de-dois-numeros');

    expect(segunda.xpGanho).toBe(0);
    expect(segunda.progresso.xp).toBe(XP_POR_DESAFIO);
  });

  it('desafios diferentes acumulam XP', () => {
    const service = criarProgressService(repositorioEmMemoria());
    service.registrarResolucao('soma-de-dois-numeros');

    const resultado = service.registrarResolucao('contar-palavras');

    expect(resultado.progresso.xp).toBe(XP_POR_DESAFIO * 2);
    expect(resultado.progresso.desafiosResolvidos).toEqual(['soma-de-dois-numeros', 'contar-palavras']);
  });

  it('grava o progresso no repositório a cada resolução nova', () => {
    const repositorio = repositorioEmMemoria();
    const service = criarProgressService(repositorio);

    service.registrarResolucao('soma-de-dois-numeros');

    expect(repositorio.carregar().xp).toBe(XP_POR_DESAFIO);
  });

  it('não grava nada quando a resolução é repetida', () => {
    let escritas = 0;
    const repositorio: ProgressRepository = {
      carregar: () => ({ xp: XP_POR_DESAFIO, desafiosResolvidos: ['soma-de-dois-numeros'] }),
      salvar: () => {
        escritas += 1;
      },
    };
    const service = criarProgressService(repositorio);

    service.registrarResolucao('soma-de-dois-numeros');

    expect(escritas).toBe(0);
  });

  it('obterProgresso devolve o progresso gravado, sem alterá-lo', () => {
    const service = criarProgressService(
      repositorioEmMemoria({ xp: 30, desafiosResolvidos: ['a', 'b', 'c'] }),
    );

    expect(service.obterProgresso()).toEqual({ xp: 30, desafiosResolvidos: ['a', 'b', 'c'] });
  });
});
