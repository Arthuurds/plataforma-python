import Link from 'next/link';
import { listarTrilhas } from '@/lib/catalog';

export default function TrilhasPage() {
  const trilhas = listarTrilhas();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Trilhas</h1>
      <ul className="flex flex-col gap-4">
        {trilhas.map((trilha) => (
          <li key={trilha.slug}>
            <Link
              href={`/trilhas/${trilha.slug}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800"
            >
              <span className="font-medium text-zinc-950 dark:text-zinc-50">{trilha.titulo}</span>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{trilha.descricao}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
