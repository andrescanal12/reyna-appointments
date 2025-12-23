import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  MessageCircle,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MessagesTab from "@/components/dashboard/MessagesTab";
import AppointmentsTab from "@/components/dashboard/AppointmentsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";

type Tab = "messages" | "appointments" | "settings";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("messages");
  const [selectedConversationPhone, setSelectedConversationPhone] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  const tabs = [
    { id: "messages" as Tab, label: "Mensajes", icon: MessageCircle },
    { id: "appointments" as Tab, label: "Citas", icon: Calendar },
    { id: "settings" as Tab, label: "Configuración", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleViewChat = (phoneNumber: string) => {
    setSelectedConversationPhone(phoneNumber);
    setActiveTab("messages");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="hidden lg:flex flex-col bg-reyna-charcoal border-r border-primary/10 relative z-20"
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary/10 bg-reyna-black/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden flex-shrink-0 shadow-gold-glow">
              <img
                src="/logo-reyna.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-serif text-xl text-primary whitespace-nowrap">
                    LucIA
                  </h1>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    Peluquería Reyna
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Welcome Message */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-4 border-b border-primary/10 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4 shadow-gold-glow" />
                <span className="font-medium capitalize">¡Hola, {userName}!</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tu asistente LucIA está lista
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-primary/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-reyna-charcoal border-b border-primary/10 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden shadow-gold-glow">
            <img
              src="/logo-reyna.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif text-xl text-primary font-bold">Peluquería Reyna</h1>
            <p className="text-xs text-muted-foreground capitalize">¡Hola, {userName}!</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-foreground"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-20 pt-16"
          >
            <div className="p-4 border-b border-primary/10 mx-4 mb-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium text-lg">¡Bienvenida, Ana!</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Tu asistente LucIA está lista para ayudarte
              </p>
            </div>
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 ${activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <tab.icon className="w-6 h-6" />
                  <span className="text-lg">{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-lg">Cerrar Sesión</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:pt-0 pt-16 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === "messages" && <MessagesTab initialSelectedChat={selectedConversationPhone} />}
            {activeTab === "appointments" && <AppointmentsTab onViewChat={handleViewChat} />}
            {activeTab === "settings" && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
