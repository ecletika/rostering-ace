import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/teste-ia")({
  head: () => ({ meta: [{ title: "Teste IA & Email — Workio" }] }),
  component: TesteIAPage,
});

const MODELS = [
  { id: "@cf/meta/llama-3.1-8b-instruct", label: "Llama 3.1 8B (rápido)" },
  { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", label: "Llama 3.3 70B (poderoso)" },
  { id: "@cf/mistral/mistral-7b-instruct-v0.2", label: "Mistral 7B" },
];

const CSS = `
.tia-wrap *, .tia-wrap *::before, .tia-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }
.tia-wrap {
  --teal-50:#E1F5EE; --teal-400:#1D9E75; --teal-600:#0F6E56;
  --blue-50:#E6F1FB; --blue-400:#378ADD; --blue-600:#185FA5;
  --gray-50:#F7F7F5; --gray-100:#EFEFED; --gray-200:#D8D8D4; --gray-400:#8A8A85; --gray-600:#5C5C58; --gray-800:#2C2C2A;
  --red-50:#FCEBEB; --red-400:#E24B4A; --red-600:#A32D2D;
  --border: 0.5px solid #E4E4E0;
  --r-md:8px; --r-lg:12px; --r-xl:16px;
  --font:'Segoe UI',system-ui,-apple-system,sans-serif;
  font-family:var(--font); color:var(--gray-800); font-size:14px;
  background:#EEECEA; min-height:100vh;
}
.tia-header { background:white; border-bottom:var(--border); padding:14px 24px; display:flex; align-items:center; gap:12px; }
.tia-header h1 { font-size:15px; font-weight:700; }
.tia-header p { font-size:12px; color:var(--gray-400); }
.tia-badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.tia-body { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:24px; max-width:1100px; margin:0 auto; }
@media(max-width:700px) { .tia-body { grid-template-columns:1fr; } }
.tia-card { background:white; border:var(--border); border-radius:var(--r-xl); overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.tia-card-head { padding:14px 18px; border-bottom:var(--border); display:flex; align-items:center; gap:8px; }
.tia-card-head h2 { font-size:14px; font-weight:600; }
.tia-card-head span { font-size:11px; color:var(--gray-400); }
.tia-card-icon { width:32px; height:32px; border-radius:var(--r-md); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.tia-icon-ai { background:var(--blue-50); }
.tia-icon-email { background:var(--teal-50); }
.tia-body-pad { padding:16px 18px; display:flex; flex-direction:column; gap:10px; }
.tia-label { font-size:11px; font-weight:600; color:var(--gray-400); letter-spacing:0.04em; text-transform:uppercase; margin-bottom:4px; }
.tia-input, .tia-textarea, .tia-select {
  width:100%; font-size:13px; padding:8px 10px; border-radius:var(--r-md);
  border:var(--border); background:white; font-family:var(--font); color:var(--gray-800); outline:none;
}
.tia-input:focus, .tia-textarea:focus, .tia-select:focus { border-color:var(--teal-400); }
.tia-textarea { resize:vertical; min-height:80px; }
.tia-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:6px;
  font-size:12px; font-weight:500; padding:9px 18px; border-radius:var(--r-md);
  border:none; cursor:pointer; font-family:var(--font); transition:opacity 0.1s;
  background:var(--teal-400); color:white; width:100%;
}
.tia-btn:hover { opacity:0.88; }
.tia-btn:disabled { opacity:0.5; cursor:not-allowed; }
.tia-btn.blue { background:var(--blue-400); }
.tia-result { background:var(--gray-50); border:var(--border); border-radius:var(--r-md); padding:12px; font-size:13px; line-height:1.6; white-space:pre-wrap; min-height:60px; color:var(--gray-800); }
.tia-result.error { background:var(--red-50); color:var(--red-600); border-color:var(--red-400); }
.tia-result.ok { background:var(--teal-50); color:var(--teal-600); }
.tia-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.4); border-top-color:white; border-radius:50%; animation:tia-spin 0.7s linear infinite; }
@keyframes tia-spin { to { transform:rotate(360deg); } }
.tia-chip { display:inline-flex; align-items:center; gap:5px; background:var(--gray-100); border-radius:20px; padding:3px 10px; font-size:11px; color:var(--gray-600); }
.tia-dot { width:6px; height:6px; border-radius:50%; background:var(--teal-400); }
`;

function injectCss(id: string, css: string) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}

