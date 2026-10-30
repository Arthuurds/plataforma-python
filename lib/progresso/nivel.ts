const XP_MINIMO_POR_NIVEL = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

export const NIVEL_MAXIMO = XP_MINIMO_POR_NIVEL.length;

export type SituacaoDoNivel = {
  nivel: number;
  xpDoNivelAtual: number;
  xpNoNivel: number;
  proximoNivel: number | null;
  xpRestante: number;
};

export function calcularNivel(xp: number): SituacaoDoNivel {
  const xpTotal = Math.max(0, xp);
  const indice = XP_MINIMO_POR_NIVEL.findLastIndex((minimo) => xpTotal >= minimo);
  const nivel = indice + 1;
  const xpDoNivelAtual = XP_MINIMO_POR_NIVEL[indice];
  const proximoXp = XP_MINIMO_POR_NIVEL[indice + 1];

  if (proximoXp === undefined) {
    return {
      nivel,
      xpDoNivelAtual,
      xpNoNivel: xpTotal - xpDoNivelAtual,
      proximoNivel: null,
      xpRestante: 0,
    };
  }

  return {
    nivel,
    xpDoNivelAtual,
    xpNoNivel: xpTotal - xpDoNivelAtual,
    proximoNivel: nivel + 1,
    xpRestante: proximoXp - xpTotal,
  };
}
