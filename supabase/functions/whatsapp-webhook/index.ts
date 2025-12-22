
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    console.log("Petición recibida en el webhook")

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const formData = await req.formData()
        const from = formData.get('From') // Teléfono del cliente
        const body = formData.get('Body') // Mensaje del cliente

        console.log(`Datos extraídos - From: ${from}, Body: ${body}`)

        if (!from || !body) {
            throw new Error("Faltan datos en la petición (From o Body)")
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log("Guardando mensaje del cliente en DB...")
        // 1. Guardar mensaje del cliente
        const { error: insertError } = await supabase.from('messages').insert({
            phone_number: from.toString(),
            message_content: body.toString(),
            sender: 'client',
            read: false
        })

        if (insertError) {
            console.error("Error al insertar mensaje del cliente:", insertError)
            throw insertError
        }

        console.log("Obteniendo configuración del salón...")
        // 2. Obtener configuración del salón para el contexto de la IA
        const { data: settings, error: settingsError } = await supabase
            .from('salon_settings')
            .select('*')
            .eq('id', 1)
            .single()

        if (settingsError) {
            console.error("Error al obtener configuración:", settingsError)
            // No lanzamos error aquí, usamos un contexto por defecto
        }

        const salonContext = `
      Eres LucIA, la asistente virtual de la Peluquería Reyna.
      Información del salón:
      - Dirección: ${settings?.salon_address ?? 'Alicante'}
      - Horario: ${JSON.stringify(settings?.working_hours ?? {})}
      - Servicios: ${settings?.services?.join(', ') ?? 'Varios'}
      - Sobre nosotros: ${settings?.about_salon ?? 'Tu belleza es nuestra pasión'}
      
      Instrucciones importantes:
      - Sé amable, profesional y usa emojis.
      - Ayuda a los clientes a agendar citas.
      - Responde de forma concisa.
      - SIEMPRE que hables de precios de servicios técnicos (keratina, tintes, tratamientos, etc.), aclara que el precio es "desde" y que puede variar dependiendo del largo y la densidad del cabello.
    `

        console.log("Llamando a OpenAI...")
        // 3. Llamar a OpenAI para generar respuesta
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: salonContext },
                    { role: 'user', content: body.toString() }
                ],
            }),
        })

        const aiData = await openAIResponse.json()
        console.log("Respuesta de OpenAI recibida")

        if (aiData.error) {
            console.error("Error de OpenAI:", aiData.error)
            throw new Error(`OpenAI Error: ${aiData.error.message}`)
        }

        const aiText = aiData.choices[0].message.content

        console.log("Guardando respuesta de LucIA en DB...")
        // 4. Guardar respuesta de LucIA
        await supabase.from('messages').insert({
            phone_number: from.toString(),
            message_content: aiText,
            sender: 'assistant',
            read: true
        })

        console.log("Enviando TwiML de respuesta...")
        // 5. Responder a Twilio (formato TwiML) - DEBE empezar sin espacios
        const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${aiText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message></Response>`

        return new Response(twiml, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/xml'
            },
        })

    } catch (error) {
        console.error('Error FATAL en el webhook:', error)
        // Respondemos con un mensaje de error a Twilio - DEBE empezar sin espacios
        const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Lo siento, LucIA está teniendo problemas técnicos. Por favor, intenta más tarde.</Message></Response>`

        return new Response(errorTwiml, {
            headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
        })
    }
})
