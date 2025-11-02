'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import {
    LayoutDashboard,
    Users,
    Beaker,
    Calendar as CalendarIcon,
    MessageSquare,
    PieChart,
    Settings,
    Search,
    CalendarCheck,
    FlaskConical,
    UserPlus,
    AlertTriangle,
    Pilcrow,
    ChevronsLeft,
    ChevronsRight,
    Plus,
    Trash2,
    X,
    Loader2,
    ClipboardList,
    FileText,
    HeartPulse,
    Mic,
    ShieldAlert,
    Bell
} from 'lucide-react';
import { AppHeader } from '../components/topbar';
import { AppMobileNav, AppSidebar } from '../components/sidebar';

// --- MOCK DATA ---
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);

const mockAppointments = {
    [formatDate(today)]: [
        { time: "09:30", patient: "Liam Gallagher", reason: "Bilan annuel", status: "Confirmé", statusColor: "green" },
        { time: "10:00", patient: "Olivia Chen", reason: "Suivi: Pression artérielle", status: "Arrivé", statusColor: "yellow" },
        { time: "10:30", patient: "Benjamin Carter", reason: "Consultation: Douleur genou", status: "Confirmé", statusColor: "green" },
        { time: "11:00", patient: "Sophia Rodriguez", reason: "Symptômes grippaux", status: "Annulé", statusColor: "red" },
        { time: "11:30", patient: "Noah Kim", reason: "Résultats test allergie", status: "Confirmé", statusColor: "green" },
        { time: "12:00", patient: "Ava Jones", reason: "Consultation pédiatrique", status: "Confirmé", statusColor: "green" },
        { time: "14:00", patient: "James Smith", reason: "Suivi diabète", status: "Confirmé", statusColor: "green" },
        { time: "14:30", patient: "Isabella Garcia", reason: "Examen de routine", status: "Confirmé", statusColor: "green" },
    ],
    [formatDate(tomorrow)]: [
         { time: "09:00", patient: "Emma Watson", reason: "Visite de contrôle", status: "Confirmé", statusColor: "green" },
         { time: "09:30", patient: "Daniel Radcliffe", reason: "Vaccination", status: "Confirmé", statusColor: "green" },
    ],
    [formatDate(dayAfter)]: [
        { time: "14:00", patient: "Robert Downey Jr.", reason: "Bilan post-opératoire", status: "Confirmé", statusColor: "green" },
    ]
};

const mockTasks = {
    [formatDate(today)]: [
        { id: 1, text: "Préparer le rapport pour Mme. Chen", completed: false },
        { id: 2, text: "Vérifier les résultats de M. Gallagher", completed: true },
        { id: 3, text: "Commander de nouvelles fournitures", completed: false },
        { id: 6, text: "Rappeler le patient Noah Kim pour son suivi", completed: false },
        { id: 7, text: "Mettre à jour le dossier de James Smith", completed: false },
    ],
    [formatDate(tomorrow)]: [
        { id: 4, text: "Confirmer rdv avec Emma Watson", completed: false },
        { id: 5, text: "Préparer le vaccin pour D. Radcliffe", completed: false },
    ]
};

