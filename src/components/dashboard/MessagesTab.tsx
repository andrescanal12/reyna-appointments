import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Phone, Clock, CheckCheck, MessageCircle, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useConversations, useMessages, useMarkMessagesAsRead, type Conversation, type Message } from "@/hooks/useMessages";
import { useUpdateClientName } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";


interface MessagesTabProps {
  initialSelectedChat?: string | null;
}

const MessagesTab = ({ initialSelectedChat }: MessagesTabProps) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(initialSelectedChat || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedChat);
  const markAsRead = useMarkMessagesAsRead();
  const updateClientName = useUpdateClientName();

  const filteredConversations = conversations?.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.phone_number.includes(searchQuery)
  ) || [];

  const selectedConversation = conversations?.find((c) => c.phone_number === selectedChat);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when selecting a chat
  useEffect(() => {
    if (selectedChat) {
      markAsRead.mutate(selectedChat);
    }
  }, [selectedChat]);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedChat) {
      setSelectedChat(conversations[0].phone_number);
    }
  }, [conversations, selectedChat]);

  if (conversationsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay conversaciones</p>
                <p className="text-sm mt-2">Los mensajes de WhatsApp aparecerán aquí</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <motion.button
                  key={conversation.phone_number}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedChat(conversation.phone_number)}
                  className={`w-full p-4 rounded-xl mb-2 text-left transition-all duration-200 ${selectedChat === conversation.phone_number
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {conversation.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground truncate">
                          {conversation.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {format(new Date(conversation.last_message_time), "HH:mm", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {conversation.sender === "assistant" && (
                          <CheckCheck className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mt-1">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="hidden lg:flex flex-1 flex-col bg-background">
        {selectedChat && selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-primary/10 bg-reyna-charcoal flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {selectedConversation.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {selectedConversation.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{selectedConversation.phone_number}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Bot toggle removed - will be added when bot_enabled column exists */}


                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => {
                        setNewClientName(selectedConversation.name.startsWith("Cliente ") ? "" : selectedConversation.name);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-reyna-charcoal border-primary/20 text-foreground">
                    <DialogHeader>
                      <DialogTitle className="text-primary font-serif">Editar nombre del cliente</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <label className="text-sm text-muted-foreground mb-2 block">Nombre completo</label>
                      <Input
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="Ej: Andres Canal"
                        className="bg-muted border-primary/20 focus:border-primary"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button
                        onClick={async () => {
                          if (newClientName.trim()) {
                            try {
                              await updateClientName.mutateAsync({
                                phoneNumber: selectedConversation.phone_number,
                                fullName: newClientName.trim()
                              });
                              setIsDialogOpen(false);
                              toast({ title: "Nombre actualizado", description: "El nombre del cliente ha sido guardado exitosamente." });
                            } catch (e: any) {
                              toast({ title: "Error", description: e?.message || "No se pudo actualizar el nombre.", variant: "destructive" });
                            }
                          }
                        }}
                      >
                        Guardar cambios
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex ${message.sender === "client" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 ${message.sender === "client"
                          ? "chat-bubble-client"
                          : "chat-bubble-assistant"
                          }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.message_content}
                        </p>
                        <div className={`flex items-center gap-1 mt-2 ${message.sender === "client" ? "justify-end" : "justify-start"
                          }`}>
                          <Clock className="w-3 h-3 opacity-60" />
                          <span className="text-xs opacity-60">
                            {format(new Date(message.received_at), "HH:mm", { locale: es })}
                          </span>
                          {message.sender === "assistant" && (
                            <CheckCheck className="w-3 h-3 opacity-60 ml-1" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No hay mensajes en esta conversación</p>
                </div>
              )}
            </ScrollArea>

            {/* Input Area (Read-only for now) */}
            <div className="p-4 border-t border-primary/10 bg-reyna-charcoal">
              <div className="flex items-center gap-2 text-muted-foreground text-sm justify-center py-2">
                <span>Los mensajes se gestionan automáticamente por LucIA vía WhatsApp</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Selecciona una conversación para ver los mensajes</p>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default MessagesTab;
