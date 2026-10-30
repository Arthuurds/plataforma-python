import { describe, expect, it } from 'vitest';
import { avaliarCodigo, type ExecutorPython, type ResultadoExecucao } from '../lib/python/avaliacao';

function executorFalso(respostas: Record<string, ResultadoExecucao>) {
  const chamadas: string[] = [];
  const executor: ExecutorPython = {
    executar: async (codigo) => {
      chamadas.push(codigo);
      return respostas[codigo] ?? { ok: true };
    },
  };
  return { executor, chamadas };
}

const testes = [
  { nome: 'soma simples', codigo: 'assert soma(2, 3) == 5' },
  { nome: 'soma com negativos', codigo: 'assert soma(-1, 1) == 0' },
];

describe('avaliarCodigo', () => {
  it('reporta erro de sintaxe sem rodar os testes', async () => {
    const { executor, chamadas } = executorFalso({
      'def soma(a, b': { ok: false, tipo: 'SyntaxError', mensagem: "SyntaxError: '(' was never closed" },
    });

    const resultado = await avaliarCodigo(executor, 'def soma(a, b', testes);

    expect(resultado).toEqual({ tipo: 'erro-sintaxe', mensagem: "SyntaxError: '(' was never closed" });
    expect(chamadas).toEqual(['def soma(a, b']);
  });

  it('reporta erro de indentação como erro de sintaxe', async () => {
    const { executor } = executorFalso({
      'x': { ok: false, tipo: 'IndentationError', mensagem: 'IndentationError: expected an indented block' },
    });

    const resultado = await avaliarCodigo(executor, 'x', testes);

    expect(resultado.tipo).toBe('erro-sintaxe');
  });

  it('reporta erro de execução do código do estudante sem rodar os testes', async () => {
    const { executor, chamadas } = executorFalso({
      'print(variavel)': { ok: false, tipo: 'NameError', mensagem: "NameError: name 'variavel' is not defined" },
    });

    const resultado = await avaliarCodigo(executor, 'print(variavel)', testes);

    expect(resultado).toEqual({
      tipo: 'erro-execucao',
      mensagem: "NameError: name 'variavel' is not defined",
    });
    expect(chamadas).toEqual(['print(variavel)']);
  });

  it('marca cada teste como passou quando nenhum erro é lançado', async () => {
    const { executor } = executorFalso({});

    const resultado = await avaliarCodigo(executor, 'def soma(a, b): return a + b', testes);

    expect(resultado).toEqual({
      tipo: 'avaliado',
      testes: [
        { nome: 'soma simples', passou: true },
        { nome: 'soma com negativos', passou: true },
      ],
    });
  });

  it('marca o teste que falhou com a mensagem e continua rodando os demais', async () => {
    const { executor } = executorFalso({
      'assert soma(2, 3) == 5': { ok: false, tipo: 'AssertionError', mensagem: 'AssertionError: esperado 5' },
    });

    const resultado = await avaliarCodigo(executor, 'def soma(a, b): return a - b', testes);

    expect(resultado).toEqual({
      tipo: 'avaliado',
      testes: [
        { nome: 'soma simples', passou: false, mensagem: 'AssertionError: esperado 5' },
        { nome: 'soma com negativos', passou: true },
      ],
    });
  });

  it('roda os testes depois do código do estudante, na ordem definida', async () => {
    const { executor, chamadas } = executorFalso({});

    await avaliarCodigo(executor, 'def soma(a, b): return a + b', testes);

    expect(chamadas).toEqual([
      'def soma(a, b): return a + b',
      'assert soma(2, 3) == 5',
      'assert soma(-1, 1) == 0',
    ]);
  });
});
