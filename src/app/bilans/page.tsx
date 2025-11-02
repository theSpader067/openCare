 
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
    Pill,
    ArrowLeft,
    Camera,
    Clipboard,
    Thermometer,
    Pencil,
    Trash2,
    AlertCircle,
    AlertTriangle,
    Link as LinkIcon,
    Clock,
    CheckCircle2
} from 'lucide-react';

// --- MOCK DATA ---
const mockPatients = [
  { id: 'P001', name: 'Liam Gallagher', dob: '1972-09-21', gender: 'Homme', lastVisit: '2023-08-15', status: 'Actif', contact: '0612345678', ipp: '87C4-1', atcdsMedicaux: ['HTA', 'Diabète Type 2'], atcdsChirurgicaux: ['Appendicectomie (1998)'], atcdsGynéco: [], diagnosis: ['Hypertension Essentielle'], medications: ['Metformine', 'Lisinopril'], allergies: ['Pénicilline'] },
  { id: 'P002', name: 'Olivia Chen', dob: '1985-05-12', gender: 'Femme', lastVisit: '2023-10-01', status: 'Actif', contact: 'olivia.c@email.com', ipp: '91A2-3', atcdsMedicaux: ['Asthme'], atcdsChirurgicaux: [], atcdsGynéco: ['G1P1'], diagnosis: ['Crise d\'asthme aïgue'], medications: ['Ventoline'], allergies: [] },
  { id: 'P003', name: 'Benjamin Carter', dob: '1990-11-30', gender: 'Homme', lastVisit: '2023-09-22', status: 'Actif', contact: '0623456789', ipp: '76B8-5', atcdsMedicaux: ['Allergies saisonnières'], atcdsChirurgicaux: [], atcdsGynéco: [], diagnosis: ['Rhinite allergique'], medications: ['Cetirizine'], allergies: ['Pollen', 'Acariens'] },
];

const mockEpisodesData = {
    'P001': [
        { id: 'E01A', date: '2023-08-15', type: 'Clinique', title: 'Consultation de suivi HTA & Diabète', content: 'Patient observant, déclare une bonne adhésion au traitement. TA contrôlée à 135/85 mmHg au cabinet. Auscultation cardio-pulmonaire sans particularités. Examen des pieds ne révèle aucune plaie ni signe de neuropathie. Le patient rapporte une asthénie modérée en fin de journée, à explorer.' },
        { id: 'E01B', date: '2023-04-02', type: 'Clinique', title: 'Consultation pour renouvellement', content: 'Renouvellement du traitement habituel. Le patient se sent bien, pas de nouveaux symptômes. Poids stable. Rappel des règles hygiéno-diététiques et de l\'importance de l\'activité physique régulière.'},
        { id: 'E01C', date: '1998-06-20', type: 'Compte Rendu', title: 'Compte rendu opératoire - Appendicectomie', content: 'Intervention réalisée sous anesthésie générale. Suites opératoires simples. Sortie à J+1.' },
        { id: 'E02A', date: '2023-07-10', type: 'Biologie', title: 'Bilan sanguin annuel', content: 'HbA1c: 6.8% (Objectif < 7%)\nCréatinine: 95 µmol/L (DFG stable)\nBilan lipidique: LDL-c à 1.1 g/L.' },
        { id: 'E02B', date: '2023-01-15', type: 'Biologie', title: 'Bilan pré-thérapeutique', content: 'NFS: Normale\nIonogramme: RAS\nFonction rénale: Normale'},
        { id: 'E03A', date: '2022-05-20', type: 'Imagerie', title: 'ECG de contrôle', content: 'Rythme sinusal régulier à 75 bpm. Pas de signes d\'hypertrophie ventriculaire gauche. Pas de troubles de la repolarisation.' },
        { id: 'E03B', date: '2021-11-10', type: 'Imagerie', title: 'Fond d\'œil', content: 'Absence de rétinopathie diabétique. Poursuivre surveillance annuelle.'},
    ],
    'P002': [
        { id: 'E04A', date: '2023-10-01', type: 'Clinique', title: 'Consultation pour dyspnée aiguë', content: 'Arrivée pour dyspnée sifflante. Saturation à 94% AA. Exacerbation asthmatique modérée. Auscultation: sibilants diffus bilatéraux. Réponse favorable aux bronchodilatateurs. Prescription de corticostéroïdes oraux pour 5 jours et renforcement de l\'éducation thérapeutique.' },
        { id: 'E04B', date: '2023-06-20', type: 'Clinique', title: 'Visite de contrôle Asthme', content: 'Patient asymptomatique depuis la dernière visite. Utilisation occasionnelle de Ventoline (< 2 fois/semaine). DEP stable. Technique d\'inhalation vérifiée et correcte.'},
        { id: 'E05A', date: '2023-09-15', type: 'Imagerie', title: 'Radio Thorax F+P', content: 'R.A.S. Pas de foyer parenchymateux. Pas de signes de distension thoracique.' },
        { id: 'E05B', date: '2022-03-12', type: 'Imagerie', title: 'EFR (Épreuves Fonctionnelles Respiratoires)', content: 'Trouble ventilatoire obstructif réversible après bronchodilatateurs, compatible avec un asthme.'},
        { id: 'E06A', date: '2023-09-01', type: 'Biologie', title: 'Gaz du sang', content: 'pH: 7.42\nPaO2: 88 mmHg\nPaCO2: 38 mmHg\nBicarbonates: 24 mmol/L'},
        { id: 'E06B', date: '2022-03-12', type: 'Biologie', title: 'Test d\'allergie', content: 'Phadiatop positif.\nAllergie aux acariens et pollens de graminées confirmée.'},
    ]
};

