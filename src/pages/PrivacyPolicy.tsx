import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <h1 className="text-2xl font-heading font-bold mb-6">Política de Privacidade — EvoCore</h1>
        <p className="text-sm text-muted-foreground mb-6">O EvoCore valoriza sua privacidade e transparência no uso de dados.</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Coleta de dados:</h2>
            <p>O aplicativo pode coletar informações como:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Dados de uso do app</li>
              <li>Informações de treino e atividade física</li>
              <li>Dados de localização (apenas durante corridas e caminhadas, com consentimento)</li>
              <li>Dados de saúde (quando autorizado pelo usuário)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Uso das informações:</h2>
            <p>Os dados coletados são utilizados para:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Melhorar a experiência do usuário</li>
              <li>Fornecer métricas de treino e evolução</li>
              <li>Personalizar recomendações de treino e nutrição</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Compartilhamento:</h2>
            <p>O EvoCore não vende dados pessoais a terceiros.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Permissões:</h2>
            <p>O aplicativo pode solicitar:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Localização (para corridas e mapas)</li>
              <li>Notificações (para lembretes e progresso)</li>
              <li>Dados de saúde (para integração com apps nativos)</li>
            </ul>
            <p className="mt-2 text-xs">Todas as permissões são opcionais e podem ser revogadas a qualquer momento.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Segurança:</h2>
            <p>Utilizamos medidas de segurança para proteger suas informações.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contato:</h2>
            <p>Para dúvidas, entre em contato pelo site oficial:</p>
            <a href="https://www.ev0core.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://www.ev0core.com
            </a>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Alterações:</h2>
            <p>Esta política pode ser atualizada a qualquer momento.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
