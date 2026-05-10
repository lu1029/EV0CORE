// This file is auto-generated for EvoCore.
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "../supabase/client";
const authClient = createLovableAuth();

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const evocoreAuth = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft", opts?: SignInOptions) => {
      const result = await authClient.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams,
        },
      });

      if (result.redirected) {
        return result;
      }

      if (result.error) {
        return result;
      }

      // O cliente Lovable já configura a sessão Supabase internamente via
      // signInWithIdToken. Chamar setSession aqui novamente sobrescreve com
      // tokens em formato incompatível (faltando claim "sub"), causando 403
      // em todas as chamadas /user subsequentes.
      return result;
    },
  },
};