const mockAnalysesData = [
    { id: 'ANL-001', patientId: 'P001', patientName: 'Liam Gallagher', type: 'Bilan Sanguin', date: '2023-10-15', medecinDemandeur: 'Dr. Sharma', status: 'Terminé' },
    { id: 'ANL-002', patientId: 'P002', patientName: 'Olivia Chen', type: 'ECBU', date: '2023-10-20', medecinDemandeur: 'Dr. Sharma', status: 'En attente' },
    { id: 'ANL-003', patientId: 'P003', patientName: 'Benjamin Carter', type: 'Radiographie du Genou', date: '2023-10-18', medecinDemandeur: 'Dr. Dubois', status: 'Terminé' },
    { id: 'ANL-004', patientId: 'P001', patientName: 'Liam Gallagher', type: 'Bilan Lipidique', date: '2023-10-22', medecinDemandeur: 'Dr. Sharma', status: 'Urgent' },
    { id: 'ANL-005', patientId: 'P002', patientName: 'Olivia Chen', type: 'NFS Plaquettes', date: '2023-10-21', medecinDemandeur: 'Dr. Sharma', status: 'En attente' },
    { id: 'ANL-006', patientId: 'P003', patientName: 'Benjamin Carter', type: 'Ionogramme', date: '2023-10-23', medecinDemandeur: 'Dr. Sharma', status: 'En attente' },
];

// --- END MOCK DATA ---


const GlobalStyles = () => (
    <style>{`
        :root {
            --bg-primary: #f4f7fc;
            --bg-secondary: #ffffff;
            --accent-primary: #4f46e5;
            --accent-secondary: #10b981;
            --accent-warning: #f59e0b;
            --accent-danger: #ef4444;
            --text-primary: #111827;
            --text-secondary: #6b7280;
            --border-color: #e5e7eb;
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

const Sidebar: React.FC<{ isExpanded: boolean; setIsExpanded: (isExpanded: boolean) => void; currentPage: string; onNavigate: (page: string) => void }> = ({ isExpanded, setIsExpanded, currentPage, onNavigate }) => {
    const navItems = [ { id: 'patients', icon: Users, title: "Patients" }, { id: 'analyses', icon: Beaker, title: "Analyses" }, { id: 'calendar', icon: CalendarIcon, title: "Calendrier" }, { id: 'messages', icon: MessageSquare, title: "Messages" }, { id: 'stats', icon: PieChart, title: "Statistiques" }];
    const isPatientRelatedPage = currentPage === 'patients' || currentPage === 'patientFile';
    return (
        <aside className={`hidden md:flex flex-col bg-white p-4 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20 items-center'}`}>
            <div className={`flex items-center w-full mb-8 ${isExpanded ? 'justify-between' : 'justify-center'}`}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12L22 7" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12V22" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12L2 7" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9.5L17 4.5" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><button onClick={() => setIsExpanded(!isExpanded)} className="sidebar-icon p-2" title={isExpanded ? "Réduire" : "Agrandir"}>{isExpanded ? <ChevronsLeft /> : <ChevronsRight />}</button></div>
            <nav className="flex flex-col gap-4 w-full">{navItems.map((item) => (<a href="#" key={item.id} onClick={(e) => { e.preventDefault(); onNavigate(item.id); }} className={`sidebar-icon p-2 flex items-center gap-3 ${((item.id === 'patients' && isPatientRelatedPage) || currentPage === item.id) ? 'active' : ''} ${!isExpanded ? 'justify-center' : ''}`} title={item.title}><item.icon className="flex-shrink-0" />{isExpanded && <span className="truncate">{item.title}</span>}</a>))}</nav>
            <div className="mt-auto w-full pt-4 border-t border-gray-200/80"><a href="#" className={`sidebar-icon p-2 flex items-center gap-3 ${!isExpanded ? 'justify-center' : ''}`} title="Paramètres"><Settings className="flex-shrink-0"/>{isExpanded && <span className="truncate">Paramètres</span>}</a></div>
        </aside>
    );
};

