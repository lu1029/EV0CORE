/**
 * OAuth redirect URI — simplified.
 * Lovable Cloud managed OAuth handles redirect URIs automatically.
 * We just need to send window.location.origin.
 */

export function getOAuthRedirectUri(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://ev0core.lovable.app";
}

export function getOAuthRedirectUriCandidates(): string[] {
  return [getOAuthRedirectUri()];
}
