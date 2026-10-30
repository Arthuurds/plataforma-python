'use client';

import { useEffect, useState } from 'react';
import { CONQUISTAS } from '@/lib/progresso/conquistas';
import { criarProgressServiceDoNavegador } from '@/lib/progresso/navegador';

export function ListaConquistas() {
  const [desbloqueadas, setDesbloqueadas] = useState<string[] | null>(null);

  useEffect(() => {
    const service = criarProgressServiceDoNavegador();
    // O localStorage só existe no navegador, então a lista é carregada depois da montagem.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDesbloqueadas(service.obterProgresso().conquistas);
  }, []);

  if (desbloqueadas === null) {
    return <p className="text-zinc-600 dark:text-zinc-400">Carregando…</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {CONQUISTAS.map((conquista) => {
        const obtida = desbloqueadas.includes(conquista.id);

        return (
          <li
            key={conquista.id}
            className={`rounded-lg border p-4 ${
              obtida
                ? 'border-green-600 text-zinc-950 dark:text-zinc-50'
                : 'border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-500'
            }`}
          >
            <span className="font-medium">{conquista.titulo}</span>
            <span className="ml-2 text-sm">{obtida ? 'desbloqueada' : 'pendente'}</span>
          </li>
        );
      })}
    </ul>
  );
}
