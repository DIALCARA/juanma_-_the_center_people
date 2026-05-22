interface Props {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function FormField({ label, htmlFor, error, required, children }: Props) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>
      )}
    </div>
  );
}
