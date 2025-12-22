
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan variables de entorno en el archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('--- Diagnóstico de Supabase ---')
  console.log('URL:', supabaseUrl)
  
  // 1. Verificar si podemos leer la tabla salon_settings
  const { data, error } = await supabase
    .from('salon_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.error('Error al leer salon_settings:', error.message)
    console.log('Posible causa: La tabla no existe o las políticas RLS bloquean el acceso anónimo.')
  } else {
    console.log('Lectura de salon_settings exitosa.')
    if (data) {
      console.log('Datos encontrados:', data)
    } else {
      console.log('No se encontraron datos (tabla vacía o sin ID 1).')
    }
  }

  // 2. Verificar estado de autenticación (anónimo en este script)
  const { data: authData } = await supabase.auth.getSession()
  console.log('Sesión actual:', authData.session ? 'Autenticado' : 'Anónimo')
}

checkDatabase()
