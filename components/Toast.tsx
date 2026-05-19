type ToastType = "success" | "error" | "info";

type ToastData = {
  message: string;
  type: ToastType;
};

type ToastProps = {
  toast: ToastData | null;
};

export function Toast({ toast }: ToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div
      className={`fixed right-5 top-5 z-50 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur ${
        toast.type === "success"
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
          : toast.type === "error"
          ? "border-red-400/20 bg-red-400/10 text-red-100"
          : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
      }`}
    >
      <p className="font-bold">{toast.message}</p>
    </div>
  );
}