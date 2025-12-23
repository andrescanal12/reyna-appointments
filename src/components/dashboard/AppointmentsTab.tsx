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
import { useAppointments, useAppointmentStats, useUpdateAppointment, useCreateAppointment, type Appointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import CalendarView from "./CalendarView";
import { cn } from "@/lib/utils";

interface AppointmentsTabProps {
  onViewChat: (phoneNumber: string) => void;
}

const AppointmentsTab = ({ onViewChat }: AppointmentsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const { toast } = useToast();

  const { data: appointments, isLoading } = useAppointments();
  const stats = useAppointmentStats();
  const updateAppointment = useUpdateAppointment();
  const createAppointment = useCreateAppointment();

  // State for new appointment form
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newServiceType, setNewServiceType] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleCreateAppointment = async () => {
    if (!newClientName || !newClientPhone || !newServiceType || !newDate || !newTime) {
      toast({
        title: "Faltan datos",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    try {
      const isoDate = `${newDate}T${newTime}:00+01:00`;

      await createAppointment.mutateAsync({
        client_name: newClientName,
        phone_number: newClientPhone,
        service_type: newServiceType,
        appointment_date: isoDate,
        status: "confirmed",
        notes: "Agendado manualmente desde el Dashboard"
      });

      toast({
        title: "Cita creada",
        description: "La cita se ha agendado correctamente",
      });
      setIsNewOpen(false);
      setNewClientName("");
      setNewClientPhone("");
      setNewServiceType("");
      setNewDate("");
      setNewTime("");
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo crear la cita. Verifica la conexión.",
        variant: "destructive"
      });
    }
  };

  const filteredAppointments = appointments?.filter((apt) => {
    const matchesSearch =
      apt.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone_number.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesService = serviceFilter === "all" || apt.service_type === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  }) || [];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "cancelled": return "bg-red-500/20 text-red-500 border-red-500/30";
      default: return "";
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
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-2">Citas</h2>
          <p className="text-muted-foreground">Gestiona todas las citas de la peluquería</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-reyna-black/40 p-1 rounded-lg border border-primary/10">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 gap-2",
                viewMode === "list" ? "bg-primary text-reyna-black hover:bg-primary/90" : "text-muted-foreground"
              )}
            >
              Lista
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "h-8 gap-2",
                viewMode === "calendar" ? "bg-primary text-reyna-black hover:bg-primary/90" : "text-muted-foreground"
              )}
            >
              Calendario
            </Button>
          </div>

          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-reyna-charcoal border-primary/20 text-foreground">
              <DialogHeader>
                <DialogTitle className="text-primary font-serif">Nueva Cita Manual</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ingresa los datos para agendar una cita directamente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre del Cliente</Label>
                  <Input id="name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="bg-muted border-primary/20" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono (con prefijo +34)</Label>
                  <Input id="phone" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="+34..." className="bg-muted border-primary/20" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="service">Servicio</Label>
                  <Select value={newServiceType} onValueChange={setNewServiceType}>
                    <SelectTrigger className="bg-muted border-primary/20">
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent className="bg-reyna-charcoal border-primary/20">
                      {["Corte/Peinado", "Tratamiento de Cauterización", "Tratamiento Células Madre", "Tintes/Baños de Color", "Keratina (Alisado)", "Botox Capilar", "Reconstrucción (Radiante Glock)"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-muted border-primary/20" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input id="time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="bg-muted border-primary/20" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateAppointment}>Guardar Cita</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col pt-2">
        {viewMode === "list" ? (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10 bg-reyna-black/40 border-primary/20 text-foreground"
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-reyna-black/40 border-primary/20">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-reyna-charcoal border-primary/20">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="confirmed">Confirmadas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[180px] bg-reyna-black/40 border-primary/20">
                    <Scissors className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Servicio" />
                  </SelectTrigger>
                  <SelectContent className="bg-reyna-charcoal border-primary/20">
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    {["Corte/Peinado", "Tratamiento de Cauterización", "Tratamiento Células Madre", "Tintes/Baños de Color", "Keratina (Alisado)", "Botox Capilar", "Reconstrucción (Radiante Glock)"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scrollable Table Area */}
            <ScrollArea className="flex-1 glass-card rounded-xl">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-7 gap-4 p-4 border-b border-primary/10 bg-muted/50 rounded-t-xl sticky top-0 z-10">
                  <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><User size={14} /> Cliente</div>
                  <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Phone size={14} /> Teléfono</div>
                  <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Scissors size={14} /> Servicio</div>
                  <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Fecha</div>
                  <div className="text-sm font-semibold text-muted-foreground">Estado</div>
                  <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Bell size={14} /> Recordatorio</div>
                  <div className="text-sm font-semibold text-muted-foreground text-right">Acciones</div>
                </div>

                <div className="flex flex-col">
                  {filteredAppointments.map((apt, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={apt.id}
                      className="grid grid-cols-7 gap-4 p-4 border-b border-primary/5 items-center hover:bg-muted/30 transition-colors group"
                    >
                      <div className="font-medium text-foreground">{apt.client_name}</div>
                      <div className="text-muted-foreground text-sm font-mono">{apt.phone_number}</div>
                      <div className="text-foreground truncate">{apt.service_type}</div>
                      <div className="text-sm">
                        <div className="text-foreground">{format(new Date(apt.appointment_date), "dd MMM yyyy", { locale: es })}</div>
                        <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> {format(new Date(apt.appointment_date), "HH:mm")}
                        </div>
                      </div>
                      <div>
                        <Badge className={cn("capitalize h-6", getStatusColor(apt.status))}>
                          {apt.status === "confirmed" ? "Confirmada" : apt.status === "pending" ? "Pendiente" : "Cancelada"}
                        </Badge>
                      </div>
                      <div>
                        <Badge variant="outline" className={cn(
                          "gap-1",
                          apt.reminder_sent ? "text-green-500 border-green-500/20" : "text-yellow-500 border-yellow-500/20"
                        )}>
                          {apt.reminder_sent ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {apt.reminder_sent ? "Enviado" : "Pendiente"}
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {apt.status === "pending" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleStatusChange(apt.id, "confirmed")} className="h-8 border-green-500/20 text-green-500 hover:bg-green-500/10">Confirmar</Button>
                            <Button variant="outline" size="sm" onClick={() => handleStatusChange(apt.id, "cancelled")} className="h-8 border-red-500/20 text-red-500 hover:bg-red-500/10">Cancelar</Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" className="h-8 border-primary/20 text-primary hover:bg-primary/10" onClick={() => onViewChat(apt.phone_number)}>Ver</Button>
                      </div>
                    </motion.div>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <div className="py-20 text-center">
                      <div className="inline-flex p-4 rounded-full bg-primary/5 mb-4">
                        <Calendar className="w-8 h-8 text-primary/40" />
                      </div>
                      <h3 className="text-lg font-serif text-foreground mb-1">No hay citas</h3>
                      <p className="text-muted-foreground">No se encontraron citas con los filtros actuales.</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <CalendarView appointments={appointments || []} onViewChat={onViewChat} />
        )}
      </div>
    </div>
  );
};

export default AppointmentsTab;

