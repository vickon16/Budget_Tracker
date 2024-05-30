import LogoComponent from "@/components/Logo";
import { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center">
      <LogoComponent />
      <div className="mt-12">{children}</div>
    </section>
  );
};

export default AuthLayout;
