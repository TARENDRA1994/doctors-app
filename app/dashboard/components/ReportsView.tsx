'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts'

interface RiskAlert {
    id: number
    name: string
    adherence: number
    healthScore: number
    isAtRisk: boolean
}

interface ReportData {
    adherenceRate: number
    totalSchedules: number
    takenSchedules: number
    progressRate: number
    totalFeedbacks: number
    improvedCount: number
    growth: {
        totalPatients: number
        newPatients: number
        trend: { month: string; count: number }[]
    }
    diseaseDistribution: { name: string; value: number }[]
    riskAlerts: RiskAlert[]
    averageHealthScore: number
    intelligence: {
        trend: 'increasing' | 'declining'
        strategy: string
    }
}

const CHART_COLORS = ['#14b8a6', '#f59e0b', '#10b981', '#6366f1', '#f43f5e']
const PIE_COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e']

export default function ReportsView() {
    const router = useRouter()
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/reports')
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-medical-500"></div>
                <p className="text-gray-400 font-medium animate-pulse">Analyzing clinical data...</p>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-medical-100 text-medical-700 text-[10px] font-bold uppercase tracking-widest rounded-full">Pro Feature</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 text-xs font-medium italic">Updated just now</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Compliance Intelligence</h2>
                    <p className="text-gray-500 text-lg mt-1">Deep insights into your clinic's therapeutic performance.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overall Clinic Health</p>
                        <p className={`text-2xl font-black ${data.averageHealthScore > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                            {data.averageHealthScore}/100
                        </p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 ${data.averageHealthScore > 70 ? 'bg-green-500' : 'bg-amber-500'}`}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" /></svg>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1. Adherence Intelligence */}
                <div className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-medical-900/5 relative overflow-hidden active:scale-[0.98] transition-all cursor-default">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-medical-50/50 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-medical-100 rounded-xl flex items-center justify-center text-medical-600 mb-6 group-hover:bg-medical-600 group-hover:text-white transition-colors duration-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" /></svg>
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Medication Intake Score</p>
                        <h3 className="text-5xl font-black text-gray-900 mb-4">{data.adherenceRate}%</h3>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-medical-500 to-medical-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                                style={{ width: `${data.adherenceRate}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Based on <span className="text-gray-900 font-bold">{data.totalSchedules}</span> scheduled reminders</p>
                    </div>
                </div>

                {/* 2. Sentiment Analytics */}
                <div className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-accent-900/5 relative overflow-hidden active:scale-[0.98] transition-all cursor-default">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-50/50 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-accent-600 mb-6 group-hover:bg-accent-600 group-hover:text-white transition-colors duration-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Patient Recovery Rate</p>
                        <h3 className="text-5xl font-black text-gray-900 mb-4">{data.progressRate}%</h3>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                style={{ width: `${data.progressRate}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium"><span className="text-gray-900 font-bold">{data.improvedCount}</span> patients reporting feeling better</p>
                    </div>
                </div>

                {/* 3. Growth Insights */}
                <div className="group bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-default overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Total Active</p>
                                <p className="text-2xl font-black">{data.growth.totalPatients}</p>
                            </div>
                        </div>
                        <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">Growth Trend</p>
                        <div className="h-32 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.growth.trend}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#fff" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorCount)" 
                                        animationDuration={1500}
                                    />
                                    <XAxis 
                                        dataKey="month" 
                                        hide 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs font-bold text-indigo-100 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                +{data.growth.newPatients} this month
                            </p>
                            <span className="text-[10px] font-black uppercase bg-white/10 px-2 py-1 rounded-lg">Last 6 Months</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row: Distribution & AI Advice */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Disease Distribution Chart */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                Clinical Distribution
                            </h4>
                            <p className="text-gray-400 text-sm mt-1">Breakdown of patient pool by medical condition.</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-medical-50 group-hover:text-medical-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.diseaseDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1500}
                                    >
                                        {data.diseaseDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {data.diseaseDistribution.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                                        <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900">{Math.round((item.value / data.growth.totalPatients) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Strategic Advisor (Enhanced Insight Panel) */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-medical-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:bg-medical-500/20 transition-all duration-1000"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md text-medical-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h4 className="text-2xl font-black tracking-tight">AI Strategic Advisor</h4>
                        </div>
                        
                        <div className="space-y-6">
                             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-default">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-2 h-2 rounded-full bg-medical-400"></span>
                                    <p className="text-[10px] font-black text-medical-400 uppercase tracking-widest">Growth Velocity</p>
                                </div>
                                <p className="text-lg leading-relaxed font-medium">
                                    Your clinic is showing <span className={`text-xl font-black ${data.intelligence.trend === 'increasing' ? 'text-green-400' : 'text-red-400'}`}>
                                        {data.intelligence.trend === 'increasing' ? 'Strong Momentum' : 'Stagnation Risk'}
                                    </span>
                                </p>
                                <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                                    {data.intelligence.trend === 'increasing' 
                                        ? `Registration volume has hit a peak. Ensure infrastructure scales to maintain quality.` 
                                        : `Patient retention is stable, but acquisition has slowed down in the last 60 days.`}
                                </p>
                            </div>

                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-default">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Actionable Tactic</p>
                                </div>
                                <p className="text-md leading-relaxed text-gray-200">{data.intelligence.strategy}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Third Row: Risk Alerts */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                            Clinical Attention Required
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">Patients with low intake scores or poor recovery progress.</p>
                    </div>
                    <span className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase">{data.riskAlerts.length} High Priority</span>
                </div>

                {data.riskAlerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.riskAlerts.map(patient => (
                            <div key={patient.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-red-200 hover:bg-red-50/20 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-xl text-gray-400 group-hover:text-red-400 transition-colors border border-gray-100">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 text-lg">{patient.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-gray-400">Intake Score: <span className="text-red-500">{patient.adherence}%</span></span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                            <span className="text-xs font-bold text-gray-400">Wellness Index: <span className="text-amber-600">{patient.healthScore}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push(`/patient/${patient.id}`)}
                                    className="px-6 py-3 bg-white text-gray-800 font-black text-xs uppercase rounded-xl border-2 border-gray-100 hover:border-red-500 hover:text-red-500 shadow-sm transition-all active:scale-95 text-center"
                                >
                                    Review
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <p className="font-black text-gray-400 text-xl uppercase tracking-widest">Excellent Compliance</p>
                        <p className="text-sm font-medium">No high-risk patients detected at this time.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
