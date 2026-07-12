'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'

interface CalendarViewProps {
  appointments: any[]
}

export default function CalendarView({ appointments }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Create empty slots for padding the beginning of the calendar
  const paddingDays = Array.from({ length: firstDay }, (_, i) => i)
  
  // Create array of days in the month
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Filter appointments for a specific day
  const getAppointmentsForDay = (day: number) => {
    return appointments.filter(appt => {
      // If we don't have appointmentDate, we can't reliably place it. 
      // (Older appointments without this field won't show in the calendar view reliably, but new ones will)
      if (!appt.appointmentDate) return false;
      
      const apptDate = new Date(appt.appointmentDate);
      return apptDate.getDate() === day && 
             apptDate.getMonth() === month && 
             apptDate.getFullYear() === year;
    })
  }

  return (
    <div className="animate-fade-in">
      <div className="medical-card p-8">
        
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center shadow-sm">
              <CalendarIcon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Schedule</h2>
              <p className="text-gray-500 font-medium text-sm">Manage your patient appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-white rounded-xl text-gray-600 hover:text-medical-600 hover:shadow-sm transition-all"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <div className="w-40 text-center font-bold text-gray-800 text-lg">
              {monthNames[month]} {year}
            </div>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-white rounded-xl text-gray-600 hover:text-medical-600 hover:shadow-sm transition-all"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-gray-50">
          
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
            {daysOfWeek.map(day => (
              <div key={day} className="py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
            {paddingDays.map(pad => (
              <div key={`pad-${pad}`} className="bg-gray-50 min-h-[120px]" />
            ))}

            {monthDays.map(day => {
              const dayAppts = getAppointmentsForDay(day);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              
              return (
                <div key={day} className={`bg-white min-h-[120px] p-2 transition-colors hover:bg-gray-50 ${isToday ? 'bg-medical-50/30' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-medical-500 text-white shadow-md' : 'text-gray-600'}`}>
                      {day}
                    </span>
                    {dayAppts.length > 0 && (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {dayAppts.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto no-scrollbar">
                    {dayAppts.map(appt => {
                      const isConfirmed = appt.status === 'CONFIRMED';
                      const timeOnly = appt.proposedTime.split(' at ')[1] || appt.proposedTime.split(' ')[0] || 'TBD';
                      
                      return (
                        <div 
                          key={appt.id} 
                          className={`p-1.5 rounded-xl border text-[11px] leading-tight ${
                            isConfirmed 
                              ? 'bg-green-50 border-green-100 text-green-700' 
                              : 'bg-amber-50 border-amber-100 text-amber-700'
                          }`}
                        >
                          <div className="font-bold truncate">{appt.patient.name}</div>
                          <div className="flex items-center gap-1 opacity-80 mt-0.5 text-[10px]">
                            <Clock size={10} />
                            <span>{timeOnly}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          
        </div>
      </div>
    </div>
  )
}
