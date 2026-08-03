export default function LoadingScreen({ label = "Зареждане…" }: { label?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-graphite px-6 text-chalk">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin border-2 border-amber border-t-transparent" />
        <p className="text-sm text-chalkDim">{label}</p>
      </div>
    </main>
  );
}