const mockAlerts = [
  { id: 1, type: 'Analyse Critique', icon: AlertTriangle, color: 'red', patient: 'Olivia Chen', details: 'Résultat d\'analyse reçu: Potassium à 5.9 mEq/L (valeur critique). Recommande une action immédiate et un suivi cardiologique.', summary: 'Patiente: O. Chen - Potassium élevé (5.9).', linkText: 'Voir le dossier complet' },
  { id: 2, type: 'Nouveau Message', icon: MessageSquare, color: 'blue', patient: 'Dr. Evans (Cardio)', details: 'Le Dr. Evans a envoyé l\'ECG du patient Benjamin Carter pour une seconde lecture. Le fichier est attaché au dossier du patient. Veuillez donner votre avis avant la fin de journée.', summary: 'Dr. Evans (Cardio) - ECG de B. Carter.', linkText: 'Lire le message' },
  { id: 3, type: 'Demande de Renouvellement', icon: Pilcrow, color: 'purple', patient: 'Liam Gallagher', details: 'Le patient Liam Gallagher a demandé un renouvellement pour sa prescription de Metformine. La dernière consultation date de 6 mois. L\'ordonnance expire dans 3 jours.', summary: 'Patient: L. Gallagher - Metformine.', linkText: 'Vérifier la demande' },
  { id: 4, type: 'Rendez-vous à confirmer', icon: CalendarCheck, color: 'yellow', patient: 'Sophia Rodriguez', details: 'La patiente Sophia Rodriguez a demandé un rendez-vous pour demain à 15:00. Veuillez confirmer sa disponibilité dans le calendrier.', summary: 'Patient: S. Rodriguez - Demande de RDV.', linkText: 'Confirmer' }
];

// --- END MOCK DATA ---


const GlobalStyles = () => (
    <style>{`
        :root {
            --bg-primary: #f8f9fa;
            --bg-secondary: #ffffff;
            --accent-primary: #0d6efd;
            --accent-secondary: #198754;
            --accent-warning: #ffc107;
            --accent-danger: #dc3545;
            --text-primary: #212529;
            --text-secondary: #6c757d;
            --border-color: rgba(0, 0, 0, 0.1);
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
        .alert-item {
            display: flex;
            align-items: flex-start;
            padding: 1rem;
            border-radius: 0.75rem;
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
        }
        .alert-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .alert-icon-container {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            margin-right: 1rem;
        }
    `}</style>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-text-secondary"><Loader2 className="animate-spin h-8 w-8 mb-2" /><p>Chargement...</p></div>
);

const EmptyState: React.FC<{icon: React.ElementType, title: string, message: string}> = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary p-4">
        <Icon className="w-16 h-16 text-gray-300 animate-pulse mb-4"/>
        <h3 className="font-semibold text-lg text-text-primary mb-1">{title}</h3>
        <p className="text-sm">{message}</p>
    </div>
);




const CalendarComponent: React.FC<{ selectedDate: Date; onDateChange: (date: Date) => void }> = ({ selectedDate, onDateChange }) => {
    const [displayDate, setDisplayDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    const daysOfWeek = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const startOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const endOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();
    const today = new Date();
    const renderDays = () => {
        const days = [];
        for (let i = 0; i < startDay; i++) { days.push(<div key={`empty-${i}`} className="text-center p-2"></div>); }
        for (let i = 1; i <= totalDays; i++) {
            const dayDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), i);
            const isSelected = formatDate(dayDate) === formatDate(selectedDate);
            const isToday = formatDate(dayDate) === formatDate(today);
            let dayClass = 'cursor-pointer transition-colors';
            if (isSelected) { dayClass += ' bg-blue-600 text-white font-semibold'; } 
            else if (isToday) { dayClass += ' bg-blue-100 text-blue-700'; } 
            else { dayClass += ' hover:bg-gray-100'; }
            days.push(<div key={i} className={`text-center p-2 rounded-full ${dayClass}`} onClick={() => onDateChange(dayDate)}>{i}</div>);
        }
        return days;
    };
    const changeMonth = (offset: number) => { setDisplayDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 1)); };
    return (
        <div className="bg-white p-4 border border-gray-200/80 rounded-xl"><div className="flex justify-between items-center mb-4"><button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronsLeft size={20}/></button><h3 className="font-semibold">{monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}</h3><button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronsRight size={20}/></button></div><div className="grid grid-cols-7 gap-1 text-sm text-text-secondary">{daysOfWeek.map(day => <div key={day} className="font-bold text-center p-2">{day}</div>)}{renderDays()}</div></div>
    );
};

