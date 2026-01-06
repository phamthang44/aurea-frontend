interface SectionHeaderProps {
  children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h2
      className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 dark:border-white/20 pb-3 text-gray-900 dark:text-white"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {children}
    </h2>
  );
}
