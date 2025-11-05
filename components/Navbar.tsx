"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Zap,
  ChevronDown,
  FileText,
  Code2,
  Target,
  MessageSquare,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routes";
import LogoutButton from "@/components/LogoutButton";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const features = [
    {
      name: "Resume Parser",
      description: "Parse and analyze resumes",
      icon: FileText,
      href: ROUTES.RESUME,
      color: "blue",
    },
    {
      name: "Skill Assessment",
      description: "Analyze your skills gap",
      icon: Target,
      href: ROUTES.SKILL,
      color: "emerald",
    },
    {
      name: "Code Editor",
      description: "Practice coding problems",
      icon: Code2,
      href: ROUTES.CODE,
      color: "purple",
    },
    {
      name: "Mock Interview",
      description: "AI-powered interviews",
      icon: MessageSquare,
      href: ROUTES.INTERVIEW,
      color: "rose",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
      blue: { bg: "bg-blue-50", text: "text-blue-600" },
      purple: { bg: "bg-purple-50", text: "text-purple-600" },
      rose: { bg: "bg-rose-50", text: "text-rose-600" },
    };
    return colors[color] || colors.blue;
  };

  if (!isMounted) {
    return (
      <nav className="fixed z-50 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Mocknetic</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Zap className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-slate-900">Mocknetic</span>
        </Link>

        <div className="flex items-center gap-8">
          {session?.user && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors rounded-lg hover:bg-slate-50"
              >
                Features
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-3">
                        {features.map((feature) => {
                          const Icon = feature.icon;
                          const colors = getColorClasses(feature.color);
                          return (
                            <Link
                              key={feature.href}
                              href={feature.href}
                              onClick={() => setIsDropdownOpen(false)}
                              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div
                                className={`${colors.bg} p-2.5 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0`}
                              >
                                <Icon className={`w-5 h-5 ${colors.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 text-sm">
                                  {feature.name}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {feature.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
            ) : session?.user ? (
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
      </div>
    </nav>
  );
};

export default Navbar;