interface Task { id: number; text: string; completed: boolean; }
const AddTaskModal: React.FC<{ onAddTask: (text: string) => void; onClose: () => void; }> = ({ onAddTask, onClose }) => {
    const [taskText, setTaskText] = useState('');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (taskText.trim()) { onAddTask(taskText.trim()); setTaskText(''); } };
    return (<div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Ajouter une nouvelle tâche</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20}/></button></div><form onSubmit={handleSubmit}><input type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Ex: Appeler le patient Doe" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" autoFocus /><div className="flex justify-end gap-2 mt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Annuler</button><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Ajouter</button></div></form></div></div>);
};

const ConfirmDeleteModal: React.FC<{ taskText: string; onConfirm: () => void; onCancel: () => void }> = ({ taskText, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-start gap-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Supprimer la tâche</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">Êtes-vous sûr de vouloir supprimer la tâche : "{taskText}" ? Cette action est irréversible.</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm" onClick={onConfirm}>Supprimer</button>
                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm" onClick={onCancel}>Annuler</button>
            </div>
        </div>
    </div>
);


const TasksComponent: React.FC<{ selectedDate: Date }> = ({ selectedDate }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            const dateKey = formatDate(selectedDate);
            setTasks(mockTasks[dateKey] || []);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedDate]);

    const toggleTask = (id: number) => { setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task)); };
    
    const handleDeleteClick = (task: Task) => { setTaskToDelete(task); };

    const confirmDelete = () => {
        if (taskToDelete) {
            setTasks(tasks.filter(task => task.id !== taskToDelete.id));
            setTaskToDelete(null);
        }
    };
    
    const addTask = (text: string) => {
        const newTask: Task = { id: Date.now(), text, completed: false };
        setTasks([...tasks, newTask]);
        setIsAddTaskModalOpen(false);
    };

    return (
        <div className="bg-white p-4 border border-gray-200/80 rounded-xl flex-1 flex flex-col min-h-[300px]">
            {isAddTaskModalOpen && <AddTaskModal onAddTask={addTask} onClose={() => setIsAddTaskModalOpen(false)} />}
            {taskToDelete && <ConfirmDeleteModal taskText={taskToDelete.text} onConfirm={confirmDelete} onCancel={() => setTaskToDelete(null)} />}
            
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Tâches du jour</h3>
                <button onClick={() => setIsAddTaskModalOpen(true)} className="flex items-center justify-center bg-blue-100 rounded-full w-8 h-8 text-blue-600 hover:bg-blue-200 transition-colors"><Plus size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
                {isLoading ? <LoadingSpinner /> : (
                    tasks.length > 0 ? 
                    <ul className="space-y-3">{tasks.map(task => (
                        <li key={task.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 group">
                            <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                            <span className={`flex-1 ${task.completed ? 'line-through text-text-secondary' : ''}`}>{task.text}</span>
                            <button onClick={() => handleDeleteClick(task)} className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                        </li>
                    ))}</ul> 
                    : <EmptyState icon={ClipboardList} title="Aucune tâche planifiée" message="Cette journée est libre de tâches. Bravo !"/>
                )}
            </div>
        </div>
    );
};


