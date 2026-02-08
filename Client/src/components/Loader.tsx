interface LoaderProps {
  size?: number;
  className?: string;
}

export default function Loader({ size = 18, className = "" }: LoaderProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="h-full w-full animate-spin rounded-full border-2 border-slate-200/30 border-t-sky-400" />
    </span>
  );
}
