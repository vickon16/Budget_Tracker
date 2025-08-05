import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import TransactionsPageClient from "./TransactionsPageClient";

const TransactionsPage = async () => {
  const session = await auth();
  if (!session || !session?.user?.id) return redirect("/auth/login");
  return <TransactionsPageClient />;
};

export default TransactionsPage;
