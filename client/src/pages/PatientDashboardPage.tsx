import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Appointment {
    id: string;
    date: string;
    type: string;
    status: string;
}

interface StoredPatient {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

const PatientDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    // Read the stored patient lazily during state initialization (not in an effect)
    // so no synchronous setState-in-effect is needed.
    const [patient] = useState<StoredPatient | null>(() => {
        try {
            const p = localStorage.getItem('patient');
            return p ? (JSON.parse(p) as StoredPatient) : null;
        } catch {
            return null;
        }
    });
    const [appointments] = useState<Appointment[]>([{ id: 'uuid-1', date: '2025-02-12T10:00:00Z', type: 'Specialist Consultation', status: 'SCHEDULED' }]); // Mock data for demo
    const [pastVisits] = useState<Appointment[]>([
        { id: 'uuid-2', date: '2024-11-05T14:30:00Z', type: 'Annual Checkup', status: 'COMPLETED' },
        { id: 'uuid-3', date: '2024-06-20T09:15:00Z', type: 'Blood Test', status: 'COMPLETED' },
    ]);

    useEffect(() => {
        const p = localStorage.getItem('patient');
        const t = localStorage.getItem('patientTenantId');
        if (!p || !t) {
            navigate('/portal/login');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-teal-500/30">
            {/* Subtle Gradient Backdrop */}
            <div className="fixed inset-0 z-0 flex items-start justify-center pointer-events-none overflow-hidden">
                <div className="w-[800px] h-[800px] absolute -top-96 opacity-20 mix-blend-screen"
                    style={{ background: 'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 60%)' }} />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="py-6 flex justify-between items-center border-b border-white/5 mb-8 mt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">Patient Portal</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-slate-200">{patient?.firstName} {patient?.lastName}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{patient?.email || 'Patient ID: ' + patient?.id?.slice(0, 6)}</p>
                        </div>
                        <div className="h-10 w-10 bg-[#111827] border border-white/10 rounded-full flex items-center justify-center font-bold text-sm text-slate-300 shadow-sm">
                            {patient?.firstName?.[0] || 'P'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 space-y-8 pb-12">

                    <div>
                        <h2 className="text-xl font-bold text-slate-100 mb-4 tracking-tight">Upcoming Visits</h2>
                        {appointments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {appointments.map(appt => (
                                    <div key={appt.id} className="bg-[#111827] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-teal-500/30 transition-colors shadow-sm">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-teal-500/10 transition-colors" />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="inline-flex items-center px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-2 animate-pulse"></span>
                                                Confirmed
                                            </div>
                                            <div className="p-2 rounded-lg bg-white/5 text-slate-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-teal-400 transition-colors">{appt.type}</h3>
                                        <p className="text-sm text-slate-400 mb-6">Dr. Smith &bull; Main Clinic</p>

                                        <div className="flex items-end justify-between bg-[#0B0F19] p-4 rounded-xl border border-white/5 mb-6">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Date & Time</p>
                                                <p className="font-semibold text-slate-200">
                                                    {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    const newDate = prompt("Enter new date (YYYY-MM-DD):");
                                                    if (newDate) {
                                                        fetch(`http://localhost:3000/api/appointments/${appt.id}/reschedule`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ date: newDate })
                                                        }).then(() => {
                                                            alert('Rescheduled!');
                                                            window.location.reload();
                                                        });
                                                    }
                                                }}
                                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold py-2.5 rounded-xl transition-all hover:text-white"
                                            >
                                                Reschedule
                                            </button>
                                            <button className="flex-1 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm shadow-teal-500/20 hover:-translate-y-0.5">
                                                Check In
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#111827] border border-white/5 rounded-2xl p-10 text-center shadow-sm">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold text-slate-200 mb-1">No upcoming appointments</h3>
                                <p className="text-sm text-slate-500 mb-6">You're all caught up. Schedule a new visit when you're ready.</p>
                                <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
                                    Book an Appointment
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <h2 className="text-xl font-bold text-slate-100 mb-4 tracking-tight">Past Visits</h2>
                        {pastVisits.length > 0 ? (
                            <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                                <div className="divide-y divide-white/5">
                                    {pastVisits.map(visit => (
                                        <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white-[0.02] transition-colors group">
                                            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-700 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-200 text-sm">{visit.type}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(visit.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border bg-slate-800/50 text-slate-400 border-slate-700">
                                                    Completed
                                                </span>
                                                <button className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors">
                                                    View Summary &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#111827] border border-white/5 rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-sm text-slate-500">No past visits recorded.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-10 flex justify-center border-t border-white/5">
                        <button
                            onClick={() => {
                                localStorage.clear();
                                navigate('/portal/login');
                            }}
                            className="text-slate-500 hover:text-rose-400 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Secure Sign Out
                        </button>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default PatientDashboardPage;
