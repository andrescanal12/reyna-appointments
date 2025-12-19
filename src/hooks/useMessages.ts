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
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("received_at", { ascending: false });

      if (error) throw error;

      // Group messages by phone number and get last message
      const conversationsMap = new Map<string, Conversation>();
      
      data?.forEach((msg) => {
        if (!conversationsMap.has(msg.phone_number)) {
          const unreadCount = data.filter(
            (m) => m.phone_number === msg.phone_number && !m.read && m.sender === "client"
          ).length;
          
          conversationsMap.set(msg.phone_number, {
            phone_number: msg.phone_number,
            name: `Cliente ${msg.phone_number.slice(-4)}`,
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
