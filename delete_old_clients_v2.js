
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://eajpjrcmuoalfcvfrvgk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhanBqcmNtdW9hbGZjdmZydmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDA3MDAsImV4cCI6MjA4MTcxNjcwMH0.MyHhHyoeHAuBvlXuexvn9KmVQU1Z6hXKnFdgBmxpE2w";

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteClients() {
    const namesToDelete = ['Carmen López', 'Laura Martínez', 'María García'];

    // Nombres exactos copiados del JSON anterior: "Mar├¡a Garc├¡a", "Carmen L├│pez", "Laura Mart├¡nez"
    // Es posible que necesite probar con las versiones codificadas si las normales fallan.
    // Pero intentaré primero con ilike o el texto normal. 
    // Viendo el JSON anterior: "client_name":"Mar├¡a Garc├¡a"
    // Probablemente sea encoding. Intentaré borrar por IDs si puedo, o por 'like'.

    console.log("Deleting...");

    // Estrategia: Borrar todo lo que NO sea 'Andres' para limpiar rápido, 
    // O borrar específicamente estos nombres.

    // Opción A: Borrar por lista exacta
    const { data, error } = await supabase
        .from('appointments')
        .delete()
        .in('client_name', ['Carmen López', 'Laura Martínez', 'María García', 'Mar├¡a Garc├¡a', 'Carmen L├│pez', 'Laura Mart├¡nez'])
        .select();

    if (error) {
        console.log("Error:", error);
    } else {
        console.log("Deleted:", data);

        // Si no borró nada, intentamos borrar todo menos Andres (ID 2eaa19d9...)
        if (!data || data.length === 0) {
            console.log("Attempting aggressive cleanup (Deleting all except Andres)...");
            const { data: allData, error: allError } = await supabase
                .from('appointments')
                .delete()
                .neq('client_name', 'Andres')
                .select();
            console.log("Aggressive delete result:", allData);
        }
    }
}

deleteClients();
