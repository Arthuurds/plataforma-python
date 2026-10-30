import { describe, expect, it } from 'vitest';
import { calcularProximaRevisao } from '../lib/progresso/revisao';
import type { Revisao } from '../lib/progresso/progress-repository';

const HOJE = '2026-03-10';

function revisaoInicial(): Revisao {
  return { desafioSlug: 'soma-de-dois-numeros', proximaData: HOJE, intervaloDias: 1, classificacoes: 0 };
}

describe('calcularProximaRevisao: primeira classificação', () => {
  it.each([
    ['errei', 1],
    ['dificil', 2],
    ['bom', 4],
    ['facil', 8],
  ] as const)('classificar "%s" na primeira vez usa o intervalo inicial de %i dia(s)', (classificacao, dias) => {
    const proxima = calcularProximaRevisao(revisaoInicial(), classificacao, HOJE);

    expect(proxima.intervaloDias).toBe(dias);
    expect(proxima.proximaData).toBe(somar(HOJE, dias));
  });

  it('registra a classificação na contagem de revisões', () => {
    const proxima = calcularProximaRevisao(revisaoInicial(), 'bom', HOJE);

    expect(proxima.classificacoes).toBe(1);
  });
});

describe('calcularProximaRevisao: revisões seguintes', () => {
  function comIntervalo(intervaloDias: number): Revisao {
    return { ...revisaoInicial(), intervaloDias, classificacoes: 1 };
  }

  it('Bom multiplica o intervalo atual por 2', () => {
    expect(calcularProximaRevisao(comIntervalo(4), 'bom', HOJE).intervaloDias).toBe(8);
  });

  it('Fácil multiplica o intervalo atual por 2,5', () => {
    expect(calcularProximaRevisao(comIntervalo(8), 'facil', HOJE).intervaloDias).toBe(20);
  });

  it('Difícil multiplica o intervalo atual por 1,2 e arredonda', () => {
    expect(calcularProximaRevisao(comIntervalo(4), 'dificil', HOJE).intervaloDias).toBe(5);
  });

  it('Errei volta o intervalo para 1 dia, independentemente do intervalo anterior', () => {
    expect(calcularProximaRevisao(comIntervalo(20), 'errei', HOJE).intervaloDias).toBe(1);
  });

  it('o intervalo nunca fica abaixo de 1 dia', () => {
    expect(calcularProximaRevisao(comIntervalo(1), 'dificil', HOJE).intervaloDias).toBe(1);
  });

  it('a próxima data é calculada a partir da data da classificação', () => {
    const proxima = calcularProximaRevisao(comIntervalo(8), 'facil', '2026-03-10');

    expect(proxima.proximaData).toBe('2026-03-30');
  });
});

function somar(data: string, dias: number): string {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia + dias)).toISOString().slice(0, 10);
}
