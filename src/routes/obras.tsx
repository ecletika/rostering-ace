import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import "@/styles/obras.css";

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
  | "dashboard"
  | "obras_kanban"
  | "clientes"
  | "obras"
  | "equipas"
  | "alocacoes"
  | "kiosk"
  | "aprovacoes"
  | "relatorios"
  | "auditoria"
  | "config";

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

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/* ─────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────── */
function ObrasApp() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [kStep, setKStep] = useState(0);
  const [pin, setPin] = useState("");
  const [pinDisplay, setPinDisplay] = useState("• • • •");
  const [kTime, setKTime] = useState("--:--");
  const [aprovBadge, setAprovBadge] = useState(4);

  /* relógio do kiosk */
  useEffect(() => {
    const tick = () =>
      setKTime(new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* PIN helpers */
  const addPin = (v: string) => {
    if (pin.length >= 4) return;
    const next = pin + v;
    setPin(next);
    setPinDisplay("• ".repeat(next.length) + "  ".repeat(4 - next.length));
  };
  const clearPin = () => {
    const next = pin.slice(0, -1);
    setPin(next);
    setPinDisplay(next.length ? "• ".repeat(next.length) + "  ".repeat(4 - next.length) : "• • • •");
  };
  const confirmPin = () => { if (pin.length === 4) goKStep(1); };

  const goKStep = (n: number) => {
    if (n === 0) { setPin(""); setPinDisplay("• • • •"); }
    setKStep(n);
  };

  const nav = (s: Screen) => { setScreen(s); };
  const meta = pageMeta[screen];

  /* calendar strip */
  const today = new Date(2026, 4, 7);
  const calDays = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(2026, 4, 7 + (i - 2));
    return { d, offset: i - 2 };
  });

  return (
    <div className="obras-root">
      <div className="o-shell">
        {/* ── SIDEBAR ── */}
        <div className="o-sidebar">
          <div className="o-sb-brand">
            <div className="o-sb-logo">
              <div className="o-sb-logo-icon"><i className="ti ti-building-factory-2" /></div>
              <div>
                <div className="o-sb-logo-text">Workio HR</div>
                <div className="o-sb-logo-sub">Obras e Alocações</div>
              </div>
            </div>
            <div className="o-breadcrumb">
              <i className="ti ti-grid-dots" /> Módulos <i className="ti ti-chevron-right" />
              <span style={{ color: "var(--teal-600)", fontWeight: 500 }}>Obras</span>
            </div>
          </div>

          <nav className="o-sb-nav">
            <div className="o-nav-sect">Visão geral</div>
            <NavItem id="dashboard"    icon="ti-layout-dashboard"   label="Dashboard"         active={screen} onNav={nav} />
            <NavItem id="obras_kanban" icon="ti-map-2"              label="Mapa de Obras"     active={screen} onNav={nav} />

            <div className="o-nav-sect">Cadastro</div>
            <NavItem id="clientes"     icon="ti-building"           label="Clientes"          active={screen} onNav={nav} />
            <NavItem id="obras"        icon="ti-building-factory-2" label="Obras"             active={screen} onNav={nav} />
            <NavItem id="equipas"      icon="ti-users-group"        label="Equipas"           active={screen} onNav={nav} />

            <div className="o-nav-sect">Operação</div>
            <NavItem id="alocacoes"    icon="ti-calendar-event"     label="Alocações"         active={screen} onNav={nav} />
            <NavItem id="kiosk"        icon="ti-device-tablet"      label="Kiosk (Picagem)"   active={screen} onNav={nav} />
            <NavItem id="aprovacoes"   icon="ti-checks"             label="Aprovações"        active={screen} onNav={nav} badge={aprovBadge} />

            <div className="o-nav-sect">Análise</div>
            <NavItem id="relatorios"   icon="ti-chart-bar"          label="Relatórios"        active={screen} onNav={nav} />
            <NavItem id="auditoria"    icon="ti-list-details"       label="Auditoria"         active={screen} onNav={nav} />
            <NavItem id="config"       icon="ti-settings"           label="Configurações"     active={screen} onNav={nav} />
          </nav>
        </div>

        {/* ── MAIN ── */}
        <div className="o-main">
          {/* Topbar */}
          <div className="o-topbar">
            <div className="o-tb-left">
              <h2>{meta.title}</h2>
              <p>{meta.sub}</p>
            </div>
            <div className="o-tb-right">
              {screen === "dashboard" && (
                <span className="o-badge o-bs"><i className="ti ti-map-pin" /> 3 obras ativas hoje</span>
              )}
              {screen === "aprovacoes" && aprovBadge > 0 && (
                <span className="o-badge o-bw"><i className="ti ti-clock" /> {aprovBadge} pendentes</span>
              )}
              <button className="o-btn o-btn-primary">
                <i className="ti ti-plus" /> {meta.btn}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="o-content">
            {screen === "dashboard"    && <ScreenDashboard />}
            {screen === "obras_kanban" && <ScreenKanban />}
            {screen === "clientes"     && <ScreenClientes />}
            {screen === "obras"        && <ScreenObras />}
            {screen === "equipas"      && <ScreenEquipas />}
            {screen === "alocacoes"    && <ScreenAlocacoes calDays={calDays} today={today} />}
            {screen === "kiosk"        && (
              <ScreenKiosk
                kStep={kStep} goKStep={goKStep}
                pin={pinDisplay} addPin={addPin} clearPin={clearPin} confirmPin={confirmPin}
                kTime={kTime}
              />
            )}
            {screen === "aprovacoes"   && <ScreenAprovacoes onApprove={() => setAprovBadge(b => Math.max(0, b - 1))} />}
            {screen === "relatorios"   && <ScreenRelatorios />}
            {screen === "auditoria"    && <ScreenAuditoria />}
            {screen === "config"       && <ScreenConfig />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAV ITEM
───────────────────────────────────────────── */
function NavItem({ id, icon, label, active, onNav, badge }: {
  id: Screen; icon: string; label: string; active: Screen;
  onNav: (s: Screen) => void; badge?: number;
}) {
  return (
    <div className={`o-nav-item${active === id ? " active" : ""}`} onClick={() => onNav(id)}>
      <i className={`ti ${icon}`} /> {label}
      {badge ? <span className="o-nav-badge">{badge}</span> : null}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: DASHBOARD
───────────────────────────────────────────── */
function ScreenDashboard() {
  return (
    <>
      <div className="o-grid-4 o-section">
        <div className="o-metric">
          <div className="o-metric-label"><i className="ti ti-hard-hat" style={{ fontSize: 13 }} /> Funcionários em obra</div>
          <div className="o-metric-value">23</div>
          <div className="o-metric-sub">De 31 ativos hoje</div>
        </div>
        <div className="o-metric">
          <div className="o-metric-label"><i className="ti ti-arrows-diff" style={{ fontSize: 13 }} /> Deslocados hoje</div>
          <div className="o-metric-value" style={{ color: "var(--amber-600)" }}>7</div>
          <div className="o-metric-sub">Fora da obra padrão</div>
        </div>
        <div className="o-metric">
          <div className="o-metric-label"><i className="ti ti-clock-exclamation" style={{ fontSize: 13 }} /> Pendentes aprovação</div>
          <div className="o-metric-value" style={{ color: "var(--red-600)" }}>4</div>
          <div className="o-metric-sub">Picagens divergentes</div>
        </div>
        <div className="o-metric">
          <div className="o-metric-label"><i className="ti ti-building-factory-2" style={{ fontSize: 13 }} /> Obras ativas</div>
          <div className="o-metric-value">8</div>
          <div className="o-metric-sub">3 com funcionários hoje</div>
        </div>
      </div>

      <div className="o-section">
        <div className="o-section-title"><i className="ti ti-user-check" /> Quem está em qual obra — hoje</div>
        <div className="o-card">
          <table className="o-tbl">
            <thead>
              <tr>
                <th>Funcionário</th><th>Cliente</th><th>Obra</th><th>Tipo</th>
                <th>Entrada</th><th>Saída</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              <DashRow name="João Silva" role="Encarregado" cliente="ABC Construções" obra="Prédio Lisboa" badge={<span className="o-badge o-bs">Planeada</span>} entrada="08:01" estado="em-obra" />
              <DashRow name="Carlos Lima" role="Pedreiro" cliente="XPTO Remodelações" obra="Moradia Cascais" obraExtra="↗ deslocado" badge={<span className="o-badge o-bw">Externa</span>} entrada="07:55" saida="17:02" estado="pendente" showAprovar />
              <DashRow name="Miguel Fonseca" role="Pintor" cliente="ABC Construções" obra="Prédio Lisboa" badge={<span className="o-badge o-bs">Planeada</span>} entrada="08:15" estado="em-obra" />
              <DashRow name="Ana Ferreira" role="Administrativo" cliente="—" obra="Sem alocação hoje" badge={<span className="o-badge o-bn">Padrão</span>} estado="nao-picou" />
              <DashRow name="Pedro Costa" role="Electricista" cliente="SulNorte Obras" obra="Armazém Sintra" badge={<span className="o-badge o-bp">Equipa</span>} entrada="08:00" estado="em-obra" />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DashRow({ name, role, cliente, obra, obraExtra, badge, entrada, saida, estado, showAprovar }: {
  name: string; role: string; cliente: string; obra: string; obraExtra?: string;
  badge: ReactNode; entrada?: string; saida?: string;
  estado: "em-obra" | "pendente" | "nao-picou"; showAprovar?: boolean;
}) {
  const estadoEl = estado === "em-obra"
    ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div className="o-dot o-dot-green" /><span style={{ fontSize: 12, color: "var(--teal-600)" }}>Em obra</span></div>
    : estado === "pendente"
    ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div className="o-dot o-dot-amber" /><span style={{ fontSize: 12, color: "var(--amber-600)" }}>Pendente</span></div>
    : <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div className="o-dot o-dot-gray" /><span style={{ fontSize: 12, color: "var(--gray-400)" }}>Não picou</span></div>;

  return (
    <tr className="o-tbl-hover">
      <td><div className="o-td-name">{name}</div><div className="o-td-sub">{role}</div></td>
      <td style={{ fontSize: 12 }}>{cliente}</td>
      <td>
        <span style={{ fontWeight: 500, color: obraExtra ? "var(--amber-600)" : undefined }}>{obra}</span>
        {obraExtra && <div className="o-td-sub" style={{ color: "var(--amber-600)" }}>{obraExtra}</div>}
      </td>
      <td>{badge}</td>
      <td style={{ fontSize: 12, fontWeight: 500 }}>{entrada ?? <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
      <td style={{ fontSize: 12, fontWeight: 500 }}>{saida ?? <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
      <td>{estadoEl}</td>
      <td>
        {showAprovar
          ? <button className="o-btn o-btn-sm" style={{ fontSize: 11, color: "var(--teal-600)" }}>Aprovar</button>
          : <button className="o-btn o-btn-ghost o-btn-sm"><i className="ti ti-dots" /></button>}
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: KANBAN
───────────────────────────────────────────── */
function ScreenKanban() {
  return (
    <div className="o-section">
      <div className="o-section-title"><i className="ti ti-layout-kanban" /> Obras por estado</div>
      <div className="o-kanban">
        {/* Ativas */}
        <div className="o-kan-col">
          <div className="o-kan-title"><div className="o-dot o-dot-green" /> Ativas (3)</div>
          <KanCard name="Prédio Lisboa Centro" client="ABC Construções" avatars={["JS","MF","RN"]} extra="+5" pct={62} pctColor="var(--teal-400)" pctLabel="62% concluído · previsto 30/08/2026" badge={<span className="o-badge o-bs" style={{fontSize:10}}>8 func.</span>} />
          <KanCard name="Moradia Cascais" client="XPTO Remodelações" avatars={["CL","PC"]} pct={35} pctColor="var(--teal-400)" pctLabel="35% concluído · previsto 15/06/2026" badge={<span className="o-badge o-bs" style={{fontSize:10}}>2 func.</span>} />
          <KanCard name="Armazém Sintra" client="SulNorte Obras" avatars={["PC","DM"]} pct={88} pctColor="var(--amber-400)" pctLabel="88% · prazo em risco · previsto 20/05/2026" pctLabelColor="var(--amber-600)" badge={<span className="o-badge o-bs" style={{fontSize:10}}>3 func.</span>} />
        </div>
        {/* Pausadas */}
        <div className="o-kan-col">
          <div className="o-kan-title"><div className="o-dot o-dot-amber" /> Pausadas (2)</div>
          <KanCard name="Remodelação Porto" client="Norte Engenharia" badge={<span className="o-badge o-bw" style={{fontSize:10}}>Pausada desde 01/04</span>} />
          <KanCard name="Residencial Braga" client="BragaCasa" badge={<span className="o-badge o-bw" style={{fontSize:10}}>Aguarda licença</span>} />
        </div>
        {/* Concluídas */}
        <div className="o-kan-col">
          <div className="o-kan-title"><div className="o-dot o-dot-gray" /> Concluídas (4)</div>
          <KanCard name="Moradia Sintra" client="ABC Construções" badge={<span className="o-badge o-bn" style={{fontSize:10}}>Concluída 14/03/2026</span>} />
          <KanCard name="Escritórios Almada" client="AlmadaTech" badge={<span className="o-badge o-bn" style={{fontSize:10}}>Concluída 20/01/2026</span>} />
        </div>
      </div>
    </div>
  );
}

function KanCard({ name, client, avatars = [], extra, pct, pctColor, pctLabel, pctLabelColor, badge }: {
  name: string; client: string; avatars?: string[]; extra?: string;
  pct?: number; pctColor?: string; pctLabel?: string; pctLabelColor?: string;
  badge: ReactNode;
}) {
  return (
    <div className="o-kan-card">
      <div className="o-kan-card-name">{name}</div>
      <div className="o-kan-card-client">{client}</div>
      <div className="o-kan-card-footer">
        <div className="o-kan-workers">
          {avatars.map((a) => <div key={a} className="o-kan-avatar">{a}</div>)}
          {extra && <div className="o-kan-avatar" style={{ background: "var(--gray-200)", color: "var(--gray-600)" }}>{extra}</div>}
        </div>
        {badge}
      </div>
      {pct !== undefined && (
        <>
          <div className="o-prog-bar" style={{ marginTop: 10 }}>
            <div className="o-prog-fill" style={{ width: `${pct}%`, background: pctColor }} />
          </div>
          <div style={{ fontSize: 10, color: pctLabelColor ?? "var(--gray-400)", marginTop: 3 }}>{pctLabel}</div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: CLIENTES
───────────────────────────────────────────── */
function ScreenClientes() {
  return (
    <>
      <div className="o-section">
        <div className="o-section-title"><i className="ti ti-building" /> Clientes cadastrados</div>
        <div className="o-card">
          <table className="o-tbl">
            <thead>
              <tr><th>Cliente</th><th>NIF</th><th>Cód. interno</th><th>Obras</th><th>Horas totais</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              <tr className="o-tbl-hover">
                <td><div className="o-td-name">ABC Construções, Lda</div><div className="o-td-sub">Lisboa · João Matos</div></td>
                <td style={{fontSize:12}}>509 123 456</td><td style={{fontSize:12}}>CLI-001</td>
                <td style={{fontWeight:500}}>3 ativas</td>
                <td style={{fontWeight:500,color:"var(--teal-600)"}}>2 480h</td>
                <td><span className="o-badge o-bs">Ativo</span></td>
                <td><button className="o-btn o-btn-ghost o-btn-sm"><i className="ti ti-dots" /></button></td>
              </tr>
              <tr className="o-tbl-hover">
                <td><div className="o-td-name">XPTO Remodelações</div><div className="o-td-sub">Cascais · Rui Ferreira</div></td>
                <td style={{fontSize:12}}>510 234 567</td><td style={{fontSize:12}}>CLI-002</td>
                <td style={{fontWeight:500}}>1 ativa</td>
                <td style={{fontWeight:500,color:"var(--teal-600)"}}>640h</td>
                <td><span className="o-badge o-bs">Ativo</span></td>
                <td><button className="o-btn o-btn-ghost o-btn-sm"><i className="ti ti-dots" /></button></td>
              </tr>
              <tr className="o-tbl-hover">
                <td><div className="o-td-name">SulNorte Obras</div><div className="o-td-sub">Setúbal · Paulo Neves</div></td>
                <td style={{fontSize:12}}>511 345 678</td><td style={{fontSize:12}}>CLI-003</td>
                <td style={{fontWeight:500}}>2 ativas</td>
                <td style={{fontWeight:500,color:"var(--teal-600)"}}>1 120h</td>
                <td><span className="o-badge o-bs">Ativo</span></td>
                <td><button className="o-btn o-btn-ghost o-btn-sm"><i className="ti ti-dots" /></button></td>
              </tr>
              <tr className="o-tbl-hover">
                <td><div className="o-td-name">Norte Engenharia, SA</div><div className="o-td-sub">Porto · Ana Sousa</div></td>
                <td style={{fontSize:12}}>512 456 789</td><td style={{fontSize:12}}>CLI-004</td>
                <td style={{fontWeight:500,color:"var(--gray-400)"}}>0 (pausadas)</td>
                <td style={{fontSize:12,color:"var(--gray-400)"}}>380h</td>
                <td><span className="o-badge o-bw">Pausado</span></td>
                <td><button className="o-btn o-btn-ghost o-btn-sm"><i className="ti ti-dots" /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="o-section">
        <div className="o-section-title"><i className="ti ti-plus" /> Novo cliente</div>
        <div className="o-card o-card-pad">
          <div className="o-form-grid">
            <div className="o-form-field"><label className="o-label">Nome do cliente *</label><input className="o-input" type="text" placeholder="Ex: ABC Construções, Lda" /></div>
            <div className="o-form-field"><label className="o-label">NIF / NIPC</label><input className="o-input" type="text" placeholder="509 123 456" /></div>
            <div className="o-form-field"><label className="o-label">Código interno</label><input className="o-input" type="text" placeholder="CLI-005" /></div>
            <div className="o-form-field"><label className="o-label">Responsável</label><input className="o-input" type="text" placeholder="Nome do contacto" /></div>
            <div className="o-form-field"><label className="o-label">Email</label><input className="o-input" type="text" placeholder="email@empresa.pt" /></div>
            <div className="o-form-field"><label className="o-label">Telefone</label><input className="o-input" type="text" placeholder="+351 210 000 000" /></div>
          </div>
          <div className="o-form-field"><label className="o-label">Morada</label><input className="o-input" type="text" placeholder="Rua, cidade, código postal" /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button className="o-btn">Cancelar</button>
            <button className="o-btn o-btn-primary"><i className="ti ti-check" /> Guardar cliente</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: OBRAS
───────────────────────────────────────────── */
function ScreenObras() {
  return (
    <div className="o-section">
      <div className="o-section-title"><i className="ti ti-building-factory-2" /> Obras cadastradas</div>
      <div className="o-card">
        <table className="o-tbl">
          <thead>
            <tr><th>Obra</th><th>Cliente</th><th>Supervisor</th><th>Período</th><th>Func.</th><th>GPS</th><th>QR</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr className="o-tbl-hover">
              <td><div className="o-td-name">Prédio Lisboa Centro</div><div className="o-td-sub" style={{fontFamily:"monospace",fontSize:10}}>OBR-001 · R. Augusta, Lisboa</div></td>
              <td style={{fontSize:12}}>ABC Construções</td><td style={{fontSize:12}}>João Silva</td>
              <td style={{fontSize:11}}>01/01/26 → 30/08/26</td>
              <td style={{fontWeight:600}}>8</td>
              <td><i className="ti ti-map-pin" style={{color:"var(--teal-400)",fontSize:14}} /></td>
              <td><i className="ti ti-qrcode" style={{color:"var(--teal-400)",fontSize:14}} /></td>
              <td><span className="o-badge o-bs">Ativa</span></td>
            </tr>
            <tr className="o-tbl-hover">
              <td><div className="o-td-name">Moradia Cascais</div><div className="o-td-sub" style={{fontFamily:"monospace",fontSize:10}}>OBR-002 · Av. Marginal, Cascais</div></td>
              <td style={{fontSize:12}}>XPTO Remodelações</td><td style={{fontSize:12}}>Carlos Lima</td>
              <td style={{fontSize:11}}>10/03/26 → 15/06/26</td>
              <td style={{fontWeight:600}}>2</td>
              <td><i className="ti ti-map-pin" style={{color:"var(--teal-400)",fontSize:14}} /></td>
              <td style={{color:"var(--gray-300)",fontSize:14}}><i className="ti ti-x" /></td>
              <td><span className="o-badge o-bs">Ativa</span></td>
            </tr>
            <tr className="o-tbl-hover">
              <td><div className="o-td-name">Armazém Sintra</div><div className="o-td-sub" style={{fontFamily:"monospace",fontSize:10}}>OBR-003 · Zona Industrial, Sintra</div></td>
              <td style={{fontSize:12}}>SulNorte Obras</td><td style={{fontSize:12}}>Pedro Costa</td>
              <td style={{fontSize:11}}>15/01/26 → 20/05/26</td>
              <td style={{fontWeight:600}}>3</td>
              <td><i className="ti ti-map-pin" style={{color:"var(--teal-400)",fontSize:14}} /></td>
              <td><i className="ti ti-qrcode" style={{color:"var(--teal-400)",fontSize:14}} /></td>
              <td><span className="o-badge o-bw">Prazo risco</span></td>
            </tr>
            <tr className="o-tbl-hover">
              <td><div className="o-td-name">Remodelação Porto</div><div className="o-td-sub" style={{fontFamily:"monospace",fontSize:10}}>OBR-004 · R. Cedofeita, Porto</div></td>
              <td style={{fontSize:12}}>Norte Engenharia</td><td style={{fontSize:12}}>—</td>
              <td style={{fontSize:11}}>01/02/26 → ?</td>
              <td style={{fontWeight:600,color:"var(--gray-400)"}}>0</td>
              <td style={{color:"var(--gray-300)",fontSize:14}}><i className="ti ti-x" /></td>
              <td style={{color:"var(--gray-300)",fontSize:14}}><i className="ti ti-x" /></td>
              <td><span className="o-badge o-bw">Pausada</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: EQUIPAS
───────────────────────────────────────────── */
function ScreenEquipas() {
  return (
    <div className="o-grid-3 o-section">
      <div className="o-card o-card-pad">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600}}>Equipa Betonagem A</div>
          <span className="o-badge o-bs">Ativa</span>
        </div>
        <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:8}}><i className="ti ti-user" style={{fontSize:12}} /> Supervisor: João Silva</div>
        <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:10}}><i className="ti ti-building-factory-2" style={{fontSize:12}} /> Obra padrão: Prédio Lisboa</div>
        <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
          {["JS","MF","RN"].map(a => <div key={a} className="o-kan-avatar" style={{width:26,height:26,fontSize:10}}>{a}</div>)}
          <div className="o-kan-avatar" style={{width:26,height:26,fontSize:10,background:"var(--gray-200)",color:"var(--gray-600)"}}>+3</div>
        </div>
        <button className="o-btn o-btn-sm" style={{width:"100%",justifyContent:"center"}}><i className="ti ti-calendar-plus" /> Alocar equipa</button>
      </div>
      <div className="o-card o-card-pad">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600}}>Equipa Pintura 1</div>
          <span className="o-badge o-bs">Ativa</span>
        </div>
        <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:8}}><i className="ti ti-user" style={{fontSize:12}} /> Supervisor: Carlos Lima</div>
        <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:10}}><i className="ti ti-building-factory-2" style={{fontSize:12}} /> Obra padrão: Moradia Cascais</div>
        <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
          {["CL","PC"].map(a => <div key={a} className="o-kan-avatar" style={{width:26,height:26,fontSize:10}}>{a}</div>)}
        </div>
        <button className="o-btn o-btn-sm" style={{width:"100%",justifyContent:"center"}}><i className="ti ti-calendar-plus" /> Alocar equipa</button>
      </div>
      <div className="o-card o-card-pad o-equipa-new" style={{borderStyle:"dashed",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",minHeight:160}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"var(--gray-100)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <i className="ti ti-plus" style={{fontSize:18,color:"var(--gray-400)"}} />
        </div>
        <div style={{fontSize:12,color:"var(--gray-400)"}}>Nova equipa</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: ALOCAÇÕES
───────────────────────────────────────────── */
function ScreenAlocacoes({ calDays, today }: { calDays: { d: Date; offset: number }[]; today: Date }) {
  return (
    <>
      <div className="o-section">
        <div className="o-cal-strip">
          {calDays.map(({ d, offset }) => (
            <div key={offset} className={`o-cal-day${offset === 0 ? " today" : ""}`}>
              <div className="o-cal-day-name">{DAYS_PT[d.getDay()]}</div>
              <div className="o-cal-day-num">{d.getDate()}</div>
              <div className="o-cal-day-dot" style={{ background: offset === 0 ? "rgba(255,255,255,0.5)" : offset < 0 ? "var(--teal-400)" : "var(--gray-200)" }} />
            </div>
          ))}
        </div>
      </div>
      <div className="o-grid-2 o-section">
        <div>
          <div className="o-section-title"><i className="ti ti-calendar-event" /> Alocações — semana de 05 a 11 Mai</div>
          <div className="o-alloc-card">
            <div className="o-alloc-icon" style={{background:"var(--teal-50)"}}><i className="ti ti-user" style={{color:"var(--teal-600)"}} /></div>
            <div style={{flex:1}}>
              <div className="o-alloc-name">João Silva → Prédio Lisboa</div>
              <div className="o-alloc-detail">ABC Construções · 05/05 a 09/05 · 08:00–17:00</div>
              <div style={{marginTop:4}}><span className="o-badge o-bs" style={{fontSize:10}}>Individual</span> <span className="o-badge o-bn" style={{fontSize:10}}>Planeada</span></div>
            </div>
            <div className="o-alloc-right"><span className="o-badge o-bs">Ativa</span></div>
          </div>
          <div className="o-alloc-card">
            <div className="o-alloc-icon" style={{background:"var(--purple-50)"}}><i className="ti ti-users-group" style={{color:"var(--purple-600)"}} /></div>
            <div style={{flex:1}}>
              <div className="o-alloc-name">Equipa Betonagem A → Prédio Lisboa</div>
              <div className="o-alloc-detail">ABC Construções · 05/05 a 30/08 · recorrente</div>
              <div style={{marginTop:4}}><span className="o-badge o-bp" style={{fontSize:10}}>Equipa</span> <span className="o-badge o-bn" style={{fontSize:10}}>Fixa</span></div>
            </div>
            <div className="o-alloc-right"><span className="o-badge o-bs">Ativa</span></div>
          </div>
          <div className="o-alloc-card">
            <div className="o-alloc-icon" style={{background:"var(--amber-50)"}}><i className="ti ti-user" style={{color:"var(--amber-600)"}} /></div>
            <div style={{flex:1}}>
              <div className="o-alloc-name">Carlos Lima → Moradia Cascais</div>
              <div className="o-alloc-detail">XPTO Remodelações · 05/05 a 14/05 · temporária</div>
              <div style={{marginTop:4}}><span className="o-badge o-bw" style={{fontSize:10}}>Temporária</span></div>
            </div>
            <div className="o-alloc-right"><span className="o-badge o-bs">Ativa</span></div>
          </div>
        </div>
        <div>
          <div className="o-section-title"><i className="ti ti-plus" /> Nova alocação rápida</div>
          <div className="o-card o-card-pad">
            <div className="o-form-field"><label className="o-label">Tipo</label>
              <select className="o-select"><option>Individual</option><option>Equipa</option></select></div>
            <div className="o-form-field"><label className="o-label">Funcionário</label>
              <select className="o-select"><option>João Silva</option><option>Carlos Lima</option><option>Miguel Fonseca</option><option>Pedro Costa</option></select></div>
            <div className="o-form-field"><label className="o-label">Obra</label>
              <select className="o-select"><option>Prédio Lisboa Centro (ABC Construções)</option><option>Moradia Cascais (XPTO)</option><option>Armazém Sintra (SulNorte)</option></select></div>
            <div className="o-form-grid">
              <div className="o-form-field"><label className="o-label">Data início</label><input className="o-input" type="date" defaultValue="2026-05-10" /></div>
              <div className="o-form-field"><label className="o-label">Data fim</label><input className="o-input" type="date" defaultValue="2026-05-14" /></div>
            </div>
            <div className="o-form-field"><label className="o-label">Motivo</label><input className="o-input" type="text" placeholder="Ex: Reforço para betonagem" /></div>
            <button className="o-btn o-btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}}><i className="ti ti-check" /> Criar alocação</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: KIOSK
───────────────────────────────────────────── */
function ScreenKiosk({ kStep, goKStep, pin, addPin, clearPin, confirmPin, kTime }: {
  kStep: number; goKStep: (n: number) => void;
  pin: string; addPin: (v: string) => void; clearPin: () => void; confirmPin: () => void;
  kTime: string;
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="o-section">
      <div className="o-section-title"><i className="ti ti-device-tablet" /> Simulação do kiosk de picagem</div>
      <div style={{ display: "flex", gap: 30, alignItems: "flex-start", justifyContent: "center" }}>
        {/* Dispositivo */}
        <div className="o-kiosk-device">
          <div className="o-kiosk-screen">
            <div className="o-kiosk-header">
              <div className="o-kiosk-time">{kTime}</div>
              <div className="o-kiosk-date" style={{textTransform:"capitalize"}}>{dateStr}</div>
            </div>
            <div className="o-kiosk-body">
              {/* Step 0 — PIN */}
              {kStep === 0 && (
                <div>
                  <div style={{textAlign:"center",marginBottom:14}}>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:10}}>Identificação do funcionário</div>
                    <div className="o-pin-display">{pin}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Introduza o PIN ou aproxime o cartão</div>
                  </div>
                  <div className="o-pin-grid">
                    {["1","2","3","4","5","6","7","8","9"].map(n => (
                      <button key={n} className="o-kbtn o-kbtn-secondary o-pin-btn" onClick={() => addPin(n)}>{n}</button>
                    ))}
                    <button className="o-kbtn o-kbtn-secondary o-pin-btn" onClick={clearPin}><i className="ti ti-backspace" /></button>
                    <button className="o-kbtn o-kbtn-secondary o-pin-btn" onClick={() => addPin("0")}>0</button>
                    <button className="o-kbtn o-kbtn-primary o-pin-btn" onClick={confirmPin}><i className="ti ti-arrow-right" /></button>
                  </div>
                </div>
              )}
              {/* Step 1 — Obra planeada */}
              {kStep === 1 && (
                <div>
                  <div className="o-kiosk-worker">
                    <div className="o-kiosk-avatar">JS</div>
                    <div>
                      <div className="o-kiosk-name">João Silva</div>
                      <div className="o-kiosk-obra">Obra planeada: <strong>Prédio Lisboa</strong></div>
                    </div>
                  </div>
                  <button className="o-kbtn o-kbtn-primary" onClick={() => goKStep(2)}><i className="ti ti-login" /> Picar entrada — Prédio Lisboa</button>
                  <button className="o-kbtn o-kbtn-secondary" onClick={() => goKStep(3)}><i className="ti ti-swap" /> Estou noutra obra</button>
                  <button className="o-kbtn o-kbtn-secondary" style={{opacity:0.5,fontSize:11}} onClick={() => goKStep(0)}>Cancelar</button>
                </div>
              )}
              {/* Step 2 — Confirmação entrada planeada */}
              {kStep === 2 && (
                <div>
                  <div className="o-kiosk-success">
                    <div className="o-kiosk-success-icon" style={{background:"rgba(29,158,117,0.2)"}}>
                      <i className="ti ti-check" style={{fontSize:24,color:"var(--teal-200)"}} />
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:"white"}}>Picagem registada!</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:4}}>João Silva · Entrada</div>
                    <div style={{fontSize:13,color:"var(--teal-200)",marginTop:4,fontWeight:600}}>Prédio Lisboa · ABC Construções</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4}}>{kTime} · {today.toLocaleDateString("pt-PT")}</div>
                  </div>
                  <button className="o-kbtn o-kbtn-secondary" onClick={() => goKStep(0)} style={{fontSize:12}}>Nova picagem</button>
                </div>
              )}
              {/* Step 3 — Escolha de obra */}
              {kStep === 3 && (
                <div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:8}}>Obras autorizadas para João Silva:</div>
                  <div className="o-kiosk-obras-list">
                    <div className="o-kiosk-obra-item" onClick={() => goKStep(4)}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:"var(--teal-400)",flexShrink:0}} />
                      <div><div style={{fontSize:12,fontWeight:500,color:"white"}}>Prédio Lisboa Centro</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:1}}>ABC Construções</div></div>
                      <span className="o-kib-plan" style={{marginLeft:"auto"}}>Planeada</span>
                    </div>
                    <div className="o-kiosk-obra-item" onClick={() => goKStep(4)}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:"var(--amber-400)",flexShrink:0}} />
                      <div><div style={{fontSize:12,fontWeight:500,color:"white"}}>Moradia Cascais</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:1}}>XPTO Remodelações</div></div>
                      <span className="o-kib-auth" style={{marginLeft:"auto"}}>Autorizada</span>
                    </div>
                    <div className="o-kiosk-obra-item" onClick={() => goKStep(4)}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:"var(--amber-400)",flexShrink:0}} />
                      <div><div style={{fontSize:12,fontWeight:500,color:"white"}}>Armazém Sintra</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:1}}>SulNorte Obras</div></div>
                      <span className="o-kib-auth" style={{marginLeft:"auto"}}>Autorizada</span>
                    </div>
                  </div>
                  <button className="o-kbtn o-kbtn-secondary" style={{marginTop:4,opacity:0.5,fontSize:11}} onClick={() => goKStep(1)}>← Voltar</button>
                </div>
              )}
              {/* Step 4 — Motivo */}
              {kStep === 4 && (
                <div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginBottom:10}}>Por que está nesta obra?</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                    {["Chamado pelo encarregado","Reforço de equipa","Obra padrão em pausa","Outro motivo"].map(m => (
                      <div key={m} className="o-kiosk-obra-item" onClick={() => goKStep(5)}>
                        <div style={{fontSize:12,fontWeight:500,color:"white"}}>{m}</div>
                      </div>
                    ))}
                  </div>
                  <button className="o-kbtn o-kbtn-secondary" style={{opacity:0.5,fontSize:11}} onClick={() => goKStep(3)}>← Voltar</button>
                </div>
              )}
              {/* Step 5 — Pendente aprovação */}
              {kStep === 5 && (
                <div>
                  <div className="o-kiosk-success">
                    <div className="o-kiosk-success-icon" style={{background:"rgba(239,159,39,0.2)"}}>
                      <i className="ti ti-clock" style={{fontSize:24,color:"var(--amber-200)"}} />
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:"white"}}>Picagem registada</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:4}}>Aguarda aprovação do supervisor</div>
                    <div style={{fontSize:13,color:"var(--amber-200)",marginTop:4,fontWeight:600}}>Moradia Cascais · XPTO</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4}}>{kTime} · {today.toLocaleDateString("pt-PT")}</div>
                  </div>
                  <button className="o-kbtn o-kbtn-secondary" onClick={() => goKStep(0)} style={{fontSize:12}}>Nova picagem</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explicação dos fluxos */}
        <div style={{ flex: 1, maxWidth: 320 }}>
          <div className="o-section-title"><i className="ti ti-route" /> Fluxos no Kiosk</div>
          <div className="o-card o-card-pad" style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--teal-600)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-circle-check" style={{fontSize:14}} /> Cenário A — Obra planeada
            </div>
            <div className="o-timeline">
              <div className="o-tl-item"><div className="o-tl-dot o-tl-dot-green" /><div className="o-tl-text">Funcionário identifica-se</div></div>
              <div className="o-tl-item"><div className="o-tl-dot o-tl-dot-green" /><div className="o-tl-text">Sistema encontra alocação ativa</div><div className="o-tl-sub">Sugere automaticamente a obra planeada</div></div>
              <div className="o-tl-item"><div className="o-tl-dot o-tl-dot-green" /><div className="o-tl-text">Confirma e pica entrada</div><div className="o-tl-sub">Picagem aprovada automaticamente</div></div>
            </div>
          </div>
          <div className="o-card o-card-pad" style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--amber-600)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-arrows-diff" style={{fontSize:14}} /> Cenário B — Outra obra
            </div>
            <div className="o-timeline">
              <div className="o-tl-item"><div className="o-tl-dot o-tl-dot-amber" /><div className="o-tl-text">Clica "Estou noutra obra"</div></div>
              <div className="o-tl-item"><div className="o-tl-dot o-tl-dot-amber" /><div className="o-tl-text">Escolhe obra autorizada</div><div className="o-tl-sub">Só vê as obras que o admin autorizou</div></div>
              <div className="o-tl-item"><div className="o-tl-dot o-tl-dot-amber" /><div className="o-tl-text">Indica o motivo</div></div>
              <div className="o-tl-item"><div className="o-tl-dot o-tl-dot-amber" /><div className="o-tl-text">Picagem fica pendente</div><div className="o-tl-sub">Supervisor recebe notificação para aprovar</div></div>
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

