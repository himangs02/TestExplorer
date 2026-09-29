"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import UserNav from "@/components/Navbar/UserNav";

interface SiteHeaderProps {
  school?: {
    name: string;
    logo_url?: string | null;
  } | null;
  user?: any;
  profile?: any;
  schoolSlug?: string | null;
}

export function SiteHeader({ school, user, profile, schoolSlug }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Scroll detection for enhanced glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define the Base Path
  const basePath = schoolSlug ? `/${schoolSlug}` : "";

  // Hide Navbar on Test/Practice Pages
  const cleanPath = schoolSlug && pathname.startsWith(`/${schoolSlug}`)
    ? pathname.replace(`/${schoolSlug}`, "") || "/"
    : pathname;

  const hiddenPrefixes = [
    "/dashboard",
    "/profile",
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

  const hiddenKeywords = [
    "/attempt",
    "/result",
    "/practice",
    "/mock",
    "/review"
  ];

  const isHidden =
    hiddenPrefixes.some((prefix) => cleanPath.startsWith(prefix)) ||
    hiddenKeywords.some((keyword) => cleanPath.includes(keyword));

  if (isHidden) return null;

  const navLinks = [
    { label: "Home", href: `${basePath}/` },
    { 
      label: "Rank Predictor", 
      href: "/predictor", 
      badge: "2027", 
      highlight: true 
    },
    { label: "Streams", href: `${basePath}/categories` },
    { label: "About", href: `${basePath}/about` },
    { label: "Blogs", href: `${basePath}/blogs` },
    { label: "Contact", href: `${basePath}/contact` },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? "bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-xs" 
        : "bg-white/95 backdrop-blur-md border-b border-gray-100"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 h-17 flex items-center justify-between">

        {/* ================= LEFT SIDE: BRANDING ================= */}
        <div className="flex items-center gap-2 shrink-0">
          {school ? (
            <Link href={`${basePath}/`} className="flex items-center gap-2.5 group">
              {school.logo_url ? (
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
                  <img
                    src={school.logo_url}
                    alt={`${school.name} Logo`}
                    className="object-contain w-full h-full rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shrink-0 shadow-sm">
                  {school.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1 max-w-[160px] sm:max-w-xs md:max-w-none">
                {school.name}
              </span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gray-950 text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-sm group-hover:bg-blue-600 transition-colors">
                TE
              </div>
              <span className="text-xl font-black text-gray-950 tracking-tight">
                Test<span className="text-blue-600">Explorer</span>
              </span>
            </Link>
          )}
        </div>

        {/* ================= CENTER: DESKTOP NAVIGATION ================= */}
        <nav className="hidden lg:flex gap-1.5 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive 
                    ? "text-blue-600 bg-blue-50/70 font-bold" 
                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-100/60"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-700 rounded-full leading-none">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ================= RIGHT SIDE: AUTH & ACTIONS ================= */}
        <div className="flex items-center gap-3">
          {/* Quick Search trigger link */}
          <Link
            href={`${basePath}/categories`}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-gray-950 hover:bg-gray-100 transition-colors"
            title="Search exams"
          >
            <Search className="w-4 h-4" />
          </Link>

          {user && profile ? (
            <UserNav profile={profile} email={user.email} />
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={`${basePath}/login`}
                prefetch={true}
                className="hidden sm:inline-flex text-sm font-bold text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
              >
                Log in
              </Link>

              <Link
                href={`${basePath}/signup`}
                prefetch={true}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-white bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER MENU ================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-17 bg-white/98 backdrop-blur-2xl border-b border-gray-200 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4.25rem)] overflow-y-auto z-50">
          <div className="container mx-auto px-5 py-6 space-y-4">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-base transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-extrabold"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-700 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Actions if not logged in */}
            {(!user || !profile) && (
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
                <Link
                  href={`${basePath}/login`}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                >
                  Log In
                </Link>
                <Link
                  href={`${basePath}/signup`}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
