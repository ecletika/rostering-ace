import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export interface OrgPosition {
  id: string;
  titulo: string;
  department_id: string | null;
  employee_id: string | null;
  parent_id: string | null;
  ordem: number;
  department?: Department | null;
  employee?: Employee | null;
  children?: OrgPosition[];
}

interface OrgChartProps {
  positions: OrgPosition[];
  departments: Department[];
  employees: Employee[];
  onSave: (id: string, data: Partial<OrgPosition>) => Promise<void>;
  onAddChild: (parentId: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isAdmin: boolean;
}

const AVATAR_PALETTE = [
  { bg: "#e8eeff", text: "#3b5bdb" },
  { bg: "#fff3e0", text: "#e65100" },
  { bg: "#e8f5e9", text: "#2e7d32" },
  { bg: "#fce4ec", text: "#c62828" },
  { bg: "#f3e5f5", text: "#6a1b9a" },
  { bg: "#e0f2f1", text: "#00695c" },
];

function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function initials(emp: Employee) {
  const n = emp.full_name || `${emp.first_name} ${emp.last_name}`;
  return n
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function deptStyle(dept: Department | null | undefined) {
  const hex = dept?.color || "#94a3b8";
  return { backgroundColor: hex + "22", color: hex };
}

// ─── Edit dialog ─────────────────────────────────────────────────────────────

interface EditDialogProps {
  position: OrgPosition;
  departments: Department[];
  employees: Employee[];
  onClose: () => void;
  onSave: (data: Partial<OrgPosition>) => Promise<void>;
}

function EditDialog({ position, departments, employees, onClose, onSave }: EditDialogProps) {
  const [titulo, setTitulo] = useState(position.titulo);
  const [deptId, setDeptId] = useState(position.department_id ?? "");
  const [empId, setEmpId] = useState(position.employee_id ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      titulo,
      department_id: deptId || null,
      employee_id: empId || null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Configurar posição</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Cargo / Título</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: CEO, Diretor, Analista..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Departamento</Label>
            <Select value={deptId} onValueChange={setDeptId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Nenhum —</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Pessoa</Label>
            <Select value={empId} onValueChange={setEmpId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar pessoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Vago —</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.full_name || `${e.first_name} ${e.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Check className="w-4 h-4 mr-1" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Single node ─────────────────────────────────────────────────────────────

interface NodeProps {
  pos: OrgPosition;
  departments: Department[];
  employees: Employee[];
  onEdit: (pos: OrgPosition) => void;
  onAddChild: (parentId: string | null) => Promise<void>;
  isAdmin: boolean;
  isRoot?: boolean;
}

function OrgNode({ pos, departments, employees, onEdit, onAddChild, isAdmin, isRoot }: NodeProps) {
  const dept = pos.department ?? departments.find((d) => d.id === pos.department_id) ?? null;
  const emp = pos.employee ?? null;
  const isEmpty = !emp;
  const color = emp ? avatarColor(emp.id) : { bg: "#f1f5f9", text: "#94a3b8" };
  const hasChildren = (pos.children?.length ?? 0) > 0;

  return (
    <div className="flex flex-col items-center">
      {/* ── Card ── */}
      <div
        onClick={() => isAdmin && onEdit(pos)}
        className={[
          "flex flex-col items-center rounded-2xl bg-white px-5 py-4 w-44 shadow-sm transition-shadow",
          isAdmin ? "cursor-pointer hover:shadow-md" : "",
          isRoot ? "border-2 border-blue-400" : "border border-gray-200",
          isEmpty ? "border-dashed" : "",
        ].join(" ")}
      >
        {/* Avatar */}
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full mb-2 text-base font-semibold select-none"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {isEmpty ? (
            <Plus className="w-5 h-5" />
          ) : (
            initials(emp!)
          )}
        </div>

        {/* Name */}
        <p
          className={[
            "text-sm font-semibold text-center leading-tight",
            isEmpty ? "text-gray-400" : "text-gray-800",
          ].join(" ")}
        >
          {isEmpty ? "Cargo por preencher" : (emp!.full_name || `${emp!.first_name} ${emp!.last_name}`)}
        </p>

        {/* Job title */}
        {!isEmpty && pos.titulo && (
          <p className="text-xs text-blue-500 text-center mt-0.5 leading-tight">{pos.titulo}</p>
        )}

        {/* Department badge */}
        {dept ? (
          <span
            className="mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={deptStyle(dept)}
          >
            {dept.name}
          </span>
        ) : (
          !isEmpty && (
            <span className="mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
              {pos.titulo}
            </span>
          )
        )}

        {/* Associar button */}
        {isEmpty && isAdmin && (
          <Button
            size="sm"
            variant="outline"
            className="mt-3 text-xs h-7 px-3 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pos);
            }}
          >
            Associar pessoa
          </Button>
        )}
      </div>

      {/* Add-child button */}
      {isAdmin && (
        <button
          title="Adicionar subordinado"
          onClick={() => onAddChild(pos.id)}
          className="mt-2 flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}

      {/* Children */}
      {hasChildren && (
        <>
          <div className="w-px h-6 bg-gray-300" />
          <div className="relative flex items-start">
            {/* Horizontal connector bar spans from center of first to center of last child */}
            {pos.children!.length > 1 && (
              <div
                className="absolute bg-gray-300"
                style={{
                  height: 1,
                  top: 0,
                  left: `calc(100% / (2 * ${pos.children!.length}))`,
                  width: `calc(100% - 100% / ${pos.children!.length})`,
                }}
              />
            )}
            {pos.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center px-3">
                <div className="w-px h-6 bg-gray-300" />
                <OrgNode
                  pos={child}
                  departments={departments}
                  employees={employees}
                  onEdit={onEdit}
                  onAddChild={onAddChild}
                  isAdmin={isAdmin}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OrgChart({
  positions,
  departments,
  employees,
  onSave,
  onAddChild,
  onDelete,
  isAdmin,
}: OrgChartProps) {
  const [editing, setEditing] = useState<OrgPosition | null>(null);

  // Build tree
  const map = new Map<string, OrgPosition>();
  positions.forEach((p) => map.set(p.id, { ...p, children: [] }));
  const roots: OrgPosition[] = [];
  map.forEach((p) => {
    if (p.parent_id && map.has(p.parent_id)) {
      const parent = map.get(p.parent_id)!;
      parent.children = parent.children ?? [];
      parent.children.push(p);
      parent.children.sort((a, b) => a.ordem - b.ordem);
    } else {
      roots.push(p);
    }
  });

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
        <p className="text-sm">Nenhuma posição cadastrada.</p>
        {isAdmin && (
          <Button onClick={() => onAddChild(null)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar posição raiz
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0 overflow-auto min-w-max py-8 px-4">
      {isAdmin && positions.length === 0 && (
        <Button onClick={() => onAddChild(null)} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar posição raiz
        </Button>
      )}
      {roots.map((root) => (
        <OrgNode
          key={root.id}
          pos={root}
          departments={departments}
          employees={employees}
          onEdit={setEditing}
          onAddChild={onAddChild}
          isAdmin={isAdmin}
          isRoot
        />
      ))}

      {editing && (
        <EditDialog
          position={editing}
          departments={departments}
          employees={employees}
          onClose={() => setEditing(null)}
          onSave={(data) => onSave(editing.id, data)}
        />
      )}
    </div>
  );
}
