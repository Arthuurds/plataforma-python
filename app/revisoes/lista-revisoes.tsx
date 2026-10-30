'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDesafio } from '@/lib/catalog';
import { dataLocal } from '@/lib/progresso/datas';
import { criarProgressServiceDoNavegador } from '@/lib/progresso/navegador';
import type { Revisao } from '@/lib/progresso/progress-repository';

export function ListaRevisoes() {
  const [vencidas, setVencidas] = useState<Revisao[] | null>(null);

  useEffect(() => {
    const service = criarProgressServiceDoNavegador();
    // O localStorage só existe no navegador, então a lista é carregada depois da montagem.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVencidas(service.revisoesVencidas(dataLocal(new Date())));
  }, []);

  if (vencidas === null) {
    return <p className="text-zinc-600 dark:text-zinc-400">Carregando…</p>;
  }

  if (vencidas.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">Nenhuma revisão pendente para hoje.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {vencidas.map((revisao) => (
        <li key={revisao.desafioSlug}>
          <Link
            href={`/desafios/${revisao.desafioSlug}`}
            className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800"
          >
            {getDesafio(revisao.desafioSlug)?.titulo ?? revisao.desafioSlug}
          </Link>
        </li>
      ))}
    </ul>
  );
}
