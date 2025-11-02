'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    LayoutDashboard,
    Users,
    Beaker,
    Calendar as CalendarIcon,
    MessageSquare,
    PieChart,
    Settings,
    Search,
    UserPlus,
    ChevronsLeft,
    ChevronsRight,
    X,
    Loader2,
    ShieldAlert,
    ChevronDown,
    Upload,
    UserX,
    BriefcaseMedical,
    Mail,
    Phone,
    Cake,
    Plus,
    FileText,
    FlaskConical,
    CalendarPlus,
    UploadCloud,
    Stethoscope,
    Activity,
    Baby,
    HeartPulse,
    Pill
} from 'lucide-react';

// --- MOCK DATA ---
const mockPatients = [
  { id: 'P001', name: 'Liam Gallagher', dob: '1972-09-21', gender: 'Homme', lastVisit: '2023-08-15', status: 'Actif', contact: '0612345678', ipp: '87C4-1', atcdsMedicaux: ['HTA', 'Diabète Type 2'], atcdsChirurgicaux: ['Appendicectomie (1998)'], atcdsGynéco: [], diagnosis: ['Hypertension Essentielle'], medications: ['Metformine', 'Lisinopril'] },
  { id: 'P002', name: 'Olivia Chen', dob: '1985-05-12', gender: 'Femme', lastVisit: '2023-10-01', status: 'Actif', contact: 'olivia.c@email.com', ipp: '91A2-3', atcdsMedicaux: ['Asthme'], atcdsChirurgicaux: [], atcdsGynéco: ['G1P1'], diagnosis: ['Crise d\'asthme aïgue'], medications: ['Ventoline'] },
  { id: 'P003', name: 'Benjamin Carter', dob: '1990-11-30', gender: 'Homme', lastVisit: '2023-09-22', status: 'Actif', contact: '0623456789', ipp: '76B8-5', atcdsMedicaux: ['Allergies saisonnières'], atcdsChirurgicaux: [], atcdsGynéco: [], diagnosis: ['Rhinite allergique'], medications: ['Cetirizine'] },
  { id: 'P004', name: 'Sophia Rodriguez', dob: '1978-02-18', gender: 'Femme', lastVisit: '2022-12-05', status: 'Inactif', contact: 'sophia.r@email.com', ipp: '45D3-2', atcdsMedicaux: ['Migraines'], atcdsChirurgicaux: ['Césarienne (2010)'], atcdsGynéco: ['G2P2'], diagnosis: ['Migraine chronique'], medications: ['Sumatriptan'] },
  { id: 'P005', name: 'Noah Kim', dob: '2001-07-03', gender: 'Homme', lastVisit: '2023-06-11', status: 'Actif', contact: '0634567890', ipp: '33F1-9', atcdsMedicaux: [], atcdsChirurgicaux: [], atcdsGynéco: [], diagnosis: ['Acné'], medications: ['Doxycycline'] },
  { id: 'P006', name: 'Ava Jones', dob: '1995-03-25', gender: 'Femme', lastVisit: '2023-01-20', status: 'Actif', contact: 'ava.j@email.com', ipp: '22E7-4', atcdsMedicaux: [], atcdsChirurgicaux: [], atcdsGynéco: ['G0P0'], diagnosis: ['Anémie ferriprive'], medications: ['Tardyferon'] },
];

// --- END MOCK DATA ---


const GlobalStyles = () => (
    <style>{`
        :root {
            --bg-primary: #f4f7fc; /* Lighter blue-gray */
            --bg-secondary: #ffffff;
            --accent-primary: #4f46e5; /* Indigo */
            --accent-secondary: #10b981; /* Emerald */
            --accent-warning: #f59e0b; /* Amber */
            --accent-danger: #ef4444; /* Red */
            --text-primary: #111827; /* Darker Gray */
            --text-secondary: #6b7280; /* Medium Gray */
            --border-color: #e5e7eb; /* Light Gray */
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .sidebar-icon {
            color: var(--text-secondary);
            transition: all 0.2s ease-in-out;
        }
        .sidebar-icon.active, .sidebar-icon:hover {
            background-color: var(--accent-primary);
            color: white;
            border-radius: 0.5rem;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }
    `}</style>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-text-secondary"><Loader2 className="animate-spin h-8 w-8 mb-2" /><p>Chargement...</p></div>
);

