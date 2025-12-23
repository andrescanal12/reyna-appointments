
import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Appointment } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
    appointments: Appointment[];
    onViewChat?: (phone: string) => void;
}

const CalendarView = ({ appointments, onViewChat }: CalendarViewProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Comienza en Lunes
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter((apt) => isSameDay(new Date(apt.appointment_date), day));
    };

    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    return (
        <div className="flex flex-col h-full bg-reyna-charcoal border border-primary/20 rounded-xl overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-reyna-black/40">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-serif text-primary capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h3>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <ChevronLeft className="h-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <ChevronRight className="h-4 h-4" />
                        </Button>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={goToToday} className="border-primary/20 hover:bg-primary/10">
                    Hoy
                </Button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-primary/10 bg-reyna-black/20">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-hidden grid grid-cols-7 grid-rows-6">
                {calendarDays.map((day, idx) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "min-h-[100px] border-r border-b border-primary/10 p-2 transition-colors",
                                !isCurrentMonth ? "bg-reyna-black/10 opacity-40" : "bg-transparent hover:bg-primary/5",
                                idx % 7 === 6 && "border-r-0"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                    isToday ? "bg-primary text-reyna-black" : "text-muted-foreground"
                                )}>
                                    {format(day, "d")}
                                </span>
                                {dayAppointments.length > 0 && (
                                    <span className="text-[10px] text-primary/60 font-bold uppercase">
                                        {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
                                    </span>
                                )}
                            </div>

                            <ScrollArea className="h-[70px] -mx-1 px-1">
                                <div className="flex flex-col gap-1">
                                    {dayAppointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            onClick={() => onViewChat?.(apt.phone_number)}
                                            className={cn(
                                                "text-[10px] p-1 rounded border cursor-pointer truncate transition-all",
                                                apt.status === 'confirmed' ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" :
                                                    apt.status === 'cancelled' ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" :
                                                        "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                                            )}
                                            title={`${format(new Date(apt.appointment_date), "HH:mm")} - ${apt.client_name}: ${apt.service_type}`}
                                        >
                                            <span className="font-bold">{format(new Date(apt.appointment_date), "HH:mm")}</span> {apt.client_name}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
