import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Message {
  id: string;
  phone_number: string;
  message_content: string;
  sender: "client" | "assistant";
  received_at: string;
  read: boolean;
}

export interface Conversation {
  phone_number: string;
  name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  sender: "client" | "assistant";
}

// Get all unique conversations with their last message
export function useConversations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      // 1. Recuperar todos los mensajes
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .order("received_at", { ascending: false });

      if (messagesError) throw messagesError;

      // 2. Recuperar todos los clientes conocidos para mapear nombres
      // Usamos cast a any porque los tipos autogenerados no conocen la tabla 'clients' todavía
      const { data: clientsData, error: clientsError } = await (supabase as any)
        .from("clients")
        .select("phone_number, full_name");

      if (clientsError) {
        console.error("Error al recuperar clientes:", clientsError);
      }

      // Crear un mapa de teléfono -> nombre
      const clientNamesMap = new Map<string, string>();
      if (clientsData) {
        clientsData.forEach((c: any) => clientNamesMap.set(c.phone_number, c.full_name));
      }

      // 3. Agrupar mensajes por número de teléfono
      const conversationsMap = new Map<string, Conversation>();

      messagesData?.forEach((msg) => {
        if (!conversationsMap.has(msg.phone_number)) {
          const unreadCount = messagesData.filter(
            (m) => m.phone_number === msg.phone_number && !m.read && m.sender === "client"
          ).length;

          const clientName = clientNamesMap.get(msg.phone_number) || `Cliente ${msg.phone_number.slice(-4)}`;

          conversationsMap.set(msg.phone_number, {
            phone_number: msg.phone_number,
            name: clientName,
            last_message: msg.message_content,
            last_message_time: msg.received_at,
            unread_count: unreadCount,
            sender: msg.sender as "client" | "assistant"
          });
        }
      });

      return Array.from(conversationsMap.values());
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// Get messages for a specific phone number
export function useMessages(phoneNumber: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", phoneNumber],
    queryFn: async () => {
      if (!phoneNumber) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("phone_number", phoneNumber)
        .order("received_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!phoneNumber,
  });

  // Set up realtime subscription for specific phone number
  useEffect(() => {
    if (!phoneNumber) return;

    const channel = supabase
      .channel(`messages-${phoneNumber}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `phone_number=eq.${phoneNumber}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", phoneNumber] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [phoneNumber, queryClient]);

  return query;
}

// Mark messages as read
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("phone_number", phoneNumber)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
