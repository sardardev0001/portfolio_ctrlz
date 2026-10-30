import PublicShell from "@/features/site/PublicShell";
import { getContent } from "@/services/public";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getContent();
  return <PublicShell content={content}>{children}</PublicShell>;
}
