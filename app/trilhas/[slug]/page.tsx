import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTrilha, listarDesafiosDaTrilha, listarTrilhas } from '@/lib/catalog';

export function generateStaticParams() {
  return listarTrilhas().map((trilha) => ({ slug: trilha.slug }));
}

export default async function TrilhaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trilha = getTrilha(slug);

  if (!trilha) {
    notFound();
  }

  const desafios = listarDesafiosDaTrilha(slug);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{trilha.titulo}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{trilha.descricao}</p>
      </header>
      <ol className="flex flex-col gap-3 list-decimal pl-6">
        {desafios.map((desafio) => (
          <li key={desafio.slug} className="text-zinc-950 dark:text-zinc-50">
            <Link href={`/desafios/${desafio.slug}`} className="hover:underline">
              {desafio.titulo}
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
