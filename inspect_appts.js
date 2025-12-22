

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function inspect() {
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

        console.log("Using URL:", supabaseUrl);

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('phone_number', '+34631820884')
            .order('appointment_date', { ascending: true });


        if (error) {
            console.error("Supabase error:", JSON.stringify(error, null, 2));
            return;
        }


        if (!data || data.length === 0) {
            console.log("No appointments found for this number.");
            return;
        }

        console.log("CITAS ENCONTRADAS:");
        data.forEach(a => {
            console.log(`ID: ${a.id} | Date: ${a.appointment_date} | Service: ${a.service_type} | Name: ${a.client_name} | Status: ${a.status}`);
        });
    } catch (err) {
        console.error("Script error:", err);
    }
}

inspect();

