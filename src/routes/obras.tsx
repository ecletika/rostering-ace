import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ─── CSS injectado em <head> via useEffect para isolar do Tailwind ─── */
const OBRAS_CSS = `
.obras-wrap *, .obras-wrap *::before, .obras-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }
.obras-wrap {
  --teal-50:#E1F5EE; --teal-100:#9FE1CB; --teal-200:#5DCAA5; --teal-400:#1D9E75; --teal-600:#0F6E56; --teal-800:#085041;
  --amber-50:#FAEEDA; --amber-200:#FAC775; --amber-400:#EF9F27; --amber-600:#854F0B;
  --red-50:#FCEBEB; --red-200:#F09595; --red-400:#E24B4A; --red-600:#A32D2D;
  --blue-50:#E6F1FB; --blue-200:#85B7EB; --blue-400:#378ADD; --blue-600:#185FA5;
  --purple-50:#EEEDFE; --purple-400:#7F77DD; --purple-600:#534AB7;
  --gray-50:#F7F7F5; --gray-100:#EFEFED; --gray-200:#D8D8D4; --gray-400:#8A8A85; --gray-600:#5C5C58; --gray-800:#2C2C2A;
  --border: 0.5px solid #E4E4E0; --border-md: 0.5px solid #CACAC5;
  --r-sm:6px; --r-md:8px; --r-lg:12px; --r-xl:16px;
  --font:'Segoe UI',system-ui,-apple-system,sans-serif;
  --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
  font-family:var(--font); background:#EEECEA; color:var(--gray-800); font-size:14px;
  height:100vh; display:flex; flex-direction:column; overflow:hidden;
}
.obras-wrap .shell { display:flex; flex:1; overflow:hidden; margin:10px; gap:10px; }
.obras-wrap .sidebar { width:230px; flex-shrink:0; background:white; border-radius:var(--r-xl); border:var(--border); display:flex; flex-direction:column; overflow:hidden; box-shadow:var(--shadow-sm); }
.obras-wrap .main-area { flex:1; background:white; border-radius:var(--r-xl); border:var(--border); display:flex; flex-direction:column; overflow:hidden; box-shadow:var(--shadow-sm); }
.obras-wrap .sb-brand { padding:16px; border-bottom:var(--border); }
.obras-wrap .sb-logo { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.obras-wrap .sb-logo-icon { width:30px; height:30px; background:var(--teal-400); border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; color:white; font-size:15px; }
.obras-wrap .sb-logo-text { font-size:13px; font-weight:700; color:var(--gray-800); letter-spacing:-0.02em; }
.obras-wrap .sb-logo-sub { font-size:10px; color:var(--gray-400); }
.obras-wrap .breadcrumb { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--gray-400); }
.obras-wrap .sb-nav { flex:1; padding:8px 0; overflow-y:auto; }
.obras-wrap .nav-sect { font-size:10px; font-weight:700; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.08em; padding:10px 16px 4px; }
.obras-wrap .nav-item { display:flex; align-items:center; gap:9px; padding:8px 16px; cursor:pointer; font-size:13px; color:var(--gray-600); transition:all 0.1s; border-left:2px solid transparent; user-select:none; }
.obras-wrap .nav-item:hover { background:var(--gray-50); color:var(--gray-800); }
.obras-wrap .nav-item.active { background:var(--teal-50); color:var(--teal-600); font-weight:500; border-left-color:var(--teal-400); padding-left:14px; }
.obras-wrap .nav-item i { font-size:15px; flex-shrink:0; }
.obras-wrap .nav-badge { margin-left:auto; font-size:10px; font-weight:600; background:var(--red-50); color:var(--red-600); padding:2px 6px; border-radius:10px; }
.obras-wrap .topbar { padding:14px 20px; border-bottom:var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
.obras-wrap .tb-left h2 { font-size:15px; font-weight:600; color:var(--gray-800); }
.obras-wrap .tb-left p { font-size:12px; color:var(--gray-400); margin-top:1px; }
.obras-wrap .tb-right { display:flex; gap:8px; align-items:center; }
.obras-wrap .btn { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:500; padding:7px 13px; border-radius:var(--r-md); border:var(--border-md); cursor:pointer; background:white; color:var(--gray-800); font-family:var(--font); transition:background 0.1s; }
.obras-wrap .btn:hover { background:var(--gray-50); }
.obras-wrap .btn-primary { background:var(--teal-400); border-color:var(--teal-400); color:white; }
.obras-wrap .btn-primary:hover { background:var(--teal-600); }
.obras-wrap .btn-sm { font-size:11px; padding:4px 9px; }
.obras-wrap .btn-ghost { border-color:transparent; background:transparent; }
.obras-wrap .btn-ghost:hover { background:var(--gray-100); }
.obras-wrap .content { flex:1; overflow-y:auto; padding:20px; background:var(--gray-50); }
.obras-wrap .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.obras-wrap .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.obras-wrap .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.obras-wrap .metric { background:white; border:var(--border); border-radius:var(--r-lg); padding:14px 16px; }
.obras-wrap .metric-label { font-size:11px; color:var(--gray-400); margin-bottom:5px; display:flex; align-items:center; gap:5px; }
.obras-wrap .metric-value { font-size:24px; font-weight:700; color:var(--gray-800); line-height:1; }
.obras-wrap .metric-sub { font-size:11px; color:var(--gray-400); margin-top:4px; }
.obras-wrap .section { margin-bottom:20px; }
.obras-wrap .section-title { font-size:11px; font-weight:700; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.07em; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
.obras-wrap .card { background:white; border:var(--border); border-radius:var(--r-lg); }
.obras-wrap .card-pad { padding:16px 18px; }
.obras-wrap .tbl { width:100%; border-collapse:collapse; }
.obras-wrap .tbl th { font-size:11px; font-weight:700; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.04em; padding:9px 12px; background:var(--gray-50); border-bottom:var(--border); text-align:left; white-space:nowrap; }
.obras-wrap .tbl td { padding:10px 12px; font-size:13px; border-bottom:var(--border); vertical-align:middle; }
.obras-wrap .tbl tr:last-child td { border-bottom:none; }
.obras-wrap .tbl-row-hover:hover td { background:var(--gray-50); cursor:pointer; }
.obras-wrap .td-name { font-weight:500; }
.obras-wrap .td-sub { font-size:11px; color:var(--gray-400); margin-top:1px; }
.obras-wrap .badge { display:inline-flex; align-items:center; gap:3px; font-size:11px; font-weight:600; padding:3px 8px; border-radius:20px; white-space:nowrap; }
.obras-wrap .bs { background:var(--teal-50); color:var(--teal-600); }
.obras-wrap .bw { background:var(--amber-50); color:var(--amber-600); }
.obras-wrap .bd { background:var(--red-50); color:var(--red-600); }
.obras-wrap .bi { background:var(--blue-50); color:var(--blue-600); }
.obras-wrap .bn { background:var(--gray-100); color:var(--gray-600); }
.obras-wrap .bp { background:var(--purple-50); color:var(--purple-600); }
.obras-wrap .fr { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:var(--border); }
.obras-wrap .fr:last-child { border-bottom:none; }
.obras-wrap .fr-label { font-size:13px; color:var(--gray-600); }
.obras-wrap .toggle { width:34px; height:19px; border-radius:10px; background:var(--teal-400); position:relative; cursor:pointer; flex-shrink:0; }
.obras-wrap .toggle::after { content:''; position:absolute; width:15px; height:15px; background:white; border-radius:50%; top:2px; right:2px; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
.obras-wrap .toggle.off { background:var(--gray-200); }
.obras-wrap .toggle.off::after { right:auto; left:2px; }
.obras-wrap .dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; display:inline-block; }
.obras-wrap .dot-green { background:var(--teal-400); }
.obras-wrap .dot-amber { background:var(--amber-400); }
.obras-wrap .dot-red { background:var(--red-400); }
.obras-wrap .dot-gray { background:var(--gray-400); }
.obras-wrap .kiosk-device { background:#1A1A18; border-radius:20px; padding:6px; width:280px; margin:0 auto; box-shadow:0 8px 32px rgba(0,0,0,0.25); }
.obras-wrap .kiosk-screen { background:#0F1510; border-radius:14px; overflow:hidden; }
.obras-wrap .kiosk-header { background:var(--teal-600); padding:16px; text-align:center; }
.obras-wrap .kiosk-time { font-size:28px; font-weight:700; color:white; font-variant-numeric:tabular-nums; }
.obras-wrap .kiosk-date { font-size:12px; color:rgba(255,255,255,0.7); margin-top:2px; }
.obras-wrap .kiosk-body { padding:16px; }
.obras-wrap .kiosk-worker { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.07); border-radius:10px; padding:12px; margin-bottom:14px; }
.obras-wrap .kiosk-avatar { width:40px; height:40px; border-radius:50%; background:var(--teal-600); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:white; flex-shrink:0; }
.obras-wrap .kiosk-btn { display:flex; width:100%; padding:12px; border-radius:10px; border:none; cursor:pointer; font-size:13px; font-weight:600; font-family:var(--font); margin-bottom:8px; align-items:center; justify-content:center; gap:8px; transition:opacity 0.1s; }
.obras-wrap .kiosk-btn:hover { opacity:0.9; }
.obras-wrap .kbtn-primary { background:var(--teal-400); color:white; }
.obras-wrap .kbtn-secondary { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.85); border:0.5px solid rgba(255,255,255,0.15) !important; }
.obras-wrap .kiosk-obras-list { margin-top:8px; }
.obras-wrap .kiosk-obra-item { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.07); border:0.5px solid rgba(255,255,255,0.12); border-radius:8px; padding:10px 12px; margin-bottom:6px; cursor:pointer; transition:background 0.1s; }
.obras-wrap .kiosk-obra-item:hover { background:rgba(255,255,255,0.12); }
.obras-wrap .kiosk-obra-item-dot { width:8px; height:8px; border-radius:50%; background:var(--teal-400); flex-shrink:0; }
.obras-wrap .kiosk-obra-item-name { font-size:12px; font-weight:500; color:white; }
.obras-wrap .kiosk-obra-item-client { font-size:10px; color:rgba(255,255,255,0.5); margin-top:1px; }
.obras-wrap .kiosk-obra-item-badge { margin-left:auto; font-size:10px; padding:2px 6px; border-radius:10px; font-weight:600; }
.obras-wrap .kib-plan { background:rgba(29,158,117,0.25); color:var(--teal-200); }
.obras-wrap .kib-auth { background:rgba(239,159,39,0.2); color:var(--amber-200); }
.obras-wrap .timeline { position:relative; padding-left:20px; }
.obras-wrap .timeline::before { content:''; position:absolute; left:6px; top:6px; bottom:6px; width:1px; background:var(--gray-200); }
.obras-wrap .tl-item { position:relative; margin-bottom:16px; }
.obras-wrap .tl-dot { position:absolute; left:-17px; top:4px; width:10px; height:10px; border-radius:50%; border:2px solid white; }
.obras-wrap .tl-dot-green { background:var(--teal-400); }
.obras-wrap .tl-dot-amber { background:var(--amber-400); }
.obras-wrap .tl-time { font-size:11px; color:var(--gray-400); margin-bottom:2px; }
.obras-wrap .tl-text { font-size:12px; color:var(--gray-800); }
.obras-wrap .tl-sub { font-size:11px; color:var(--gray-400); margin-top:1px; }
.obras-wrap .cal-strip { display:flex; gap:6px; margin-bottom:16px; overflow-x:auto; padding-bottom:4px; }
.obras-wrap .cal-day { flex-shrink:0; width:46px; text-align:center; padding:8px 4px; border-radius:var(--r-md); border:var(--border); background:white; cursor:pointer; }
.obras-wrap .cal-day.today { background:var(--teal-400); border-color:var(--teal-400); }
.obras-wrap .cal-day-name { font-size:10px; color:var(--gray-400); }
.obras-wrap .cal-day.today .cal-day-name { color:rgba(255,255,255,0.8); }
.obras-wrap .cal-day-num { font-size:15px; font-weight:700; color:var(--gray-800); margin-top:2px; }
.obras-wrap .cal-day.today .cal-day-num { color:white; }
.obras-wrap .cal-day-dot { width:5px; height:5px; border-radius:50%; margin:4px auto 0; }
.obras-wrap .alloc-card { background:white; border:var(--border); border-radius:var(--r-lg); padding:14px 16px; display:flex; align-items:flex-start; gap:12px; margin-bottom:8px; }
.obras-wrap .alloc-icon { width:36px; height:36px; border-radius:var(--r-md); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.obras-wrap .alloc-name { font-size:13px; font-weight:500; }
.obras-wrap .alloc-detail { font-size:12px; color:var(--gray-400); margin-top:2px; }
.obras-wrap .alloc-right { margin-left:auto; text-align:right; flex-shrink:0; }
.obras-wrap .prog-bar { height:5px; background:var(--gray-100); border-radius:3px; overflow:hidden; margin-top:5px; }
.obras-wrap .prog-fill { height:100%; border-radius:3px; }
.obras-wrap .kanban { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.obras-wrap .kan-col { background:var(--gray-50); border-radius:var(--r-lg); padding:12px; border:var(--border); }
.obras-wrap .kan-title { font-size:11px; font-weight:700; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
.obras-wrap .kan-card { background:white; border:var(--border); border-radius:var(--r-md); padding:12px; margin-bottom:7px; cursor:pointer; }
.obras-wrap .kan-card:hover { border-color:var(--teal-200); }
.obras-wrap .kan-card-name { font-size:13px; font-weight:500; }
.obras-wrap .kan-card-client { font-size:11px; color:var(--gray-400); margin-top:2px; }
.obras-wrap .kan-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
.obras-wrap .kan-workers { display:flex; }
.obras-wrap .kan-avatar { width:20px; height:20px; border-radius:50%; background:var(--teal-400); border:1.5px solid white; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:white; margin-left:-5px; }
.obras-wrap .kan-avatar:first-child { margin-left:0; }
.obras-wrap .level-opts { display:flex; gap:6px; }
.obras-wrap .level-opt { flex:1; padding:8px; border-radius:var(--r-md); border:var(--border-md); text-align:center; cursor:pointer; font-size:12px; color:var(--gray-600); transition:all 0.1s; }
.obras-wrap .level-opt.sel { border-color:var(--teal-400); background:var(--teal-50); color:var(--teal-600); font-weight:500; }
.obras-wrap .level-opt i { display:block; font-size:18px; margin-bottom:4px; }
.obras-wrap .map-ph { background:var(--gray-100); border-radius:var(--r-md); height:80px; display:flex; align-items:center; justify-content:center; color:var(--gray-400); font-size:12px; gap:6px; border:var(--border); }
.obras-wrap input[type=text], .obras-wrap input[type=date], .obras-wrap select, .obras-wrap textarea {
  width:100%; font-size:13px; padding:7px 10px; border-radius:var(--r-md); border:var(--border-md); background:white; font-family:var(--font); color:var(--gray-800); outline:none;
}
.obras-wrap input:focus, .obras-wrap select:focus, .obras-wrap textarea:focus { border-color:var(--teal-400); }
.obras-wrap label { font-size:12px; color:var(--gray-400); display:block; margin-bottom:4px; }
.obras-wrap .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
.obras-wrap .form-field { margin-bottom:12px; }
.obras-wrap .mono { font-family:'Cascadia Code','Fira Code',monospace; }
`;

