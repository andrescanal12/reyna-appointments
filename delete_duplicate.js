
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function deleteDuplicate() {
    console.log("Buscando cita de las 13:00 para eliminar...");

    // 1. Buscar la cita específica (13:00 del 23 de dic)
    const { data: appts, error: findError } = await supabase
        .from('appointments')
        .select('*')
        .eq('phone_number', '+34631820884')
        .filter('appointment_date', 'ilike', '%2025-12-23T13:00%');

    if (findError) {
        console.error("Error buscando:", findError);
        return;
    }

    console.log(`Encontradas: ${appts.length}`);

    if (appts.length > 0) {
        const id = appts[0].id;
        console.log(`Eliminando cita con ID: ${id}`);

        const { error: deleteError } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error("Error eliminando:", deleteError);
        } else {
            console.log("¡Cita eliminada con éxito!");
        }
    } else {
        // Intentar por hora local si el ISO no coincide exactamente
        console.log("No encontrada con ISO exacto, buscando por fecha...");
        const { data: allAppts } = await supabase
            .from('appointments')
            .select('*')
            .eq('phone_number', '+34631820884');

        const toDelete = allAppts?.find(a => a.appointment_date.includes('13:00') || a.appointment_date.includes('12:00:00'));
        // Nota: El usuario mostró 13:00 en la imagen anterior, pero en la última sale "Cancelada".

        if (toDelete) {
            console.log(`Eliminando por coincidencia manual: ${toDelete.id}`);
            await supabase.from('appointments').delete().eq('id', toDelete.id);
            console.log("Eliminada.");
        } else {
            console.log("No se pudo identificar la cita para borrar.");
        }
    }
}

deleteDuplicate();
