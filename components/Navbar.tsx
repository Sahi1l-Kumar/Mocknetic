import Link from "next/link";
import React from "react";
import { Zap } from "lucide-react";

import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routes";
import LogoutButton from "@/components/LogoutButton";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="fixed z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Zap className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-slate-900">Mocknetic</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <UserAvatar
                id={session.user.id!}
                name={session.user.name!}
                imageUrl={session.user.image}
              />
              <LogoutButton />
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href={ROUTES.SIGN_IN}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.SIGN_UP}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
