import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- AuthN: require valid Supabase JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return json({ error: "Server misconfigured" }, 500);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    // --- AuthZ: require admin role ---
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Você seleciona versículos bíblicos sobre LOUVOR e ADORAÇÃO. Use a tradução Almeida Revista e Atualizada (ARA) ou Nova Almeida Atualizada. Retorne SEMPRE via tool call.",
          },
          {
            role: "user",
            content: "Sugira UM versículo bíblico curto (até 25 palavras) sobre louvor ou adoração a Deus. Varie entre Salmos, Hebreus, Apocalipse, Efésios.",
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "retornar_versiculo",
              description: "Retorna versículo formatado",
              parameters: {
                type: "object",
                properties: {
                  texto: { type: "string", description: "Texto do versículo, sem aspas" },
                  referencia: { type: "string", description: "Ex: Salmos 100:2" },
                },
                required: ["texto", "referencia"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "retornar_versiculo" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return json({ error: "Limite de requisições atingido. Tente novamente em instantes." }, 429);
      if (resp.status === 402) return json({ error: "Créditos de IA esgotados. Adicione créditos no workspace Lovable." }, 402);
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      return json({ error: "Erro ao gerar versículo" }, 500);
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Resposta inválida da IA");
    const parsed = JSON.parse(args);
    return json(parsed);
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Erro" }, 500);
  }
});