const AppointmentsComponent: React.FC<{selectedDate: Date}> = ({selectedDate}) => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setIsLoading(true);
        setCurrentPage(1); // Reset page on date change
        const timer = setTimeout(() => {
            const dateKey = formatDate(selectedDate);
            setAppointments(mockAppointments[dateKey] || []);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedDate]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAppointments = appointments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(appointments.length / itemsPerPage);

    const statusBadge = (status: string, color: string) => {
        const colors = { green: "bg-green-100 text-green-800", yellow: "bg-yellow-100 text-yellow-800", red: "bg-red-100 text-red-800", };
        return <span className={`py-1 px-3 rounded-full text-xs font-medium ${colors[color as keyof typeof colors]}`}>{status}</span>
    }
    
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
         <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-xl p-4 md:p-6 flex flex-col min-h-[400px]">
            <h2 className="text-xl mb-4 font-medium">Rendez-vous à venir</h2>
            {isLoading ? <LoadingSpinner /> : (appointments.length > 0 ? 
            <>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-gray-50">
                            <tr>
                                <th className="p-3 font-semibold text-sm text-text-secondary">Heure</th>
                                <th className="p-3 font-semibold text-sm text-text-secondary">Patient</th>
                                <th className="p-3 hidden md:table-cell font-semibold text-sm text-text-secondary">Motif</th>
                                <th className="p-3 text-center font-semibold text-sm text-text-secondary">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAppointments.map(rdv => (
                                <tr key={rdv.time} className="border-b border-gray-200 last:border-b-0">
                                    <td className="p-3 font-medium">{rdv.time}</td>
                                    <td className="p-3">{rdv.patient}</td>
                                    <td className="p-3 hidden md:table-cell text-text-secondary">{rdv.reason}</td>
                                    <td className="p-3 text-center">{statusBadge(rdv.status, rdv.statusColor)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4 mt-auto">
                        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                        <span className="text-sm text-text-secondary">Page {currentPage} sur {totalPages}</span>
                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                    </div>
                )}
            </>
             : <EmptyState icon={CalendarCheck} title="Aucun rendez-vous" message="Cette journée est libre. Profitez-en !"/>)}
        </div>
    )
}



const NouvelleConsultationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [patient, setPatient] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('premiere');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patient || !date) { console.error("Veuillez remplir les champs obligatoires."); return; }
        console.log({ patient, date, type, telephone, email });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">Nouvelle Consultation</h3><button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><X size={24}/></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-1">Nom du patient <span className="text-red-500">*</span></label><input type="text" id="patient-name" value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="ex: Jean Dupont" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="ex: 06 12 34 56 78" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/></div>
                        <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: jean.dupont@email.com" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/></div>
                    </div>
                     <div><label htmlFor="rdv-date" className="block text-sm font-medium text-gray-700 mb-1">Date du rendez-vous <span className="text-red-500">*</span></label><input type="datetime-local" id="rdv-date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required /></div>
                    <div><label htmlFor="rdv-type" className="block text-sm font-medium text-gray-700 mb-1">Type de rendez-vous</label><select id="rdv-type" value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="premiere">Première consultation</option><option value="suivi">Suivi</option><option value="bilan">Bilan de santé</option><option value="urgence">Urgence</option></select></div>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors">Annuler</button><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Créer</button></div>
                </form>
            </div>
        </div>
    )
};

const AlertDetailsModal: React.FC<{ alert: typeof mockAlerts[0] | null; onClose: () => void }> = ({ alert, onClose }) => {
    if (!alert) return null;
    const Icon = alert.icon;
    const colorClasses = {
        red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-500' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-500' },
    };
    const currentColors = colorClasses[alert.color as keyof typeof colorClasses] || colorClasses.red;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl border-t-4" style={{borderColor: `var(--accent-${alert.color === 'red' ? 'danger' : alert.color === 'blue' ? 'primary' : 'warning'})`}} onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${currentColors.bg}`}><Icon className={`w-6 h-6 ${currentColors.text}`} /></div>
                        <div>
                            <h3 className="text-xl font-semibold">{alert.type}</h3>
                            <p className="text-text-secondary">Patient / Source: {alert.patient}</p>
                        </div>
                        <button onClick={onClose} className="ml-auto p-1 rounded-full text-gray-400 hover:bg-gray-200"><X size={20}/></button>
                    </div>
                    <p className="text-text-secondary leading-relaxed">{alert.details}</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
                    <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">{alert.linkText}</button>
                </div>
            </div>
        </div>
    )
}

