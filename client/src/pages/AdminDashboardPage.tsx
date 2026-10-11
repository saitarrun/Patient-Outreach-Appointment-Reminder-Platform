import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardData {
    stats: {
        totalPatients: number;
        upcomingAppointments: number;
        activeCampaigns: number;
        failedReminders: number;
    };
    recentActivity: {
        id: string;
        action: string;
        resource: string;
        createdAt: string;
    }[];
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const headers: HeadersInit = { 'x-tenant-id': 'demo' };
                if (user?.id) headers['x-user-id'] = user.id;

                const res = await fetch('/api/dashboard/stats', { headers });
                if (!res.ok) throw new Error('Failed to fetch dashboard data');

                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error(err);
                setError('Unable to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const stats = [
        { label: 'Total Patients', value: data?.stats?.totalPatients || 0, increase: true, icon: 'Users' },
        { label: 'Upcoming Appts', value: data?.stats?.upcomingAppointments || 0, increase: true, icon: 'Calendar' },
        { label: 'Active Campaigns', value: data?.stats?.activeCampaigns || 0, increase: false, icon: 'Megaphone' },
        { label: 'Failed Reminders', value: data?.stats?.failedReminders || 0, increase: false, icon: 'AlertTriangle' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Overview</h2>
                    <p className="text-sm text-slate-400 mt-1">Activity and system metrics for Heart Blooms</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-medium mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#111827] border border-white/5 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-indigo-500/10" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                            <div className="p-1.5 rounded-md bg-white/5 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                                {stat.icon === 'Users' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                {stat.icon === 'Calendar' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                {stat.icon === 'Megaphone' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                                {stat.icon === 'AlertTriangle' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                            </div>
                        </div>
                        <div className="flex items-end gap-3 relative z-10">
                            <h3 className="text-3xl font-bold text-slate-100">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-slate-200">Outreach Engagement</h3>
                        <select className="bg-[#0B0F19] border border-white/10 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-64 border border-white/5 bg-[#0B0F19]/50 rounded-xl flex items-center justify-center border-dashed">
                        <div className="text-center">
                            <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            <span className="text-sm font-medium text-slate-500">Chart visualization coming soon...</span>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-slate-200">Recent Activity</h3>
                    </div>

                    <div className="space-y-6">
                        {data?.recentActivity?.map((item, index) => (
                            <div key={item.id} className="relative flex gap-4">
                                {index !== (data?.recentActivity?.length || 0) - 1 && (
                                    <div className="absolute top-8 bottom-[-24px] left-3 w-[1px] bg-white/5" />
                                )}

                                <div className="relative z-10 flex-shrink-0">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#111827] 
                                        ${item.action.includes('FAIL') || item.action.includes('ERROR') ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.action.includes('FAIL') || item.action.includes('ERROR') ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 pt-0.5 pb-2">
                                    <p className="text-xs text-slate-200 leading-relaxed">
                                        <span className="font-semibold text-slate-100">{item.action.replace('_', ' ')}</span> &bull; {item.resource}
                                    </p>
                                    <span className="text-[10px] text-slate-500 mt-1 block font-medium uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                        {(!data?.recentActivity || data.recentActivity.length === 0) && (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-500">No activity yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
