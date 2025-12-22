
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function deleteClients() {
    try {
        const env = fs.readFileSync('.env', 'utf8');
        const urlMatch = env.match(/VITE_SUPABASE_URL=["']?(.*?)["']?(\r?\n|$)/);
        const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=["']?(.*?)["']?(\r?\n|$)/);

        if (!urlMatch || !keyMatch) {
            console.error("Could not find Supabase URL or Key in .env");
            return;
        }

        const supabaseUrl = urlMatch[1].trim();
        const supabaseKey = keyMatch[1].trim();
        const supabase = createClient(supabaseUrl, supabaseKey);

        const namesToDelete = ['Carmen López', 'Laura Martínez', 'María García'];

        console.log("Deleting appointments for:", namesToDelete);

        const { data, error } = await supabase
            .from('appointments')
            .delete()
            .in('client_name', namesToDelete)
            .select();

        if (error) {
            console.error("Error deleting:", error);
        } else {
            console.log("Deleted records:", data);
        }

    } catch (err) {
        console.error("Script error:", err);
    }
}

deleteClients();
