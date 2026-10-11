import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientLoginPage = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Hardcoded "Demo Clinic" ID from earlier steps or env
            // ideally we fetch this or use subdomain
            const currentTenantId = 'demo';

            const res = await fetch('http://localhost:3000/api/auth/patient-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': currentTenantId
                },
                body: JSON.stringify({ phone, dob })
            });

            if (!res.ok) throw new Error('Invalid Credentials');

            const data = await res.json();
            localStorage.setItem('patient', JSON.stringify(data.patient));
            localStorage.setItem('patientTenantId', currentTenantId);

            navigate('/portal/dashboard');
        } catch {
            setError('Login failed. Please check your details.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] font-sans text-slate-200 p-6 selection:bg-teal-500/30">
            {/* Subtle Gradient Backdrop */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full max-w-4xl mx-auto opacity-20 mix-blend-screen"
                    style={{ background: 'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 60%)' }} />
            </div>

            <div className="relative z-10 w-full max-w-[420px]">
                {/* Minimalist Card */}
                <div className="bg-[#111827]/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-teal-500/10 p-10 border border-white/10 relative overflow-hidden">

                    {/* Subtle Top Border Highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50" />

                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-500/10 border border-teal-500/20 rounded-2xl mb-6">
                            <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">Patient Portal</h1>
                        <p className="text-sm text-slate-400">Access your health records and appointments</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center text-sm text-rose-400 font-medium">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        aria-required="true"
                                        aria-label="Phone Number"
                                        className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-sm"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth</label>
                                <div className="relative">
                                    <input
                                        id="dob"
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        required
                                        aria-required="true"
                                        aria-label="Date of Birth"
                                        className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-sm"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 flex items-center justify-center py-3 px-4 bg-teal-600 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm text-white text-sm font-semibold rounded-xl shadow-sm shadow-teal-500/30 transition-all hover:-translate-y-0.5"
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Hint */}
                    <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Secure Patient Portal &bull; Encryption Enabled
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    &copy; 2026 Heart Blooms Platform
                </p>
            </div>
        </div>
    );
};

export default PatientLoginPage;