const EmptyState: React.FC<{icon: React.ElementType, title: string, message: string}> = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary p-8 bg-gray-50 rounded-lg">
        <Icon className="w-16 h-16 text-gray-300 mb-4"/>
        <h3 className="font-semibold text-lg text-text-primary mb-1">{title}</h3>
        <p className="text-sm">{message}</p>
    </div>
);

const Sidebar: React.FC<{ isExpanded: boolean; setIsExpanded: (isExpanded: boolean) => void }> = ({ isExpanded, setIsExpanded }) => {
    const navItems = [{ icon: LayoutDashboard, title: "Tableau de bord" },{ icon: Users, title: "Patients", active: true },{ icon: Beaker, title: "Analyses" },{ icon: CalendarIcon, title: "Calendrier" },{ icon: MessageSquare, title: "Messages" },{ icon: PieChart, title: "Statistiques" }];
    return (
        <aside className={`hidden md:flex flex-col bg-white p-4 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20 items-center'}`}>
            <div className={`flex items-center w-full mb-8 ${isExpanded ? 'justify-between' : 'justify-center'}`}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12L22 7" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12V22" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12L2 7" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9.5L17 4.5" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><button onClick={() => setIsExpanded(!isExpanded)} className="sidebar-icon p-2" title={isExpanded ? "Réduire" : "Agrandir"}>{isExpanded ? <ChevronsLeft /> : <ChevronsRight />}</button></div>
            <nav className="flex flex-col gap-4 w-full">{navItems.map((item, index) => (<a href="#" key={index} className={`sidebar-icon p-2 flex items-center gap-3 ${item.active ? 'active' : ''} ${!isExpanded ? 'justify-center' : ''}`} title={item.title}><item.icon className="flex-shrink-0" />{isExpanded && <span className="truncate">{item.title}</span>}</a>))}</nav>
            <div className="mt-auto w-full pt-4 border-t border-gray-200/80"><a href="#" className={`sidebar-icon p-2 flex items-center gap-3 ${!isExpanded ? 'justify-center' : ''}`} title="Paramètres"><Settings className="flex-shrink-0"/>{isExpanded && <span className="truncate">Paramètres</span>}</a></div>
        </aside>
    );
};

