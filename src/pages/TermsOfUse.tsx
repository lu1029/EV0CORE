import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <h1 className="text-2xl font-heading font-bold mb-6">Termos de Uso</h1>
        <p className="text-xs text-muted-foreground mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta e utilizar o EvoCore, você concorda com estes Termos de Uso e com a nossa Política de Privacidade. Se não concordar, não utilize o aplicativo.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Descrição do Serviço</h2>
            <p>O EvoCore é um aplicativo de fitness que utiliza inteligência artificial para criar planos personalizados de treino, nutrição e corrida. O app não substitui acompanhamento médico ou de profissional de educação física.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Conta do Usuário</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Você é responsável por manter a segurança de sua conta</li>
              <li>Não compartilhe suas credenciais de acesso</li>
              <li>Você deve fornecer informações verdadeiras ao se cadastrar</li>
              <li>É necessário ter pelo menos 13 anos para usar o app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Uso Adequado</h2>
            <p>Você concorda em não:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Usar o app para fins ilegais ou não autorizados</li>
              <li>Tentar acessar dados de outros usuários</li>
              <li>Interferir no funcionamento do serviço</li>
              <li>Realizar engenharia reversa do aplicativo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Planos e Pagamentos</h2>
            <p>O EvoCore oferece um plano gratuito com funcionalidades limitadas e um plano Premium com acesso completo. Assinaturas são processadas via Stripe. Cancelamentos podem ser feitos a qualquer momento, com acesso mantido até o fim do período pago.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Isenção de Responsabilidade</h2>
            <p>Os planos de treino e nutrição gerados por IA são sugestões baseadas nas informações fornecidas. <strong>Consulte sempre um profissional de saúde antes de iniciar qualquer programa de exercícios ou dieta.</strong> O EvoCore não se responsabiliza por lesões ou problemas de saúde decorrentes do uso do app.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Propriedade Intelectual</h2>
            <p>Todo o conteúdo, design, marca e tecnologia do EvoCore são de propriedade exclusiva dos desenvolvedores. É proibida a reprodução sem autorização.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Alterações nos Termos</h2>
            <p>Podemos atualizar estes termos periodicamente. Alterações significativas serão comunicadas pelo app. O uso continuado após alterações constitui aceitação dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Legislação Aplicável</h2>
            <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca do domicílio do usuário para dirimir quaisquer controvérsias.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Contato</h2>
            <p>Dúvidas sobre os Termos de Uso: <strong>contato@evocore.app</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
