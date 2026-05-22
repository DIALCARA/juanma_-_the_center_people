interface Props {
  type: "success" | "error" | "info";
  message: string;
  onClose?: () => void;
}

const styles = {
  success: "border-green-800 bg-green-900/20 text-green-400",
  error: "border-red-800 bg-red-900/20 text-red-400",
  info: "border-neutral-700 bg-neutral-800/50 text-neutral-300",
};

export default function Alert({ type, message, onClose }: Props) {
  return (
    <div
      className={`flex items-start justify-between p-3 border text-sm mb-4 ${styles[type]}`}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 text-lg leading-none">
          ×
        </button>
      )}
    </div>
  );
}
