import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";
import { toast } from "sonner";

const LanguageSettings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const change = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    toast.success(t("settings.saved"));
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label={t("common.back")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-heading font-bold text-foreground">{t("settings.language")}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("settings.languageDescription")}</p>

      <div className="space-y-2">
        {SUPPORTED_LANGUAGES.map((lng) => {
          const active = i18n.resolvedLanguage === lng || i18n.language === lng;
          return (
            <button
              key={lng}
              onClick={() => change(lng)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                active ? "border-primary bg-primary/5 glow-primary" : "border-border bg-card"
              }`}
            >
              <span className="text-foreground font-medium">
                {lng === "pt-BR" ? "Português (Brasil)" :
                 lng === "en" ? "English" :
                 lng === "es" ? "Español" :
                 lng === "fr" ? "Français" :
                 lng === "de" ? "Deutsch" :
                 lng === "it" ? "Italiano" :
                 lng === "ja" ? "日本語" :
                 lng === "ko" ? "한국어" :
                 lng === "zh-CN" ? "中文 (简体)" : lng}
              </span>
              {active && <Check className="w-5 h-5 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSettings;
