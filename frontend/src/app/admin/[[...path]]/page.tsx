import AdminApp from "@/features/admin/AdminApp";
export const metadata = {
  title: "مدیریت استودیو",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  return <AdminApp path={path?.join("/") || "dashboard"} />;
}
