/**
 * OAuth redirect URI — simplified.
 * Managed OAuth handles redirect URIs automatically.
 * We just need to send window.location.origin.
 */

export function getOAuthRedirectUri(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://ev0core.com";
}

export function getOAuthRedirectUriCandidates(): string[] {
  return [getOAuthRedirectUri()];
}
