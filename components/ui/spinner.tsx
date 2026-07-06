export function Spinner({ className = "h-8 w-8", color = "border-primary" }: { className?: string; color?: string }) {
  return (
    <div className={`${className} animate-spin rounded-full border-4 ${color} border-t-transparent`} />
  );
}
