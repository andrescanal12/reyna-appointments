import { motion } from "framer-motion";
import { Crown, MessageCircle, Calendar, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: MessageCircle,
      title: "Atención 24/7",
      description: "Juliana responde automáticamente a tus clientes en WhatsApp, incluso fuera del horario comercial"
    },
    {
      icon: Calendar,
      title: "Gestión Automática",
      description: "Agenda, confirma y envía recordatorios de citas sin intervención manual"
    },
    {
      icon: Sparkles,
      title: "Experiencia Premium",
      description: "Interfaz elegante y profesional que refleja la calidad de tu peluquería"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-gold-radial opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo Crown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 flex justify-center"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary flex items-center justify-center animate-pulse-gold">
              <Crown className="w-16 h-16 md:w-20 md:h-20 text-primary" />
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "3s" }} />
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 text-gradient-gold"
          >
            Peluquería Reyna
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-4"
          >
            Gestión inteligente de citas con{" "}
            <span className="text-primary font-semibold">Juliana IA</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-muted-foreground mb-12 max-w-2xl mx-auto text-lg"
          >
            Tu asistente virtual 24/7 que gestiona citas por WhatsApp con elegancia y eficiencia
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              className="btn-gold px-8 py-6 text-lg rounded-full group"
            >
              Iniciar Sesión
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => navigate("/register")}
              variant="outline"
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg rounded-full transition-all duration-300"
            >
              Registrarse
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl text-center mb-16 text-primary"
          >
            ¿Por qué Juliana IA?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="glass-card p-8 hover:border-primary/40 transition-all duration-300 hover:shadow-gold group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-4 text-primary">
              Todo en un solo lugar
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Gestiona mensajes, citas y configuración desde un elegante panel de control
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-2 rounded-3xl shadow-gold-lg"
          >
            <div className="bg-reyna-charcoal rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <Crown className="w-20 h-20 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Vista previa del dashboard</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gold-radial opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-6 text-primary">
              Comienza hoy mismo
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Únete a Peluquería Reyna y transforma la manera en que gestionas tus citas
            </p>
            <Button
              onClick={() => navigate("/register")}
              size="lg"
              className="btn-gold px-12 py-6 text-lg rounded-full"
            >
              Crear cuenta gratis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-reyna-charcoal border-t border-primary/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              <span className="font-serif text-xl text-primary">Peluquería Reyna</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 Peluquería Reyna. Powered by Juliana IA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
