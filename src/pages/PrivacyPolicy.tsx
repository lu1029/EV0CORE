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

        <h1 className="text-2xl font-heading font-bold mb-6">Política de Privacidade</h1>
        <p className="text-xs text-muted-foreground mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Dados Coletados</h2>
            <p>O EvoCore coleta os seguintes dados pessoais:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Dados de identificação:</strong> nome, e-mail</li>
              <li><strong>Dados de saúde (categoria especial LGPD):</strong> peso, altura, idade, gênero, histórico de treinos, volume de exercícios, dados de corrida (distância, pace, calorias)</li>
              <li><strong>Dados nutricionais:</strong> refeições registradas, macronutrientes, consumo de água</li>
              <li><strong>Dados de localização:</strong> rotas de corrida (quando autorizado)</li>
              <li><strong>Dados de uso:</strong> preferências do app, configurações, progresso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Finalidade do Tratamento</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Personalizar planos de treino, nutrição e corrida com IA</li>
              <li>Acompanhar seu progresso e evolução física</li>
              <li>Calcular métricas de saúde e desempenho</li>
              <li>Gerenciar sua conta e assinatura</li>
              <li>Enviar notificações relevantes (quando autorizado)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Base Legal (LGPD Art. 7º e 11º)</h2>
            <p>O tratamento de seus dados pessoais, incluindo dados de saúde (categoria especial), é realizado com base no seu <strong>consentimento explícito</strong> (Art. 11, I da LGPD), fornecido ao aceitar esta política e utilizar o aplicativo.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Armazenamento e Segurança</h2>
            <p>Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS/SSL) e em repouso. Utilizamos Row Level Security (RLS) para garantir que apenas você tenha acesso aos seus próprios dados. Os dados são retidos enquanto sua conta estiver ativa.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Compartilhamento de Dados</h2>
            <p>Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins de marketing. Dados podem ser processados por:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Provedor de infraestrutura (hospedagem e banco de dados)</li>
              <li>Processador de pagamentos (Stripe) — apenas dados de transação</li>
              <li>Serviços de IA — dados anonimizados para geração de planos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Seus Direitos (LGPD Art. 18)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de todos os seus dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar portabilidade dos dados</li>
            </ul>
            <p className="mt-2">Para exercer qualquer direito, acesse <strong>Perfil → Configurações → Meus Dados</strong> ou entre em contato pelo e-mail: <strong>privacidade@evocore.app</strong></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Exclusão de Dados</h2>
            <p>Você pode solicitar a exclusão completa de sua conta e todos os dados associados diretamente no aplicativo. Após confirmação, todos os dados serão permanentemente removidos em até 30 dias.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Contato do Encarregado (DPO)</h2>
            <p>Para dúvidas sobre privacidade e proteção de dados: <strong>privacidade@evocore.app</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
