import LogoComponent from "./Logo";

const Footer = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center pb-10">
      <div className="mt-6 flex flex-col gap-y-3 items-center justify-center w-full">
        <LogoComponent
          textClassName="text-md sm:text-base md:text-lg"
          iconClassName="size-4 sm:size-6 md:size-8"
        />

        <p>
          Created by Vickonary.{" "}
          <span className="text-emerald-500 font-bold">Victor</span> |{" "}
          <span className="text-rose-500 font-bold">Cyril</span>
        </p>
        <p className="text-sm text-muted-foreground">&copy; copyright 2024.</p>
      </div>
    </section>
  );
};

export default Footer;