const Header: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => {
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
                <h1 className="text-2xl tracking-tight font-medium">{title}</h1>
                <p className="text-text-secondary text-sm">{subtitle}</p>
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
                            <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Déconnexion</a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

type Patient = typeof mockPatients[0];
type Episode = { id: string; date: string; type: string; title: string; content: string; reportUrl?: string; };
type Analyse = typeof mockAnalysesData[0];

const InfoBlock: React.FC<{ icon: React.ElementType; title: string; items: string[] | undefined; color: string }> = ({ icon: Icon, title, items, color }) => {
    const colors = { amber: { bg: 'bg-amber-100', text: 'text-amber-800', icon: 'text-amber-500' }, sky: { bg: 'bg-sky-100', text: 'text-sky-800', icon: 'text-sky-500' }, red: { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-500' }, emerald: {bg: 'bg-emerald-100', text: 'text-emerald-800', icon: 'text-emerald-500'}, fuchsia: {bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', icon: 'text-fuchsia-500'} };
    const currentTheme = colors[color as keyof typeof colors] || colors.sky;
    return(
        <div>
            <h3 className="flex items-center gap-2 font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2"><Icon className={`w-5 h-5 ${currentTheme.icon}`} />{title}</h3>
            <div className="flex flex-wrap gap-2">{items && items.length > 0 ? items.map(item => <span key={item} className={`text-xs font-medium px-2.5 py-1 rounded-full ${currentTheme.bg} ${currentTheme.text}`}>{item}</span>) : <p className="text-sm text-gray-400">Aucun</p>}</div>
        </div>
    )
}

const PatientDetailPanel: React.FC<{ patient: Patient | null; onClose: () => void; onViewFile: (patient: Patient) => void }> = ({ patient, onClose, onViewFile }) => {
    const [isActionsMenuOpen, setActionsMenuOpen] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) { setActionsMenuOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    if (!patient) return (<div className="bg-white rounded-xl p-6 h-full flex flex-col items-center justify-center text-center shadow-sm"><BriefcaseMedical className="w-16 h-16 text-gray-300 mb-4"/><h3 className="font-semibold text-lg">Dossier Patient</h3><p className="text-sm text-text-secondary">Sélectionnez un patient pour voir ses détails.</p></div>);
    
    return (
        <div className="bg-white rounded-xl p-6 flex flex-col h-full shadow-sm">
            <div className="flex justify-between items-start mb-6"><div className="flex items-center gap-4"><img src={`https://placehold.co/64x64/e0e7ff/4f46e5?text=${patient.name.charAt(0)}`} className="rounded-full" alt="avatar"/><div><h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2><p className="text-sm text-text-secondary">IPP: {patient.ipp}</p></div></div><button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-200"><X size={20}/></button></div>
            <div className="grid grid-cols-3 gap-4 text-center bg-indigo-50 p-3 rounded-lg mb-6"><div><p className="text-xs text-indigo-700 font-semibold">Âge</p><p className="font-bold text-indigo-900">{new Date().getFullYear() - new Date(patient.dob).getFullYear()}</p></div><div><p className="text-xs text-indigo-700 font-semibold">Sexe</p><p className="font-bold text-indigo-900">{patient.gender}</p></div><div><p className="text-xs text-indigo-700 font-semibold">Statut</p><p className="font-bold text-indigo-900">{patient.status}</p></div></div>
            <div className="space-y-6 flex-grow overflow-y-auto pr-2"><InfoBlock icon={HeartPulse} title="ATCDs médicaux" items={patient.atcdsMedicaux} color="red" /><InfoBlock icon={Activity} title="ATCDs chirurgicaux" items={patient.atcdsChirurgicaux} color="emerald" />{patient.gender === 'Femme' && <InfoBlock icon={Baby} title="ATCDs gynéco-obstétriques" items={patient.atcdsGynéco} color="fuchsia" />}<InfoBlock icon={Stethoscope} title="Diagnostics" items={patient.diagnosis} color="amber" /><InfoBlock icon={Pill} title="Traitement" items={patient.medications} color="sky" /></div>
            <div className="pt-6"><h3 className="font-semibold mb-4">Actions Rapides</h3><div className="flex items-center gap-2"><button onClick={() => onViewFile(patient)} className="flex-1 bg-indigo-600 text-white font-medium p-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Consulter le Dossier</button><div className="relative" ref={actionsMenuRef}><button onClick={() => setActionsMenuOpen(prev => !prev)} className="p-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"><Plus size={20}/></button>{isActionsMenuOpen && (<div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5"><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FileText size={16} className="text-gray-500"/>Nouvelle Ordonnance</a><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FlaskConical size={16} className="text-gray-500"/>Nouvelle Analyse</a><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><CalendarPlus size={16} className="text-gray-500"/>Nouveau RDV</a></div>)}</div></div></div>
        </div>
    );
};