/* ─────────────────────────────────────────────
   SCREEN: APROVAÇÕES
───────────────────────────────────────────── */
function ScreenAprovacoes({ onApprove }: { onApprove: () => void }) {
  const [rows, setRows] = useState([
    { id: 1, name: "Carlos Lima",   dt: "07/05 · 07:55–17:02", planeada: "Prédio Lisboa",  picada: "Moradia Cascais",  badgeType: "bw", origem: "Escolha manual",  motivo: "Chamado p/ encarregado" },
    { id: 2, name: "Rui Neves",     dt: "07/05 · 08:10–?",     planeada: "Prédio Lisboa",  picada: "Armazém Sintra",   badgeType: "bw", origem: "Escolha manual",  motivo: "Reforço de equipa" },
    { id: 3, name: "Ana Ferreira",  dt: "07/05 · 08:30–?",     planeada: "Sem alocação",   picada: "Moradia Cascais",  badgeType: "bd", origem: "Sem alocação",    motivo: "—" },
    { id: 4, name: "Pedro Costa",   dt: "06/05 · 08:00–17:15", planeada: "Armazém Sintra", picada: "Moradia Cascais",  badgeType: "bw", origem: "Escolha manual",  motivo: "Obra padrão em pausa" },
  ]);

  const aprovar = (id: number) => { setRows(r => r.filter(x => x.id !== id)); onApprove(); };
  const rejeitar = (id: number) => { setRows(r => r.filter(x => x.id !== id)); };

  return (
    <>
      <div className="o-grid-4 o-section">
        <div className="o-metric"><div className="o-metric-label"><i className="ti ti-clock" style={{fontSize:12}} /> Pendentes</div><div className="o-metric-value" style={{color:"var(--amber-600)"}}>{rows.length}</div><div className="o-metric-sub">Picagens a rever</div></div>
        <div className="o-metric"><div className="o-metric-label"><i className="ti ti-arrows-diff" style={{fontSize:12}} /> Obra diferente</div><div className="o-metric-value">3</div><div className="o-metric-sub">Vs. planeado</div></div>
        <div className="o-metric"><div className="o-metric-label"><i className="ti ti-map-pin-off" style={{fontSize:12}} /> Sem alocação</div><div className="o-metric-value">1</div><div className="o-metric-sub">Sem obra definida</div></div>
        <div className="o-metric"><div className="o-metric-label"><i className="ti ti-clock-hour-3" style={{fontSize:12}} /> SLA médio</div><div className="o-metric-value">1.2h</div><div className="o-metric-sub">Tempo resposta</div></div>
      </div>
      <div className="o-section">
        <div className="o-section-title"><i className="ti ti-checks" /> Picagens pendentes de aprovação</div>
        <div className="o-card">
          <table className="o-tbl">
            <thead><tr><th>Funcionário</th><th>Data / Hora</th><th>Obra planeada</th><th>Obra picada</th><th>Origem</th><th>Motivo</th><th>Ação</th></tr></thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:"center",padding:"24px",color:"var(--gray-400)",fontSize:13}}>
                  <i className="ti ti-checks" style={{fontSize:20,display:"block",marginBottom:6}} />
                  Todas as picagens foram processadas
                </td></tr>
              )}
              {rows.map(r => (
                <tr key={r.id} className="o-tbl-hover">
                  <td className="o-td-name">{r.name}</td>
                  <td style={{fontSize:12}}>{r.dt}</td>
                  <td style={{fontSize:12,color:"var(--gray-400)"}}>{r.planeada}</td>
                  <td><span style={{fontWeight:500}}>{r.picada}</span><div className="o-td-sub" style={{color:"var(--amber-600)"}}>↗ deslocado</div></td>
                  <td><span className={`o-badge o-${r.badgeType}`} style={{fontSize:10}}>{r.origem}</span></td>
                  <td style={{fontSize:12}}>{r.motivo}</td>
                  <td style={{whiteSpace:"nowrap"}}>
                    <button className="o-btn o-btn-sm o-btn-primary" style={{marginRight:4}} onClick={() => aprovar(r.id)}><i className="ti ti-check" /> Aprovar</button>
                    <button className="o-btn o-btn-sm" style={{color:"var(--red-600)"}} onClick={() => rejeitar(r.id)}><i className="ti ti-x" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div style={{padding:"10px 12px",display:"flex",justifyContent:"flex-end",gap:8}}>
            <button className="o-btn o-btn-sm" onClick={() => { rows.forEach(r => onApprove()); setRows([]); }}><i className="ti ti-checks" /> Aprovar todas</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: RELATÓRIOS
───────────────────────────────────────────── */
function ScreenRelatorios() {
  return (
    <>
      <div className="o-grid-3 o-section">
        {[
          { h: "2 480h", name: "ABC Construções",   sub: "Mai 2026 · 8 funcionários", pct: 55, color: "var(--teal-400)",  valColor: "var(--teal-600)" },
          { h: "1 120h", name: "SulNorte Obras",    sub: "Mai 2026 · 3 funcionários", pct: 25, color: "var(--blue-400)",  valColor: "var(--blue-600)" },
          { h: "640h",   name: "XPTO Remodelações", sub: "Mai 2026 · 2 funcionários", pct: 14, color: "var(--amber-400)", valColor: "var(--amber-600)" },
        ].map(c => (
          <div key={c.name} className="o-card o-card-pad" style={{cursor:"pointer"}}>
            <div style={{fontSize:28,fontWeight:700,color:c.valColor}}>{c.h}</div>
            <div style={{fontSize:13,fontWeight:500,marginTop:4}}>{c.name}</div>
            <div style={{fontSize:11,color:"var(--gray-400)"}}>{c.sub}</div>
            <div className="o-prog-bar" style={{marginTop:8}}><div className="o-prog-fill" style={{width:`${c.pct}%`,background:c.color}} /></div>
          </div>
        ))}
      </div>
      <div className="o-section">
        <div className="o-section-title"><i className="ti ti-table" /> Horas por obra — detalhe</div>
        <div className="o-card">
          <table className="o-tbl">
            <thead><tr><th>Obra</th><th>Cliente</th><th>Funcionários</th><th>H. normais</th><th>H. extra</th><th>H. externas</th><th>H. pendentes</th><th>Total</th></tr></thead>
            <tbody>
              <tr><td className="o-td-name">Prédio Lisboa Centro</td><td style={{fontSize:12}}>ABC Construções</td><td style={{fontWeight:500}}>8</td><td style={{fontWeight:500}}>1 840h</td><td style={{color:"var(--amber-600)"}}>320h</td><td style={{color:"var(--blue-600)"}}>48h</td><td style={{color:"var(--red-600)"}}>12h</td><td style={{fontWeight:700}}>2 220h</td></tr>
              <tr><td className="o-td-name">Moradia Cascais</td><td style={{fontSize:12}}>XPTO</td><td style={{fontWeight:500}}>2</td><td style={{fontWeight:500}}>580h</td><td style={{color:"var(--amber-600)"}}>48h</td><td style={{color:"var(--blue-600)"}}>14h</td><td style={{color:"var(--red-600)"}}>8h</td><td style={{fontWeight:700}}>650h</td></tr>
              <tr><td className="o-td-name">Armazém Sintra</td><td style={{fontSize:12}}>SulNorte</td><td style={{fontWeight:500}}>3</td><td style={{fontWeight:500}}>880h</td><td style={{color:"var(--amber-600)"}}>120h</td><td style={{color:"var(--blue-600)"}}>32h</td><td style={{color:"var(--red-600)"}}>4h</td><td style={{fontWeight:700}}>1 036h</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button className="o-btn o-btn-sm"><i className="ti ti-file-spreadsheet" /> Excel</button>
        <button className="o-btn o-btn-sm"><i className="ti ti-file-type-pdf" /> PDF</button>
        <button className="o-btn o-btn-sm"><i className="ti ti-file-csv" /> CSV</button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: AUDITORIA
───────────────────────────────────────────── */
function ScreenAuditoria() {
  const rows = [
    { dt: "07/05 08:22", user: "Carlos Lima",    acao: "Picagem obra externa", entidade: "Moradia Cascais",    ant: "Prédio Lisboa",    novo: "Moradia Cascais",     novoCor: "var(--amber-600)" },
    { dt: "06/05 17:10", user: "Admin (João S.)", acao: "Alocação criada",     entidade: "Carlos Lima",        ant: "—",                novo: "Moradia Cascais 05–14/05", novoCor: "var(--teal-600)" },
    { dt: "05/05 09:00", user: "Admin (João S.)", acao: "Obra pausada",        entidade: "Remodelação Porto",  ant: "Ativa",            novo: "Pausada",              novoCor: "var(--amber-600)" },
    { dt: "04/05 14:22", user: "Admin (João S.)", acao: "Picagem corrigida",   entidade: "Ana Ferreira",       ant: "Sem obra",         novo: "Prédio Lisboa",        novoCor: "var(--teal-600)" },
    { dt: "02/05 11:00", user: "Sistema",         acao: "Cliente criado",      entidade: "BragaCasa",          ant: "—",                novo: "CLI-006",              novoCor: "var(--teal-600)" },
  ];
  return (
    <div className="o-section">
      <div className="o-section-title"><i className="ti ti-list-details" /> Auditoria de alocações e picagens</div>
      <div className="o-card">
        <table className="o-tbl">
          <thead><tr><th>Data/hora</th><th>Utilizador</th><th>Ação</th><th>Entidade</th><th>Valor anterior</th><th>Valor novo</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{fontSize:11,fontFamily:"monospace"}}>{r.dt}</td>
                <td style={{fontSize:12}}>{r.user}</td>
                <td style={{fontSize:12}}>{r.acao}</td>
                <td style={{fontSize:12}}>{r.entidade}</td>
                <td style={{fontSize:11,color:"var(--gray-400)"}}>{r.ant}</td>
                <td style={{fontSize:12,fontWeight:500,color:r.novoCor}}>{r.novo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: CONFIG
───────────────────────────────────────────── */
function ScreenConfig() {
  const [permLevel, setPermLevel] = useState(1);
  const levels = [
    { icon: "ti-x",            label: "Nunca" },
    { icon: "ti-shield-check", label: "Se autorizado" },
    { icon: "ti-crown",        label: "Supervisores" },
    { icon: "ti-users",        label: "Todos" },
  ];
  return (
    <>
      <div className="o-grid-2 o-section">
        <div>
          <div className="o-section-title"><i className="ti ti-sliders" /> Regras de picagem</div>
          <div className="o-card o-card-pad">
            <div className="o-fr">
              <span className="o-fr-label">Picagem sem alocação definida</span>
              <select className="o-select" style={{width:"auto",fontSize:12,padding:"4px 8px"}}>
                <option>Permitir + enviar para aprovação</option><option>Bloquear</option><option>Usar obra padrão</option>
              </select>
            </div>
            <div className="o-fr">
              <span className="o-fr-label">Obra diferente da planeada</span>
              <select className="o-select" style={{width:"auto",fontSize:12,padding:"4px 8px"}}>
                <option>Permitir + enviar para aprovação</option><option>Bloquear</option><option>Aprovar automaticamente</option>
              </select>
            </div>
            <div className="o-fr">
              <span className="o-fr-label">Obrigar motivo ao picar noutra obra</span>
              <div className="o-toggle" />
            </div>
            <div className="o-fr">
              <span className="o-fr-label">Exigir GPS por defeito</span>
              <div className="o-toggle off" />
            </div>
          </div>
        </div>
        <div>
          <div className="o-section-title"><i className="ti ti-users" /> Permissões por nível</div>
          <div className="o-card o-card-pad">
            <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:8}}>Quem pode escolher outra obra no Kiosk?</div>
            <div className="o-level-opts">
              {levels.map((l, i) => (
                <div key={i} className={`o-level-opt${permLevel === i ? " sel" : ""}`} onClick={() => setPermLevel(i)}>
                  <i className={`ti ${l.icon}`} />{l.label}
                </div>
              ))}
            </div>
            <div style={{marginTop:14,fontSize:12,color:"var(--gray-400)",marginBottom:8}}>Nível de permissão para aprovação de picagens</div>
            <div className="o-fr"><span className="o-fr-label">Supervisor pode aprovar</span><div className="o-toggle" /></div>
            <div className="o-fr"><span className="o-fr-label">RH pode aprovar</span><div className="o-toggle" /></div>
            <div className="o-fr"><span className="o-fr-label">Admin pode corrigir obra da picagem</span><div className="o-toggle" /></div>
          </div>
        </div>
      </div>
      <div className="o-section">
        <div className="o-section-title"><i className="ti ti-building-factory-2" /> Obra/cliente padrão da empresa (fallback)</div>
        <div className="o-card o-card-pad" style={{maxWidth:500}}>
          <div className="o-form-grid">
            <div className="o-form-field"><label className="o-label">Cliente padrão</label>
              <select className="o-select"><option>Interno</option><option>ABC Construções</option></select></div>
            <div className="o-form-field"><label className="o-label">Obra padrão (fallback)</label>
              <select className="o-select"><option>Sem obra definida</option><option>Prédio Lisboa Centro</option></select></div>
          </div>
          <div style={{fontSize:11,color:"var(--gray-400)"}}>Usado quando o funcionário não tem obra atribuída e o sistema precisa de registar a picagem sem perder a informação.</div>
        </div>
      </div>
    </>
  );
}
