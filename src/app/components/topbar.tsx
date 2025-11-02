'use client';
import { useRef, useState } from "react";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { ShieldAlert } from "lucide-react";

export const AppHeader: React.FC<{ currentDate: string }> = ({ currentDate }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) { setMenuOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <header className="bg-white p-4 flex justify-between items-center gap-4 rounded-xl border border-gray-200/80 shadow-sm">
            <div>
                <h1 className="text-2xl tracking-tight font-medium">Bon retour, Dr. Sharma</h1>
                <p className="text-text-secondary text-sm">{currentDate}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <input type="text" placeholder="Rechercher patient, analyse..." className="bg-gray-100 border-transparent rounded-lg py-2 pl-10 pr-4 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 focus:w-96" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                </div>
                <button className="p-2.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Urgence">
                    <ShieldAlert size={20}/>
                </button>
                <div className="relative" ref={menuRef}>
                    <img onClick={() => setMenuOpen(!isMenuOpen)} src="https://placehold.co/40x40/0d6efd/f8f9fa?text=AS" alt="Avatar du médecin" className="rounded-full border-2 border-blue-500 cursor-pointer hover:scale-105 transition-transform" />
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
                            <div className="border-t border-gray-100 my-1"></div>
                            <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Déconnexion</a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};