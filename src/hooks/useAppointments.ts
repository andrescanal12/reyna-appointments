import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Appointment {
  id: string;
  phone_number: string;
  client_name: string;
  appointment_date: string;
  service_type: string;
  status: "pending" | "confirmed" | "cancelled";
  reminder_sent: boolean;
  notes: string | null;
  created_at: string;
}

export function useAppointments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// Helper function to get appointment stats
export function useAppointmentStats() {
  const { data: appointments } = useAppointments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const stats = {
    todayCount: 0,
    pendingCount: 0,
    confirmedCount: 0,
    cancelledCount: 0,
  };

  if (appointments) {
    appointments.forEach((apt) => {
      const aptDate = new Date(apt.appointment_date);
      
      if (aptDate >= today && aptDate < tomorrow) {
        stats.todayCount++;
      }
      
      if (apt.status === "pending") stats.pendingCount++;
      if (apt.status === "confirmed") stats.confirmedCount++;
      if (apt.status === "cancelled") stats.cancelledCount++;
    });
  }

  return stats;
}
