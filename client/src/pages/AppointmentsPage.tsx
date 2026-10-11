import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/EmptyState';

interface Appointment {
    id: string;
    date: string;
    type: string;
    status: string;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        // DEMO: Explicitly ask for 'demo' tenant
        const headers: HeadersInit = {
            'x-tenant-id': 'demo'
        };

        if (user?.id) {
            headers['x-user-id'] = user.id;
        }

        fetch('/api/appointments', { headers })
            .then((res) => {
                if (!res.ok) {
                    if (res.status === 403) throw new Error('Access Denied');
                    throw new Error('Failed to fetch appointments');
                }
                return res.json();
            })
            .then((data) => {
                setAppointments(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setAppointments([]); // Ensure array on error
                setLoading(false);
            });
    }, [user]);

    // Stats calculation
    const stats = useMemo(() => {
        const total = appointments.length;
        const upcoming = appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'SCHEDULED').length;
        const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;

        return [
            { label: 'Total Appointments', value: total, icon: 'Calendar', change: '+8%', color: 'from-blue-400 to-cyan-300' },
            { label: 'Upcoming', value: upcoming, icon: 'Clock', change: '+2%', color: 'from-emerald-400 to-teal-300' },
            { label: 'Confirmed', value: confirmed, icon: 'CheckCircle', change: '+15%', color: 'from-purple-400 to-pink-300' },
        ];
    }, [appointments]);

    const filteredAppointments = appointments.filter(appointment =>
        (appointment.patient?.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (appointment.patient?.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (appointments.length === 0 && !searchQuery) {
        return (
            <div className="max-w-4xl mx-auto mt-10">
                <EmptyState
                    title="No Appointments Scheduled"
                    description="When patients book appointments, they will appear here."
                    actionLabel="Go to Patients"
                    onAction={() => window.location.href = '/patients'}
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
                        Appointments
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage scheduling, upcoming visits, and appointment statuses
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5" onClick={() => alert("Scheduling module coming soon!")} >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Appointment
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
                                {stat.icon === 'Calendar' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                )}
                                {stat.icon === 'Clock' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                {stat.icon === 'CheckCircle' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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

            {/* Toolbar (Search) */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#111827] border border-white/5 rounded-xl p-2">
                <div className="relative flex-1 w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        className="block w-full pl-9 pr-3 py-2 text-sm bg-transparent border-none text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            {filteredAppointments.length === 0 ? (
                <div className="bg-[#111827] border border-white/5 rounded-xl p-12 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">No appointments found</h3>
                    <p className="text-sm text-slate-500">Try adjusting your search terms.</p>
                </div>
            ) : (
                <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/5">
                            <thead className="bg-[#0B0F19]/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patient Name</th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Appointment Type</th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-3.5">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-[#111827]">
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-xs transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                                                        {appointment.patient?.firstName?.[0] || '?'}
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-slate-200">
                                                        {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown Patient'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono">ID: {appointment.patient?.id?.slice(0, 6) || '---'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-300">{appointment.type}</div>
                                            <div className="text-xs text-slate-500">ID: {appointment.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-300">{new Date(appointment.date).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-500">{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border 
                                                ${appointment.status === 'CONFIRMED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                    appointment.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                <span className={`w-1 h-1 rounded-full mr-1.5 
                                                    ${appointment.status === 'CONFIRMED' ? 'bg-indigo-400' :
                                                        appointment.status === 'CANCELLED' ? 'bg-rose-400' :
                                                            'bg-emerald-400'}`}></span>
                                                {appointment.status || 'SCHEDULED'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-slate-500 hover:text-indigo-400 transition-colors mx-2">Reschedule</button>
                                            <button className="text-indigo-400 hover:text-indigo-300 transition-colors">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
