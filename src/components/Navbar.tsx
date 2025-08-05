"use client";

import { usePathname } from "next/navigation";
import LogoComponent from "./Logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
};

const items = [
  { label: "Dashboard", link: "/dashboard" },
  { label: "Transactions", link: "/dashboard/transactions" },
  { label: "Manage", link: "/dashboard/manage" },
];

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="block md:hidden bg-background border-separate">
      <nav className="container flex items-center justify-between px-4 md:px-8 h-[70px] w-full">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-full max-w-[400px] sm:max-w-[500px]"
            side="left"
          >
            <LogoComponent />
            <div className="flex flex-col gap-1 pt-10 flex-1">
              {items.map((item) => (
                <NavbarItem
                  key={item.label}
                  label={item.label}
                  link={item.link}
                  clickCallback={() => setIsOpen((prev) => !prev)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex h-[80px] items-center gap-x-4">
          <LogoComponent />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <NavbarAvatar />
        </div>
      </nav>
    </section>
  );
};

const DesktopNavbar = () => {
  return (
    <section className="hidden border-separate border-b bg-background md:flex ">
      <nav className="container flex items-center px-4 md:px-8 h-[70px] gap-x-4 w-full">
        <LogoComponent />
        <div className="flex h-full items-center flex-1 justify-center">
          {items.map((item) => (
            <NavbarItem key={item.label} label={item.label} link={item.link} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <NavbarAvatar />
        </div>
      </nav>
    </section>
  );
};

type NavbarItemProps = {
  link: string;
  label: string;
  clickCallback?: () => void;
};

const NavbarItem = ({ link, label, clickCallback }: NavbarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === link;

  return (
    <div className="relative flex items-center">
      <Link
        href={link}
        onClick={clickCallback && clickCallback}
        className={buttonVariants({
          variant: "ghost",
          className: cn(
            "w-full text-lg text-muted-foreground hover:text-foreground",
            {
              "text-foreground": isActive,
            }
          ),
        })}
      >
        {label}
      </Link>
      {isActive && (
        <div className="absolute hidden inset-x-0 bottom-0 h-[2px] w-[80%] mx-auto rounded-xl md:block bg-foreground" />
      )}
    </div>
  );
};

const NavbarAvatar = () => {
  const { data: session } = useSession();
  if (!session || !session?.user) return null;
  const user = session.user;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none focus:ring-[2px] focus:ring-offset-2 focus:ring-primary rounded-full">
        <Avatar>
          <AvatarImage
            src={user?.image || "/images/male-avatar.png"}
            alt="Avatar Image"
          />
          <AvatarFallback>{user?.name || "AV"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive flex items-center gap-2 cursor-pointer"
          onClick={() => signOut({ redirectTo: "/auth/login" })}
        >
          <LogOut className="h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Navbar;
