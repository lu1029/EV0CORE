import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Atalho: /corrida/ativa redireciona para /corrida com flag para iniciar automático.
// (RunningScreen escuta o sessionStorage flag para começar a captura GPS.)
export default function CorridaAtiva() {
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.setItem("evocore.run.autostart", "1");
    navigate("/corrida", { replace: true });
  }, [navigate]);
  return null;
}
