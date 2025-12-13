import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Login = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const success = login(password);
      if (success) {
        toast({
          title: "Bienvenido",
          description: "Acceso concedido al panel de administración",
        });
        navigate("/admin");
      } else {
        toast({
          title: "Error",
          description: "Contraseña incorrecta",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="glass-card neon-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              <span className="text-foreground">Panel </span>
              <span className="text-gradient">Admin</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Ingresá la contraseña para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/50 border-border focus:border-primary h-12"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full h-12 bg-primary text-primary-foreground font-display font-semibold neon-glow hover:bg-primary/90"
            >
              {isLoading ? "Verificando..." : "Ingresar"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
