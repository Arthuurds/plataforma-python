import { notFound } from 'next/navigation';
import { getDesafio, listarDesafios } from '@/lib/catalog';
import { EditorDesafio } from './editor-desafio';

export function generateStaticParams() {
  return listarDesafios().map((desafio) => ({ slug: desafio.slug }));
}

export default async function DesafioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const desafio = getDesafio(slug);

  if (!desafio) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{desafio.titulo}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{desafio.enunciado}</p>
      </header>
      <EditorDesafio desafio={desafio} />
    </main>
  );
}
