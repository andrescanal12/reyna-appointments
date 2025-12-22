
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateClientName() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ phoneNumber, fullName }: { phoneNumber: string; fullName: string }) => {
            const { error } = await (supabase as any)
                .from("clients")
                .upsert({
                    phone_number: phoneNumber,
                    full_name: fullName
                }, {
                    onConflict: 'phone_number'
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}