const AddPatientModal: React.FC<{ onClose: () => void }> = ({ onClose }) => ( <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">Ajouter un nouveau patient</h3><button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={24}/></button></div><form className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label><input type="text" placeholder="ex: Jean Dupont" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">IPP</label><input type="text" placeholder="ex: 12A3-4" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label><input type="date" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label><select className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"><option>Homme</option><option>Femme</option></select></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Contact (Tél. ou Email)</label><input type="text" placeholder="ex: 0612345678" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors">Annuler</button><button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Créer Patient</button></div></form></div></div> );
const ImportPatientModal: React.FC<{ onClose: () => void }> = ({ onClose }) => ( <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">Importer une liste de patients</h3><button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={24}/></button></div><div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"><div className="text-center"><UploadCloud className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" /><div className="mt-4 flex text-sm leading-6 text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"><span>Téléchargez un fichier</span><input id="file-upload" name="file-upload" type="file" className="sr-only" /></label><p className="pl-1">ou glissez-déposez</p></div><p className="text-xs leading-5 text-gray-600">XLS, XLSX, CSV jusqu'à 10MB</p></div></div><div className="flex justify-end gap-3 pt-6"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors">Annuler</button><button type="button" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Importer</button></div></div></div> );

const PatientsPage: React.FC<{ onViewPatientFile: (patient: Patient) => void }> = ({ onViewPatientFile }) => {
    const [patients] = useState(mockPatients);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isAddPatientModalOpen, setAddPatientModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const itemsPerPage = 8;

    const filteredPatients = useMemo(() => patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).filter(p => statusFilter === 'Tous' ? true : p.status === statusFilter), [patients, searchTerm, statusFilter]);
    useEffect(() => { setIsLoading(true); const timer = setTimeout(() => setIsLoading(false), 500); return () => clearTimeout(timer); }, [searchTerm, statusFilter]);
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const statusBadge = (status: string) => (<span className={`py-1 px-3 rounded-full text-xs font-medium ${status === 'Actif' ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}`}>{status}</span>);
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2">
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto flex-grow"><div className="relative flex-grow"><input type="text" placeholder="Rechercher par nom..." className="bg-gray-100 border-transparent rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setSearchTerm(e.target.value)} /><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" /></div><div className="relative"><select className="appearance-none bg-gray-100 border-transparent rounded-lg py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-text-secondary" onChange={(e) => setStatusFilter(e.target.value)}><option value="Tous">Statut</option><option value="Actif">Actif</option><option value="Inactif">Inactif</option></select><ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" /></div></div>
                    <div className="flex items-center gap-2 w-full md:w-auto"><button onClick={() => setImportModalOpen(true)} className="flex-1 md:flex-initial w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"><Upload size={18}/> Importer</button><button onClick={() => setAddPatientModalOpen(true)} className="flex-1 md:flex-initial w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"><UserPlus size={18}/> Ajouter</button></div>
                </div>
                <div className="flex-1 bg-white rounded-xl p-4 md:p-6 flex flex-col shadow-sm">{isLoading ? <LoadingSpinner /> : (currentPatients.length > 0 ? <> <div className="flex-1 overflow-y-auto"><table className="w-full text-left"><thead className="sticky top-0 bg-gray-50 z-10"><tr><th className="p-3 font-semibold text-sm text-text-secondary">Nom du Patient</th><th className="p-3 hidden md:table-cell font-semibold text-sm text-text-secondary">IPP</th><th className="p-3 hidden lg:table-cell font-semibold text-sm text-text-secondary">Dernière Visite</th><th className="p-3 text-center font-semibold text-sm text-text-secondary">Statut</th></tr></thead><tbody>{currentPatients.map(patient => (<tr key={patient.id} className={`last:border-b-0 hover:bg-indigo-50 cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-indigo-100' : ''}`} onClick={() => setSelectedPatient(patient)}><td className="p-3 font-medium">{patient.name}</td><td className="p-3 hidden md:table-cell text-text-secondary font-mono text-xs">{patient.ipp}</td><td className="p-3 hidden lg:table-cell text-text-secondary">{new Date(patient.lastVisit).toLocaleDateString('fr-FR')}</td><td className="p-3 text-center">{statusBadge(patient.status)}</td></tr>))}</tbody></table></div> {totalPages > 1 && (<div className="flex justify-between items-center pt-4"><button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button><span className="text-sm text-text-secondary">Page {currentPage} sur {totalPages}</span><button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button></div>)} </> : <EmptyState icon={UserX} title="Aucun patient trouvé" message="Modifiez vos filtres ou ajoutez un nouveau patient."/>)}</div>
            </div>
            <aside className="hidden lg:flex flex-col overflow-y-auto"><PatientDetailPanel patient={selectedPatient} onClose={() => setSelectedPatient(null)} onViewFile={onViewPatientFile} /></aside>
            {isAddPatientModalOpen && <AddPatientModal onClose={() => setAddPatientModalOpen(false)} />}
            {isImportModalOpen && <ImportPatientModal onClose={() => setImportModalOpen(false)} />}
        </main>
    );
};

