import { UsersStoreProvider } from "@/components/users-store-provider";

type UsersLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function UsersLayout({ children }: UsersLayoutProps) {
  return <UsersStoreProvider>{children}</UsersStoreProvider>;
}
