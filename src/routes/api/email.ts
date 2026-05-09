import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getRequestContext } from "cloudflare:workers";

export const APIRoute = createAPIFileRoute("/api/email")({
  POST: async ({ request }) => {
    try {
      const ctx = getRequestContext<CloudflareEnv>();
      const { to, subject, html } = (await request.json()) as {
        to: string;
        subject: string;
        html: string;
      };

      if (!to || !subject) {
        return Response.json({ error: "to e subject são obrigatórios" }, { status: 400 });
      }

      // Construir mensagem MIME simples
      const boundary = "----workio-boundary-" + Date.now();
      const raw = [
        `MIME-Version: 1.0`,
        `From: Workio <noreply@workio.pt>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        html.replace(/<[^>]+>/g, ""),
        ``,
        `--${boundary}`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        html,
        ``,
        `--${boundary}--`,
      ].join("\r\n");

      // @ts-expect-error — EmailMessage é global nos Workers runtime
      const message = new EmailMessage("noreply@workio.pt", to, raw);
      await ctx.env.MY_EMAIL.send(message);

      return Response.json({ ok: true, message: `Email enviado para ${to}` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return Response.json({ ok: false, error: msg }, { status: 500 });
    }
  },
});
