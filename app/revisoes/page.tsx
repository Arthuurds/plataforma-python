import { ListaRevisoes } from './lista-revisoes';

export default function RevisoesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Revisões de hoje</h1>
      <ListaRevisoes />
    </main>
  );
}
