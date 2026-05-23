export default function EmptySupportState() {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">
          Пока нет тикетов
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Здесь будут отображаться обращения в поддержку
        </p>
      </div>
    </div>
  );
}