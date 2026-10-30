'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDesafio } from '@/lib/catalog';
import { dataLocal } from '@/lib/progresso/datas';
import { criarProgressServiceDoNavegador } from '@/lib/progresso/navegador';
import type { Revisao } from '@/lib/progresso/progress-repository';
import type { Classificacao } from '@/lib/progresso/revisao';

const CLASSIFICACOES: { valor: Classificacao; rotulo: string }[] = [
  { valor: 'errei', rotulo: 'Errei' },
  { valor: 'dificil', rotulo: 'Difícil' },
  { valor: 'bom', rotulo: 'Bom' },
  { valor: 'facil', rotulo: 'Fácil' },
];

export function ListaRevisoes() {
  const [vencidas, setVencidas] = useState<Revisao[] | null>(null);
  const [ultimoXp, setUltimoXp] = useState<number | null>(null);

  useEffect(() => {
    const service = criarProgressServiceDoNavegador();
    // O localStorage só existe no navegador, então a lista é carregada depois da montagem.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVencidas(service.revisoesVencidas(dataLocal(new Date())));
  }, []);

  function classificar(desafioSlug: string, classificacao: Classificacao) {
    const hoje = dataLocal(new Date());
    const service = criarProgressServiceDoNavegador();
    const resultado = service.classificarRevisao(desafioSlug, classificacao, hoje);

    setUltimoXp(resultado.xpGanho);
    setVencidas(service.revisoesVencidas(hoje));
  }

  if (vencidas === null) {
    return <p className="text-zinc-600 dark:text-zinc-400">Carregando…</p>;
  }

  if (vencidas.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-zinc-600 dark:text-zinc-400">Nenhuma revisão pendente para hoje.</p>
        {ultimoXp ? <p className="text-green-700 dark:text-green-400">+{ultimoXp} XP nesta sessão</p> : null}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {vencidas.map((revisao) => (
        <li key={revisao.desafioSlug} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <Link href={`/desafios/${revisao.desafioSlug}`} className="font-medium hover:underline">
            {getDesafio(revisao.desafioSlug)?.titulo ?? revisao.desafioSlug}
          </Link>
          <div className="flex flex-wrap gap-2">
            {CLASSIFICACOES.map((classificacao) => (
              <button
                key={classificacao.valor}
                type="button"
                onClick={() => classificar(revisao.desafioSlug, classificacao.valor)}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-sm hover:border-zinc-500 dark:border-zinc-700"
              >
                {classificacao.rotulo}
              </button>
            ))}
          </div>
        </li>
      ))}
      {ultimoXp ? <p className="text-green-700 dark:text-green-400">+{ultimoXp} XP</p> : null}
    </ul>
  );
}
