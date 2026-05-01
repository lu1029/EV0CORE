import React from "react";
import { ChevronLeft, Copy, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PUBLIC_URL = "https://ev0core.com/termos";

const TermsOfUse = () => {
  const navigate = useNavigate();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_URL);
      toast.success("Link público copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Termos de Serviço — EvoCore",
          text: "Confira os Termos de Serviço do EvoCore",
          url: PUBLIC_URL,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <h1 className="text-2xl font-heading font-bold mb-2">Termos de Serviço</h1>
        <p className="text-xs text-muted-foreground mb-4">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        {/* Public link card */}
        <div className="glass-card rounded-2xl p-4 mb-8 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Link público</p>
            <p className="text-sm font-mono text-foreground truncate">{PUBLIC_URL}</p>
          </div>
          <button
            onClick={copyLink}
            className="h-9 px-3 rounded-lg bg-secondary border border-border text-xs font-bold flex items-center gap-1.5 active:scale-95"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar
          </button>
          <button
            onClick={share}
            className="h-9 px-3 rounded-lg gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Compartilhar
          </button>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta, acessar ou utilizar o aplicativo EvoCore (“EvoCore”, “nós”, “nosso”), você (“usuário”, “você”) declara ter lido, compreendido e concordado integralmente com estes Termos de Serviço e com a nossa <a href="/privacidade" className="text-primary underline">Política de Privacidade</a>. Caso não concorde com qualquer disposição, por favor não utilize o aplicativo.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Descrição do Serviço</h2>
            <p>O EvoCore é uma plataforma digital de bem-estar e fitness que oferece, entre outras funcionalidades: planos de treino personalizados, registro de corridas, acompanhamento nutricional, comunidade social, mensagens, integração com pagamentos e recursos de inteligência artificial (EvoAI). O serviço é fornecido “no estado em que se encontra”, sem garantia de resultados específicos. <strong>O EvoCore não substitui acompanhamento médico, fisioterapêutico ou de profissional de educação física.</strong></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Cadastro e Conta</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Para utilizar o EvoCore é necessário criar uma conta com informações verdadeiras, completas e atualizadas;</li>
              <li>É necessário ter, no mínimo, <strong>13 anos</strong> de idade. Menores entre 13 e 18 anos devem ter consentimento dos responsáveis legais;</li>
              <li>Você é o único responsável pela confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta;</li>
              <li>O EvoCore poderá suspender ou encerrar contas que violem estes Termos, sem prejuízo das demais medidas legais cabíveis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Conduta do Usuário</h2>
            <p>É vedado ao usuário:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Utilizar o serviço para finalidades ilícitas, fraudulentas ou que violem direitos de terceiros;</li>
              <li>Publicar conteúdo ofensivo, discriminatório, violento, sexualmente explícito, difamatório, falso ou que viole direitos autorais;</li>
              <li>Praticar engenharia reversa, copiar, modificar ou criar obras derivadas do aplicativo;</li>
              <li>Tentar acessar dados de outros usuários, contornar mecanismos de segurança ou interferir no funcionamento do serviço;</li>
              <li>Utilizar bots, scripts ou meios automatizados para coletar dados ou interagir com a plataforma;</li>
              <li>Comercializar, sublicenciar ou ceder o acesso à sua conta a terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Conteúdo do Usuário</h2>
            <p>Você é integralmente responsável pelo conteúdo (textos, fotos, métricas, comentários) publicado no EvoCore. Ao publicar, você concede ao EvoCore licença não exclusiva, mundial e gratuita para armazenar, exibir e distribuir esse conteúdo dentro da plataforma, exclusivamente para a operação do serviço. Você pode excluir seu conteúdo a qualquer momento. Reservamo-nos o direito de remover conteúdo que viole estes Termos ou a legislação vigente.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Planos, Assinaturas e Pagamentos</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>O EvoCore oferece um plano gratuito com funcionalidades limitadas e planos Premium pagos (semanal, mensal e anual);</li>
              <li>Pagamentos são processados por intermediários certificados (Stripe / AbacatePay/Pix). Não armazenamos dados completos de cartão em nossos servidores;</li>
              <li>Assinaturas são renovadas automaticamente ao fim do período contratado, salvo cancelamento prévio;</li>
              <li>O cancelamento pode ser feito a qualquer momento dentro do app, mantendo-se o acesso até o término do período já pago;</li>
              <li>Em conformidade com o art. 49 do <strong>Código de Defesa do Consumidor</strong>, você tem direito de arrependimento em até 7 (sete) dias corridos contados da contratação à distância, com reembolso integral mediante solicitação por e-mail.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Período de Teste Gratuito</h2>
            <p>O EvoCore poderá oferecer período de teste gratuito de até 7 (sete) dias. Ao iniciar o teste, o usuário fornece dados de pagamento que serão cobrados automaticamente ao término, exceto em caso de cancelamento dentro do prazo. O teste é limitado a 1 (um) por usuário.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Inteligência Artificial (EvoAI)</h2>
            <p>O EvoAI gera recomendações automatizadas a partir das informações fornecidas pelo usuário. Tais recomendações são <strong>sugestões orientativas</strong>, não constituem aconselhamento médico, nutricional ou desportivo profissional. O EvoCore não se responsabiliza por decisões tomadas exclusivamente com base nas saídas do EvoAI.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Propriedade Intelectual</h2>
            <p>Todos os direitos sobre o software, design, marca, logotipos, textos e demais elementos do EvoCore pertencem ao EvoCore ou a seus licenciantes, sendo protegidos pela Lei nº 9.610/1998 (Direitos Autorais) e Lei nº 9.279/1996 (Propriedade Industrial). É concedida ao usuário licença pessoal, limitada, não exclusiva e revogável para uso do aplicativo, exclusivamente para fins não comerciais.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Privacidade e Proteção de Dados</h2>
            <p>O tratamento de dados pessoais é realizado em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong>. Detalhes sobre quais dados coletamos, finalidades, bases legais, compartilhamentos e direitos do titular estão descritos em nossa <a href="/privacidade" className="text-primary underline">Política de Privacidade</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Isenção de Responsabilidade</h2>
            <p>Na máxima extensão permitida pela lei, o EvoCore não se responsabiliza por:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Lesões físicas, problemas de saúde ou danos decorrentes da execução de exercícios, dietas ou atividades sugeridas pelo app;</li>
              <li>Indisponibilidades temporárias do serviço por manutenção, falhas de internet ou caso fortuito/força maior;</li>
              <li>Conteúdo publicado por outros usuários da comunidade;</li>
              <li>Perda de dados causada por uso indevido da conta pelo próprio usuário.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Suspensão e Encerramento</h2>
            <p>Podemos suspender ou encerrar o acesso do usuário, a qualquer tempo e sem aviso prévio, em caso de violação destes Termos, fraude, uso indevido ou ordem judicial. O usuário também pode encerrar sua conta a qualquer momento, com a consequente exclusão de seus dados conforme nossa Política de Privacidade.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Alterações destes Termos</h2>
            <p>Estes Termos podem ser atualizados a qualquer momento. Alterações relevantes serão comunicadas pelo aplicativo ou e-mail cadastrado. A continuidade do uso após a notificação caracteriza aceitação das novas condições.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Legislação Aplicável e Foro</h2>
            <p>Estes Termos são regidos pelas leis da República Federativa do Brasil, em especial o <strong>Código de Defesa do Consumidor (Lei nº 8.078/1990)</strong>, o <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong> e a <strong>LGPD (Lei nº 13.709/2018)</strong>. Para dirimir controvérsias, fica eleito o foro do domicílio do consumidor.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">15. Contato</h2>
            <p>Para dúvidas, reclamações ou solicitações relacionadas aos Termos de Serviço, entre em contato pelo e-mail <strong>contato@ev0core.com</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
