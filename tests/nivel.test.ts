import { describe, expect, it } from 'vitest';
import { calcularNivel, NIVEL_MAXIMO } from '../lib/progresso/nivel';

describe('calcularNivel', () => {
  it('começa no nível 1 com zero XP', () => {
    const nivel = calcularNivel(0);

    expect(nivel.nivel).toBe(1);
    expect(nivel.xpRestante).toBe(100);
  });

  it.each([
    [99, 1],
    [100, 2],
    [299, 2],
    [300, 3],
    [599, 3],
    [600, 4],
    [999, 4],
    [1000, 5],
    [1499, 5],
    [1500, 6],
    [2099, 6],
    [2100, 7],
    [2799, 7],
    [2800, 8],
    [3599, 8],
    [3600, 9],
    [4499, 9],
    [4500, 10],
  ])('com %i XP o estudante está no nível %i', (xp, nivelEsperado) => {
    expect(calcularNivel(xp).nivel).toBe(nivelEsperado);
  });

  it('informa quanto XP falta para o próximo nível', () => {
    const nivel = calcularNivel(250);

    expect(nivel.nivel).toBe(2);
    expect(nivel.xpRestante).toBe(50);
  });

  it('informa quanto do nível atual já foi conquistado', () => {
    const nivel = calcularNivel(250);

    expect(nivel.xpDoNivelAtual).toBe(100);
    expect(nivel.xpNoNivel).toBe(150);
  });

  it('no nível máximo não há próximo nível nem XP restante', () => {
    const nivel = calcularNivel(9000);

    expect(nivel.nivel).toBe(NIVEL_MAXIMO);
    expect(nivel.proximoNivel).toBeNull();
    expect(nivel.xpRestante).toBe(0);
  });

  it('trata XP negativo como zero', () => {
    expect(calcularNivel(-5).nivel).toBe(1);
  });
});
