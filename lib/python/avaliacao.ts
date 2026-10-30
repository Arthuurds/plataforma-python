import type { Teste } from '../catalog';

export type ResultadoExecucao = { ok: true } | { ok: false; tipo: string; mensagem: string };

export interface ExecutorPython {
  executar(codigo: string): Promise<ResultadoExecucao>;
}

export type ResultadoTeste = {
  nome: string;
  passou: boolean;
  mensagem?: string;
};

export type ResultadoAvaliacao =
  | { tipo: 'erro-sintaxe'; mensagem: string }
  | { tipo: 'erro-execucao'; mensagem: string }
  | { tipo: 'avaliado'; testes: ResultadoTeste[] };

export type MensagemParaWorker = {
  codigo: string;
  testes: Teste[];
};

export type MensagemDoWorker =
  | { tipo: 'pronto' }
  | { tipo: 'resultado'; resultado: ResultadoAvaliacao }
  | { tipo: 'erro-interno'; mensagem: string };

const TIPOS_DE_SINTAXE = ['SyntaxError', 'IndentationError', 'TabError'];

export async function avaliarCodigo(
  executor: ExecutorPython,
  codigo: string,
  testes: Teste[],
): Promise<ResultadoAvaliacao> {
  const execucao = await executor.executar(codigo);

  if (!execucao.ok) {
    const tipo = TIPOS_DE_SINTAXE.includes(execucao.tipo) ? 'erro-sintaxe' : 'erro-execucao';
    return { tipo, mensagem: execucao.mensagem };
  }

  const resultados: ResultadoTeste[] = [];

  for (const teste of testes) {
    const resultado = await executor.executar(teste.codigo);

    resultados.push(
      resultado.ok
        ? { nome: teste.nome, passou: true }
        : { nome: teste.nome, passou: false, mensagem: resultado.mensagem },
    );
  }

  return { tipo: 'avaliado', testes: resultados };
}
