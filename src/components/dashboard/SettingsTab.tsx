import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Clock,
  Scissors,
  Globe,
  Link2,
  Save,
  Plus,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSalonSettings, useUpdateSalonSettings } from "@/hooks/useSalonSettings";

const SettingsTab = () => {
  const { toast } = useToast();
  const { data: salonSettings, isLoading } = useSalonSettings();
  const updateSettings = useUpdateSalonSettings();

  const [settings, setSettings] = useState({
    salon_name: "Peluquería Reyna",
    salon_address: "C. Alcalde Suárez Llanos, 19, 03012 Alicante",
    salon_phone: "",
    salon_email: "",
    working_hours: {
      tuesday_saturday: "10:00-14:00, 16:00-20:00",
      lunch_break: "14:00-16:00",
      closed: ["sunday", "monday"] as string[]
    },
    services: [
      "Corte/Peinado - 45 min",
      "Tratamiento de Cauterización - Desde 60€ - 3h",
      "Tratamiento Células Madre - Desde 35€ - 1h 30min",
      "Tintes/Baños de Color - Precio estándar - 2h",
      "Keratina (Alisado) - Desde 150€ - 4h 30min",
      "Botox Capilar - Desde 80€ - 4h 30min",
      "Reconstrucción (Radiante Glock) - Desde 50€ - 4h"
    ],
    about_salon: "Peluquería Reyna - Tu belleza es nuestra pasión.",
    whatsapp_webhook_url: "",
    timezone: "Europe/Madrid",
    google_maps_url: ""
  });

  const [newService, setNewService] = useState("");

  // Load settings from database
  useEffect(() => {
    if (salonSettings) {
      setSettings({
        salon_name: salonSettings.salon_name,
        salon_address: salonSettings.salon_address,
        salon_phone: salonSettings.salon_phone || "",
        salon_email: salonSettings.salon_email || "",
        working_hours: salonSettings.working_hours,
        services: salonSettings.services,
        about_salon: salonSettings.about_salon,
        whatsapp_webhook_url: salonSettings.whatsapp_webhook_url || "",
        timezone: salonSettings.timezone,
        google_maps_url: salonSettings.google_maps_url
      });
    }
  }, [salonSettings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        salon_name: settings.salon_name,
        salon_address: settings.salon_address,
        salon_phone: settings.salon_phone || null,
        salon_email: settings.salon_email || null,
        working_hours: settings.working_hours,
        services: settings.services,
        about_salon: settings.about_salon,
        whatsapp_webhook_url: settings.whatsapp_webhook_url || null,
        timezone: settings.timezone,
        google_maps_url: settings.google_maps_url
      });

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
    }
  };

  const addService = () => {
    if (newService.trim()) {
      setSettings({
        ...settings,
        services: [...settings.services, newService.trim()]
      });
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setSettings({
      ...settings,
      services: settings.services.filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] lg:h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-primary mb-2">Configuración</h2>
          <p className="text-muted-foreground">Personaliza la información de tu peluquería y las opciones de Juliana IA</p>
        </div>

        <div className="space-y-8">
          {/* Información General */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="font-serif text-xl text-primary mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información General
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salonName">Nombre de la peluquería</Label>
                <Input
                  id="salonName"
                  value={settings.salon_name}
                  onChange={(e) => setSettings({ ...settings, salon_name: e.target.value })}
                  className="bg-muted border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salonPhone">Teléfono</Label>
                <Input
                  id="salonPhone"
                  value={settings.salon_phone}
                  onChange={(e) => setSettings({ ...settings, salon_phone: e.target.value })}
                  className="bg-muted border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="salonAddress" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Dirección
                </Label>
                <Input
                  id="salonAddress"
                  value={settings.salon_address}
                  onChange={(e) => setSettings({ ...settings, salon_address: e.target.value })}
                  className="bg-muted border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salonEmail">Email</Label>
                <Input
                  id="salonEmail"
                  type="email"
                  value={settings.salon_email}
                  onChange={(e) => setSettings({ ...settings, salon_email: e.target.value })}
                  className="bg-muted border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleMapsUrl" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  URL de Google Maps
                </Label>
                <Input
                  id="googleMapsUrl"
                  value={settings.google_maps_url}
                  onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                  className="bg-muted border-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </motion.section>

          {/* Horarios */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="font-serif text-xl text-primary mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horarios
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Martes a Sábado</Label>
                <Input
                  value={settings.working_hours.tuesday_saturday}
                  onChange={(e) => setSettings({
                    ...settings,
                    working_hours: { ...settings.working_hours, tuesday_saturday: e.target.value }
                  })}
                  className="bg-muted border-primary/20 focus:border-primary"
                  placeholder="10:00-14:00, 16:00-20:00"
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de comida (cerrado)</Label>
                <Input
                  value={settings.working_hours.lunch_break}
                  onChange={(e) => setSettings({
                    ...settings,
                    working_hours: { ...settings.working_hours, lunch_break: e.target.value }
                  })}
                  className="bg-muted border-primary/20 focus:border-primary"
                  placeholder="14:00-16:00"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  Zona horaria
                </Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                >
                  <SelectTrigger className="bg-muted border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20">
                    <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.section>

          {/* Servicios */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="font-serif text-xl text-primary mb-6 flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Servicios
            </h3>
            <div className="space-y-4">
              {settings.services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg group"
                >
                  <span className="flex-1 text-foreground">{service}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeService(index)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Nuevo servicio - Precio - Duración"
                  className="bg-muted border-primary/20 focus:border-primary"
                  onKeyPress={(e) => e.key === "Enter" && addService()}
                />
                <Button
                  onClick={addService}
                  className="btn-gold px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Webhook */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="font-serif text-xl text-primary mb-6 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Integración WhatsApp
            </h3>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL del Webhook (Twilio)</Label>
              <Input
                id="webhookUrl"
                value={settings.whatsapp_webhook_url}
                onChange={(e) => setSettings({ ...settings, whatsapp_webhook_url: e.target.value })}
                placeholder="https://tu-proyecto.supabase.co/functions/v1/whatsapp-webhook"
                className="bg-muted border-primary/20 focus:border-primary font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Esta URL se configurará automáticamente cuando se active la integración con WhatsApp.
              </p>
            </div>
          </motion.section>

          {/* Descripción */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="font-serif text-xl text-primary mb-6">Acerca de la Peluquería</h3>
            <Textarea
              value={settings.about_salon}
              onChange={(e) => setSettings({ ...settings, about_salon: e.target.value })}
              rows={4}
              className="bg-muted border-primary/20 focus:border-primary resize-none"
              placeholder="Describe tu peluquería..."
            />
          </motion.section>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end pb-8"
          >
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="btn-gold px-8 py-6 text-lg rounded-xl"
            >
              {updateSettings.isPending ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default SettingsTab;
