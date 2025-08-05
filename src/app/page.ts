import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

const MainPage = async () => {
  const session = await auth();
  if (!session) {
    return redirect("/auth/login");
  } else {
    return redirect("/dashboard");
  }
};

export default MainPage;
