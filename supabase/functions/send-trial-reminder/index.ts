import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, email, reminderType, daysLeft } = await req.json();

    console.log(`Sending ${reminderType} reminder to ${email} for user ${userId}`);

    const subject = reminderType === '3_days' 
      ? "Seu teste grátis termina em 3 dias! 🚀" 
      : "Últimas 24 horas do seu teste grátis! ⏳";

    const content = reminderType === '3_days'
      ? `Olá! Passando para lembrar que restam apenas 3 dias do seu teste grátis no EVO. Não perca acesso aos recursos premium!`
      : `Seu teste grátis termina amanhã! Aproveite as últimas 24 horas de acesso total e continue sua jornada premium sem interrupções.`;

    const benefits = [
      "✅ Planos de treino personalizados",
      "✅ Acompanhamento de progresso detalhado",
      "✅ Acesso exclusivo a exercícios avançados",
      "✅ Suporte prioritário",
      "✅ Sem anúncios e distrações"
    ];

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">${content}</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111827;">Lembre-se do que você ganha com o Premium:</h3>
          <ul style="list-style: none; padding: 0;">
            ${benefits.map(b => `<li style="margin-bottom: 10px; color: #4B5563;">${b}</li>`).join('')}
          </ul>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://ev0core.com/premium" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Gerenciar Assinatura</a>
        </div>
        <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 40px;">
          Se você cancelar antes do término do teste, nenhuma cobrança será efetuada.
        </p>
      </div>
    `;

    // Send email using Lovable Email Infrastructure (pgmq)
    const { error: emailError } = await supabase.rpc("send_email", {
      p_to: email,
      p_subject: subject,
      p_html: html,
      p_from_name: "EVO Team",
    });

    if (emailError) throw emailError;

    // Send Push Notification (Mocking/Triggering via DB for app to pick up)
    await supabase.from("notifications").insert({
      user_id: userId,
      title: subject,
      message: content,
      type: "trial_reminder",
      data: { reminderType, daysLeft }
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-trial-reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
