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

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBotEnabledColumn() {
    console.log("Intentando añadir columna bot_enabled...");

    try {
        // Primero verificar si la columna ya existe
        const { data: columns, error: checkError } = await supabase
            .from('clients')
            .select('*')
            .limit(1);

        if (checkError) {
            console.error("Error al verificar tabla:", checkError);
            return;
        }

        console.log("Estructura actual de clients:", Object.keys(columns[0] || {}));

        // Intentar hacer un update con bot_enabled para ver si existe
        const { error: testError } = await supabase
            .from('clients')
            .update({ bot_enabled: true })
            .eq('phone_number', 'test_number_that_does_not_exist');

        if (testError) {
            console.log("La columna bot_enabled NO existe. Error:", testError.message);
            console.log("\n⚠️ SOLUCIÓN:");
            console.log("1. Ve a https://supabase.com/dashboard");
            console.log("2. Abre tu proyecto");
            console.log("3. Ve a Table Editor → clients");
            console.log("4. Añade columna: bot_enabled (tipo: boolean, default: true)");
        } else {
            console.log("✅ La columna bot_enabled YA existe");
        }
    } catch (e) {
        console.error("Error general:", e);
    }
}

addBotEnabledColumn();
