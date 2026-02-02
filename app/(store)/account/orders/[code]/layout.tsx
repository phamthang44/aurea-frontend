/**
 * Order Detail Layout
 *
 * This layout overrides the parent account layout to allow
 * the order detail page to have its own full-width layout
 * without the account sidebar.
 */
export default function OrderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