const Header: React.FC = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) { setMenuOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <header className="bg-white p-4 flex justify-between items-center gap-4 rounded-xl shadow-sm">
             <div>
                <h1 className="text-2xl tracking-tight font-medium">Gestion des Patients</h1>
                <p className="text-text-secondary text-sm">Rechercher, filtrer et gérer les dossiers patients.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <input type="text" placeholder="Rechercher patient, analyse..." className="bg-gray-100 border-transparent rounded-lg py-2 pl-10 pr-4 w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 focus:w-96" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                </div>
                <button className="p-2.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Urgence">
                    <ShieldAlert size={20}/>
                </button>
                <div className="relative" ref={menuRef}>
                    <img onClick={() => setMenuOpen(!isMenuOpen)} src="https://placehold.co/40x40/4f46e5/f4f7fc?text=AS" alt="Avatar du médecin" className="rounded-full border-2 border-indigo-500 cursor-pointer hover:scale-105 transition-transform" />
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

type Patient = typeof mockPatients[0];

const InfoBlock: React.FC<{ icon: React.ElementType; title: string; items: string[]; color: string }> = ({ icon: Icon, title, items, color }) => {
    const colors = {
        amber: { bg: 'bg-amber-100', text: 'text-amber-800', icon: 'text-amber-500' },
        sky: { bg: 'bg-sky-100', text: 'text-sky-800', icon: 'text-sky-500' },
        red: { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-500' },
        emerald: {bg: 'bg-emerald-100', text: 'text-emerald-800', icon: 'text-emerald-500'},
        fuchsia: {bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', icon: 'text-fuchsia-500'}
    };
    const currentTheme = colors[color as keyof typeof colors] || colors.sky;
    return(
        <div>
            <h3 className="flex items-center gap-2 font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">
                <Icon className={`w-5 h-5 ${currentTheme.icon}`} />
                {title}
            </h3>
            <div className="flex flex-wrap gap-2">
                {items && items.length > 0 ? items.map(item => <span key={item} className={`text-xs font-medium px-2.5 py-1 rounded-full ${currentTheme.bg} ${currentTheme.text}`}>{item}</span>) : <p className="text-sm text-gray-400">Aucun</p>}
            </div>
        </div>
    )
}

const PatientDetailPanel: React.FC<{ patient: Patient | null; onClose: () => void }> = ({ patient, onClose }) => {
    const [isActionsMenuOpen, setActionsMenuOpen] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) { setActionsMenuOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    if (!patient) {
        return (
            <div className="bg-white rounded-xl p-6 h-full flex flex-col items-center justify-center text-center shadow-sm">
                <BriefcaseMedical className="w-16 h-16 text-gray-300 mb-4"/>
                <h3 className="font-semibold text-lg">Dossier Patient</h3>
                <p className="text-sm text-text-secondary">Sélectionnez un patient pour voir ses détails.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-xl p-6 flex flex-col h-full shadow-sm">
            <div className="flex justify-between items-start mb-6"><div className="flex items-center gap-4"><img src={`https://placehold.co/64x64/e0e7ff/4f46e5?text=${patient.name.charAt(0)}`} className="rounded-full" alt="avatar"/><div><h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2><p className="text-sm text-text-secondary">IPP: {patient.ipp}</p></div></div><button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-200"><X size={20}/></button></div>
            <div className="grid grid-cols-3 gap-4 text-center bg-indigo-50 p-3 rounded-lg mb-6">
                <div><p className="text-xs text-indigo-700 font-semibold">Âge</p><p className="font-bold text-indigo-900">{new Date().getFullYear() - new Date(patient.dob).getFullYear()}</p></div>
                <div><p className="text-xs text-indigo-700 font-semibold">Sexe</p><p className="font-bold text-indigo-900">{patient.gender}</p></div>
                <div><p className="text-xs text-indigo-700 font-semibold">Statut</p><p className="font-bold text-indigo-900">{patient.status}</p></div>
            </div>
            
            <div className="space-y-6 flex-grow overflow-y-auto pr-2">
                <InfoBlock icon={HeartPulse} title="ATCDs médicaux" items={patient.atcdsMedicaux} color="red" />
                <InfoBlock icon={Activity} title="ATCDs chirurgicaux" items={patient.atcdsChirurgicaux} color="emerald" />
                {patient.gender === 'Femme' && <InfoBlock icon={Baby} title="ATCDs gynéco-obstétriques" items={patient.atcdsGynéco} color="fuchsia" />}
                <InfoBlock icon={Stethoscope} title="Diagnostics" items={patient.diagnosis} color="amber" />
                <InfoBlock icon={Pill} title="Traitement" items={patient.medications} color="sky" />
            </div>

            <div className="pt-6"><h3 className="font-semibold mb-4">Actions Rapides</h3><div className="flex items-center gap-2"><button className="flex-1 bg-indigo-600 text-white font-medium p-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Consulter le Dossier</button><div className="relative" ref={actionsMenuRef}><button onClick={() => setActionsMenuOpen(prev => !prev)} className="p-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"><Plus size={20}/></button>{isActionsMenuOpen && (<div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5"><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FileText size={16} className="text-gray-500"/>Nouvelle Ordonnance</a><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FlaskConical size={16} className="text-gray-500"/>Nouvelle Analyse</a><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><CalendarPlus size={16} className="text-gray-500"/>Nouveau RDV</a></div>)}</div></div></div>
        </div>
    );
};

const AddPatientModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">Ajouter un nouveau patient</h3><button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={24}/></button></div><form className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label><input type="text" placeholder="ex: Jean Dupont" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">IPP</label><input type="text" placeholder="ex: 12A3-4" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label><input type="date" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label><select className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"><option>Homme</option><option>Femme</option></select></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Contact (Tél. ou Email)</label><input type="text" placeholder="ex: 0612345678" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors">Annuler</button><button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Créer Patient</button></div></form></div></div>
);

const ImportPatientModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">Importer une liste de patients</h3><button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={24}/></button></div><div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"><div className="text-center"><UploadCloud className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" /><div className="mt-4 flex text-sm leading-6 text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"><span>Téléchargez un fichier</span><input id="file-upload" name="file-upload" type="file" className="sr-only" /></label><p className="pl-1">ou glissez-déposez</p></div><p className="text-xs leading-5 text-gray-600">XLS, XLSX, CSV jusqu'à 10MB</p></div></div><div className="flex justify-end gap-3 pt-6"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors">Annuler</button><button type="button" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Importer</button></div></div></div>
);


