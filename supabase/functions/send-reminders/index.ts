
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Hora actual en Madrid
        const now = new Date();
        // Buscamos citas entre 55 y 65 minutos en el futuro (para dar margen y que corra el cron cada 10-15 min)
        const lowerBuffer = new Date(now.getTime() + 55 * 60000);
        const upperBuffer = new Date(now.getTime() + 65 * 60000); // 1h 05min

        console.log(`Checking appointments between ${lowerBuffer.toISOString()} and ${upperBuffer.toISOString()}`);

        const { data: appointments, error } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('status', 'confirmed')
            .eq('reminder_sent', false)
            .gte('appointment_date', lowerBuffer.toISOString())
            .lte('appointment_date', upperBuffer.toISOString())

        if (error) throw error;

        console.log(`Found ${appointments?.length || 0} appointments to remind.`);

        const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
        const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
        const twilioPhone = 'whatsapp:+14155238886' // Sandbox

        if (!appointments || appointments.length === 0) {
            return new Response(JSON.stringify({ message: "No reminders needed" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const results = [];

        for (const appt of appointments) {
            const dateObj = new Date(appt.appointment_date);
            const timeString = dateObj.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });

            const message = `Hola ${appt.client_name}, te recordamos tu cita para *${appt.service_type}* hoy a las *${timeString}*. ¿Nos confirmas tu asistencia? 💇‍♀️`;

            // Send WhatsApp via Twilio
            const resp = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        From: twilioPhone,
                        To: appt.phone_number,
                        Body: message
                    })
                }
            );

            if (resp.ok) {
                // Mark as sent
                await supabaseClient
                    .from('appointments')
                    .update({ reminder_sent: true })
                    .eq('id', appt.id);
                results.push({ id: appt.id, status: 'sent' });
            } else {
                const text = await resp.text();
                console.error(`Failed to send to ${appt.phone_number}:`, text);
                results.push({ id: appt.id, status: 'failed', error: text });
            }
        }

        return new Response(JSON.stringify({ processed: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
