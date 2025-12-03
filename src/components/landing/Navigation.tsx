"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Lock, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const { data: session } = useSession();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const navLinks = [
        { name: "Services", href: "#services" },
        { name: "Fleet", href: "#fleet" },
        { name: "Projects", href: "#projects" },
        { name: "Safety", href: "#safety" },
        { name: "Contact", href: "#contact" },
    ];

    const portalLink = session ? "/dashboard" : "/login";
    const portalText = session ? "Dashboard" : "Client Portal";
    const PortalIcon = session ? LayoutDashboard : Lock;

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-charcoal/90 backdrop-blur-md py-4 shadow-lg" : "bg-transparent py-6"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="relative z-50 bg-charcoal/80 backdrop-blur-md p-2 rounded-lg hover:bg-charcoal/90 transition-colors border border-white/10">
                    <img
                        src="/images/MidwestUnderground_Logo (1).png"
                        alt="Midwest Underground"
                        className="h-12 md:h-16 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-white/80 hover:text-orange font-sans text-sm uppercase tracking-widest transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Client Portal / Dashboard Button */}
                    <Link
                        href={portalLink}
                        className="group relative z-50 cursor-pointer flex items-center space-x-2 px-5 py-2 border border-white/30 rounded-full text-white hover:bg-white hover:text-charcoal transition-all duration-300"
                    >
                        <PortalIcon className="w-4 h-4" />
                        <span className="font-sans text-sm font-medium">{portalText}</span>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white z-50"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        className="fixed inset-0 bg-charcoal z-40 flex flex-col justify-center items-center space-y-8"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-2xl font-heading text-white hover:text-orange uppercase tracking-wider"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href={portalLink}
                            className="flex items-center space-x-2 px-8 py-3 border border-white/30 rounded-full text-white hover:bg-white hover:text-charcoal transition-all duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <PortalIcon className="w-5 h-5" />
                            <span className="font-sans text-lg font-medium">{portalText}</span>
                        </Link>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}