const MiniWysiwygEditor: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);


    const execCmd = (command: string) => {
        document.execCommand(command, false, undefined);
        if(editorRef.current) editorRef.current.focus();
    };

    return (
        <div className="border border-gray-300 rounded-lg">
            <div className="flex items-center gap-1 border-gray-300 rounded-t-lg p-1 bg-gray-50">
                <button type="button" onClick={() => execCmd('bold')} className="p-2 rounded hover:bg-gray-200 font-bold w-9 h-9 flex items-center justify-center">B</button>
                <button type="button" onClick={() => execCmd('italic')} className="p-2 rounded hover:bg-gray-200 italic w-9 h-9 flex items-center justify-center">I</button>
                <button type="button" onClick={() => execCmd('underline')} className="p-2 rounded hover:bg-gray-200 underline w-9 h-9 flex items-center justify-center">U</button>
                <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-2 rounded hover:bg-gray-200 w-9 h-9 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg></button>
            </div>
            <div
                ref={editorRef}
                contentEditable="true"
                onInput={handleInput}
                className="w-full min-h-[150px] rounded-b-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none overflow-y-auto"
            />
        </div>
    );
};


const AddEditEpisodeModal: React.FC<{ episode: Episode | null; activeTab: string; onClose: () => void; onSave: (data: { title: string; content: string }) => void }> = ({ episode, activeTab, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const isEditMode = episode !== null;

    useEffect(() => {
        if (isEditMode && episode) {
            setTitle(episode.title);
            setContent(episode.content);
        } else {
            setTitle('');
            setContent('');
        }
    }, [episode, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, content });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">{isEditMode ? 'Modifier' : 'Ajouter'} un épisode {activeTab}</h3><button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={24}/></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Consultation de suivi" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observation / Contenu</label>
                        <MiniWysiwygEditor value={content} onChange={setContent} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors">Annuler</button><button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Enregistrer</button></div>
                </form>
            </div>
        </div>
    );
};

const ConfirmDeleteModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-start gap-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" /></div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"><h3 className="text-lg leading-6 font-medium text-gray-900">Supprimer l'élément</h3><div className="mt-2"><p className="text-sm text-gray-500">Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p></div></div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3"><button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm" onClick={onConfirm}>Supprimer</button><button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm" onClick={onCancel}>Annuler</button></div>
        </div>
    </div>
);


