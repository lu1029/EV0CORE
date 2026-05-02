import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Send, ArrowLeft, Sparkles, Loader2, Lock } from "lucide-react";
import evoaiLogo from "@/assets/evoai-logo.png";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evo-ai-chat`;

const quickPrompts = [
  "Monte um treino para hoje",
  "Sugira uma dieta para ganhar massa",
  "Dicas para melhorar meu pace na corrida",
  "Como recuperar melhor pós-treino?",
];

const AIChatScreen = () => {
  const { userProfile, setCurrentTab } = useApp();
  const { isActive: isPremium, isLoading: isSubscriptionLoading } = useSubscription();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Premium check
    if (!isPremium) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text.trim() },
        { 
          role: "assistant", 
          content: "O acesso ao EvoAI é exclusivo para assinantes Premium. Assine agora para desbloquear seu personal trainer 24/7! 🚀" 
        },
      ]);
      setInput("");
      return;
    }

    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          userProfile: {
            name: userProfile.name,
            age: userProfile.age,
            gender: userProfile.gender,
            weight: userProfile.weight,
            height: userProfile.height,
            goal: userProfile.goal,
            level: userProfile.level,
            preference: userProfile.preference,
            daysPerWeek: userProfile.daysPerWeek,
          },
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro na resposta da IA");
      }

      if (!resp.body) throw new Error("Stream não disponível");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error("AI chat error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente em alguns instantes. 😅" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-lg mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 glass-card-purple border-0 border-b border-primary/10">
        <button onClick={() => setCurrentTab("home")} className="active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="w-9 h-9 rounded-xl overflow-hidden">
          <img src={evoaiLogo} alt="EvoAI" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">EvoAI</p>
          <p className="text-[10px] text-muted-foreground">Seu personal trainer inteligente</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] text-accent">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar">
        {isSubscriptionLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : !isPremium ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">EvoAI é Premium</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Tenha acesso ilimitado ao seu personal trainer inteligente, planos personalizados e suporte 24/7.
            </p>
            <Button 
              variant="hero" 
              className="w-full max-w-[200px] rounded-xl"
              onClick={() => setCurrentTab("premium")}
            >
              Assinar Premium
            </Button>
          </div>
        ) : messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-heading font-bold text-foreground mb-1">Olá, {userProfile.name || "Atleta"}! 👋</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Sou sua IA personal trainer. Posso criar treinos, dietas e te ajudar a evoluir!
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="glass-card rounded-xl px-3 py-2.5 text-xs text-foreground text-left hover:border-primary/30 active:scale-95 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg overflow-hidden mr-2 mt-1 shrink-0">
                <img src={evoaiLogo} alt="EvoAI" className="w-full h-full object-cover" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "glass-card rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
              <img src={evoaiLogo} alt="EvoAI" className="w-full h-full object-cover" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Pensando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 glass border-0 border-t border-border/30">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex flex-col gap-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 2000))}
              maxLength={2000}
              placeholder="Pergunte algo..."
              className="w-full bg-secondary/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/50 focus:border-primary/50 transition-colors"
              disabled={isLoading}
            />
            {input.length > 1800 && (
              <p className="text-[10px] text-muted-foreground text-right pr-1">{input.length}/2000</p>
            )}
          </div>
          <Button
            type="submit"
            variant="hero"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="rounded-xl w-11 h-11 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChatScreen;
