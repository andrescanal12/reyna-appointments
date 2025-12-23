
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateClientName() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ phoneNumber, fullName }: { phoneNumber: string; fullName: string }) => {
            console.log('🔄 Updating client name:', { phoneNumber, fullName });

            // First, check if client exists
            const { data: existingClient, error: checkError } = await (supabase as any)
                .from("clients")
                .select("*")
                .eq("phone_number", phoneNumber)
                .single();

            console.log('📊 Check result:', { existingClient, checkError });

            if (existingClient) {
                // Update existing client
                console.log('✏️ Updating existing client...');
                const { error } = await (supabase as any)
                    .from("clients")
                    .update({ full_name: fullName })
                    .eq("phone_number", phoneNumber);

                if (error) {
                    console.error('❌ Update error:', error);
                    throw error;
                }
                console.log('✅ Update successful');
            } else {
                // Insert new client
                console.log('➕ Inserting new client...');
                const { error } = await (supabase as any)
                    .from("clients")
                    .insert({
                        phone_number: phoneNumber,
                        full_name: fullName
                        // bot_enabled removed - column doesn't exist in production yet
                    });

                if (error) {
                    console.error('❌ Insert error:', error);
                    throw error;
                }
                console.log('✅ Insert successful');
            }

            return { phoneNumber, fullName };
        },
        onSuccess: (data) => {
            // Update the cache directly instead of refetching
            queryClient.setQueryData(["conversations"], (old: any) => {
                if (!old) return old;
                return old.map((conv: any) =>
                    conv.phone_number === data.phoneNumber
                        ? { ...conv, name: data.fullName }
                        : conv
                );
            });

            // Force refetch after a short delay to ensure DB update completed
            setTimeout(async () => {
                await queryClient.refetchQueries({ queryKey: ["conversations"] });
                console.log('🔄 Conversations refetched from database');
            }, 500);
        },
    });
}

export function useToggleBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ phoneNumber, botEnabled }: { phoneNumber: string; botEnabled: boolean }) => {
            // First check if the client exists and if bot_enabled column is available
            const { data: existingClient, error: checkError } = await (supabase as any)
                .from("clients")
                .select("*")
                .eq("phone_number", phoneNumber)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                // PGRST116 is "not found", which is fine
                throw new Error(`Error verificando cliente: ${checkError.message}`);
            }

            if (existingClient) {
                // Update existing client
                const { error } = await (supabase as any)
                    .from("clients")
                    .update({ bot_enabled: botEnabled })
                    .eq("phone_number", phoneNumber);

                if (error) {
                    // Check if error is due to missing column
                    if (error.message && error.message.includes('bot_enabled')) {
                        throw new Error('La columna bot_enabled no existe en la base de datos. Por favor añádela desde el dashboard de Supabase.');
                    }
                    throw error;
                }
            } else {
                // Insert new client with bot_enabled
                const { error } = await (supabase as any)
                    .from("clients")
                    .insert({
                        phone_number: phoneNumber,
                        bot_enabled: botEnabled
                    });

                if (error) {
                    if (error.message && error.message.includes('bot_enabled')) {
                        throw new Error('La columna bot_enabled no existe en la base de datos. Por favor añádela desde el dashboard de Supabase.');
                    }
                    throw error;
                }
            }
        },
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: ["conversations"] });
            await queryClient.refetchQueries({ queryKey: ["messages"] });
        },
    });
}
