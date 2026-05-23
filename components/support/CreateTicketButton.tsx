interface Props {
  onClick: () => void;
}

export default function CreateTicketButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
    >
      Создать тикет
    </button>
  );
}