const PatientFilePage: React.FC<{ patient: Patient; onBack: () => void }> = ({ patient, onBack }) => {
    const [activeTab, setActiveTab] = useState('Clinique');
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null, data: Episode | null }>({ type: null, data: null });

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            const sortedEpisodes = (mockEpisodesData[patient.id as keyof typeof mockEpisodesData] || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setEpisodes(sortedEpisodes as Episode[]);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [patient.id]);

     useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 400);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const tabs = [{ name: 'Clinique', icon: Clipboard }, { name: 'Biologie', icon: Beaker }, { name: 'Imagerie', icon: Camera }, { name: 'Compte Rendu', icon: FileText }];
    const filteredEpisodes = episodes.filter(e => e.type === activeTab);

    const handleSaveEpisode = (data: { title: string; content: string }) => {
        if (modalState.type === 'edit' && modalState.data) {
            setEpisodes(episodes.map(e => e.id === modalState.data!.id ? { ...e, ...data } : e));
        } else {
            const newEpisode: Episode = {
                id: `E${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: activeTab,
                ...data
            };
            setEpisodes([newEpisode, ...episodes]);
        }
        setModalState({ type: null, data: null });
    };

    const handleConfirmDelete = () => {
        if (modalState.data) {
            setEpisodes(episodes.filter(e => e.id !== modalState.data!.id));
        }
        setModalState({ type: null, data: null });
    };


    const episodeIcon = (type: string) => {
        switch(type) {
            case 'Clinique': return <Thermometer className="text-blue-500" />;
            case 'Biologie': return <FlaskConical className="text-green-500" />;
            case 'Imagerie': return <Camera className="text-purple-500" />;
            case 'Compte Rendu': return <FileText className="text-gray-500" />;
            default: return <Clipboard className="text-gray-500" />;
        }
    }

    return (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
            <aside className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center relative">
                    <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 hover:text-indigo-600"><ArrowLeft /></button>
                    <img src={`https://placehold.co/96x96/e0e7ff/4f46e5?text=${patient.name.charAt(0)}`} className="rounded-full mx-auto mb-4" alt="avatar" />
                    <h2 className="text-xl font-bold">{patient.name}</h2>
                    <p className="text-sm text-text-secondary">IPP: {patient.ipp}</p>
                    <div className="text-sm text-text-secondary mt-2">{new Date().getFullYear() - new Date(patient.dob).getFullYear()} ans • {patient.gender}</div>
                </div>
                <nav className="bg-white p-4 rounded-xl shadow-sm flex-grow">
                    <ul className="space-y-2">
                        {tabs.map(tab => (
                            <li key={tab.name}><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(tab.name);}} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === tab.name ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}><tab.icon size={20} /> {tab.name}</a></li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2">
                {activeTab === 'Clinique' && (
                     <div className="bg-white rounded-xl p-6 shadow-sm">
                         <h2 className="text-xl font-bold mb-4">Synthèse Clinique</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <InfoBlock icon={HeartPulse} title="ATCDs médicaux" items={patient.atcdsMedicaux} color="red" />
                             <InfoBlock icon={Activity} title="ATCDs chirurgicaux" items={patient.atcdsChirurgicaux} color="emerald" />
                             {patient.gender === 'Femme' && <InfoBlock icon={Baby} title="ATCDs gynéco-obstétriques" items={patient.atcdsGynéco} color="fuchsia" />}
                             <InfoBlock icon={AlertCircle} title="Allergies" items={patient.allergies} color="amber" />
                         </div>
                     </div>
                )}
                <div className="bg-white rounded-xl p-6 shadow-sm flex-grow flex flex-col">
                    <h2 className="text-xl font-bold mb-4">Historique - {activeTab}</h2>
                    <div className="flex-grow space-y-6">
                        {isLoading ? <LoadingSpinner /> : (
                            filteredEpisodes.length > 0 ? filteredEpisodes.map(episode => (
                            <div key={episode.id} className="flex gap-4 group relative">
                                <div className="flex flex-col items-center"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">{episodeIcon(episode.type)}</div><div className="flex-grow w-px bg-gray-200"></div></div>
                                <div>
                                    <p className="font-semibold text-text-secondary text-sm">{new Date(episode.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    <h3 className="font-bold text-lg">{episode.title}</h3>
                                    <div className="text-text-secondary" dangerouslySetInnerHTML={{ __html: episode.content.replace(/\n/g, '<br />') }} />
                                </div>
                                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setModalState({ type: 'edit', data: episode })} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full"><Pencil size={16} /></button><button onClick={() => setModalState({ type: 'delete', data: episode })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full"><Trash2 size={16} /></button></div>
                            </div>
                        )) : <EmptyState icon={BriefcaseMedical} title={`Aucun épisode ${activeTab.toLowerCase()}`} message="Il n'y a pas encore d'enregistrement pour cette catégorie." />
                        )}
                    </div>
                    <div className="mt-6 text-center"><button onClick={() => setModalState({ type: 'add', data: null })} className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 mx-auto"><Plus size={18} />Ajouter un épisode</button></div>
                </div>
            </div>
            {(modalState.type === 'add' || modalState.type === 'edit') && <AddEditEpisodeModal episode={modalState.data} activeTab={activeTab} onClose={() => setModalState({ type: null, data: null })} onSave={handleSaveEpisode} />}
            {modalState.type === 'delete' && <ConfirmDeleteModal onCancel={() => setModalState({ type: null, data: null })} onConfirm={handleConfirmDelete} />}
        </main>
    );
};

const AddEditAnalyseModal: React.FC<{ analyse: Analyse | null; onClose: () => void; onSave: (data: Partial<Analyse>) => void }> = ({ analyse, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        type: '',
        medecinDemandeur: '',
        status: 'En attente'
    });

    useEffect(() => {
        if (analyse) {
            setFormData({
                patientName: analyse.patientName,
                type: analyse.type,
                medecinDemandeur: analyse.medecinDemandeur,
                status: analyse.status
            });
        }
    }, [analyse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">{analyse ? 'Modifier' : 'Nouvelle'} demande d'analyse</h3><button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={24}/></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom du Patient</label><input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom du Bilan</label><input type="text" name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Médecin Demandeur</label><input type="text" name="medecinDemandeur" value={formData.medecinDemandeur} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Statut</label><select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"><option>En attente</option><option>Terminé</option><option>Urgent</option></select></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors">Annuler</button><button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Enregistrer</button></div>
                </form>
            </div>
        </div>
    );
};

const AnalysesPage: React.FC = () => {
    const [analyses, setAnalyses] = useState<Analyse[]>(mockAnalysesData);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null, data: Analyse | null }>({ type: null, data: null });


    const filteredAnalyses = useMemo(() => {
        return analyses
            .filter(analyse => analyse.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || analyse.type.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(analyse => statusFilter === 'Tous' ? true : analyse.status === statusFilter);
    }, [analyses, searchTerm, statusFilter]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAnalyses = filteredAnalyses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


    const handleSaveAnalyse = (data: Partial<Analyse>) => {
        if (modalState.type === 'edit' && modalState.data) {
            setAnalyses(analyses.map(a => a.id === modalState.data!.id ? { ...a, ...data } as Analyse : a));
        } else {
            const newAnalyse: Analyse = {
                id: `ANL-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                patientId: `P-${Date.now()}`,
                ...data
            } as Analyse;
            setAnalyses([newAnalyse, ...analyses]);
        }
        setModalState({ type: null, data: null });
    };

    const handleConfirmDelete = () => {
        if (modalState.data) {
            setAnalyses(analyses.filter(a => a.id !== modalState.data!.id));
        }
        setModalState({ type: null, data: null });
    };

    const statusBadge = (status: string) => {
        const config = {
            'Terminé': "bg-emerald-100 text-emerald-800",
            'En attente': "bg-amber-100 text-amber-800",
            'Urgent': "bg-red-100 text-red-800"
        };
        return <span className={`py-1 px-3 rounded-full text-xs font-medium ${config[status as keyof typeof config] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
    };

    return (
        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto flex-grow">
                    <div className="relative flex-grow"><input type="text" placeholder="Rechercher par patient ou type..." className="bg-gray-100 border-transparent rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setSearchTerm(e.target.value)} /><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" /></div>
                    <div className="relative"><select className="appearance-none bg-gray-100 border-transparent rounded-lg py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-text-secondary" onChange={(e) => setStatusFilter(e.target.value)}><option value="Tous">Tous les statuts</option><option value="En attente">En attente</option><option value="Terminé">Terminé</option><option value="Urgent">Urgent</option></select><ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" /></div>
                </div>
                <button onClick={() => setModalState({ type: 'add', data: null })} className="flex-shrink-0 w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"><Plus size={18}/> Nouvelle Demande</button>
            </div>

            <div className="flex-1 bg-white rounded-xl p-4 md:p-6 flex flex-col shadow-sm">
                {isLoading ? <LoadingSpinner /> : (
                    currentAnalyses.length > 0 ? <>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                    <tr>
                                        <th className="p-3 font-semibold text-sm text-text-secondary">ID Demande</th>
                                        <th className="p-3 font-semibold text-sm text-text-secondary">Patient</th>
                                        <th className="p-3 hidden lg:table-cell font-semibold text-sm text-text-secondary">Nom du Bilan</th>
                                        <th className="p-3 hidden md:table-cell font-semibold text-sm text-text-secondary">Demandeur</th>
                                        <th className="p-3 text-center font-semibold text-sm text-text-secondary">Statut</th>
                                        <th className="p-3 text-center font-semibold text-sm text-text-secondary">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAnalyses.map(analyse => (
                                        <tr key={analyse.id} className="last:border-b-0 hover:bg-gray-50">
                                            <td className="p-3 font-mono text-xs text-text-secondary">{analyse.id}</td>
                                            <td className="p-3 font-medium">{analyse.patientName} <span className="text-text-secondary font-normal text-xs">({analyse.patientId})</span></td>
                                            <td className="p-3 hidden lg:table-cell text-text-secondary">{analyse.type}</td>
                                            <td className="p-3 hidden md:table-cell text-text-secondary">{analyse.medecinDemandeur}</td>
                                            <td className="p-3 text-center">{statusBadge(analyse.status)}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => setModalState({ type: 'edit', data: analyse })} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full"><Pencil size={16} /></button>
                                                    <button onClick={() => setModalState({ type: 'delete', data: analyse })} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
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
                    </> : <EmptyState icon={Beaker} title="Aucune analyse trouvée" message="Modifiez vos filtres ou créez une nouvelle demande d'analyse." />
                )}
            </div>
            {(modalState.type === 'add' || modalState.type === 'edit') && <AddEditAnalyseModal analyse={modalState.data} onClose={() => setModalState({ type: null, data: null })} onSave={handleSaveAnalyse} />}
            {modalState.type === 'delete' && <ConfirmDeleteModal onCancel={() => setModalState({ type: null, data: null })} onConfirm={handleConfirmDelete} />}
        </main>
    );
};


const MobileNav: React.FC<{ currentPage: string, onNavigate: (page: string) => void }> = ({ currentPage, onNavigate }) => {
    const navItems = [ { id: 'patients', icon: Users, title: "Patients" }, { id: 'analyses', icon: Beaker, title: "Analyses" }, { id: 'calendar', icon: CalendarIcon, title: "Calendrier" }, { id: 'messages', icon: MessageSquare, title: "Messages" }, { id: 'settings', icon: Settings, title: "Paramètres" }, ];
     const isPatientRelatedPage = currentPage === 'patients' || currentPage === 'patientFile';
    return (<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-10">{navItems.map((item) => (<a href="#" key={item.id} onClick={(e) => { e.preventDefault(); onNavigate(item.id)}} className={`sidebar-icon p-3 ${(item.id === 'patients' && isPatientRelatedPage) || currentPage === item.id ? 'active' : ''}`} title={item.title}><item.icon /></a>))}</nav>);
};

export default function MedicalDashboardApp() {
    const [isSidebarExpanded, setIsExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState('analyses');
    const [activePatient, setActivePatient] = useState<Patient | null>(null);

    const navigate = (page: string) => {
        if(page === 'patients'){
            setActivePatient(null);
        }
        setCurrentPage(page);
    };

    const viewPatientFile = (patient: Patient) => {
        setActivePatient(patient);
        setCurrentPage('patientFile');
    };

    const backToPatientList = () => {
        setActivePatient(null);
        setCurrentPage('patients');
    };
    
    const renderPage = () => {
        switch(currentPage) {
            case 'patients':
                return <PatientsPage onViewPatientFile={viewPatientFile} />;
            case 'patientFile':
                if (activePatient) {
                    return <PatientFilePage patient={activePatient} onBack={backToPatientList} />;
                }
                backToPatientList();
                return null;
            case 'analyses':
                return <AnalysesPage />;
            default:
                return <AnalysesPage />;
        }
    };
    
    const pageTitles = {
        'patients': { title: 'Gestion des Patients', subtitle: 'Rechercher, filtrer et gérer les dossiers patients.'},
        'patientFile': { title: 'Dossier Patient', subtitle: `Consultation du dossier de ${activePatient?.name || ''}` },
        'analyses': { title: 'Gestion des Analyses', subtitle: 'Suivre et consulter les demandes d\'analyses.'}
    };
    const currentTitle = pageTitles[currentPage as keyof typeof pageTitles] || { title: 'Tableau de Bord', subtitle: 'Bienvenue' };

    return (
        <>
            <GlobalStyles />
            <div className="w-full h-screen overflow-hidden flex">
                <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsExpanded} currentPage={currentPage} onNavigate={navigate} />
                <div className="flex-1 flex flex-col gap-6 overflow-hidden p-6 bg-gray-50/50">
                    <Header title={currentTitle.title} subtitle={currentTitle.subtitle} />
                    {renderPage()}
                </div>
                <MobileNav currentPage={currentPage} onNavigate={navigate} />
            </div>
        </>
    );
}

