import { describe, expect, it } from 'vitest';
import { getTrilha, listarDesafiosDaTrilha, listarTrilhas } from '../lib/catalog';

describe('catálogo de trilhas', () => {
  it('lista as trilhas disponíveis', () => {
    const slugs = listarTrilhas().map((trilha) => trilha.slug);

    expect(slugs).toContain('logica-basica');
    expect(slugs).toContain('estruturas-de-dados');
  });

  it('retorna os desafios da trilha na ordem definida pela trilha', () => {
    const titulos = listarDesafiosDaTrilha('logica-basica').map((desafio) => desafio.slug);

    expect(titulos).toEqual(['soma-de-dois-numeros', 'filtrar-lista-paridade']);
  });

  it('um mesmo desafio aparece em todas as trilhas a que pertence', () => {
    const emLogica = listarDesafiosDaTrilha('logica-basica').map((desafio) => desafio.slug);
    const emEstruturas = listarDesafiosDaTrilha('estruturas-de-dados').map((desafio) => desafio.slug);

    expect(emLogica).toContain('filtrar-lista-paridade');
    expect(emEstruturas).toContain('filtrar-lista-paridade');
  });

  it('a posição do desafio é específica de cada trilha', () => {
    const posicaoEmLogica = listarDesafiosDaTrilha('logica-basica').findIndex(
      (desafio) => desafio.slug === 'filtrar-lista-paridade',
    );
    const posicaoEmEstruturas = listarDesafiosDaTrilha('estruturas-de-dados').findIndex(
      (desafio) => desafio.slug === 'filtrar-lista-paridade',
    );

    expect(posicaoEmLogica).not.toBe(posicaoEmEstruturas);
  });

  it('retorna uma lista vazia para uma trilha inexistente', () => {
    expect(listarDesafiosDaTrilha('trilha-que-nao-existe')).toEqual([]);
  });

  it('encontra uma trilha pelo slug e retorna undefined para slug desconhecido', () => {
    expect(getTrilha('logica-basica')?.titulo).toBe('Lógica básica');
    expect(getTrilha('trilha-que-nao-existe')).toBeUndefined();
  });
});
