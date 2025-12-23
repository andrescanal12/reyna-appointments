
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBotEnabledColumn() {
    console.log("Checking if bot_enabled column exists...");

    // We try to fetch the column to see if it exists
    const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: `
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='clients' AND column_name='bot_enabled'
                ) THEN
                    ALTER TABLE public.clients ADD COLUMN bot_enabled BOOLEAN DEFAULT TRUE;
                END IF;
            END $$;
        `
    });

    if (error) {
        // Most likely execute_sql RPC doesn't exist. Let's try another way or just report.
        console.error("Error adding column (RPC might not exist):", error.message);
        console.log("Attempting direct SQL execution via REST API is not supported. Please ensure the column is added.");
    } else {
        console.log("Column added or already exists.");
    }
}

addBotEnabledColumn();
