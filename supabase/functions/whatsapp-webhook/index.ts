
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SERVICE_DURATIONS: { [key: string]: number } = {
    "Corte/Peinado": 45,
    "Tratamiento de Cauterización": 180,
    "Tratamiento Células Madre": 90,
    "Tintes/Baños de Color": 120,
    "Keratina (Alisado)": 270,
    "Botox Capilar": 270,
    "Reconstrucción (Radiante Glock)": 240
};

function getDuration(serviceName: string): number {
    const key = Object.keys(SERVICE_DURATIONS).find(k => serviceName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(serviceName.toLowerCase()));
    return key ? SERVICE_DURATIONS[key] : 60;
}

const TOOLS = [
    {
        type: "function",
        function: {
            name: "create_appointment",
            description: "Crea una cita NUEVA en la agenda.",
            parameters: {
                type: "object",
                properties: {
                    client_name: { type: "string", description: "Nombre del cliente." },
                    appointment_date: { type: "string", description: "Fecha ISO COMPLETA CON OFFSET (ej: 2025-12-23T19:00:00+01:00). IMPORTANTE: Añade siempre '+01:00' al final." },
                    service_type: { type: "string" },
                    notes: { type: "string" }
                },
                required: ["client_name", "appointment_date", "service_type"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "update_appointment",
            description: "Modifica una cita existente indicando su ID y nueva fecha.",
            parameters: {
                type: "object",
                properties: {
                    appointment_id: { type: "string", description: "El ID (UUID) exacto de la cita a modificar." },
                    new_date: { type: "string", description: "Nueva fecha ISO CON OFFSET. Si es '7 tarde', envía ...T19:00:00+01:00. SIEMPRE añade +01:00." },
                    new_service: { type: "string", description: "Nuevo servicio si cambia." }
                },
                required: ["appointment_id", "new_date"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "cancel_appointment",
            description: "Cancela una cita existente indicando su ID.",
            parameters: {
                type: "object",
                properties: {
                    appointment_id: { type: "string", description: "El ID (UUID) exacto de la cita a cancelar." }
                },
                required: ["appointment_id"]
            }
        }
    }
];

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const formData = await req.formData()
        const from = (formData.get('From')?.toString() || '').replace('whatsapp:', '')
        const body = formData.get('Body')?.toString() || ''

        if (!from || !body) throw new Error("Faltan datos")

        const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')

        // 1. Guardar mensaje
        await supabase.from('messages').insert({ phone_number: from, message_content: body, sender: 'client' })

        // 2. Historial (10 mensajes)
        const { data: history } = await supabase.from('messages').select('message_content, sender').eq('phone_number', from).order('received_at', { ascending: false }).limit(10)
        const previousMessages = history ? history.slice(1).reverse().map((msg: any) => ({
            role: msg.sender === 'client' ? 'user' : 'assistant',
            content: msg.message_content
        })) : []

        // 3. Contexto (Ajustado para Madrid)
        const { data: settings } = await supabase.from('salon_settings').select('*').eq('id', 1).single()
        const { data: appts } = await supabase.from('appointments').select('*').eq('phone_number', from).gte('appointment_date', new Date().toISOString()).order('appointment_date', { ascending: true })

        // --- Bot Enabled Check (DISABLED until bot_enabled column is added to database) ---
        // TODO: Uncomment this after adding bot_enabled column to clients table
        /*
        try {
            const { data: clientData, error } = await supabase.from('clients').select('bot_enabled').eq('phone_number', from).single()
            if (!error && clientData && clientData.bot_enabled === false) {
                console.log(`Bot disabled for ${from}. Skipping response.`)
                return new Response('ok', { headers: corsHeaders })
            }
        } catch (e) {
            console.log('bot_enabled check skipped (column may not exist):', e)
        }
        */
        // --- END ---

        const appointmentsContext = appts && appts.length > 0
            ? appts.map((a: any) => `- ID: ${a.id} | Fecha: ${new Date(a.appointment_date).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} | Servicio: ${a.service_type} | Status: ${a.status}`).join('\n')
            : "No tiene citas próximas."

        const nowMadrid = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

        const salonContext = `
            Eres LucIA, la asistente virtual oficial de la Peluquería Reyna.
            Tu personalidad es amable, profesional y eficiente. Usas emojis ocasionalmente.
            
            IDIOMA:
            - HABLA EXCLUSIVAMENTE EN ESPAÑOL. Aunque el usuario te hable en inglés o chino, responde en ESPAÑOL.
            - Nunca digas "I apologize" ni uses frases en inglés.

            TUS SERVICIOS Y PRECIOS OFICIALES (NO INVENTES NADA FUERA DE ESTO):
            - Corte/Peinado: 45 min
            - Tratamiento de Cauterización: Desde 60€ - 3h
            - Tratamiento Células Madre: Desde 35€ - 1h 30min
            - Tintes/Baños de Color: Precio estándar - 2h
            - Keratina (Alisado): Desde 150€ - 4h 30min
            - Botox Capilar: Desde 80€ - 4h 30min
            - Reconstrucción (Radiante Glock): Desde 50€ - 4h
            *Nota: Si preguntan precio exacto de algo "Desde", explica que depende del largo y volumen.*

            FECHA Y HORA ACTUAL EN ESPAÑA: ${nowMadrid}.
            
            CITAS YA PROGRAMADAS DEL CLIENTE:
            ${appointmentsContext}

            TUS REGLAS DE ORO:
            1. ALCANCE: Solo respondes dudas sobre LA PELUQUERÍA. Si te preguntan de cocina, política o clima, diles amablemente que solo gestionas citas de la peluquería.
            2. REPROGRAMAR: Si piden cambiar fecha/hora de una cita YA existente, usa 'update_appointment' con el ID exacto. NO crees duplicados.
            3. CANCELAR: Si piden cancelar, usa 'cancel_appointment' con el ID exacto.
            4. NUEVAS CITAS - SIGUE ESTE PROCESO EXACTO:
               a. **TOMA LA INICIATIVA**: Cuando pidan disponibilidad, NO esperes a que elijan. VERIFICA las horas libres y OFRÉCELE 3-4 OPCIONES ESPECÍFICAS.
               b. **HORARIO DE COMIDA**: De 14:00 a 15:59 estamos CERRADOS (hora de comer). NUNCA ofrezcas ni agendes citas en ese rango.
               c. Ejemplo de respuesta proactiva: "Para [servicio] tengo disponible: mañana a las 10:00, 12:00, 16:30 o 18:00. ¿Cuál te viene mejor?"
               d. **OBLIGATORIO**: Pide "Nombre completo" al cliente para el registro (NO pidas teléfono).
               e. Confirma servicio y hora elegida.
               f. Solo cuando tengas TODO, llama a 'create_appointment'. En 'client_name' pones el nombre que te dieron.
            5. ZONA HORARIA: España (UTC+1). Si te dicen "a las 5", asume 17:00 salvo que digan "mañana". Al llamar a las herramientas, tus fechas deben terminar SIEMPRE en '+01:00'.
            6. ERRORES DE HERRAMIENTAS - REGLA SUPREMA:
               - Si la herramienta devuelve un texto que empieza por "Error:", SIGNIFICA QUE LA ACCIÓN FALLÓ.
               - EN ESE CASO:
                 a) DILE AL CLIENTE QUE NO SE PUDO AGENDAR.
                 b) Explica la razón exacta del error (ej: "Ya existe una cita a esa hora y tu tratamiento dura X horas, así que se solapan").
                 c) NO uses frases de confirmación como "Listo", "Agendado" o emojis de celebración.
                 d) Pídele que elija otra hora.
               - SOLO si la herramienta devuelve "Éxito...", entonces y SOLO ENTONCES confirmas.
        `

        // 4. OpenAI
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: salonContext }, ...previousMessages, { role: 'user', content: body }],
                tools: TOOLS,
                tool_choice: "auto"
            })
        })

        let aiData = await response.json()
        let message = aiData.choices[0].message

        // 5. Herramientas
        if (message.tool_calls) {
            const toolResponses = []
            for (const toolCall of message.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments)

                if (toolCall.function.name === "create_appointment") {
                    const requestedDate = new Date(args.appointment_date);
                    // Comprobación de horario de comida (14:00 - 15:59 prohibido empezar)
                    const madridHour = parseInt(requestedDate.toLocaleString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false }));

                    if (madridHour >= 14 && madridHour < 16) {
                        toolResponses.push({ role: "tool", tool_call_id: toolCall.id, content: "Error: No se pueden agendar citas entre las 14:00 y las 16:00 (Hora de comida). Por favor pide otra hora." });
                    } else {
                        // 1. Calcular fin de la nueva cita
                        const durationMinutes = getDuration(args.service_type);
                        const requestedEnd = new Date(requestedDate.getTime() + durationMinutes * 60000);

                        // 2. Obtener todas las citas del día (para verificar solapamientos)
                        const startOfDay = new Date(requestedDate); startOfDay.setHours(0, 0, 0, 0);
                        const endOfDay = new Date(requestedDate); endOfDay.setHours(23, 59, 59, 999);

                        const { data: dayAppts } = await supabase.from('appointments')
                            .select('*')
                            .gte('appointment_date', startOfDay.toISOString())
                            .lte('appointment_date', endOfDay.toISOString())
                            .neq('status', 'cancelled');

                        let conflict = false;
                        if (dayAppts) {
                            for (const appt of dayAppts) {
                                const existStart = new Date(appt.appointment_date);
                                const existDuration = getDuration(appt.service_type);
                                const existEnd = new Date(existStart.getTime() + existDuration * 60000);

                                if (requestedDate < existEnd && requestedEnd > existStart) {
                                    conflict = true;
                                    break;
                                }
                            }
                        }

                        if (conflict) {
                            toolResponses.push({ role: "tool", tool_call_id: toolCall.id, content: "Error: Ya existe una cita en ese horario que se solapa dada la duración del servicio. Por favor elige otra hora." });
                        } else {
                            const { error } = await supabase.from('appointments').insert({
                                phone_number: from,
                                client_name: args.client_name,
                                appointment_date: args.appointment_date,
                                service_type: args.service_type,
                                status: 'pending'
                            })
                            toolResponses.push({ role: "tool", tool_call_id: toolCall.id, content: error ? error.message : "Éxito al crear" })
                        }
                    }
                } else if (toolCall.function.name === "update_appointment") {
                    console.log("Updating ID:", args.appointment_id)
                    const { error } = await supabase.from('appointments').update({
                        appointment_date: args.new_date,
                        service_type: args.new_service
                    }).eq('id', args.appointment_id).eq('phone_number', from)

                    toolResponses.push({ role: "tool", tool_call_id: toolCall.id, content: error ? `Error: ${error.message}` : "Cita actualizada correctamente." })
                } else if (toolCall.function.name === "cancel_appointment") {
                    console.log("Cancelling ID:", args.appointment_id)
                    const { error } = await supabase.from('appointments').update({
                        status: 'cancelled'
                    }).eq('id', args.appointment_id).eq('phone_number', from)

                    toolResponses.push({ role: "tool", tool_call_id: toolCall.id, content: error ? `Error: ${error.message}` : "Cita cancelada correctamente." })
                }
            }

            // Confirmación final
            const finalResp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'system', content: salonContext }, ...previousMessages, { role: 'user', content: body }, message, ...toolResponses]
                })
            })
            const finalData = await finalResp.json()
            message = finalData.choices[0].message
        }

        const aiText = message.content || "¡Entendido!"
        await supabase.from('messages').insert({ phone_number: from, message_content: aiText, sender: 'assistant' })

        return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${aiText.replace(/&/g, '&amp;')}</Message></Response>`, {
            headers: { ...corsHeaders, 'Content-Type': 'text/xml' }
        })

    } catch (e) {
        return new Response(`<Response><Message>Error técnico de LucIA.</Message></Response>`, { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } })
    }
})
