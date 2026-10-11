import { useState } from 'react';
import type { Patient } from '@app/shared';
import { useAuth } from '../contexts/AuthContext';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (patient: Patient) => void;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        dob: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'x-tenant-id': 'demo' // Hardcoded for demo/MVP
            };

            if (user?.id) {
                headers['x-user-id'] = user.id;
            }

            const res = await fetch('/api/patients', {
                method: 'POST',
                headers,
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create patient');
            }

            const newPatient = await res.json();
            onSuccess(newPatient);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay with blur */}
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom rounded-[2rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
                    {/* Glass Panel */}
                    <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 p-8 relative z-10">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30 mb-4">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight" id="modal-title">
                                Add New Patient
                            </h3>
                            <p className="mt-2 text-sm text-blue-200/70">
                                Enter the patient's details to register them in the system.
                            </p>
                        </div>

                        <form id="add-patient-form" onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start mx-2">
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-blue-100 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        required
                                        className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                                        placeholder="Jane"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-blue-100 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        required
                                        className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-blue-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                                        placeholder="jane@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-blue-100 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        required
                                        className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                                        placeholder="(555) 123-4567"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="dob" className="block text-sm font-medium text-blue-100 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        id="dob"
                                        required
                                        className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all [color-scheme:dark]"
                                        value={formData.dob}
                                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-white/10 rounded-xl text-base font-medium text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all sm:w-auto sm:flex-1"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-lg shadow-cyan-500/30 text-base font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all sm:w-auto sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Patient'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
