"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, HardHat, Globe, FileText, Calculator, Activity, Settings, LogOut, User } from "lucide-react";

export default function MobileNav({ user }: { user: { name: string; role: string } }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">MWU <span className="text-yellow-500">OPS</span></span>
            </div>
            <button onClick={toggleMenu} className="focus:outline-none">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="absolute top-16 left-0 w-full bg-gray-800 border-t border-gray-700 shadow-lg flex flex-col p-4 space-y-4">
                    <nav className="flex flex-col space-y-2">
                        <Link href="/dashboard" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/dashboard/projects" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                            <HardHat className="h-5 w-5" />
                            <span>Projects</span>
                        </Link>
                        <Link href="/dashboard/map" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                            <Globe className="h-5 w-5" />
                            <span>3D Maps</span>
                        </Link>
                        <Link href="/dashboard/reports" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                            <FileText className="h-5 w-5" />
                            <span>Daily Reports</span>
                        </Link>
                        <Link href="/dashboard/estimating" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                            <Calculator className="h-5 w-5" />
                            <span>Estimating</span>
                        </Link>
                        <Link href="/dashboard/estimates/import" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg ml-4">
                            <FileText className="h-5 w-5" />
                            <span>Import Estimate</span>
                        </Link>
                        <Link href="/dashboard/rod-pass" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                            <Activity className="h-5 w-5" />
                            <span>Log Rod Pass</span>
                        </Link>
                        {user.role === "OWNER" && (
                            <Link href="/dashboard/settings" onClick={toggleMenu} className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                                <Settings className="h-5 w-5" />
                                <span>Settings</span>
                            </Link>
                        )}
                    </nav>

                    <div className="border-t border-gray-700 pt-4">
                        <div className="flex items-center space-x-3 px-4 py-2">
                            <div className="bg-blue-600 rounded-full p-2">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.role}</p>
                            </div>
                        </div>
                        <Link href="/api/auth/signout" className="flex items-center space-x-3 px-4 py-2 mt-2 text-red-400 hover:text-red-300 text-sm">
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
