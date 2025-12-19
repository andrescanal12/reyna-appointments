-- ============================================
-- DATOS DE DEMOSTRACIÓN - Peluquería Reyna
-- ============================================
-- Este script inserta conversaciones y citas de prueba
-- para demostrar la funcionalidad de la aplicación

-- ============================================
-- 1. CONVERSACIONES DE WHATSAPP
-- ============================================

-- Conversación 1: María García (Cliente nueva pidiendo información)
INSERT INTO public.messages (phone_number, message_content, sender, received_at, read) VALUES
('+34612345678', 'Hola! Me gustaría saber los precios de los tratamientos de keratina', 'client', NOW() - INTERVAL '2 hours', true),
('+34612345678', '¡Hola María! 😊 Encantada de atenderte. Nuestro tratamiento de Keratina (Alisado) tiene un precio desde 150€ y dura aproximadamente 4h 30min. ¿Te gustaría agendar una cita?', 'assistant', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes', true),
('+34612345678', 'Perfecto! Sí, me gustaría agendar para el viernes si es posible', 'client', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes', true),
('+34612345678', 'Claro que sí! Te tengo disponibilidad el viernes 22 de diciembre a las 10:00. ¿Te viene bien ese horario?', 'assistant', NOW() - INTERVAL '2 hours' + INTERVAL '6 minutes', true),
('+34612345678', 'Perfecto, me viene genial! 👍', 'client', NOW() - INTERVAL '2 hours' + INTERVAL '8 minutes', true),
('+34612345678', 'Excelente! Tu cita está confirmada para el viernes 22 de diciembre a las 10:00 para Keratina (Alisado). Te enviaré un recordatorio un día antes. Nos vemos! 💇‍♀️✨', 'assistant', NOW() - INTERVAL '2 hours' + INTERVAL '9 minutes', true);

-- Conversación 2: Carmen López (Cliente regular confirmando cita)
INSERT INTO public.messages (phone_number, message_content, sender, received_at, read) VALUES
('+34623456789', 'Buenos días! Quiero confirmar mi cita de mañana', 'client', NOW() - INTERVAL '1 day', true),
('+34623456789', '¡Buenos días Carmen! 🌟 Sí, tienes tu cita confirmada para mañana 20 de diciembre a las 16:00 para Corte/Peinado. ¿Necesitas cambiar algo?', 'assistant', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes', true),
('+34623456789', 'No, todo perfecto! Nos vemos mañana 😊', 'client', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes', true),
('+34623456789', 'Perfecto! Te esperamos mañana. Que tengas un lindo día! 💕', 'assistant', NOW() - INTERVAL '1 day' + INTERVAL '6 minutes', true);

-- Conversación 3: Laura Martínez (Preguntando por tratamiento de células madre)
INSERT INTO public.messages (phone_number, message_content, sender, received_at, read) VALUES
('+34634567890', 'Hola! Vi en Instagram el tratamiento de células madre. ¿En qué consiste?', 'client', NOW() - INTERVAL '3 hours', true),
('+34634567890', '¡Hola Laura! 😊 El Tratamiento de Células Madre es ideal para regenerar y revitalizar el cabello. Ayuda a reparar el daño, aporta brillo y suavidad. Dura 1h 30min y el precio es desde 35€. ¿Te gustaría probarlo?', 'assistant', NOW() - INTERVAL '3 hours' + INTERVAL '2 minutes', true),
('+34634567890', 'Suena genial! ¿Tienen disponibilidad para esta semana?', 'client', NOW() - INTERVAL '3 hours' + INTERVAL '5 minutes', true),
('+34634567890', 'Sí! Tengo disponibilidad el jueves 21 a las 11:00 o a las 17:00. ¿Cuál prefieres?', 'assistant', NOW() - INTERVAL '3 hours' + INTERVAL '6 minutes', true),
('+34634567890', 'El jueves a las 11:00 me viene perfecto!', 'client', NOW() - INTERVAL '3 hours' + INTERVAL '8 minutes', true),
('+34634567890', 'Perfecto! Cita agendada para el jueves 21 de diciembre a las 11:00 para Tratamiento de Células Madre. Te veo pronto! ✨', 'assistant', NOW() - INTERVAL '3 hours' + INTERVAL '9 minutes', true);

-- Conversación 4: Ana Rodríguez (Consulta sobre horarios)
INSERT INTO public.messages (phone_number, message_content, sender, received_at, read) VALUES
('+34645678901', 'Hola! ¿Qué horario tienen?', 'client', NOW() - INTERVAL '30 minutes', false),
('+34645678901', '¡Hola Ana! 😊 Nuestro horario es de martes a sábado de 10:00 a 14:00 y de 16:00 a 20:00. Cerramos domingos y lunes. ¿En qué puedo ayudarte?', 'assistant', NOW() - INTERVAL '28 minutes', false);

-- Conversación 5: Sofía Torres (Cancelación de cita)
INSERT INTO public.messages (phone_number, message_content, sender, received_at, read) VALUES
('+34656789012', 'Hola, necesito cancelar mi cita del sábado 😔', 'client', NOW() - INTERVAL '4 hours', true),
('+34656789012', 'Hola Sofía! No te preocupes, entiendo que surgen imprevistos. He cancelado tu cita del sábado. ¿Te gustaría reagendar para otra fecha?', 'assistant', NOW() - INTERVAL '4 hours' + INTERVAL '3 minutes', true),
('+34656789012', 'Sí por favor, ¿tienen algo para la próxima semana?', 'client', NOW() - INTERVAL '4 hours' + INTERVAL '6 minutes', true),
('+34656789012', 'Claro! Tengo disponibilidad el martes 26 a las 10:30 o el miércoles 27 a las 16:00. ¿Cuál prefieres?', 'assistant', NOW() - INTERVAL '4 hours' + INTERVAL '7 minutes', true);

-- ============================================
-- 2. CITAS AGENDADAS
-- ============================================

-- Cita 1: María García - Keratina (Confirmada)
INSERT INTO public.appointments (
  phone_number, 
  client_name, 
  appointment_date, 
  service_type, 
  status, 
  reminder_sent, 
  notes
) VALUES (
  '+34612345678',
  'María García',
  (CURRENT_DATE + INTERVAL '3 days') + TIME '10:00:00',
  'Keratina (Alisado) - Desde 150€ - 4h 30min',
  'confirmed',
  false,
  'Primera vez con tratamiento de keratina. Cliente nueva.'
);

-- Cita 2: Carmen López - Corte/Peinado (Confirmada)
INSERT INTO public.appointments (
  phone_number, 
  client_name, 
  appointment_date, 
  service_type, 
  status, 
  reminder_sent, 
  notes
) VALUES (
  '+34623456789',
  'Carmen López',
  (CURRENT_DATE + INTERVAL '1 day') + TIME '16:00:00',
  'Corte/Peinado - 45 min',
  'confirmed',
  true,
  'Cliente regular. Prefiere corte bob.'
);

-- Cita 3: Laura Martínez - Tratamiento Células Madre (Pendiente)
INSERT INTO public.appointments (
  phone_number, 
  client_name, 
  appointment_date, 
  service_type, 
  status, 
  reminder_sent, 
  notes
) VALUES (
  '+34634567890',
  'Laura Martínez',
  (CURRENT_DATE + INTERVAL '2 days') + TIME '11:00:00',
  'Tratamiento Células Madre - Desde 35€ - 1h 30min',
  'pending',
  false,
  'Interesada en regeneración capilar. Vio el servicio en Instagram.'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar mensajes insertados
SELECT 
  phone_number,
  COUNT(*) as total_mensajes,
  MAX(received_at) as ultimo_mensaje
FROM public.messages
GROUP BY phone_number
ORDER BY ultimo_mensaje DESC;

-- Verificar citas insertadas
SELECT 
  client_name,
  appointment_date,
  service_type,
  status
FROM public.appointments
ORDER BY appointment_date;
