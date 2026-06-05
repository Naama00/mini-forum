// Reusable circular user avatar component with gradient background
export function UserAvatar({ firstName = "", lastName = "", size = "sm" }) {
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";

  const sizeClasses = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 font-bold`}>
      {initials}
    </div>
  );
}
