import { describe, expect, it } from 'vitest';
import { PROGRESSO_INICIAL, type Progresso, type ProgressRepository } from '../lib/progresso/progress-repository';
import { criarProgressService, XP_POR_DESAFIO, XP_POR_REVISAO } from '../lib/progresso/progress-service';

const HOJE = '2026-03-10';

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

    const resultado = service.registrarResolucao('soma-de-dois-numeros', HOJE);

    expect(resultado.xpGanho).toBe(XP_POR_DESAFIO);
    expect(resultado.progresso.xp).toBe(XP_POR_DESAFIO);
  });

  it('resolver de novo o mesmo desafio não concede XP', () => {
    const service = criarProgressService(repositorioEmMemoria());
    service.registrarResolucao('soma-de-dois-numeros', HOJE);

    const segunda = service.registrarResolucao('soma-de-dois-numeros', HOJE);

    expect(segunda.xpGanho).toBe(0);
    expect(segunda.progresso.xp).toBe(XP_POR_DESAFIO);
  });

  it('desafios diferentes acumulam XP', () => {
    const service = criarProgressService(repositorioEmMemoria());
    service.registrarResolucao('soma-de-dois-numeros', HOJE);

    const resultado = service.registrarResolucao('contar-palavras', HOJE);

    expect(resultado.progresso.xp).toBe(XP_POR_DESAFIO * 2);
    expect(resultado.progresso.desafiosResolvidos).toEqual(['soma-de-dois-numeros', 'contar-palavras']);
  });

  it('grava o progresso no repositório a cada resolução nova', () => {
    const repositorio = repositorioEmMemoria();
    const service = criarProgressService(repositorio);

    service.registrarResolucao('soma-de-dois-numeros', HOJE);

    expect(repositorio.carregar().xp).toBe(XP_POR_DESAFIO);
  });

  it('não grava nada quando a resolução é repetida', () => {
    let escritas = 0;
    const repositorio: ProgressRepository = {
      carregar: () => ({
        xp: XP_POR_DESAFIO,
        desafiosResolvidos: ['soma-de-dois-numeros'],
        revisoes: [{ desafioSlug: 'soma-de-dois-numeros', proximaData: '2026-03-11', intervaloDias: 1, classificacoes: 0 }],
      }),
      salvar: () => {
        escritas += 1;
      },
    };
    const service = criarProgressService(repositorio);

    service.registrarResolucao('soma-de-dois-numeros', HOJE);

    expect(escritas).toBe(0);
  });

  it('obterProgresso devolve o progresso gravado, sem alterá-lo', () => {
    const progresso: Progresso = { xp: 30, desafiosResolvidos: ['a', 'b', 'c'], revisoes: [] };
    const service = criarProgressService(repositorioEmMemoria(progresso));

    expect(service.obterProgresso()).toEqual(progresso);
  });
});

describe('ProgressService: fila de revisões', () => {
  it('a primeira resolução cria uma revisão para o dia seguinte', () => {
    const service = criarProgressService(repositorioEmMemoria());

    const resultado = service.registrarResolucao('soma-de-dois-numeros', HOJE);

    expect(resultado.progresso.revisoes).toEqual([
      { desafioSlug: 'soma-de-dois-numeros', proximaData: '2026-03-11', intervaloDias: 1, classificacoes: 0 },
    ]);
  });

  it('resolver o mesmo desafio de novo não cria uma segunda revisão', () => {
    const service = criarProgressService(repositorioEmMemoria());
    service.registrarResolucao('soma-de-dois-numeros', HOJE);

    const segunda = service.registrarResolucao('soma-de-dois-numeros', '2026-03-12');

    expect(segunda.progresso.revisoes).toHaveLength(1);
  });

  it('lista as revisões vencidas na data atual, inclusive as de dias anteriores', () => {
    const service = criarProgressService(
      repositorioEmMemoria({
        xp: 0,
        desafiosResolvidos: [],
        revisoes: [
          { desafioSlug: 'vencida-ontem', proximaData: '2026-03-09', intervaloDias: 1, classificacoes: 0 },
          { desafioSlug: 'vence-hoje', proximaData: '2026-03-10', intervaloDias: 1, classificacoes: 0 },
          { desafioSlug: 'vence-amanha', proximaData: '2026-03-11', intervaloDias: 1, classificacoes: 0 },
        ],
      }),
    );

    const vencidas = service.revisoesVencidas(HOJE).map((revisao) => revisao.desafioSlug);

    expect(vencidas).toEqual(['vencida-ontem', 'vence-hoje']);
  });

  it('sem revisões vencidas, a lista vem vazia', () => {
    const service = criarProgressService(repositorioEmMemoria());

    expect(service.revisoesVencidas(HOJE)).toEqual([]);
  });
});

describe('ProgressService: classificar revisão', () => {
  function repositorioComRevisao(proximaData: string) {
    return repositorioEmMemoria({
      xp: 10,
      desafiosResolvidos: ['soma-de-dois-numeros'],
      revisoes: [{ desafioSlug: 'soma-de-dois-numeros', proximaData, intervaloDias: 1, classificacoes: 0 }],
    });
  }

  it('concede XP em qualquer classificação, inclusive Errei', () => {
    const service = criarProgressService(repositorioComRevisao(HOJE));

    const resultado = service.classificarRevisao('soma-de-dois-numeros', 'errei', HOJE);

    expect(resultado.xpGanho).toBe(XP_POR_REVISAO);
    expect(resultado.progresso.xp).toBe(10 + XP_POR_REVISAO);
  });

  it('recalcula a próxima data da revisão conforme a classificação', () => {
    const service = criarProgressService(repositorioComRevisao(HOJE));

    const resultado = service.classificarRevisao('soma-de-dois-numeros', 'facil', HOJE);

    expect(resultado.progresso.revisoes[0]).toEqual({
      desafioSlug: 'soma-de-dois-numeros',
      proximaData: '2026-03-18',
      intervaloDias: 8,
      classificacoes: 1,
    });
  });

  it('não concede XP nem altera a revisão quando ela ainda não venceu', () => {
    const service = criarProgressService(repositorioComRevisao('2026-03-11'));

    const resultado = service.classificarRevisao('soma-de-dois-numeros', 'bom', HOJE);

    expect(resultado.xpGanho).toBe(0);
    expect(resultado.progresso.revisoes[0].proximaData).toBe('2026-03-11');
  });

  it('não faz nada para um desafio sem revisão na fila', () => {
    const service = criarProgressService(repositorioEmMemoria());

    const resultado = service.classificarRevisao('desafio-inexistente', 'bom', HOJE);

    expect(resultado.xpGanho).toBe(0);
  });
});
