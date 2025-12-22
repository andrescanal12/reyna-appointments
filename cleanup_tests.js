
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function cleanup() {
    console.log("Iniciando limpieza de chats de prueba...");

    // 1. Obtener todos los teléfonos que tienen mensajes
    const { data: messages } = await supabase.from('messages').select('phone_number');
    const allPhones = [...new Set(messages.map(m => m.phone_number))];

    // 2. Obtener teléfonos de clientes reales (con nombre)
    const { data: clients } = await supabase.from('clients').select('phone_number');
    const realPhones = new Set(clients.map(c => c.phone_number));

    // 3. Identificar teléfonos de prueba (con mensajes pero sin perfil de cliente)
    const testPhones = allPhones.filter(p => !realPhones.has(p));

    console.log(`Teléfonos de prueba encontrados: ${testPhones.length}`);

    if (testPhones.length > 0) {
        for (const phone of testPhones) {
            console.log(`Eliminando mensajes del teléfono: ${phone}`);
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('phone_number', phone);

            if (error) console.error(`Error eliminando ${phone}:`, error);
        }
        console.log("Limpieza completada.");
    } else {
        console.log("No se encontraron chats de prueba sin nombre.");
    }
}

cleanup();