export default function MedicalDashboardApp() {
    const [currentDate, setCurrentDate] = useState("Chargement de la date...");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<typeof mockAlerts[0] | null>(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            setCurrentDate(now.toLocaleDateString('fr-FR', options));
        };
        const timerId = setInterval(updateTime, 1000); updateTime();
        return () => clearInterval(timerId);
    }, []);

    return (
        <>
            <GlobalStyles />
            {isConsultationModalOpen && <NouvelleConsultationModal onClose={() => setIsConsultationModalOpen(false)} />}
            <AlertDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
            <div className="w-full h-screen overflow-hidden flex">

                    <AppSidebar />

                <div className="flex-1 flex flex-col gap-6 overflow-hidden p-6 bg-gray-50/50">
                    <AppHeader currentDate={currentDate} />
                    <div className="flex-1 flex gap-6 overflow-hidden">
                        <main className="flex-1 flex flex-col gap-6 overflow-y-auto">
                            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between items-start"><div className="flex items-center justify-center bg-blue-100 rounded-full w-12 h-12 mb-4"><CalendarCheck className="w-6 h-6 text-blue-600" /></div><div><p className="text-4xl font-bold">14</p><p className="text-text-secondary">Rendez-vous du jour</p></div></div>
                                <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between items-start"><div className="flex items-center justify-center bg-green-100 rounded-full w-12 h-12 mb-4"><FlaskConical className="w-6 h-6 text-green-600" /></div><div><p className="text-4xl font-bold">8</p><p className="text-text-secondary">Analyses en attente</p></div></div>
                                <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between items-start"><div className="flex items-center justify-center bg-orange-100 rounded-full w-12 h-12 mb-4"><ClipboardList className="w-6 h-6 text-orange-600" /></div><div><p className="text-4xl font-bold">5</p><p className="text-text-secondary">Tâches en attente</p></div></div>
                                <button onClick={() => setIsConsultationModalOpen(true)} className="bg-blue-600 text-white p-5 rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-lg shadow-blue-500/20 flex flex-col justify-center items-center text-center gap-2"><UserPlus className="w-10 h-10" /><p className="text-lg font-medium">Nouvelle Consultation</p></button>
                            </section>
                            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                                <div className="bg-white border border-gray-200/80 rounded-xl p-4 md:p-6 flex flex-col">
                                    <h2 className="text-xl mb-4 font-medium">Alertes prioritaires</h2>
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                        {mockAlerts.map(alert => {
                                            const Icon = alert.icon;
                                            const colorClasses = { red: { bg: 'bg-red-100', text: 'text-red-600', title: 'text-red-800'}, blue: { bg: 'bg-blue-100', text: 'text-blue-600', title: 'text-blue-800' }, purple: { bg: 'bg-purple-100', text: 'text-purple-600', title: 'text-purple-800'}, yellow: {bg: 'bg-yellow-100', text: 'text-yellow-600', title: 'text-yellow-800'}};
                                            const currentColors = colorClasses[alert.color as keyof typeof colorClasses] || colorClasses.red;
                                            return (
                                                <div key={alert.id} className="alert-item" onClick={() => setSelectedAlert(alert)}>
                                                    <div className={`alert-icon-container ${currentColors.bg}`}><Icon className={`h-5 w-5 ${currentColors.text}`} /></div>
                                                    <div><h3 className={`font-semibold ${currentColors.title}`}>{alert.type}</h3><p className="text-sm text-text-secondary">{alert.summary} <span className="text-blue-600 font-medium">Voir</span></p></div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <AppointmentsComponent selectedDate={selectedDate}/>
                            </section>
                        </main>
                        <aside className="hidden xl:flex flex-col w-96 gap-6 overflow-y-auto">
                            <CalendarComponent selectedDate={selectedDate} onDateChange={setSelectedDate} />
                            <TasksComponent selectedDate={selectedDate} />
                        </aside>
                    </div>
                </div>

                <AppMobileNav />
            </div>
        </>
    );
}

