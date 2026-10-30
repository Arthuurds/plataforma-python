import type { ExecutorPython, ResultadoExecucao } from './avaliacao';

const PYODIDE_VERSAO = '314.0.7';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSAO}/full/`;
const PYODIDE_MODULO_URL = `${PYODIDE_INDEX_URL}pyodide.mjs`;

type PythonError = Error & { type: string };

export type Pyodide = {
  globals: { get(nome: string): () => unknown };
  runPythonAsync(codigo: string, opcoes: { globals: unknown }): Promise<unknown>;
  ffi: { PythonError: new (...args: never[]) => PythonError };
};

export async function carregarPyodide(): Promise<Pyodide> {
  const modulo = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ PYODIDE_MODULO_URL)) as {
    loadPyodide: (opcoes: { indexURL: string }) => Promise<Pyodide>;
  };

  return modulo.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
}

function ultimaLinha(mensagem: string): string {
  return mensagem.trim().split('\n').pop() ?? mensagem;
}

export function criarExecutorPyodide(pyodide: Pyodide): ExecutorPython {
  const ambiente = pyodide.globals.get('dict')();

  return {
    async executar(codigo: string): Promise<ResultadoExecucao> {
      try {
        await pyodide.runPythonAsync(codigo, { globals: ambiente });
        return { ok: true };
      } catch (erro) {
        if (erro instanceof pyodide.ffi.PythonError) {
          const pythonError = erro as PythonError;
          return { ok: false, tipo: pythonError.type, mensagem: ultimaLinha(pythonError.message) };
        }
        throw erro;
      }
    },
  };
}
