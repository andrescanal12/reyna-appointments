import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAppointments, useAppointmentStats, useUpdateAppointment, type Appointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";

interface AppointmentsTabProps {
  onViewChat: (phoneNumber: string) => void;
}

const AppointmentsTab = ({ onViewChat }: AppointmentsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: appointments, isLoading } = useAppointments();
  const stats = useAppointmentStats();
  const updateAppointment = useUpdateAppointment();

  const filteredAppointments = appointments?.filter((apt) => {
    const matchesSearch =
      apt.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone_number.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesService = serviceFilter === "all" || apt.service_type === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  }) || [];

  const services = [...new Set(appointments?.map(a => a.service_type) || [])];

  const handleStatusChange = async (id: string, newStatus: "confirmed" | "cancelled") => {
    try {
      await updateAppointment.mutateAsync({ id, status: newStatus });
      toast({
        title: "Estado actualizado",
        description: `La cita ha sido ${newStatus === "confirmed" ? "confirmada" : "cancelada"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmada
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30 hover:bg-warning/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelada
          </Badge>
        );
      default:
        return null;
    }
  };

  const statCards = [
    { label: "Citas Hoy", value: stats.todayCount, icon: Calendar, color: "text-primary" },
    { label: "Pendientes", value: stats.pendingCount, icon: AlertCircle, color: "text-warning" },
    { label: "Confirmadas", value: stats.confirmedCount, icon: CheckCircle, color: "text-success" },
    { label: "Canceladas", value: stats.cancelledCount, icon: XCircle, color: "text-destructive" }
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-3xl text-primary mb-2">Citas</h2>
        <p className="text-muted-foreground">Gestiona todas las citas de la peluquería</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted border-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-muted border-primary/20">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/20">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="confirmed">Confirmadas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          {services.length > 0 && (
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[200px] bg-muted border-primary/20">
                <Scissors className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Servicio" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/20">
                <SelectItem value="all">Todos los servicios</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Appointments Table */}
      <ScrollArea className="flex-1 glass-card rounded-xl">
        <div className="min-w-[800px]">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-primary/10 bg-muted/50 rounded-t-xl sticky top-0">
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Cliente
            </div>
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Teléfono
            </div>
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Servicio
            </div>
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha
            </div>
            <div className="text-sm font-semibold text-muted-foreground">Estado</div>
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Recordatorio
            </div>
            <div className="text-sm font-semibold text-muted-foreground">Acciones</div>
          </div>

          {/* Table Body */}
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay citas registradas</p>
              <p className="text-sm mt-2">Las citas creadas por Juliana IA aparecerán aquí</p>
            </div>
          ) : (
            filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-7 gap-4 p-4 border-b border-primary/5 hover:bg-muted/30 transition-colors"
              >
                <div className="font-medium text-foreground">{appointment.client_name}</div>
                <div className="text-muted-foreground">{appointment.phone_number}</div>
                <div className="text-foreground truncate">{appointment.service_type}</div>
                <div className="text-foreground">
                  <div>{format(new Date(appointment.appointment_date), "dd MMM yyyy", { locale: es })}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(appointment.appointment_date), "HH:mm", { locale: es })}
                  </div>
                </div>
                <div>{getStatusBadge(appointment.status)}</div>
                <div>
                  {appointment.reminder_sent ? (
                    <span className="flex items-center gap-1 text-primary">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Enviado</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Pendiente</span>
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {appointment.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, "confirmed")}
                        className="border-success/20 text-success hover:bg-success/10"
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, "cancelled")}
                        className="border-destructive/20 text-destructive hover:bg-destructive/10"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  {/* Always show View button, or at least when it's not pending? User asked for "Ver" to redirect. 
                      The logic was: if pending -> Confirm/Cancel. If not pending -> Ver.
                      We keep that logic. */}
                  {appointment.status !== "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/20 text-primary hover:bg-primary/10"
                      onClick={() => onViewChat(appointment.phone_number)}
                    >
                      Ver
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AppointmentsTab;
