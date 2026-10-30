import { avaliarCodigo, type MensagemDoWorker, type MensagemParaWorker } from './avaliacao';
import { carregarPyodide, criarExecutorPyodide } from './pyodide';

const pyodidePronto = carregarPyodide();

function enviar(mensagem: MensagemDoWorker) {
  postMessage(mensagem);
}

pyodidePronto.then(
  () => enviar({ tipo: 'pronto' }),
  () => {},
);

self.onmessage = async (evento: MessageEvent<MensagemParaWorker>) => {
  try {
    const pyodide = await pyodidePronto;
    const resultado = await avaliarCodigo(criarExecutorPyodide(pyodide), evento.data.codigo, evento.data.testes);
    enviar({ tipo: 'resultado', resultado });
  } catch (erro) {
    enviar({ tipo: 'erro-interno', mensagem: erro instanceof Error ? erro.message : String(erro) });
  }
};
