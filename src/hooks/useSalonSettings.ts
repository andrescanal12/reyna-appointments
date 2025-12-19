import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface WorkingHours {
  tuesday_saturday: string;
  lunch_break: string;
  closed: string[];
}

export interface SalonSettings {
  id: number;
  salon_name: string;
  salon_address: string;
  salon_phone: string | null;
  salon_email: string | null;
  working_hours: WorkingHours;
  services: string[];
  about_salon: string;
  whatsapp_webhook_url: string | null;
  timezone: string;
  google_maps_url: string;
  created_at: string;
  updated_at: string;
}

export function useSalonSettings() {
  return useQuery({
    queryKey: ["salon-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Return default settings if none exist
        return {
          id: 1,
          salon_name: "Peluquería Reyna",
          salon_address: "C. Alcalde Suárez Llanos, 19, 03012 Alicante",
          salon_phone: null,
          salon_email: null,
          working_hours: {
            tuesday_saturday: "10:00-14:00, 16:00-20:00",
            lunch_break: "14:00-16:00",
            closed: ["sunday", "monday"]
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
          about_salon: "Peluquería Reyna - Tu belleza es nuestra pasión",
          whatsapp_webhook_url: null,
          timezone: "Europe/Madrid",
          google_maps_url: "https://www.google.es/maps/place/Sal%C3%B3n+de+Belleza+Reina",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as SalonSettings;
      }
      
      return {
        ...data,
        working_hours: data.working_hours as unknown as WorkingHours,
        services: data.services || []
      } as SalonSettings;
    },
  });
}

export function useUpdateSalonSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<Omit<SalonSettings, "id" | "created_at" | "updated_at">>) => {
      const updateData: Record<string, unknown> = { ...settings };
      
      // Convert working_hours to Json type if present
      if (settings.working_hours) {
        updateData.working_hours = settings.working_hours as unknown as Json;
      }

      const { error } = await supabase
        .from("salon_settings")
        .upsert({
          id: 1,
          ...updateData
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-settings"] });
    },
  });
}
