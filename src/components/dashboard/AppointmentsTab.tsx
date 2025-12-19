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

// Mock data
const mockAppointments = [
  {
    id: "1",
    clientName: "María García",
    phone: "+34612345678",
    service: "Keratina (Alisado)",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24),
    status: "confirmed",
    reminderSent: true,
    notes: "Primera vez que viene"
  },
  {
    id: "2",
    clientName: "Carmen López",
    phone: "+34687654321",
    service: "Corte/Peinado",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    status: "pending",
    reminderSent: false,
    notes: ""
  },
  {
    id: "3",
    clientName: "Ana Martínez",
    phone: "+34698765432",
    service: "Tintes/Baños de Color",
    date: new Date(Date.now() + 1000 * 60 * 60 * 3),
    status: "confirmed",
    reminderSent: true,
    notes: "Traerá foto de referencia"
  },
  {
    id: "4",
    clientName: "Laura Fernández",
    phone: "+34654321987",
    service: "Botox Capilar",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "cancelled",
    reminderSent: true,
    notes: "Canceló por enfermedad"
  },
  {
    id: "5",
    clientName: "Sofia Ruiz",
    phone: "+34611223344",
    service: "Tratamiento Células Madre",
    date: new Date(Date.now() + 1000 * 60 * 60 * 5),
    status: "confirmed",
    reminderSent: true,
    notes: ""
  }
];

const stats = [
  { label: "Citas Hoy", value: 3, icon: Calendar, color: "text-primary" },
  { label: "Pendientes", value: 1, icon: AlertCircle, color: "text-warning" },
  { label: "Confirmadas", value: 4, icon: CheckCircle, color: "text-success" },
  { label: "Canceladas", value: 1, icon: XCircle, color: "text-destructive" }
];

const AppointmentsTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const filteredAppointments = mockAppointments.filter((apt) => {
    const matchesSearch = 
      apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesService = serviceFilter === "all" || apt.service === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

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

  const services = [...new Set(mockAppointments.map(a => a.service))];

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-3xl text-primary mb-2">Citas</h2>
        <p className="text-muted-foreground">Gestiona todas las citas de la peluquería</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
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
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-7 gap-4 p-4 border-b border-primary/5 hover:bg-muted/30 transition-colors"
            >
              <div className="font-medium text-foreground">{appointment.clientName}</div>
              <div className="text-muted-foreground">{appointment.phone}</div>
              <div className="text-foreground">{appointment.service}</div>
              <div className="text-foreground">
                <div>{format(appointment.date, "dd MMM yyyy", { locale: es })}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(appointment.date, "HH:mm", { locale: es })}
                </div>
              </div>
              <div>{getStatusBadge(appointment.status)}</div>
              <div>
                {appointment.reminderSent ? (
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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  Ver
                </Button>
              </div>
            </motion.div>
          ))}

          {filteredAppointments.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron citas con los filtros aplicados</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AppointmentsTab;
