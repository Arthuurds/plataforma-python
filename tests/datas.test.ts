import { describe, expect, it } from 'vitest';
import { dataLocal, somarDias } from '../lib/progresso/datas';

describe('dataLocal', () => {
  it('devolve a data do dia civil local, no formato AAAA-MM-DD', () => {
    expect(dataLocal(new Date(2026, 0, 5, 10, 0))).toBe('2026-01-05');
  });

  it('usa o dia local mesmo perto da meia-noite', () => {
    expect(dataLocal(new Date(2026, 0, 31, 23, 59))).toBe('2026-01-31');
  });
});

describe('somarDias', () => {
  it('soma dias dentro do mesmo mês', () => {
    expect(somarDias('2026-03-10', 1)).toBe('2026-03-11');
  });

  it('atravessa a virada do mês', () => {
    expect(somarDias('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('atravessa a virada do ano', () => {
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('trata anos bissextos', () => {
    expect(somarDias('2024-02-28', 1)).toBe('2024-02-29');
  });
});