export const Route = createFileRoute("/obras")({
  head: () => ({
    meta: [{ title: "Obras e Alocações — Workio HR" }],
    links: [
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/tabler-icons.min.css",
      },
    ],
  }),
  component: ObrasApp,
});

type Screen =
  | "dashboard" | "obras_kanban" | "clientes" | "obras"
  | "equipas" | "alocacoes" | "kiosk" | "aprovacoes"
  | "relatorios" | "auditoria" | "config";

const pageMeta: Record<Screen, { title: string; sub: string; btn: string }> = {
  dashboard:    { title: "Dashboard de Obras e Alocações",       sub: "Vista em tempo real de quem está em qual obra hoje",                   btn: "Nova alocação" },
  obras_kanban: { title: "Mapa de Obras",                        sub: "Kanban por estado: ativas, pausadas e concluídas",                     btn: "Nova obra" },
  clientes:     { title: "Clientes",                             sub: "Empresas e clientes para os quais presta serviço",                     btn: "Novo cliente" },
  obras:        { title: "Obras",                                sub: "Projetos e locais de trabalho por cliente",                            btn: "Nova obra" },
  equipas:      { title: "Equipas",                              sub: "Grupos de funcionários para alocação em bloco",                        btn: "Nova equipa" },
  alocacoes:    { title: "Planeamento de Alocações",             sub: "Quem vai para qual obra, quando e porquê",                             btn: "Nova alocação" },
  kiosk:        { title: "Kiosk — Picagem por Obra",             sub: "Simulação do fluxo de picagem com deteção de obra e escolha externa",  btn: "Configurar kiosk" },
  aprovacoes:   { title: "Aprovação de Picagens",                sub: "Picagens fora do planeado que aguardam validação do supervisor",       btn: "Aprovar todas" },
  relatorios:   { title: "Relatórios de Horas por Obra/Cliente", sub: "Horas trabalhadas, custos estimados e divergências por período",       btn: "Exportar" },
  auditoria:    { title: "Auditoria",                            sub: "Histórico completo de alterações em alocações, picagens e cadastros",  btn: "Exportar log" },
  config:       { title: "Configurações",                        sub: "Regras gerais de picagem, permissões e fallback de obra padrão",       btn: "Guardar" },
};

const DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

type KioskObra = { id: string; name: string; client: string; authorized: boolean };
type KioskEmployee = { id: string; name: string; initials: string };

function ObrasApp() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [kStep, setKStep] = useState(0);
  const [pin, setPin] = useState("");
  const [kTime, setKTime] = useState("--:--");
  const [aprovBadge, setAprovBadge] = useState(4);
  const [kioskObras, setKioskObras] = useState<KioskObra[]>([]);
  const [kioskLoading, setKioskLoading] = useState(false);
  const [kioskEmployee, setKioskEmployee] = useState<KioskEmployee | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  /* Inject CSS once */
  useEffect(() => {
    const id = "obras-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = OBRAS_CSS;
      document.head.appendChild(s);
    }
    return () => { /* keep style for SPA navigation */ };
  }, []);

  /* Kiosk clock */
  useEffect(() => {
    const tick = () => setKTime(new Date().toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit"}));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* PIN — identificar colaborador e carregar obras */
  const addPin = (v: string) => { if (pin.length < 4) { setPin(p => p + v); setPinError(null); } };
  const clearPin = () => { setPin(p => p.slice(0,-1)); setPinError(null); };
  const goKStep = (n: number) => { if (n === 0) { setPin(""); setKioskEmployee(null); setPinError(null); } setKStep(n); };

  const confirmPin = async () => {
    if (pin.length !== 4) return;
    setKioskLoading(true);
    setPinError(null);

    // 1. Procurar colaborador pelo punch_code
    const { data: emp } = await supabase
      .from("employees")
      .select("id, name")
      .eq("punch_code", pin)
      .eq("active", true)
      .maybeSingle();

    if (!emp) {
      setPinError("PIN inválido. Tente novamente.");
      setKioskLoading(false);
      return;
    }

    const initials = emp.name.split(" ").slice(0,2).map((w: string) => w[0]).join("").toUpperCase();
    setKioskEmployee({ id: emp.id, name: emp.name, initials });

    // 2. Carregar obras autorizadas para este colaborador
    const { data: obras } = await supabase.rpc("m22_kiosk_obras", {
      p_employee_id: emp.id,
    });

    setKioskObras(
      (obras ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        client: row.client_name,
        authorized: row.authorized,
      }))
    );

    setKioskLoading(false);
    goKStep(1);
  };

  const pinDisplay = pin.length ? "• ".repeat(pin.length) + "  ".repeat(4-pin.length) : "• • • •";

  /* Calendar strip */
  const calDays = Array.from({length:8},(_,i) => { const d=new Date(2026,4,7+(i-2)); return {d,offset:i-2}; });

  const meta = pageMeta[screen];

  return (
    <div className="obras-wrap">
      <div className="shell">

        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo">
              <div className="sb-logo-icon"><i className="ti ti-building-factory-2"/></div>
              <div>
                <div className="sb-logo-text">Workio HR</div>
                <div className="sb-logo-sub">Obras e Alocações</div>
              </div>
            </div>
            <div className="breadcrumb">
              <i className="ti ti-grid-dots"/> Módulos <i className="ti ti-chevron-right"/>
              <span style={{color:"var(--teal-600)",fontWeight:500}}>Obras</span>
            </div>
          </div>

          <div className="sb-nav">
            <div className="nav-sect">Visão geral</div>
            <N id="dashboard"    icon="ti-layout-dashboard"   label="Dashboard"       s={screen} go={setScreen}/>
            <N id="obras_kanban" icon="ti-map-2"              label="Mapa de Obras"   s={screen} go={setScreen}/>
            <div className="nav-sect">Cadastro</div>
            <N id="clientes"     icon="ti-building"           label="Clientes"        s={screen} go={setScreen}/>
            <N id="obras"        icon="ti-building-factory-2" label="Obras"           s={screen} go={setScreen}/>
            <N id="equipas"      icon="ti-users-group"        label="Equipas"         s={screen} go={setScreen}/>
            <div className="nav-sect">Operação</div>
            <N id="alocacoes"    icon="ti-calendar-event"     label="Alocações"       s={screen} go={setScreen}/>
            <N id="kiosk"        icon="ti-device-tablet"      label="Kiosk (Picagem)" s={screen} go={setScreen}/>
            <N id="aprovacoes"   icon="ti-checks"             label="Aprovações"      s={screen} go={setScreen} badge={aprovBadge}/>
            <div className="nav-sect">Análise</div>
            <N id="relatorios"   icon="ti-chart-bar"          label="Relatórios"      s={screen} go={setScreen}/>
            <N id="auditoria"    icon="ti-list-details"       label="Auditoria"       s={screen} go={setScreen}/>
            <N id="config"       icon="ti-settings"           label="Configurações"   s={screen} go={setScreen}/>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="main-area">
          <div className="topbar">
            <div className="tb-left">
              <h2>{meta.title}</h2>
              <p>{meta.sub}</p>
            </div>
            <div className="tb-right">
              {screen==="dashboard" && <span className="badge bs"><i className="ti ti-map-pin"/> 3 obras ativas hoje</span>}
              {screen==="aprovacoes" && aprovBadge>0 && <span className="badge bw"><i className="ti ti-clock"/> {aprovBadge} pendentes</span>}
              <button className="btn btn-primary"><i className="ti ti-plus"/> {meta.btn}</button>
            </div>
          </div>

          <div className="content">
            {screen==="dashboard"    && <SDashboard/>}
            {screen==="obras_kanban" && <SKanban/>}
            {screen==="clientes"     && <SClientes/>}
            {screen==="obras"        && <SObras/>}
            {screen==="equipas"      && <SEquipas/>}
            {screen==="alocacoes"    && <SAlocacoes calDays={calDays}/>}
            {screen==="kiosk"        && <SKiosk kStep={kStep} goKStep={goKStep} pin={pinDisplay} addPin={addPin} clearPin={clearPin} confirmPin={confirmPin} kTime={kTime} obras={kioskObras} obrasLoading={kioskLoading} employee={kioskEmployee} pinError={pinError}/>}
            {screen==="aprovacoes"   && <SAprovacoes onApprove={()=>setAprovBadge(b=>Math.max(0,b-1))}/>}
            {screen==="relatorios"   && <SRelatorios/>}
            {screen==="auditoria"    && <SAuditoria/>}
            {screen==="config"       && <SConfig/>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* NAV ITEM */
function N({id,icon,label,s,go,badge}:{id:Screen;icon:string;label:string;s:Screen;go:(x:Screen)=>void;badge?:number}) {
  return (
    <div className={`nav-item${s===id?" active":""}`} onClick={()=>go(id)}>
      <i className={`ti ${icon}`}/> {label}
      {badge ? <span className="nav-badge">{badge}</span> : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   DASHBOARD
──────────────────────────────────────────────────────────── */
function SDashboard() {
  return (
    <>
      <div className="grid-4 section">
        <div className="metric">
          <div className="metric-label"><i className="ti ti-hard-hat" style={{fontSize:13}}/> Funcionários em obra</div>
          <div className="metric-value">23</div>
          <div className="metric-sub">De 31 ativos hoje</div>
        </div>
        <div className="metric">
          <div className="metric-label"><i className="ti ti-arrows-diff" style={{fontSize:13}}/> Deslocados hoje</div>
          <div className="metric-value" style={{color:"var(--amber-600)"}}>7</div>
          <div className="metric-sub">Fora da obra padrão</div>
        </div>
        <div className="metric">
          <div className="metric-label"><i className="ti ti-clock-exclamation" style={{fontSize:13}}/> Pendentes aprovação</div>
          <div className="metric-value" style={{color:"var(--red-600)"}}>4</div>
          <div className="metric-sub">Picagens divergentes</div>
        </div>
        <div className="metric">
          <div className="metric-label"><i className="ti ti-building-factory-2" style={{fontSize:13}}/> Obras ativas</div>
          <div className="metric-value">8</div>
          <div className="metric-sub">3 com funcionários hoje</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title"><i className="ti ti-user-check"/> Quem está em qual obra — hoje</div>
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Funcionário</th><th>Cliente</th><th>Obra</th><th>Tipo</th>
                <th>Entrada</th><th>Saída</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr className="tbl-row-hover">
                <td><div className="td-name">João Silva</div><div className="td-sub">Encarregado</div></td>
                <td style={{fontSize:12}}>ABC Construções</td>
                <td><span style={{fontWeight:500}}>Prédio Lisboa</span></td>
                <td><span className="badge bs">Planeada</span></td>
                <td style={{fontSize:12,fontWeight:500}}>08:01</td>
                <td style={{fontSize:12,color:"var(--gray-400)"}}>—</td>
                <td><div style={{display:"flex",alignItems:"center",gap:5}}><div className="dot dot-green"/><span style={{fontSize:12,color:"var(--teal-600)"}}>Em obra</span></div></td>
                <td><button className="btn btn-ghost btn-sm"><i className="ti ti-dots"/></button></td>
              </tr>
              <tr className="tbl-row-hover">
                <td><div className="td-name">Carlos Lima</div><div className="td-sub">Pedreiro</div></td>
                <td style={{fontSize:12}}>XPTO Remodelações</td>
                <td><span style={{fontWeight:500,color:"var(--amber-600)"}}>Moradia Cascais</span><div className="td-sub" style={{color:"var(--amber-600)"}}>↗ deslocado</div></td>
                <td><span className="badge bw">Externa</span></td>
                <td style={{fontSize:12,fontWeight:500}}>07:55</td>
                <td style={{fontSize:12,fontWeight:500}}>17:02</td>
                <td><div style={{display:"flex",alignItems:"center",gap:5}}><div className="dot dot-amber"/><span style={{fontSize:12,color:"var(--amber-600)"}}>Pendente</span></div></td>
                <td><button className="btn btn-sm" style={{fontSize:11,color:"var(--teal-600)"}}>Aprovar</button></td>
              </tr>
              <tr className="tbl-row-hover">
                <td><div className="td-name">Miguel Fonseca</div><div className="td-sub">Pintor</div></td>
                <td style={{fontSize:12}}>ABC Construções</td>
                <td><span style={{fontWeight:500}}>Prédio Lisboa</span></td>
                <td><span className="badge bs">Planeada</span></td>
                <td style={{fontSize:12,fontWeight:500}}>08:15</td>
                <td style={{fontSize:12,color:"var(--gray-400)"}}>—</td>
                <td><div style={{display:"flex",alignItems:"center",gap:5}}><div className="dot dot-green"/><span style={{fontSize:12,color:"var(--teal-600)"}}>Em obra</span></div></td>
                <td><button className="btn btn-ghost btn-sm"><i className="ti ti-dots"/></button></td>
              </tr>
              <tr className="tbl-row-hover">
                <td><div className="td-name">Ana Ferreira</div><div className="td-sub">Administrativo</div></td>
                <td style={{fontSize:12}}>—</td>
                <td style={{fontSize:12,color:"var(--gray-400)"}}>Sem alocação hoje</td>
                <td><span className="badge bn">Padrão</span></td>
                <td style={{fontSize:12,color:"var(--gray-400)"}}>—</td>
                <td style={{fontSize:12,color:"var(--gray-400)"}}>—</td>
                <td><div style={{display:"flex",alignItems:"center",gap:5}}><div className="dot dot-gray"/><span style={{fontSize:12,color:"var(--gray-400)"}}>Não picou</span></div></td>
                <td><button className="btn btn-ghost btn-sm"><i className="ti ti-dots"/></button></td>
              </tr>
              <tr className="tbl-row-hover">
                <td><div className="td-name">Pedro Costa</div><div className="td-sub">Electricista</div></td>
                <td style={{fontSize:12}}>SulNorte Obras</td>
                <td><span style={{fontWeight:500}}>Armazém Sintra</span></td>
                <td><span className="badge bp">Equipa</span></td>
                <td style={{fontSize:12,fontWeight:500}}>08:00</td>
                <td style={{fontSize:12,color:"var(--gray-400)"}}>—</td>
                <td><div style={{display:"flex",alignItems:"center",gap:5}}><div className="dot dot-green"/><span style={{fontSize:12,color:"var(--teal-600)"}}>Em obra</span></div></td>
                <td><button className="btn btn-ghost btn-sm"><i className="ti ti-dots"/></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   MAPA DE OBRAS (KANBAN)
──────────────────────────────────────────────────────────── */
function SKanban() {
  return (
    <div className="section">
      <div className="section-title"><i className="ti ti-layout-kanban"/> Obras por estado</div>
      <div className="kanban">
        <div className="kan-col">
          <div className="kan-title"><div className="dot dot-green"/> Ativas (3)</div>
          <div className="kan-card">
            <div className="kan-card-name">Prédio Lisboa Centro</div>
            <div className="kan-card-client">ABC Construções</div>
            <div className="kan-card-footer">
              <div className="kan-workers">
                <div className="kan-avatar">JS</div><div className="kan-avatar">MF</div><div className="kan-avatar">RN</div>
                <div className="kan-avatar" style={{background:"var(--gray-200)",color:"var(--gray-600)"}}>+5</div>
              </div>
              <span className="badge bs" style={{fontSize:10}}>8 func.</span>
            </div>
            <div className="prog-bar" style={{marginTop:10}}><div className="prog-fill" style={{width:"62%",background:"var(--teal-400)"}}/></div>
            <div style={{fontSize:10,color:"var(--gray-400)",marginTop:3}}>62% concluído · previsto 30/08/2026</div>
          </div>
          <div className="kan-card">
            <div className="kan-card-name">Moradia Cascais</div>
            <div className="kan-card-client">XPTO Remodelações</div>
            <div className="kan-card-footer">
              <div className="kan-workers"><div className="kan-avatar">CL</div><div className="kan-avatar">PC</div></div>
              <span className="badge bs" style={{fontSize:10}}>2 func.</span>
            </div>
            <div className="prog-bar" style={{marginTop:10}}><div className="prog-fill" style={{width:"35%",background:"var(--teal-400)"}}/></div>
            <div style={{fontSize:10,color:"var(--gray-400)",marginTop:3}}>35% concluído · previsto 15/06/2026</div>
          </div>
          <div className="kan-card">
            <div className="kan-card-name">Armazém Sintra</div>
            <div className="kan-card-client">SulNorte Obras</div>
            <div className="kan-card-footer">
              <div className="kan-workers"><div className="kan-avatar">PC</div><div className="kan-avatar">DM</div></div>
              <span className="badge bs" style={{fontSize:10}}>3 func.</span>
            </div>
            <div className="prog-bar" style={{marginTop:10}}><div className="prog-fill" style={{width:"88%",background:"var(--amber-400)"}}/></div>
            <div style={{fontSize:10,color:"var(--amber-600)",marginTop:3}}>88% · prazo em risco · previsto 20/05/2026</div>
          </div>
        </div>
        <div className="kan-col">
          <div className="kan-title"><div className="dot dot-amber"/> Pausadas (2)</div>
          <div className="kan-card">
            <div className="kan-card-name">Remodelação Porto</div>
            <div className="kan-card-client">Norte Engenharia</div>
            <div className="kan-card-footer"><div className="kan-workers"/><span className="badge bw" style={{fontSize:10}}>Pausada desde 01/04</span></div>
          </div>
          <div className="kan-card">
            <div className="kan-card-name">Residencial Braga</div>
            <div className="kan-card-client">BragaCasa</div>
            <div className="kan-card-footer"><div className="kan-workers"/><span className="badge bw" style={{fontSize:10}}>Aguarda licença</span></div>
          </div>
        </div>
        <div className="kan-col">
          <div className="kan-title"><div className="dot dot-gray"/> Concluídas (4)</div>
          <div className="kan-card">
            <div className="kan-card-name">Moradia Sintra</div>
            <div className="kan-card-client">ABC Construções</div>
            <div className="kan-card-footer"><div/><span className="badge bn" style={{fontSize:10}}>Concluída 14/03/2026</span></div>
          </div>
          <div className="kan-card">
            <div className="kan-card-name">Escritórios Almada</div>
            <div className="kan-card-client">AlmadaTech</div>
            <div className="kan-card-footer"><div/><span className="badge bn" style={{fontSize:10}}>Concluída 20/01/2026</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CLIENTES
──────────────────────────────────────────────────────────── */
function SClientes() {
  return (
    <>
      <div className="section">
        <div className="section-title"><i className="ti ti-building"/> Clientes cadastrados</div>
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Cliente</th><th>NIF</th><th>Cód. interno</th><th>Obras</th><th>Horas totais</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr className="tbl-row-hover">
                <td><div className="td-name">ABC Construções, Lda</div><div className="td-sub">Lisboa · João Matos</div></td>
                <td className="mono" style={{fontSize:12}}>509 123 456</td><td className="mono" style={{fontSize:12}}>CLI-001</td>
                <td style={{fontWeight:500}}>3 ativas</td><td style={{fontWeight:500,color:"var(--teal-600)"}}>2 480h</td>
                <td><span className="badge bs">Ativo</span></td>
                <td><button className="btn btn-ghost btn-sm"><i className="ti ti-dots"/></button></td>
              </tr>
              <tr className="tbl-row-hover">
                <td><div className="td-name">XPTO Remodelações</div><div className="td-sub">Cascais · Rui Ferreira</div></td>
                <td className="mono" style={{fontSize:12}}>510 234 567</td><td className="mono" style={{fontSize:12}}>CLI-002</td>
                <td style={{fontWeight:500}}>1 ativa</td><td style={{fontWeight:500,color:"var(--teal-600)"}}>640h</td>
                <td><span className="badge bs">Ativo</span></td>
                <td><button className="btn btn-ghost btn-sm"><i className="ti ti-dots"/></button></td>
              </tr>
              <tr className="tbl-row-hover">
                <td><div className="td-name">SulNorte Obras</div><div className="td-sub">Setúbal · Paulo Neves</div></td>
                <td className="mono" style={{fontSize:12}}>511 345 678</td><td className="mono" style={{fontSize:12}}>CLI-003</td>
                <td style={{fontWeight:500}}>2 ativas</td><td style={{fontWeight:500,color:"var(--teal-600)"}}>1 120h</td>
                <td><span className="badge bs">Ativo</span></td>
                <td><button className="btn btn-ghost btn-sm"><i className="ti ti-dots"/></button></td>
              </tr>
              <tr className="tbl-row-hover">
                <td><div className="td-name">Norte Engenharia, SA</div><div className="td-sub">Porto · Ana Sousa</div></td>
                <td className="mono" style={{fontSize:12}}>512 456 789</td><td className="mono" style={{fontSize:12}}>CLI-004</td>
                <td style={{fontWeight:500,color:"var(--gray-400)"}}>0 (pausadas)</td><td style={{fontSize:12,color:"var(--gray-400)"}}>380h</td>
                <td><span className="badge bw">Pausado</span></td>
                <td><button className="btn btn-ghost btn-sm"><i className="ti ti-dots"/></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="section">
        <div className="section-title"><i className="ti ti-plus"/> Novo cliente</div>
        <div className="card card-pad">
          <div className="form-grid">
            <div className="form-field"><label>Nome do cliente *</label><input type="text" placeholder="Ex: ABC Construções, Lda"/></div>
            <div className="form-field"><label>NIF / NIPC</label><input type="text" placeholder="509 123 456"/></div>
            <div className="form-field"><label>Código interno</label><input type="text" placeholder="CLI-005"/></div>
            <div className="form-field"><label>Responsável</label><input type="text" placeholder="Nome do contacto"/></div>
            <div className="form-field"><label>Email</label><input type="text" placeholder="email@empresa.pt"/></div>
            <div className="form-field"><label>Telefone</label><input type="text" placeholder="+351 210 000 000"/></div>
          </div>
          <div className="form-field"><label>Morada</label><input type="text" placeholder="Rua, cidade, código postal"/></div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}>
            <button className="btn">Cancelar</button>
            <button className="btn btn-primary"><i className="ti ti-check"/> Guardar cliente</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   OBRAS
──────────────────────────────────────────────────────────── */
function SObras() {
  return (
    <div className="section">
      <div className="section-title"><i className="ti ti-building-factory-2"/> Obras cadastradas</div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Obra</th><th>Cliente</th><th>Supervisor</th><th>Período</th><th>Func.</th><th>GPS</th><th>QR</th><th>Estado</th></tr></thead>
          <tbody>
            <tr className="tbl-row-hover">
              <td><div className="td-name">Prédio Lisboa Centro</div><div className="td-sub mono" style={{fontSize:10}}>OBR-001 · R. Augusta, Lisboa</div></td>
              <td style={{fontSize:12}}>ABC Construções</td><td style={{fontSize:12}}>João Silva</td>
              <td style={{fontSize:11}}>01/01/26 → 30/08/26</td><td style={{fontWeight:600}}>8</td>
              <td><i className="ti ti-map-pin" style={{color:"var(--teal-400)",fontSize:14}}/></td>
              <td><i className="ti ti-qrcode" style={{color:"var(--teal-400)",fontSize:14}}/></td>
              <td><span className="badge bs">Ativa</span></td>
            </tr>
            <tr className="tbl-row-hover">
              <td><div className="td-name">Moradia Cascais</div><div className="td-sub mono" style={{fontSize:10}}>OBR-002 · Av. Marginal, Cascais</div></td>
              <td style={{fontSize:12}}>XPTO Remodelações</td><td style={{fontSize:12}}>Carlos Lima</td>
              <td style={{fontSize:11}}>10/03/26 → 15/06/26</td><td style={{fontWeight:600}}>2</td>
              <td><i className="ti ti-map-pin" style={{color:"var(--teal-400)",fontSize:14}}/></td>
              <td style={{color:"var(--gray-300)",fontSize:14}}><i className="ti ti-x"/></td>
              <td><span className="badge bs">Ativa</span></td>
            </tr>
            <tr className="tbl-row-hover">
              <td><div className="td-name">Armazém Sintra</div><div className="td-sub mono" style={{fontSize:10}}>OBR-003 · Zona Industrial, Sintra</div></td>
              <td style={{fontSize:12}}>SulNorte Obras</td><td style={{fontSize:12}}>Pedro Costa</td>
              <td style={{fontSize:11}}>15/01/26 → 20/05/26</td><td style={{fontWeight:600}}>3</td>
              <td><i className="ti ti-map-pin" style={{color:"var(--teal-400)",fontSize:14}}/></td>
              <td><i className="ti ti-qrcode" style={{color:"var(--teal-400)",fontSize:14}}/></td>
              <td><span className="badge bw">Prazo risco</span></td>
            </tr>
            <tr className="tbl-row-hover">
              <td><div className="td-name">Remodelação Porto</div><div className="td-sub mono" style={{fontSize:10}}>OBR-004 · R. Cedofeita, Porto</div></td>
              <td style={{fontSize:12}}>Norte Engenharia</td><td style={{fontSize:12}}>—</td>
              <td style={{fontSize:11}}>01/02/26 → ?</td><td style={{fontWeight:600,color:"var(--gray-400)"}}>0</td>
              <td style={{color:"var(--gray-300)",fontSize:14}}><i className="ti ti-x"/></td>
              <td style={{color:"var(--gray-300)",fontSize:14}}><i className="ti ti-x"/></td>
              <td><span className="badge bw">Pausada</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   EQUIPAS
──────────────────────────────────────────────────────────── */
function SEquipas() {
  return (
    <div className="grid-3 section">
      <div className="card card-pad">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600}}>Equipa Betonagem A</div>
          <span className="badge bs">Ativa</span>
        </div>
        <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:8}}><i className="ti ti-user" style={{fontSize:12}}/> Supervisor: João Silva</div>
        <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:10}}><i className="ti ti-building-factory-2" style={{fontSize:12}}/> Obra padrão: Prédio Lisboa</div>
        <div style={{display:"flex",alignItems:"center",gap:-4,marginBottom:12}}>
          <div className="kan-avatar" style={{width:26,height:26,fontSize:10}}>JS</div>
          <div className="kan-avatar" style={{width:26,height:26,fontSize:10}}>MF</div>
          <div className="kan-avatar" style={{width:26,height:26,fontSize:10}}>RN</div>
          <div className="kan-avatar" style={{width:26,height:26,fontSize:10,background:"var(--gray-200)",color:"var(--gray-600)"}}>+3</div>
        </div>
        <button className="btn btn-sm" style={{width:"100%",justifyContent:"center"}}><i className="ti ti-calendar-plus"/> Alocar equipa</button>
      </div>
      <div className="card card-pad">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600}}>Equipa Pintura 1</div>
          <span className="badge bs">Ativa</span>
        </div>
        <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:8}}><i className="ti ti-user" style={{fontSize:12}}/> Supervisor: Carlos Lima</div>
        <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:10}}><i className="ti ti-building-factory-2" style={{fontSize:12}}/> Obra padrão: Moradia Cascais</div>
        <div style={{display:"flex",alignItems:"center",gap:-4,marginBottom:12}}>
          <div className="kan-avatar" style={{width:26,height:26,fontSize:10}}>CL</div>
          <div className="kan-avatar" style={{width:26,height:26,fontSize:10}}>PC</div>
        </div>
        <button className="btn btn-sm" style={{width:"100%",justifyContent:"center"}}><i className="ti ti-calendar-plus"/> Alocar equipa</button>
      </div>
      <div className="card card-pad" style={{borderStyle:"dashed",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",minHeight:160}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"var(--gray-100)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <i className="ti ti-plus" style={{fontSize:18,color:"var(--gray-400)"}}/>
        </div>
        <div style={{fontSize:12,color:"var(--gray-400)"}}>Nova equipa</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   ALOCAÇÕES
──────────────────────────────────────────────────────────── */
function SAlocacoes({calDays}:{calDays:{d:Date;offset:number}[]}) {
  return (
    <>
      <div className="section">
        <div className="cal-strip">
          {calDays.map(({d,offset}) => (
            <div key={offset} className={`cal-day${offset===0?" today":""}`}>
              <div className="cal-day-name">{DAYS[d.getDay()]}</div>
              <div className="cal-day-num">{d.getDate()}</div>
              <div className="cal-day-dot" style={{background:offset===0?"rgba(255,255,255,0.5)":offset<0?"var(--teal-400)":"var(--gray-200)"}}/>
            </div>
          ))}
        </div>
      </div>
      <div className="grid-2 section">
        <div>
          <div className="section-title"><i className="ti ti-calendar-event"/> Alocações — semana de 05 a 11 Mai</div>
          <div className="alloc-card">
            <div className="alloc-icon" style={{background:"var(--teal-50)"}}><i className="ti ti-user" style={{color:"var(--teal-600)"}}/></div>
            <div style={{flex:1}}>
              <div className="alloc-name">João Silva → Prédio Lisboa</div>
              <div className="alloc-detail">ABC Construções · 05/05 a 09/05 · 08:00–17:00</div>
              <div style={{marginTop:4}}><span className="badge bs" style={{fontSize:10}}>Individual</span> <span className="badge bn" style={{fontSize:10}}>Planeada</span></div>
            </div>
            <div className="alloc-right"><span className="badge bs">Ativa</span></div>
          </div>
          <div className="alloc-card">
            <div className="alloc-icon" style={{background:"var(--purple-50)"}}><i className="ti ti-users-group" style={{color:"var(--purple-600)"}}/></div>
            <div style={{flex:1}}>
              <div className="alloc-name">Equipa Betonagem A → Prédio Lisboa</div>
              <div className="alloc-detail">ABC Construções · 05/05 a 30/08 · recorrente</div>
              <div style={{marginTop:4}}><span className="badge bp" style={{fontSize:10}}>Equipa</span> <span className="badge bn" style={{fontSize:10}}>Fixa</span></div>
            </div>
            <div className="alloc-right"><span className="badge bs">Ativa</span></div>
          </div>
          <div className="alloc-card">
            <div className="alloc-icon" style={{background:"var(--amber-50)"}}><i className="ti ti-user" style={{color:"var(--amber-600)"}}/></div>
            <div style={{flex:1}}>
              <div className="alloc-name">Carlos Lima → Moradia Cascais</div>
              <div className="alloc-detail">XPTO Remodelações · 05/05 a 14/05 · temporária</div>
              <div style={{marginTop:4}}><span className="badge bw" style={{fontSize:10}}>Temporária</span></div>
            </div>
            <div className="alloc-right"><span className="badge bs">Ativa</span></div>
          </div>
        </div>
        <div>
          <div className="section-title"><i className="ti ti-plus"/> Nova alocação rápida</div>
          <div className="card card-pad">
            <div className="form-field"><label>Tipo</label><select><option>Individual</option><option>Equipa</option></select></div>
            <div className="form-field"><label>Funcionário</label><select><option>João Silva</option><option>Carlos Lima</option><option>Miguel Fonseca</option><option>Pedro Costa</option></select></div>
            <div className="form-field"><label>Obra</label><select><option>Prédio Lisboa Centro (ABC Construções)</option><option>Moradia Cascais (XPTO)</option><option>Armazém Sintra (SulNorte)</option></select></div>
            <div className="form-grid">
              <div className="form-field"><label>Data início</label><input type="date" defaultValue="2026-05-10"/></div>
              <div className="form-field"><label>Data fim</label><input type="date" defaultValue="2026-05-14"/></div>
            </div>
            <div className="form-field"><label>Motivo</label><input type="text" placeholder="Ex: Reforço para betonagem"/></div>
            <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}}><i className="ti ti-check"/> Criar alocação</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   KIOSK
──────────────────────────────────────────────────────────── */
function SKiosk({kStep,goKStep,pin,addPin,clearPin,confirmPin,kTime,obras,obrasLoading,employee,pinError}:{
  kStep:number;goKStep:(n:number)=>void;pin:string;
  addPin:(v:string)=>void;clearPin:()=>void;confirmPin:()=>void;kTime:string;
  obras:KioskObra[];obrasLoading:boolean;
  employee:KioskEmployee|null;pinError:string|null;
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-PT",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  return (
    <div className="section">
      <div className="section-title"><i className="ti ti-device-tablet"/> Simulação do kiosk de picagem</div>
      <div style={{display:"flex",gap:30,alignItems:"flex-start",justifyContent:"center"}}>
        <div className="kiosk-device">
          <div className="kiosk-screen">
            <div className="kiosk-header">
              <div className="kiosk-time">{kTime}</div>
              <div className="kiosk-date" style={{textTransform:"capitalize"}}>{dateStr}</div>
            </div>
            <div className="kiosk-body">
              {kStep===0 && (
                <div>
                  <div style={{textAlign:"center",marginBottom:14}}>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:10}}>Identificação do funcionário</div>
                    <div style={{fontSize:36,fontWeight:700,color:"white",letterSpacing:"0.2em",background:"rgba(255,255,255,0.08)",borderRadius:10,padding:12,marginBottom:8}}>{pin}</div>
                    {pinError
                      ? <div style={{fontSize:11,color:"var(--red-400)",marginBottom:4}}>{pinError}</div>
                      : <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Introduza o PIN ou aproxime o cartão</div>
                    }
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:6}}>
                    {["1","2","3","4","5","6","7","8","9"].map(n=>(
                      <button key={n} className="kiosk-btn kbtn-secondary" style={{padding:10,fontSize:16}} onClick={()=>addPin(n)}>{n}</button>
                    ))}
                    <button className="kiosk-btn kbtn-secondary" style={{padding:10,fontSize:16}} onClick={clearPin}><i className="ti ti-backspace"/></button>
                    <button className="kiosk-btn kbtn-secondary" style={{padding:10,fontSize:16}} onClick={()=>addPin("0")}>0</button>
                    <button className="kiosk-btn kbtn-primary" style={{padding:10,fontSize:16}} onClick={()=>confirmPin()}><i className="ti ti-arrow-right"/></button>
                  </div>
                </div>
              )}
              {kStep===1 && employee && (
                <div>
                  <div className="kiosk-worker">
                    <div className="kiosk-avatar">{employee.initials}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:"white"}}>{employee.name}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:2}}>
                        {obras.length > 0 ? `${obras.length} obra(s) autorizada(s)` : "Sem obras atribuídas"}
                      </div>
                    </div>
                  </div>
                  <button className="kiosk-btn kbtn-secondary" onClick={()=>goKStep(3)}><i className="ti ti-swap"/> Escolher obra</button>
                  <button className="kiosk-btn kbtn-secondary" style={{opacity:0.5,fontSize:11}} onClick={()=>goKStep(0)}>Cancelar</button>
                </div>
              )}
              {kStep===2 && (
                <div style={{textAlign:"center",padding:"10px 0 16px"}}>
                  <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(29,158,117,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
                    <i className="ti ti-check" style={{fontSize:24,color:"var(--teal-200)"}}/>
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:"white"}}>Picagem registada!</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:4}}>{employee?.name ?? "Funcionário"} · Entrada</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4}}>{kTime} · {today.toLocaleDateString("pt-PT")}</div>
                  <button className="kiosk-btn kbtn-secondary" onClick={()=>goKStep(0)} style={{fontSize:12,marginTop:12}}>Nova picagem</button>
                </div>
              )}
              {kStep===3 && (
                <div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:8}}>
                    {obrasLoading ? "A carregar obras…" : obras.length === 0 ? "Sem obras autorizadas" : "Obras autorizadas:"}
                  </div>
                  <div className="kiosk-obras-list">
                    {obrasLoading && (
                      <div style={{textAlign:"center",padding:"16px 0",color:"rgba(255,255,255,0.4)",fontSize:12}}>
                        <i className="ti ti-loader-2" style={{fontSize:20,display:"block",marginBottom:6}}/> A carregar…
                      </div>
                    )}
                    {!obrasLoading && obras.length === 0 && (
                      <div style={{textAlign:"center",padding:"16px 0",color:"rgba(255,255,255,0.35)",fontSize:12}}>
                        <i className="ti ti-building-off" style={{fontSize:24,display:"block",marginBottom:6}}/>
                        Nenhuma obra autorizada encontrada.<br/>
                        <span style={{fontSize:10}}>Peça ao administrador para autorizar obras.</span>
                      </div>
                    )}
                    {!obrasLoading && obras.map(o=>(
                      <div key={o.id} className="kiosk-obra-item" onClick={()=>goKStep(4)}>
                        <div className="kiosk-obra-item-dot" style={{background: o.authorized ? "var(--amber-400)" : "var(--teal-400)"}}/>
                        <div>
                          <div className="kiosk-obra-item-name">{o.name}</div>
                          <div className="kiosk-obra-item-client">{o.client}</div>
                        </div>
                        <span className={`kiosk-obra-item-badge ${o.authorized ? "kib-auth" : "kib-plan"}`}>
                          {o.authorized ? "Autorizada" : "Disponível"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="kiosk-btn kbtn-secondary" style={{marginTop:4,opacity:0.5,fontSize:11}} onClick={()=>goKStep(1)}>← Voltar</button>
                </div>
              )}
              {kStep===4 && (
                <div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginBottom:10}}>Por que está nesta obra?</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                    {["Chamado pelo encarregado","Reforço de equipa","Obra padrão em pausa","Outro motivo"].map(m=>(
                      <div key={m} className="kiosk-obra-item" onClick={()=>goKStep(5)}>
                        <div><div className="kiosk-obra-item-name">{m}</div></div>
                      </div>
                    ))}
                  </div>
                  <button className="kiosk-btn kbtn-secondary" style={{opacity:0.5,fontSize:11}} onClick={()=>goKStep(3)}>← Voltar</button>
                </div>
              )}
              {kStep===5 && (
                <div style={{textAlign:"center",padding:"10px 0 16px"}}>
                  <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(239,159,39,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
                    <i className="ti ti-clock" style={{fontSize:24,color:"var(--amber-200)"}}/>
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:"white"}}>Picagem registada</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:4}}>Aguarda aprovação do supervisor</div>
                  <div style={{fontSize:13,color:"var(--amber-200)",marginTop:4,fontWeight:600}}>Moradia Cascais · XPTO</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4}}>{kTime} · {today.toLocaleDateString("pt-PT")}</div>
                  <button className="kiosk-btn kbtn-secondary" onClick={()=>goKStep(0)} style={{fontSize:12,marginTop:12}}>Nova picagem</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{flex:1,maxWidth:320}}>
          <div className="section-title"><i className="ti ti-route"/> Fluxos no Kiosk</div>
          <div className="card card-pad" style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--teal-600)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-circle-check" style={{fontSize:14}}/> Cenário A — Obra planeada
            </div>
            <div className="timeline">
              <div className="tl-item"><div className="tl-dot tl-dot-green"/><div className="tl-text">Funcionário identifica-se</div></div>
              <div className="tl-item"><div className="tl-dot tl-dot-green"/><div className="tl-text">Sistema encontra alocação ativa</div><div className="tl-sub">Sugere automaticamente a obra planeada</div></div>
              <div className="tl-item"><div className="tl-dot tl-dot-green"/><div className="tl-text">Confirma e pica entrada</div><div className="tl-sub">Picagem aprovada automaticamente</div></div>
            </div>
          </div>
          <div className="card card-pad" style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--amber-600)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-arrows-diff" style={{fontSize:14}}/> Cenário B — Outra obra
            </div>
            <div className="timeline">
              <div className="tl-item"><div className="tl-dot tl-dot-amber"/><div className="tl-text">Clica "Estou noutra obra"</div></div>
              <div className="tl-item"><div className="tl-dot tl-dot-amber"/><div className="tl-text">Escolhe obra autorizada</div><div className="tl-sub">Só vê as obras que o admin autorizou</div></div>
              <div className="tl-item"><div className="tl-dot tl-dot-amber"/><div className="tl-text">Indica o motivo</div></div>
              <div className="tl-item"><div className="tl-dot tl-dot-amber"/><div className="tl-text">Picagem fica pendente</div><div className="tl-sub">Supervisor recebe notificação para aprovar</div></div>
            </div>
          </div>
          <div style={{padding:10,background:"var(--teal-50)",borderRadius:"var(--r-md)",border:"0.5px solid var(--teal-100)"}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--teal-600)",marginBottom:4}}>Prioridade da obra na picagem</div>
            <div style={{fontSize:11,color:"var(--teal-600)",lineHeight:1.7}}>
              1. Alocação individual planeada<br/>
              2. Alocação por equipa<br/>
              3. Obra definida no dispositivo<br/>
              4. Obra padrão do funcionário<br/>
              5. Escolha manual autorizada
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   APROVAÇÕES
──────────────────────────────────────────────────────────── */
function SAprovacoes({onApprove}:{onApprove:()=>void}) {
  const [rows, setRows] = useState([
    {id:1,name:"Carlos Lima",  dt:"07/05 · 07:55–17:02",plan:"Prédio Lisboa", pic:"Moradia Cascais", bc:"bw",orig:"Escolha manual",mot:"Chamado p/ encarregado"},
    {id:2,name:"Rui Neves",    dt:"07/05 · 08:10–?",    plan:"Prédio Lisboa", pic:"Armazém Sintra",  bc:"bw",orig:"Escolha manual",mot:"Reforço de equipa"},
    {id:3,name:"Ana Ferreira", dt:"07/05 · 08:30–?",    plan:"Sem alocação",  pic:"Moradia Cascais", bc:"bd",orig:"Sem alocação",  mot:"—"},
    {id:4,name:"Pedro Costa",  dt:"06/05 · 08:00–17:15",plan:"Armazém Sintra",pic:"Moradia Cascais", bc:"bw",orig:"Escolha manual",mot:"Obra padrão em pausa"},
  ]);
  const rm = (id:number) => setRows(r=>r.filter(x=>x.id!==id));
  return (
    <>
      <div className="grid-4 section">
        <div className="metric"><div className="metric-label"><i className="ti ti-clock" style={{fontSize:12}}/> Pendentes</div><div className="metric-value" style={{color:"var(--amber-600)"}}>{rows.length}</div><div className="metric-sub">Picagens a rever</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-arrows-diff" style={{fontSize:12}}/> Obra diferente</div><div className="metric-value">3</div><div className="metric-sub">Vs. planeado</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-map-pin-off" style={{fontSize:12}}/> Sem alocação</div><div className="metric-value">1</div><div className="metric-sub">Sem obra definida</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-clock-hour-3" style={{fontSize:12}}/> SLA médio</div><div className="metric-value">1.2h</div><div className="metric-sub">Tempo resposta</div></div>
      </div>
      <div className="section">
        <div className="section-title"><i className="ti ti-checks"/> Picagens pendentes de aprovação</div>
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Funcionário</th><th>Data / Hora</th><th>Obra planeada</th><th>Obra picada</th><th>Origem</th><th>Motivo</th><th>Ação</th></tr></thead>
            <tbody>
              {rows.length===0 && <tr><td colSpan={7} style={{textAlign:"center",padding:24,color:"var(--gray-400)",fontSize:13}}>Todas as picagens foram processadas ✓</td></tr>}
              {rows.map(r=>(
                <tr key={r.id} className="tbl-row-hover">
                  <td className="td-name">{r.name}</td>
                  <td style={{fontSize:12}}>{r.dt}</td>
                  <td style={{fontSize:12,color:"var(--gray-400)"}}>{r.plan}</td>
                  <td><span style={{fontWeight:500}}>{r.pic}</span><div className="td-sub" style={{color:"var(--amber-600)"}}>↗ deslocado</div></td>
                  <td><span className={`badge ${r.bc}`} style={{fontSize:10}}>{r.orig}</span></td>
                  <td style={{fontSize:12}}>{r.mot}</td>
                  <td style={{whiteSpace:"nowrap"}}>
                    <button className="btn btn-sm btn-primary" style={{marginRight:4}} onClick={()=>{rm(r.id);onApprove();}}><i className="ti ti-check"/> Aprovar</button>
                    <button className="btn btn-sm" style={{color:"var(--red-600)"}} onClick={()=>rm(r.id)}><i className="ti ti-x"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length>0 && (
          <div style={{padding:"10px 12px",display:"flex",justifyContent:"flex-end",gap:8}}>
            <button className="btn btn-sm" onClick={()=>{const n=rows.length;setRows([]);for(let i=0;i<n;i++)onApprove();}}><i className="ti ti-checks"/> Aprovar todas</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   RELATÓRIOS
──────────────────────────────────────────────────────────── */
function SRelatorios() {
  return (
    <>
      <div className="grid-3 section">
        {[
          {h:"2 480h",name:"ABC Construções",  sub:"Mai 2026 · 8 funcionários",pct:55,c:"var(--teal-400)",vc:"var(--teal-600)"},
          {h:"1 120h",name:"SulNorte Obras",   sub:"Mai 2026 · 3 funcionários",pct:25,c:"var(--blue-400)",vc:"var(--blue-600)"},
          {h:"640h",  name:"XPTO Remodelações",sub:"Mai 2026 · 2 funcionários",pct:14,c:"var(--amber-400)",vc:"var(--amber-600)"},
        ].map(x=>(
          <div key={x.name} className="card card-pad" style={{cursor:"pointer"}}>
            <div style={{fontSize:28,fontWeight:700,color:x.vc}}>{x.h}</div>
            <div style={{fontSize:13,fontWeight:500,marginTop:4}}>{x.name}</div>
            <div style={{fontSize:11,color:"var(--gray-400)"}}>{x.sub}</div>
            <div className="prog-bar" style={{marginTop:8}}><div className="prog-fill" style={{width:`${x.pct}%`,background:x.c}}/></div>
          </div>
        ))}
      </div>
      <div className="section">
        <div className="section-title"><i className="ti ti-table"/> Horas por obra — detalhe</div>
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Obra</th><th>Cliente</th><th>Funcionários</th><th>H. normais</th><th>H. extra</th><th>H. externas</th><th>H. pendentes</th><th>Total</th></tr></thead>
            <tbody>
              <tr><td className="td-name">Prédio Lisboa Centro</td><td style={{fontSize:12}}>ABC Construções</td><td style={{fontWeight:500}}>8</td><td style={{fontWeight:500}}>1 840h</td><td style={{color:"var(--amber-600)"}}>320h</td><td style={{color:"var(--blue-600)"}}>48h</td><td style={{color:"var(--red-600)"}}>12h</td><td style={{fontWeight:700}}>2 220h</td></tr>
              <tr><td className="td-name">Moradia Cascais</td><td style={{fontSize:12}}>XPTO</td><td style={{fontWeight:500}}>2</td><td style={{fontWeight:500}}>580h</td><td style={{color:"var(--amber-600)"}}>48h</td><td style={{color:"var(--blue-600)"}}>14h</td><td style={{color:"var(--red-600)"}}>8h</td><td style={{fontWeight:700}}>650h</td></tr>
              <tr><td className="td-name">Armazém Sintra</td><td style={{fontSize:12}}>SulNorte</td><td style={{fontWeight:500}}>3</td><td style={{fontWeight:500}}>880h</td><td style={{color:"var(--amber-600)"}}>120h</td><td style={{color:"var(--blue-600)"}}>32h</td><td style={{color:"var(--red-600)"}}>4h</td><td style={{fontWeight:700}}>1 036h</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button className="btn btn-sm"><i className="ti ti-file-spreadsheet"/> Excel</button>
        <button className="btn btn-sm"><i className="ti ti-file-type-pdf"/> PDF</button>
        <button className="btn btn-sm"><i className="ti ti-file-csv"/> CSV</button>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   AUDITORIA
──────────────────────────────────────────────────────────── */
function SAuditoria() {
  const rows=[
    {dt:"07/05 08:22",user:"Carlos Lima",   acao:"Picagem obra externa",entidade:"Moradia Cascais",   ant:"Prédio Lisboa",         novo:"Moradia Cascais",          nc:"var(--amber-600)"},
    {dt:"06/05 17:10",user:"Admin (João S.)",acao:"Alocação criada",    entidade:"Carlos Lima",       ant:"—",                     novo:"Moradia Cascais 05–14/05", nc:"var(--teal-600)"},
    {dt:"05/05 09:00",user:"Admin (João S.)",acao:"Obra pausada",       entidade:"Remodelação Porto", ant:"Ativa",                 novo:"Pausada",                  nc:"var(--amber-600)"},
    {dt:"04/05 14:22",user:"Admin (João S.)",acao:"Picagem corrigida",  entidade:"Ana Ferreira",      ant:"Sem obra",              novo:"Prédio Lisboa",            nc:"var(--teal-600)"},
    {dt:"02/05 11:00",user:"Sistema",        acao:"Cliente criado",     entidade:"BragaCasa",         ant:"—",                     novo:"CLI-006",                  nc:"var(--teal-600)"},
  ];
  return (
    <div className="section">
      <div className="section-title"><i className="ti ti-list-details"/> Auditoria de alocações e picagens</div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Data/hora</th><th>Utilizador</th><th>Ação</th><th>Entidade</th><th>Valor anterior</th><th>Valor novo</th></tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{fontSize:11}} className="mono">{r.dt}</td>
                <td style={{fontSize:12}}>{r.user}</td>
                <td style={{fontSize:12}}>{r.acao}</td>
                <td style={{fontSize:12}}>{r.entidade}</td>
                <td style={{fontSize:11,color:"var(--gray-400)"}}>{r.ant}</td>
                <td style={{fontSize:12,fontWeight:500,color:r.nc}}>{r.novo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CONFIG
──────────────────────────────────────────────────────────── */
function SConfig() {
  const [lv,setLv]=useState(1);
  return (
    <>
      <div className="grid-2 section">
        <div>
          <div className="section-title"><i className="ti ti-sliders"/> Regras de picagem</div>
          <div className="card card-pad">
            <div className="fr"><span className="fr-label">Picagem sem alocação definida</span><select style={{width:"auto",fontSize:12,padding:"4px 8px"}}><option>Permitir + enviar para aprovação</option><option>Bloquear</option><option>Usar obra padrão</option></select></div>
            <div className="fr"><span className="fr-label">Obra diferente da planeada</span><select style={{width:"auto",fontSize:12,padding:"4px 8px"}}><option>Permitir + enviar para aprovação</option><option>Bloquear</option><option>Aprovar automaticamente</option></select></div>
            <div className="fr"><span className="fr-label">Obrigar motivo ao picar noutra obra</span><div className="toggle"/></div>
            <div className="fr"><span className="fr-label">Exigir GPS por defeito</span><div className="toggle off"/></div>
          </div>
        </div>
        <div>
          <div className="section-title"><i className="ti ti-users"/> Permissões por nível</div>
          <div className="card card-pad">
            <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:8}}>Quem pode escolher outra obra no Kiosk?</div>
            <div className="level-opts">
              {[{i:"ti-x",l:"Nunca"},{i:"ti-shield-check",l:"Se autorizado"},{i:"ti-crown",l:"Supervisores"},{i:"ti-users",l:"Todos"}].map((x,idx)=>(
                <div key={idx} className={`level-opt${lv===idx?" sel":""}`} onClick={()=>setLv(idx)}>
                  <i className={`ti ${x.i}`}/>{x.l}
                </div>
              ))}
            </div>
            <div style={{marginTop:14,fontSize:12,color:"var(--gray-400)",marginBottom:8}}>Nível de permissão para aprovação de picagens</div>
            <div className="fr"><span className="fr-label">Supervisor pode aprovar</span><div className="toggle"/></div>
            <div className="fr"><span className="fr-label">RH pode aprovar</span><div className="toggle"/></div>
            <div className="fr"><span className="fr-label">Admin pode corrigir obra da picagem</span><div className="toggle"/></div>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-title"><i className="ti ti-building-factory-2"/> Obra/cliente padrão da empresa (fallback)</div>
        <div className="card card-pad" style={{maxWidth:500}}>
          <div className="form-grid">
            <div className="form-field"><label>Cliente padrão</label><select><option>Interno</option><option>ABC Construções</option></select></div>
            <div className="form-field"><label>Obra padrão (fallback)</label><select><option>Sem obra definida</option><option>Prédio Lisboa Centro</option></select></div>
          </div>
          <div style={{fontSize:11,color:"var(--gray-400)"}}>Usado quando o funcionário não tem obra atribuída e o sistema precisa de registar a picagem sem perder a informação.</div>
        </div>
      </div>
    </>
  );
}
