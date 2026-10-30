import { describe, expect, it } from 'vitest';
import { conquistasAlcancadas, sequenciaAtual, type TrilhaResumo } from '../lib/progresso/conquistas';
import { PROGRESSO_INICIAL, type Progresso, type ProgressRepository } from '../lib/progresso/progress-repository';
import { criarProgressService } from '../lib/progresso/progress-service';

const TRILHAS: TrilhaResumo[] = [
  { slug: 'trilha-a', desafioSlugs: ['a1', 'a2'] },
  { slug: 'trilha-b', desafioSlugs: ['b1'] },
];

function repositorioEmMemoria(inicial: Progresso = PROGRESSO_INICIAL): ProgressRepository {
  let atual = inicial;
  return {
    carregar: () => atual,
    salvar: (progresso) => {
      atual = progresso;
    },
  };
}

describe('sequenciaAtual', () => {
  it('conta os dias seguidos terminando hoje', () => {
    expect(sequenciaAtual(['2026-03-08', '2026-03-09', '2026-03-10'], '2026-03-10')).toBe(3);
  });

  it('um intervalo quebra a sequência', () => {
    expect(sequenciaAtual(['2026-03-08', '2026-03-10'], '2026-03-10')).toBe(1);
  });

  it('dias sem atividade hoje não contam como sequência atual', () => {
    expect(sequenciaAtual(['2026-03-08', '2026-03-09'], '2026-03-10')).toBe(0);
  });

  it('atravessa a virada do mês', () => {
    expect(sequenciaAtual(['2026-02-28', '2026-03-01'], '2026-03-01')).toBe(2);
  });
});

describe('conquistasAlcancadas', () => {
  it('"primeiro desafio resolvido" é alcançada com um desafio resolvido', () => {
    const alcancadas = conquistasAlcancadas(
      { desafiosResolvidos: ['a1'], diasDeEstudo: ['2026-03-10'] },
      TRILHAS,
      '2026-03-10',
    );

    expect(alcancadas).toContain('primeiro-desafio');
  });

  it('"primeira trilha concluída" exige todos os desafios da trilha', () => {
    const parcial = conquistasAlcancadas(
      { desafiosResolvidos: ['a1'], diasDeEstudo: [] },
      TRILHAS,
      '2026-03-10',
    );
    const completa = conquistasAlcancadas(
      { desafiosResolvidos: ['a1', 'a2'], diasDeEstudo: [] },
      TRILHAS,
      '2026-03-10',
    );

    expect(parcial).not.toContain('primeira-trilha');
    expect(completa).toContain('primeira-trilha');
  });

  it('"sequência de 3 dias" é alcançada ao atingir 3 dias seguidos', () => {
    const alcancadas = conquistasAlcancadas(
      { desafiosResolvidos: [], diasDeEstudo: ['2026-03-08', '2026-03-09', '2026-03-10'] },
      TRILHAS,
      '2026-03-10',
    );

    expect(alcancadas).toContain('sequencia-3-dias');
  });

  it('sem atividade, nenhuma conquista é alcançada', () => {
    expect(conquistasAlcancadas({ desafiosResolvidos: [], diasDeEstudo: [] }, TRILHAS, '2026-03-10')).toEqual([]);
  });
});

describe('ProgressService: conquistas', () => {
  it('reporta como nova a conquista desbloqueada pela primeira resolução', () => {
    const service = criarProgressService(repositorioEmMemoria(), TRILHAS);

    const resultado = service.registrarResolucao('a1', '2026-03-10');

    expect(resultado.novasConquistas).toEqual(['primeiro-desafio']);
  });

  it('uma conquista já desbloqueada não é reportada de novo', () => {
    const service = criarProgressService(repositorioEmMemoria(), TRILHAS);
    service.registrarResolucao('a1', '2026-03-10');

    const segunda = service.registrarResolucao('a2', '2026-03-10');

    expect(segunda.novasConquistas).toEqual(['primeira-trilha']);
    expect(service.obterProgresso().conquistas).toEqual(['primeiro-desafio', 'primeira-trilha']);
  });

  it('desbloqueia a sequência de 3 dias quando o terceiro dia de estudo acontece', () => {
    const service = criarProgressService(repositorioEmMemoria(), TRILHAS);

    service.registrarResolucao('a1', '2026-03-08');
    service.registrarResolucao('b1', '2026-03-09');
    const terceiroDia = service.registrarResolucao('a2', '2026-03-10');

    expect(terceiroDia.novasConquistas).toContain('sequencia-3-dias');
  });

  it('um dia sem atividade quebra a sequência', () => {
    const service = criarProgressService(repositorioEmMemoria(), TRILHAS);

    service.registrarResolucao('a1', '2026-03-10');
    service.registrarResolucao('b1', '2026-03-11');
    const depois = service.registrarResolucao('a2', '2026-03-13');

    expect(depois.novasConquistas).not.toContain('sequencia-3-dias');
  });

  it('classificar uma revisão conta como dia de estudo', () => {
    const service = criarProgressService(
      repositorioEmMemoria({
        xp: 20,
        desafiosResolvidos: ['a1', 'b1'],
        revisoes: [{ desafioSlug: 'a1', proximaData: '2026-03-11', intervaloDias: 1, classificacoes: 0 }],
        diasDeEstudo: ['2026-03-09', '2026-03-10'],
        conquistas: ['primeiro-desafio'],
      }),
      TRILHAS,
    );

    const resultado = service.classificarRevisao('a1', 'bom', '2026-03-11');

    expect(resultado.progresso.diasDeEstudo).toContain('2026-03-11');
    expect(resultado.novasConquistas).toContain('sequencia-3-dias');
  });

  it('um dia de estudo é registrado uma única vez, mesmo com várias atividades no dia', () => {
    const service = criarProgressService(repositorioEmMemoria(), TRILHAS);

    service.registrarResolucao('a1', '2026-03-10');
    const outra = service.registrarResolucao('b1', '2026-03-10');

    expect(outra.progresso.diasDeEstudo).toEqual(['2026-03-10']);
  });
});
