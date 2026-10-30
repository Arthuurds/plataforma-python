'use client';

import { useEffect, useRef, useState } from 'react';
import type { Desafio } from '@/lib/catalog';
import type { MensagemDoWorker, MensagemParaWorker, ResultadoAvaliacao } from '@/lib/python/avaliacao';

const TEMPO_LIMITE_MS = 10000;

export function EditorDesafio({ desafio }: { desafio: Desafio }) {
  const [codigo, setCodigo] = useState('');
  const [pronto, setPronto] = useState(false);
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAvaliacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const tempoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function iniciarWorker() {
    const worker = new Worker('/pyodide-worker.js', { type: 'module' });

    worker.onmessage = (evento: MessageEvent<MensagemDoWorker>) => {
      const mensagem = evento.data;

      if (mensagem.tipo === 'pronto') {
        setPronto(true);
        return;
      }

      if (tempoRef.current) {
        clearTimeout(tempoRef.current);
        tempoRef.current = null;
      }
      setExecutando(false);

      if (mensagem.tipo === 'resultado') {
        setResultado(mensagem.resultado);
        setErro(null);
      } else {
        setResultado(null);
        setErro(mensagem.mensagem);
      }
    };

    workerRef.current = worker;
  }

  function reiniciarWorker() {
    workerRef.current?.terminate();
    setPronto(false);
    iniciarWorker();
  }

  useEffect(() => {
    iniciarWorker();

    return () => {
      workerRef.current?.terminate();
      if (tempoRef.current) {
        clearTimeout(tempoRef.current);
      }
    };
  }, []);

  function executar() {
    if (!workerRef.current || !pronto || executando) {
      return;
    }

    setExecutando(true);
    setResultado(null);
    setErro(null);

    const mensagem: MensagemParaWorker = { codigo, testes: desafio.testes };
    workerRef.current.postMessage(mensagem);

    tempoRef.current = setTimeout(() => {
      tempoRef.current = null;
      setExecutando(false);
      setErro('O código demorou demais e foi interrompido. Verifique se há um laço infinito.');
      reiniciarWorker();
    }, TEMPO_LIMITE_MS);
  }

  const textoBotao = !pronto ? 'Carregando Python…' : executando ? 'Executando…' : 'Executar';

  return (
    <section className="flex flex-col gap-4">
      <label htmlFor="codigo" className="font-medium text-zinc-950 dark:text-zinc-50">
        Seu código
      </label>
      <textarea
        id="codigo"
        value={codigo}
        onChange={(evento) => setCodigo(evento.target.value)}
        spellCheck={false}
        rows={12}
        className="w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="button"
        onClick={executar}
        disabled={!pronto || executando}
        className="self-start rounded-lg bg-zinc-950 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {textoBotao}
      </button>

      <Resultados resultado={resultado} erro={erro} />
    </section>
  );
}

function Resultados({ resultado, erro }: { resultado: ResultadoAvaliacao | null; erro: string | null }) {
  if (erro) {
    return <p className="rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-200">{erro}</p>;
  }

  if (!resultado) {
    return null;
  }

  if (resultado.tipo === 'erro-sintaxe') {
    return (
      <div className="rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-200">
        <p className="font-medium">Erro de sintaxe: corrija o código antes de executar os testes.</p>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-sm">{resultado.mensagem}</pre>
      </div>
    );
  }

  if (resultado.tipo === 'erro-execucao') {
    return (
      <div className="rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-200">
        <p className="font-medium">Seu código lançou um erro ao rodar.</p>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-sm">{resultado.mensagem}</pre>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {resultado.testes.map((teste) => (
        <li
          key={teste.nome}
          className={teste.passou ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}
        >
          <span className="font-medium">
            {teste.passou ? '✓ Passou' : '✗ Falhou'}: {teste.nome}
          </span>
          {teste.mensagem ? <pre className="font-mono text-sm">{teste.mensagem}</pre> : null}
        </li>
      ))}
    </ul>
  );
}
