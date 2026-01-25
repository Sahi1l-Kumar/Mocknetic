"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Zap,
  ChevronDown,
  Code2,
  Target,
  MessageSquare,
  GraduationCap,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routes";
import LogoutButton from "@/components/LogoutButton";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const features = [
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  if (!isMounted || status === "loading") {
    return (
      <nav className="fixed z-50 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={ROUTES.HOME} className="flex items-center gap-2">
              <Zap className="w-7 h-7 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">
                Mocknetic
              </span>
            </Link>

            {/* Desktop skeleton */}
            <div className="hidden md:flex items-center gap-6">
              <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
            </div>

            {/* Mobile skeleton */}
            <div className="md:hidden flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <Zap className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Mocknetic</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {session?.user && (
              <>
                {/* Features Dropdown */}
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
                                    className={`${colors.bg} p-2.5 rounded-lg group-hover:scale-110 transition-transform shrink-0`}
                                  >
                                    <Icon
                                      className={`w-5 h-5 ${colors.text}`}
                                    />
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

                <Link
                  href={ROUTES.DASHBOARD}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors rounded-lg hover:bg-blue-50 group"
                >
                  <LayoutDashboard className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                  Dashboard
                </Link>

                <Link
                  href={ROUTES.CLASSROOM}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors rounded-lg hover:bg-indigo-50"
                >
                  <GraduationCap className="w-5 h-5" />
                  Classroom
                </Link>
              </>
            )}

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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {session?.user && (
              <UserAvatar
                id={session.user.id!}
                name={session.user.name!}
                imageUrl={session.user.image}
              />
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-white z-40 overflow-y-auto">
          <div className="px-4 py-6 space-y-4">
            {session?.user ? (
              <>
                <Link
                  href={ROUTES.DASHBOARD}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-4 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="bg-blue-100 p-2.5 rounded-lg">
                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">My Dashboard</p>
                    <p className="text-xs text-slate-600">
                      View your progress and stats
                    </p>
                  </div>
                </Link>

                <Link
                  href={ROUTES.CLASSROOM}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-4 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <div className="bg-indigo-50 p-2.5 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Classroom</p>
                    <p className="text-xs text-slate-600">
                      Your enrolled classes
                    </p>
                  </div>
                </Link>

                {/* Features Section */}
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
                    Features
                  </p>
                  <div className="space-y-2">
                    {features.map((feature) => {
                      const Icon = feature.icon;
                      const colors = getColorClasses(feature.color);
                      return (
                        <Link
                          key={feature.href}
                          href={feature.href}
                          onClick={closeMobileMenu}
                          className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div
                            className={`${colors.bg} p-2.5 rounded-lg shrink-0`}
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

                {/* Logout */}
                <div className="border-t pt-4">
                  <LogoutButton />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  href={ROUTES.SIGN_IN}
                  onClick={closeMobileMenu}
                  className="block w-full text-center px-6 py-3 text-slate-700 font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href={ROUTES.SIGN_UP}
                  onClick={closeMobileMenu}
                  className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
