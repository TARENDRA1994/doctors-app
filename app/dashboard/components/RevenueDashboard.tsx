'use client'

import { useEffect, useState } from 'react'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts'

interface AnalyticsData {
    fee: number
    today: { revenue: number; visits: number }
    monthly: { revenue: number; visits: number }
    trafficData: { day: string; visits: number; revenue: number }[]
    patientSplit: { name: string; value: number }[]
}

const PIE_COLORS = ['#10b981', '#3b82f6'] // Green for New, Blue for Returning

export default function RevenueDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(resData => {
                if (resData && !resData.error) {
                    setData(resData)
                }
            })
            .catch(err => console.error('Error fetching analytics:', err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-medical-500"></div>
                <p className="text-gray-400 font-medium animate-pulse">Calculating clinic financials...</p>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Practice Command Center</h2>
                    <p className="text-gray-500 text-lg mt-1">Real-time revenue & growth analytics for your clinic.</p>
                </div>
                <div className="bg-medical-50 border border-medical-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Consultation Fee</p>
                        <p className="text-xl font-black text-medical-700">₹{data.fee}</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-medical-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Today's Revenue */}
                <div className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden active:scale-[0.98] transition-all cursor-default">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50/50 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Today's Revenue</p>
                            <h3 className="text-5xl font-black text-gray-900 mb-2">₹{data.today.revenue.toLocaleString()}</h3>
                            <p className="text-sm font-bold text-green-600">From {data.today.visits} patients</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden active:scale-[0.98] transition-all cursor-default">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Revenue</p>
                            <h3 className="text-5xl font-black text-gray-900 mb-2">₹{data.monthly.revenue.toLocaleString()}</h3>
                            <p className="text-sm font-bold text-blue-600">From {data.monthly.visits} patients</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart: Last 7 days Traffic/Revenue */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="text-2xl font-black text-gray-900">Weekly Revenue Trend</h4>
                            <p className="text-sm text-gray-400 font-medium">Earnings over the last 7 days</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip 
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 6, 6]} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: New vs Returning */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl">
                    <div>
                        <h4 className="text-2xl font-black text-gray-900">Patient Retention</h4>
                        <p className="text-sm text-gray-400 font-medium">New vs Returning this month</p>
                    </div>
                    <div className="h-56 mt-4 relative">
                        {data.patientSplit.reduce((a, b) => a + b.value, 0) === 0 ? (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <p className="text-gray-400 font-medium">No patient data this month</p>
                             </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.patientSplit}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1500}
                                    >
                                        {data.patientSplit.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-4 space-y-3">
                        {data.patientSplit.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
