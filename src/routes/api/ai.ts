import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getRequestContext } from "cloudflare:workers";

export const APIRoute = createAPIFileRoute("/api/ai")({
  POST: async ({ request }) => {
    try {
      const ctx = getRequestContext<CloudflareEnv>();
      const { prompt, model } = (await request.json()) as {
        prompt: string;
        model?: string;
      };

      if (!prompt?.trim()) {
        return Response.json({ error: "prompt é obrigatório" }, { status: 400 });
      }

      const selectedModel = model || "@cf/meta/llama-3.1-8b-instruct";

      const result = await ctx.env.MY_IA.run(selectedModel as Parameters<Ai["run"]>[0], {
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente de RH da Workio. Responda de forma clara e profissional em português europeu.",
          },
          { role: "user", content: prompt },
        ],
      } as AiTextGenerationInput);

      return Response.json({ ok: true, result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return Response.json({ ok: false, error: msg }, { status: 500 });
    }
  },
});
