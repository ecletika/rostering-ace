import { useState, useRef, useEffect } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */
export interface Department {
  id: string;
  name: string;
  color: string | null;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string | null;
  job_title: string | null;
  photo_url: string | null;
  department: string | null;
  role: string;
  manager_id?: string | null;
  reports_to?: string | null;
}

export interface OrgChartProps {
  ceo: Employee | null;
  departments: Department[];
  employees: Employee[];
  isAdmin: boolean;
  onAddDepartment: (data: { name: string; color: string }) => Promise<void>;
  onAddPosition: (deptId: string, empId: string, jobTitle: string) => Promise<void>;
  onReorderDepts: (ids: string[]) => void;
}

/* ─── CSS (same style as obras.tsx) ─────────────────────────────────── */
const ORG_CSS = `
.org-wrap *, .org-wrap *::before, .org-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }
.org-wrap {
  --teal-50:#E1F5EE; --teal-100:#9FE1CB; --teal-200:#5DCAA5; --teal-400:#1D9E75; --teal-600:#0F6E56;
  --blue-50:#E6F1FB; --blue-200:#85B7EB; --blue-400:#378ADD; --blue-600:#185FA5;
  --gray-50:#F7F7F5; --gray-100:#EFEFED; --gray-200:#D8D8D4; --gray-400:#8A8A85; --gray-600:#5C5C58; --gray-800:#2C2C2A;
  --border: 0.5px solid #E4E4E0;
  --r-md:8px; --r-lg:12px; --r-xl:16px;
  --font:'Segoe UI',system-ui,-apple-system,sans-serif;
  --shadow-sm:0 1px 3px rgba(0,0,0,0.07);
  font-family:var(--font); color:var(--gray-800); font-size:14px;
}

/* ── connector lines ── */
.org-tree { display:flex; flex-direction:column; align-items:center; }
.org-vline { width:1px; height:28px; background:var(--gray-200); flex-shrink:0; }
.org-hbar-wrap { position:relative; display:flex; align-items:flex-start; }
.org-hbar {
  position:absolute; top:0; background:var(--gray-200);
  height:1px; pointer-events:none;
}
.org-col { display:flex; flex-direction:column; align-items:center; }

/* ── cards ── */
.org-card {
  background:white; border:var(--border); border-radius:var(--r-xl);
  padding:16px 14px; width:160px; flex-shrink:0;
  box-shadow:var(--shadow-sm); display:flex; flex-direction:column;
  align-items:center; text-align:center; position:relative;
  transition:box-shadow 0.15s, transform 0.15s;
  cursor:default; user-select:none;
}
.org-card.draggable { cursor:grab; }
.org-card.draggable:active { cursor:grabbing; }
.org-card.drag-over { box-shadow:0 0 0 2px var(--teal-400); transform:scale(1.02); }
.org-card.ceo { border:1.5px solid var(--blue-200); }

/* ── plus card ── */
.org-card.plus {
  border:1.5px dashed var(--gray-200); background:var(--gray-50);
  cursor:pointer; color:var(--gray-400);
  justify-content:center; min-height:120px;
}
.org-card.plus:hover { border-color:var(--teal-400); color:var(--teal-400); background:var(--teal-50); }
.org-card.plus .plus-icon { font-size:22px; font-weight:300; line-height:1; }

/* ── dept card ── */
.org-card.dept { min-height:80px; justify-content:center; padding:14px 12px; }
.org-dept-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-bottom:8px; }
.org-dept-name { font-size:13px; font-weight:600; color:var(--gray-800); line-height:1.2; }
.org-dept-count { font-size:11px; color:var(--gray-400); margin-top:4px; }

/* ── employee card ── */
.org-card.emp { min-height:130px; }
.org-avatar {
  width:44px; height:44px; border-radius:50%; display:flex; align-items:center;
  justify-content:center; font-size:14px; font-weight:700; flex-shrink:0;
  margin-bottom:8px; background:var(--blue-50); color:var(--blue-600);
}
.org-emp-name { font-size:12px; font-weight:600; color:var(--gray-800); line-height:1.3; }
.org-emp-role { font-size:11px; color:var(--blue-400); margin-top:3px; line-height:1.2; }
.org-badge {
  display:inline-block; margin-top:8px; padding:2px 8px; border-radius:20px;
  font-size:10px; font-weight:600; white-space:nowrap;
}

/* ── modals ── */
.org-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:1000;
  display:flex; align-items:center; justify-content:center; padding:16px;
}
.org-modal {
  background:white; border-radius:var(--r-xl); padding:24px; width:100%;
  max-width:400px; box-shadow:0 8px 32px rgba(0,0,0,0.15);
}
.org-modal h3 { font-size:15px; font-weight:700; margin-bottom:16px; color:var(--gray-800); }
.org-field { margin-bottom:12px; }
.org-label { font-size:11px; color:var(--gray-400); margin-bottom:4px; display:block; font-weight:500; letter-spacing:0.03em; }
.org-input {
  width:100%; font-size:13px; padding:8px 10px; border-radius:var(--r-md);
  border:var(--border); background:white; font-family:var(--font); color:var(--gray-800); outline:none;
}
.org-input:focus { border-color:var(--teal-400); }
.org-select { appearance:none; }
.org-colors { display:flex; gap:6px; flex-wrap:wrap; margin-top:4px; }
.org-color-swatch {
  width:24px; height:24px; border-radius:50%; cursor:pointer; border:2px solid transparent;
  flex-shrink:0; transition:transform 0.1s;
}
.org-color-swatch:hover { transform:scale(1.15); }
.org-color-swatch.sel { border-color:var(--gray-800); }
.org-modal-btns { display:flex; gap:8px; justify-content:flex-end; margin-top:16px; }
.org-btn {
  display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:500;
  padding:8px 16px; border-radius:var(--r-md); border:var(--border); cursor:pointer;
  background:white; color:var(--gray-800); font-family:var(--font); transition:background 0.1s;
}
.org-btn:hover { background:var(--gray-50); }
.org-btn.primary { background:var(--teal-400); border-color:var(--teal-400); color:white; }
.org-btn.primary:hover { background:var(--teal-600); }
`;

