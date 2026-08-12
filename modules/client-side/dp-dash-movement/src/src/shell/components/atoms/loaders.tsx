interface SimpleLoaderProps {
  text?: string;
  className?: string;
}

export default function SimpleLoader({ text, className }: SimpleLoaderProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="w-5 h-5 border-2 border-t-primary border-gray-300 rounded-full animate-spin" />
      <div className="text-xs font-semibold text-slate-700">{text ?? 'Loading...'}</div>
    </div>
  );
}
