'use client';
import { LayoutDashboard, Users, Beaker, CalendarIcon, MessageSquare, PieChart, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React, { useState } from 'react';
const Sidebar: React.FC<{ isExpanded: boolean; setIsExpanded: (isExpanded: boolean) => void }> = ({ isExpanded, setIsExpanded }) => {
    const navItems = [{ icon: LayoutDashboard, title: "Tableau de bord", active: true },{ icon: Users, title: "Patients" },{ icon: Beaker, title: "Analyses" },{ icon: CalendarIcon, title: "Calendrier" },{ icon: MessageSquare, title: "Messages" },{ icon: PieChart, title: "Statistiques" }];
    return (
        <aside className={`hidden md:flex flex-col bg-white p-4 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20 items-center'}`}>
            <div className={`flex items-center w-full mb-8 ${isExpanded ? 'justify-between' : 'justify-center'}`}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12L22 7" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12V22" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12L2 7" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9.5L17 4.5" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><button onClick={() => setIsExpanded(!isExpanded)} className="sidebar-icon p-2" title={isExpanded ? "Réduire" : "Agrandir"}>{isExpanded ? <ChevronsLeft /> : <ChevronsRight />}</button></div>
            <nav className="flex flex-col gap-4 w-full">{navItems.map((item, index) => (<a href="#" key={index} className={`sidebar-icon p-2 flex items-center gap-3 ${item.active ? 'active' : ''} ${!isExpanded ? 'justify-center' : ''}`} title={item.title}><item.icon className="flex-shrink-0" />{isExpanded && <span className="truncate">{item.title}</span>}</a>))}</nav>
            <div className="mt-auto w-full pt-4 border-t border-gray-200/80"><a href="#" className={`sidebar-icon p-2 flex items-center gap-3 ${!isExpanded ? 'justify-center' : ''}`} title="Paramètres"><Settings className="flex-shrink-0"/>{isExpanded && <span className="truncate">Paramètres</span>}</a></div>
        </aside>
    );
};

const MobileNav: React.FC = () => {
    const navItems = [{ icon: LayoutDashboard, title: "Tableau de bord", active: true },{ icon: Users, title: "Patients" },{ icon: CalendarIcon, title: "Calendrier" },{ icon: MessageSquare, title: "Messages" },{ icon: Settings, title: "Paramètres" },];
    return (<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-10">{navItems.map((item, index) => (<a href="#" key={index} className={`sidebar-icon p-3 ${item.active ? 'active' : ''}`} title={item.title}><item.icon /></a>))}</nav>);
};



export const AppSidebar = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    return (
        <>
            <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        </>
    );
};

export const AppMobileNav = () => {
    return (
        <>
            <MobileNav />
        </>
    );
};