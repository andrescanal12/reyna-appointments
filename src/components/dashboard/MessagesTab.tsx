import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Phone, Clock, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    phone: "+34612345678",
    name: "María García",
    lastMessage: "Perfecto, te espero mañana a las 10:00 para tu tratamiento de keratina.",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 0,
    sender: "assistant"
  },
  {
    id: "2",
    phone: "+34687654321",
    name: "Carmen López",
    lastMessage: "Hola, quisiera reservar una cita para corte y peinado",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 2,
    sender: "client"
  },
  {
    id: "3",
    phone: "+34698765432",
    name: "Ana Martínez",
    lastMessage: "¿Tenéis disponibilidad para el sábado?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    sender: "client"
  },
  {
    id: "4",
    phone: "+34654321987",
    name: "Laura Fernández",
    lastMessage: "Gracias por el recordatorio, allí estaré!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unreadCount: 0,
    sender: "client"
  }
];

const mockMessages = [
  {
    id: "1",
    content: "Hola, buenos días! Me gustaría reservar una cita",
    sender: "client",
    timestamp: new Date(Date.now() - 1000 * 60 * 60)
  },
  {
    id: "2",
    content: "¡Hola! Bienvenida a Peluquería Reyna. Soy Juliana, tu asistente virtual. Estaré encantada de ayudarte a reservar tu cita. ¿Qué servicio te interesa?\n\n• Corte/Peinado - 45 min\n\n• Tratamiento de Cauterización - Desde 60€ - 3h\n\n• Tratamiento Células Madre - Desde 35€ - 1h 30min\n\n• Tintes/Baños de Color - Precio estándar - 2h\n\n• Keratina (Alisado) - Desde 150€ - 4h 30min\n\n• Botox Capilar - Desde 80€ - 4h 30min\n\n• Reconstrucción (Radiante Glock) - Desde 50€ - 4h",
    sender: "assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 55)
  },
  {
    id: "3",
    content: "Me interesa el tratamiento de keratina",
    sender: "client",
    timestamp: new Date(Date.now() - 1000 * 60 * 50)
  },
  {
    id: "4",
    content: "Excelente elección. El tratamiento de Keratina (Alisado) tiene una duración de aproximadamente 4h 30min y un precio desde 150€.\n\n¿Para qué día te gustaría agendar tu cita?",
    sender: "assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 45)
  },
  {
    id: "5",
    content: "¿Tenéis disponibilidad para mañana por la mañana?",
    sender: "client",
    timestamp: new Date(Date.now() - 1000 * 60 * 40)
  },
  {
    id: "6",
    content: "Déjame verificar la disponibilidad para mañana... ✨\n\nTenemos disponibilidad mañana a las 10:00. ¿Te viene bien esa hora?\n\nPara confirmar la cita, necesito tu nombre completo, por favor.",
    sender: "assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 35)
  },
  {
    id: "7",
    content: "Sí, perfecto! Me llamo María García",
    sender: "client",
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: "8",
    content: "Perfecto, te espero mañana a las 10:00 para tu tratamiento de keratina.\n\n📋 **Confirmación de Cita**\n• Nombre: María García\n• Servicio: Keratina (Alisado)\n• Fecha: Mañana, 10:00\n• Duración estimada: 4h 30min\n\n📍 Dirección: C. Alcalde Suárez Llanos, 19, 03012 Alicante\n\n¡Te esperamos! 💇‍♀️✨",
    sender: "assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  }
];

const MessagesTab = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.phone.includes(searchQuery)
  );

  const selectedConversation = mockConversations.find((c) => c.id === selectedChat);

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex">
      {/* Chat List */}
      <div className="w-full lg:w-96 border-r border-primary/10 flex flex-col bg-reyna-charcoal">
        {/* Header */}
        <div className="p-4 border-b border-primary/10">
          <h2 className="font-serif text-2xl text-primary mb-4">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <motion.button
                key={conversation.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedChat(conversation.id)}
                className={`w-full p-4 rounded-xl mb-2 text-left transition-all duration-200 ${
                  selectedChat === conversation.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {conversation.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground truncate">
                        {conversation.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(conversation.lastMessageTime, "HH:mm", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {conversation.sender === "assistant" && (
                        <CheckCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mt-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="hidden lg:flex flex-1 flex-col bg-background">
        {selectedChat && selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-primary/10 bg-reyna-charcoal flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {selectedConversation.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{selectedConversation.phone}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-3xl mx-auto">
                {mockMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.sender === "client" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 ${
                        message.sender === "client"
                          ? "chat-bubble-client"
                          : "chat-bubble-assistant"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className={`flex items-center gap-1 mt-2 ${
                        message.sender === "client" ? "justify-end" : "justify-start"
                      }`}>
                        <Clock className="w-3 h-3 opacity-60" />
                        <span className="text-xs opacity-60">
                          {format(message.timestamp, "HH:mm", { locale: es })}
                        </span>
                        {message.sender === "assistant" && (
                          <CheckCheck className="w-3 h-3 opacity-60 ml-1" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area (Read-only for now) */}
            <div className="p-4 border-t border-primary/10 bg-reyna-charcoal">
              <div className="flex items-center gap-2 text-muted-foreground text-sm justify-center py-2">
                <span>Los mensajes se gestionan automáticamente por Juliana IA vía WhatsApp</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Selecciona una conversación para ver los mensajes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
