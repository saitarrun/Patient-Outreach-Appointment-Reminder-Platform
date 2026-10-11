import { useEffect, useState, useMemo } from 'react';
import type { Patient } from '@app/shared';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/EmptyState';
import AddPatientModal from '../components/AddPatientModal';

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const { user } = useAuth();

    useEffect(() => {
        // DEMO: Explicitly ask for 'demo' tenant and include user ID
        const headers: HeadersInit = {
            'x-tenant-id': 'demo'
        };

        if (user?.id) {
            headers['x-user-id'] = user.id;
        }

        fetch('/api/patients', { headers })
            .then((res) => {
                if (!res.ok) {
                    if (res.status === 403) throw new Error('Access Denied');
                    throw new Error('Failed to fetch patients');
                }
                return res.json();
            })
            .then((data) => {
                setPatients(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setPatients([]); // Ensure array on error
                setLoading(false);
            });
    }, [user]);

    const handlePatientCreated = (newPatient: Patient) => {
        setPatients([...patients, newPatient]);
    };

    // Stats calculation
    const stats = useMemo(() => {
        const total = patients.length;
        // Mocking active count for Visuals
        const active = patients.length;

        // Mock new patients count
        const newThisMonth = Math.floor(total * 0.2) + 1;

        return [
            { label: 'Total Patients', value: total, icon: 'Users', change: '+12%', color: 'from-blue-400 to-cyan-300' },
            { label: 'Active Cases', value: active, icon: 'Activity', change: '+5%', color: 'from-emerald-400 to-teal-300' },
            { label: 'New (Month)', value: newThisMonth, icon: 'UserPlus', change: '+18%', color: 'from-purple-400 to-pink-300' },
        ];
    }, [patients]);

    const filteredPatients = patients.filter(patient =>
        patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    // Determine if we show empty state (no patients at all, no search)
    if (patients.length === 0 && !searchQuery) {
        return (
            <div className="max-w-4xl mx-auto mt-10">
                <EmptyState
                    title="No Patients Found"
                    description="Get started by adding your first patient to the system."
                    actionLabel="Add Patient"
                    onAction={() => setIsModalOpen(true)}
                />
                <AddPatientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handlePatientCreated}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Page Title Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                        Patient Management
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Overview of all registered patients across the platform
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Patient
                </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-[#111827] border border-white/5 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                            <div className={`p-1.5 rounded-md bg-white/5 text-slate-300 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors`}>
                                {stat.icon === 'Users' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                )}
                                {stat.icon === 'Activity' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                )}
                                {stat.icon === 'UserPlus' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                )}
                            </div>
                        </div>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-bold text-slate-100">{stat.value}</h3>
                            <span className="flex items-center text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 mb-1">
                                {stat.change}
                                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar (Search & Filters) */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#111827] border border-white/5 rounded-xl p-2">
                <div className="relative flex-1 w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="block w-full pl-9 pr-3 py-2 text-sm bg-transparent border-none text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center bg-[#0B0F19] p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Grid View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white/10 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Table View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {filteredPatients.length === 0 ? (
                <div className="bg-[#111827] border border-white/5 rounded-xl p-12 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">No patients found</h3>
                    <p className="text-sm text-slate-500">Try adjusting your search terms or add a new patient.</p>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredPatients.map((patient: Patient & { active?: boolean }) => (
                                <div
                                    key={patient.id}
                                    className="group flex flex-col bg-[#111827] border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all duration-300 shadow-sm"
                                >
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                                    {patient.firstName[0]}{patient.lastName[0]}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                                                        {patient.firstName} {patient.lastName}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-mono">ID: {patient.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${(patient.active ?? true) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                <span className={`w-1 h-1 rounded-full mr-1.5 ${(patient.active ?? true) ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                                                Active
                                            </span>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            {patient.email && (
                                                <div className="flex items-center text-xs text-slate-400 group/item">
                                                    <svg className="flex-shrink-0 mr-2 h-3.5 w-3.5 text-slate-500 group-hover/item:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    <span className="truncate">{patient.email}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center text-xs text-slate-400 group/item">
                                                <svg className="flex-shrink-0 mr-2 h-3.5 w-3.5 text-slate-500 group-hover/item:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {patient.phone}
                                            </div>
                                            {patient.dob && (
                                                <div className="flex items-center text-xs text-slate-400 group/item">
                                                    <svg className="flex-shrink-0 mr-2 h-3.5 w-3.5 text-slate-500 group-hover/item:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span>{new Date(patient.dob).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-white/5 bg-[#0B0F19]/50 p-3 flex justify-end gap-2">
                                        <button className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors">
                                            Edit
                                        </button>
                                        <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-md hover:bg-indigo-500/10 transition-colors">
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-[#0B0F19]/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patient Name</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contact Info</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</th>
                                        <th scope="col" className="relative px-6 py-3.5">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-[#111827]">
                                    {filteredPatients.map((patient: Patient & { active?: boolean }) => (
                                        <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-xs transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                                                            {patient.firstName[0]}
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-slate-200">{patient.firstName} {patient.lastName}</div>
                                                        <div className="text-xs text-slate-500 font-mono">ID: {patient.id.slice(0, 6)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-300">{patient.email || 'N/A'}</div>
                                                <div className="text-xs text-slate-500">{patient.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${(patient.active ?? true) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                    <span className={`w-1 h-1 rounded-full mr-1.5 ${(patient.active ?? true) ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                                {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-slate-500 hover:text-indigo-400 transition-colors mx-2">Edit</button>
                                                <button className="text-indigo-400 hover:text-indigo-300 transition-colors">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <AddPatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handlePatientCreated}
            />
        </div>
    );
}
