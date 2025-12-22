
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://eajpjrcmuoalfcvfrvgk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhanBqcmNtdW9hbGZjdmZydmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDA3MDAsImV4cCI6MjA4MTcxNjcwMH0.MyHhHyoeHAuBvlXuexvn9KmVQU1Z6hXKnFdgBmxpE2w";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('phone_number', '+34631820884');

    if (error) {
        console.log("ERROR:", error);
    } else {
        console.log("DATA:", JSON.stringify(data, null, 2));
    }
}

run();
