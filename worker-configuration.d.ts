// Cloudflare Workers bindings — declarados em wrangler.jsonc
// Gerado automaticamente pelo `wrangler types` mas mantido manualmente aqui.

interface CloudflareEnv {
  /** Workers AI — binding: MY_IA */
  MY_IA: Ai;
  /** Email — binding: MY_EMAIL */
  MY_EMAIL: SendEmail;
  /** Static assets */
  ASSETS: Fetcher;
}