/* ─── Colour presets ─────────────────────────────────────────────────── */
const SWATCHES = [
  "#1D9E75","#378ADD","#E24B4A","#EF9F27","#7F77DD",
  "#F06292","#26C6DA","#66BB6A","#8D6E63","#546E7A",
];

const AVATAR_PALETTE = [
  { bg:"#e8eeff", text:"#3b5bdb" },
  { bg:"#fff3e0", text:"#e65100" },
  { bg:"#e8f5e9", text:"#2e7d32" },
  { bg:"#fce4ec", text:"#c62828" },
  { bg:"#f3e5f5", text:"#6a1b9a" },
  { bg:"#e0f2f1", text:"#00695c" },
];

function avatarStyle(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function empName(e: Employee) {
  return e.full_name || `${e.first_name} ${e.last_name}`;
}

function initials(e: Employee) {
  const n = empName(e);
  return n.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

/* ─── Add-Department modal ───────────────────────────────────────────── */
function AddDeptModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: { name: string; color: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SWATCHES[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), color });
    setSaving(false);
    onClose();
  }

  return (
    <div className="org-overlay" onClick={onClose}>
      <div className="org-modal" onClick={e => e.stopPropagation()}>
        <h3>Novo Departamento</h3>
        <div className="org-field">
          <label className="org-label">Nome do departamento</label>
          <input
            className="org-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Tecnologia, Financeiro..."
            autoFocus
            onKeyDown={e => e.key === "Enter" && handleSave()}
          />
        </div>
        <div className="org-field">
          <label className="org-label">Cor</label>
          <div className="org-colors">
            {SWATCHES.map(c => (
              <div
                key={c}
                className={`org-color-swatch${color === c ? " sel" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        <div className="org-modal-btns">
          <button className="org-btn" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="org-btn primary" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "A guardar..." : "Criar departamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add-Position modal ─────────────────────────────────────────────── */
function AddPositionModal({ dept, employees, onClose, onSave }: {
  dept: Department;
  employees: Employee[];
  onClose: () => void;
  onSave: (empId: string, jobTitle: string) => Promise<void>;
}) {
  const [empId, setEmpId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // Pre-fill job title when employee selected
  function handleEmpChange(id: string) {
    setEmpId(id);
    const emp = employees.find(e => e.id === id);
    if (emp?.job_title && !jobTitle) setJobTitle(emp.job_title);
  }

  async function handleSave() {
    if (!empId) return;
    setSaving(true);
    await onSave(empId, jobTitle);
    setSaving(false);
    onClose();
  }

  return (
    <div className="org-overlay" onClick={onClose}>
      <div className="org-modal" onClick={e => e.stopPropagation()}>
        <h3>Adicionar cargo — {dept.name}</h3>
        <div className="org-field">
          <label className="org-label">Colaborador</label>
          <select
            className="org-input org-select"
            value={empId}
            onChange={e => handleEmpChange(e.target.value)}
          >
            <option value="">— Selecionar colaborador —</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{empName(e)}</option>
            ))}
          </select>
        </div>
        <div className="org-field">
          <label className="org-label">Cargo / Título</label>
          <input
            className="org-input"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="Ex: Desenvolvedor Senior, Analista..."
          />
        </div>
        <div className="org-modal-btns">
          <button className="org-btn" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="org-btn primary" onClick={handleSave} disabled={saving || !empId}>
            {saving ? "A guardar..." : "Adicionar cargo"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main OrgChart component ────────────────────────────────────────── */
export function OrgChart({
  ceo,
  departments,
  employees,
  isAdmin,
  onAddDepartment,
  onAddPosition,
  onReorderDepts,
}: OrgChartProps) {
  const [deptOrder, setDeptOrder] = useState<string[]>([]);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [addPosFor, setAddPosFor] = useState<Department | null>(null);
  const dragIdx = useRef<number | null>(null);

  // Inject CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "org-css";
    el.textContent = ORG_CSS;
    if (!document.getElementById("org-css")) document.head.appendChild(el);
    return () => { document.getElementById("org-css")?.remove(); };
  }, []);

  // Keep deptOrder in sync with incoming departments
  useEffect(() => {
    setDeptOrder(prev => {
      const existing = prev.filter(id => departments.some(d => d.id === id));
      const newOnes = departments.filter(d => !existing.includes(d.id)).map(d => d.id);
      return [...existing, ...newOnes];
    });
  }, [departments]);

  const orderedDepts = deptOrder
    .map(id => departments.find(d => d.id === id))
    .filter(Boolean) as Department[];

  // Employees grouped by dept name
  function empsByDept(dept: Department) {
    return employees.filter(e =>
      e.department?.toLowerCase().trim() === dept.name.toLowerCase().trim()
    );
  }

  // ── Drag handlers for departments ──
  function onDragStart(idx: number) { dragIdx.current = idx; }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const next = [...deptOrder];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(idx, 0, moved);
    dragIdx.current = idx;
    setDeptOrder(next);
  }
  function onDragEnd() {
    dragIdx.current = null;
    onReorderDepts(deptOrder);
  }

  // Available employees (not already in any dept in org)
  const usedEmpIds = new Set(
    addPosFor
      ? empsByDept(addPosFor).map(e => e.id)
      : []
  );
  const availableEmps = employees.filter(e => !usedEmpIds.has(e.id));

  const ceoStyle = ceo ? avatarStyle(ceo.id) : { bg: "#f1f5f9", text: "#94a3b8" };

  /* ── Number of columns including the "+" ── */
  const colCount = orderedDepts.length + (isAdmin ? 1 : 0);

  return (
    <div className="org-wrap">
      {/* ── CEO ── */}
      <div className="org-tree">
        <div className="org-card ceo" style={{ width: 180 }}>
          {ceo ? (
            <>
              <div
                className="org-avatar"
                style={{ background: ceoStyle.bg, color: ceoStyle.text }}
              >
                {initials(ceo)}
              </div>
              <div className="org-emp-name">{empName(ceo)}</div>
              <div className="org-emp-role">{ceo.job_title || "CEO"}</div>
            </>
          ) : (
            <div style={{ color: "var(--gray-400)", fontSize: 12 }}>CEO não definido</div>
          )}
        </div>

        {colCount > 0 && <div className="org-vline" />}

        {/* ── Department row ── */}
        {colCount > 0 && (
          <div className="org-hbar-wrap">
            {/* Horizontal connector bar */}
            {colCount > 1 && (
              <div
                className="org-hbar"
                style={{
                  left: `calc(100% / (2 * ${colCount}))`,
                  width: `calc(100% - 100% / ${colCount})`,
                }}
              />
            )}

            {orderedDepts.map((dept, idx) => {
              const emps = empsByDept(dept);
              const deptColor = dept.color || "#8A8A85";
              const empCount = emps.length;

              return (
                <div
                  key={dept.id}
                  className="org-col"
                  style={{ padding: "0 10px" }}
                >
                  {/* vertical drop from hbar to dept card */}
                  <div className="org-vline" />

                  {/* Dept card */}
                  <div
                    className={`org-card dept${isAdmin ? " draggable" : ""}`}
                    draggable={isAdmin}
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={e => onDragOver(e, idx)}
                    onDragEnd={onDragEnd}
                  >
                    <div className="org-dept-dot" style={{ background: deptColor }} />
                    <div className="org-dept-name">{dept.name}</div>
                    <div className="org-dept-count">
                      {empCount} {empCount === 1 ? "pessoa" : "pessoas"}
                    </div>
                  </div>

                  {/* vertical line to employees */}
                  {(empCount > 0 || isAdmin) && <div className="org-vline" />}

                  {/* Employee row */}
                  {(empCount > 0 || isAdmin) && (
                    <div className="org-hbar-wrap">
                      {/* hbar for employees */}
                      {(empCount + (isAdmin ? 1 : 0)) > 1 && (
                        <div
                          className="org-hbar"
                          style={{
                            left: `calc(100% / (2 * ${empCount + (isAdmin ? 1 : 0)}))`,
                            width: `calc(100% - 100% / ${empCount + (isAdmin ? 1 : 0)})`,
                          }}
                        />
                      )}

                      {emps.map(emp => {
                        const av = avatarStyle(emp.id);
                        return (
                          <div key={emp.id} className="org-col" style={{ padding: "0 6px" }}>
                            <div className="org-vline" />
                            <div className="org-card emp">
                              <div
                                className="org-avatar"
                                style={{ background: av.bg, color: av.text, width: 38, height: 38, fontSize: 12 }}
                              >
                                {initials(emp)}
                              </div>
                              <div className="org-emp-name">{empName(emp)}</div>
                              <div className="org-emp-role">{emp.job_title || "—"}</div>
                              {dept.color && (
                                <span
                                  className="org-badge"
                                  style={{
                                    background: deptColor + "22",
                                    color: deptColor,
                                  }}
                                >
                                  {dept.name}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* "+" to add position in this dept */}
                      {isAdmin && (
                        <div className="org-col" style={{ padding: "0 6px" }}>
                          <div className="org-vline" />
                          <div
                            className="org-card plus"
                            style={{ width: 120, minHeight: 90 }}
                            onClick={() => setAddPosFor(dept)}
                          >
                            <div className="plus-icon">+</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* "+" to add new dept */}
            {isAdmin && (
              <div className="org-col" style={{ padding: "0 10px" }}>
                <div className="org-vline" />
                <div
                  className="org-card dept plus"
                  onClick={() => setAddDeptOpen(true)}
                >
                  <div className="plus-icon">+</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {addDeptOpen && (
        <AddDeptModal
          onClose={() => setAddDeptOpen(false)}
          onSave={onAddDepartment}
        />
      )}
      {addPosFor && (
        <AddPositionModal
          dept={addPosFor}
          employees={availableEmps}
          onClose={() => setAddPosFor(null)}
          onSave={(empId, jobTitle) => onAddPosition(addPosFor.id, empId, jobTitle)}
        />
      )}
    </div>
  );
}
