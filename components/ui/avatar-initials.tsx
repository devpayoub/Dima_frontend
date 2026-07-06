export function AvatarInitials({ name, className = "" }: { name: string; className?: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ${className}`}>
      {initials}
    </div>
  );
}