const PatientsPage: React.FC = () => {
    const [patients] = useState(mockPatients);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isAddPatientModalOpen, setAddPatientModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const itemsPerPage = 8;

    const filteredPatients = useMemo(() => {
        return patients
            .filter(patient => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(patient => statusFilter === 'Tous' ? true : patient.status === statusFilter)
    }, [patients, searchTerm, statusFilter]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const statusBadge = (status: string) => {
        const colors = { 'Actif': "bg-emerald-100 text-emerald-800", 'Inactif': "bg-gray-100 text-gray-800" };
        return <span className={`py-1 px-3 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors['Inactif']}`}>{status}</span>;
    };

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2">
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto flex-grow">
                        <div className="relative flex-grow">
                            <input type="text" placeholder="Rechercher par nom..." className="bg-gray-100 border-transparent rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setSearchTerm(e.target.value)} />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        </div>
                        <div className="relative">
                             <select className="appearance-none bg-gray-100 border-transparent rounded-lg py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-text-secondary" onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="Tous">Statut</option><option value="Actif">Actif</option><option value="Inactif">Inactif</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={() => setImportModalOpen(true)} className="flex-1 md:flex-initial w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"><Upload size={18}/> Importer</button>
                        <button onClick={() => setAddPatientModalOpen(true)} className="flex-1 md:flex-initial w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"><UserPlus size={18}/> Ajouter</button>
                    </div>
                </div>
                
                <div className="flex-1 bg-white rounded-xl p-4 md:p-6 flex flex-col shadow-sm">
                    {isLoading ? <LoadingSpinner /> : (
                        currentPatients.length > 0 ?
                        <>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                    <tr>
                                        <th className="p-3 font-semibold text-sm text-text-secondary">Nom du Patient</th>
                                        <th className="p-3 hidden md:table-cell font-semibold text-sm text-text-secondary">IPP</th>
                                        <th className="p-3 hidden lg:table-cell font-semibold text-sm text-text-secondary">Dernière Visite</th>
                                        <th className="p-3 text-center font-semibold text-sm text-text-secondary">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPatients.map(patient => (
                                        <tr key={patient.id} className={`last:border-b-0 hover:bg-indigo-50 cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-indigo-100' : ''}`} onClick={() => setSelectedPatient(patient)}>
                                            <td className="p-3 font-medium">{patient.name}</td>
                                            <td className="p-3 hidden md:table-cell text-text-secondary font-mono text-xs">{patient.ipp}</td>
                                            <td className="p-3 hidden lg:table-cell text-text-secondary">{new Date(patient.lastVisit).toLocaleDateString('fr-FR')}</td>
                                            <td className="p-3 text-center">{statusBadge(patient.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                                <span className="text-sm text-text-secondary">Page {currentPage} sur {totalPages}</span>
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                            </div>
                        )}
                        </>
                        : <EmptyState icon={UserX} title="Aucun patient trouvé" message="Modifiez vos filtres ou ajoutez un nouveau patient pour commencer."/>
                    )}
                </div>
            </div>
            <aside className="hidden lg:flex flex-col overflow-y-auto">
                <PatientDetailPanel patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
            </aside>
            {isAddPatientModalOpen && <AddPatientModal onClose={() => setAddPatientModalOpen(false)} />}
            {isImportModalOpen && <ImportPatientModal onClose={() => setImportModalOpen(false)} />}
        </main>
    );
};


const MobileNav: React.FC = () => {
    const navItems = [{ icon: LayoutDashboard, title: "Tableau de bord" },{ icon: Users, title: "Patients", active: true },{ icon: CalendarIcon, title: "Calendrier" },{ icon: MessageSquare, title: "Messages" },{ icon: Settings, title: "Paramètres" },];
    return (<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-10">{navItems.map((item, index) => (<a href="#" key={index} className={`sidebar-icon p-3 ${item.active ? 'active' : ''}`} title={item.title}><item.icon /></a>))}</nav>);
};

export default function MedicalDashboardApp() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    return (
        <>
            <GlobalStyles />
            <div className="w-full h-screen overflow-hidden flex">
                <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
                <div className="flex-1 flex flex-col gap-6 overflow-hidden p-6 bg-gray-50/50">
                    <Header/>
                    <PatientsPage />
                </div>
                <MobileNav />
            </div>
        </>
    );
}

