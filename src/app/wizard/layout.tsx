import { PropsWithChildren } from "react";

const WizardLayout = ({ children }: PropsWithChildren) => {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center">
      {children}
    </section>
  );
};

export default WizardLayout;