function TesteIAPage() {
  injectCss("tia-css", CSS);

  // ── AI state ──
  const [aiModel, setAiModel] = useState(MODELS[0].id);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // ── Email state ──
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("Teste Workio AI");
  const [emailBody, setEmailBody] = useState("<p>Olá! Este é um email de teste enviado via <b>Workio</b> + Cloudflare Email.</p>");
  const [emailResult, setEmailResult] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  async function sendAi() {
    setAiLoading(true);
    setAiResult(null);
    setAiError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, model: aiModel }),
      });
      const data = await res.json() as { ok: boolean; result?: { response?: string }; error?: string };
      if (!data.ok) throw new Error(data.error || "Erro na IA");
      const text = (data.result as { response?: string })?.response ?? JSON.stringify(data.result, null, 2);
      setAiResult(text);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setAiLoading(false);
    }
  }

  async function sendEmail() {
    setEmailLoading(true);
    setEmailResult(null);
    setEmailError(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo, subject: emailSubject, html: emailBody }),
      });
      const data = await res.json() as { ok: boolean; message?: string; error?: string };
      if (!data.ok) throw new Error(data.error || "Erro ao enviar email");
      setEmailResult(data.message ?? "Email enviado com sucesso!");
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="tia-wrap">
      {/* Header */}
      <div className="tia-header">
        <div>
          <h1>Teste — Workers AI & Email</h1>
          <p>Testar os bindings MY_IA e MY_EMAIL do Cloudflare Workers</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span className="tia-chip"><span className="tia-dot" />MY_IA ligado</span>
          <span className="tia-chip"><span className="tia-dot" />MY_EMAIL ligado</span>
        </div>
      </div>

      <div className="tia-body">
        {/* ── AI Card ── */}
        <div className="tia-card">
          <div className="tia-card-head">
            <div className="tia-card-icon tia-icon-ai">🤖</div>
            <div>
              <h2>Workers AI</h2>
              <span>Binding: MY_IA</span>
            </div>
          </div>
          <div className="tia-body-pad">
            <div>
              <div className="tia-label">Modelo</div>
              <select
                className="tia-select"
                value={aiModel}
                onChange={e => setAiModel(e.target.value)}
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="tia-label">Prompt</div>
              <textarea
                className="tia-textarea"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ex: Cria uma política de férias para uma empresa de tecnologia com 50 colaboradores..."
                rows={4}
              />
            </div>
            <button
              className="tia-btn blue"
              onClick={sendAi}
              disabled={aiLoading || !aiPrompt.trim()}
            >
              {aiLoading ? <><span className="tia-spinner" /> A processar...</> : "▶ Enviar para IA"}
            </button>
            {aiResult && (
              <div>
                <div className="tia-label">Resposta</div>
                <div className="tia-result">{aiResult}</div>
              </div>
            )}
            {aiError && (
              <div className="tia-result error">❌ {aiError}</div>
            )}
          </div>
        </div>

        {/* ── Email Card ── */}
        <div className="tia-card">
          <div className="tia-card-head">
            <div className="tia-card-icon tia-icon-email">📧</div>
            <div>
              <h2>Serviço de Email</h2>
              <span>Binding: MY_EMAIL</span>
            </div>
          </div>
          <div className="tia-body-pad">
            <div>
              <div className="tia-label">Para (destinatário)</div>
              <input
                className="tia-input"
                type="email"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                placeholder="teste@exemplo.com"
              />
            </div>
            <div>
              <div className="tia-label">Assunto</div>
              <input
                className="tia-input"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <div className="tia-label">Corpo (HTML)</div>
              <textarea
                className="tia-textarea"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                rows={4}
              />
            </div>
            <button
              className="tia-btn"
              onClick={sendEmail}
              disabled={emailLoading || !emailTo || !emailSubject}
            >
              {emailLoading ? <><span className="tia-spinner" /> A enviar...</> : "📤 Enviar email"}
            </button>
            {emailResult && (
              <div className="tia-result ok">✅ {emailResult}</div>
            )}
            {emailError && (
              <div className="tia-result error">❌ {emailError}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
