import { ListaConquistas } from './lista-conquistas';

export default function ConquistasPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Conquistas</h1>
      <ListaConquistas />
    </main>
  );
}
