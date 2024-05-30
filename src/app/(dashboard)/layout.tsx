import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { PropsWithChildren } from "react";

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="relative flex h-screen w-full flex-col">
      <section className="w-full">
        <Navbar />
        <section className="w-full min-h-[75vh] relative bg-background">
          {children}
        </section>
        <Footer />
      </section>
    </main>
  );
};

export default DashboardLayout;
