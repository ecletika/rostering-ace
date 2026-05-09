import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  OrgChart,
  type Department,
  type Employee,
  type OrgPosition,
} from "@/components/organograma/OrgChart";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Users, Building2, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/organograma")({
  head: () => ({ meta: [{ title: "Organograma" }] }),
  component: OrganogramaPage,
});

function OrganogramaPage() {
  const [positions, setPositions] = useState<OrgPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (cid: string) => {
    setLoading(true);

    const [posRes, deptRes, empRes] = await Promise.all([
      supabase
        .from("org_positions")
        .select(
          "*, department:departments(id, name, color), employee:employees(id, first_name, last_name, full_name, job_title, photo_url)"
        )
        .eq("company_id", cid)
        .order("ordem"),
      supabase
        .from("departments")
        .select("id, name, color")
        .eq("company_id", cid)
        .order("name"),
      supabase
        .from("employees")
        .select("id, first_name, last_name, full_name, job_title, photo_url")
        .eq("company_id", cid)
        .eq("status", "active")
        .order("first_name"),
    ]);

    if (posRes.error) toast.error("Erro ao carregar organograma");
    else setPositions((posRes.data ?? []) as OrgPosition[]);

    if (deptRes.data) setDepartments(deptRes.data as Department[]);
    if (empRes.data) setEmployees(empRes.data as Employee[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: emp } = await supabase
        .from("employees")
        .select("id, company_id, role")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!emp) { setLoading(false); return; }

      setCompanyId(emp.company_id);
      setIsAdmin(emp.role === "admin" || emp.role === "manager");
      loadData(emp.company_id);
    }
    init();
  }, [loadData]);

  async function handleSave(id: string, data: Partial<OrgPosition>) {
    const { error } = await supabase
      .from("org_positions")
      .update({
        titulo: data.titulo,
        department_id: data.department_id ?? null,
        employee_id: data.employee_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar posição");
    } else {
      toast.success("Posição actualizada");
      if (companyId) loadData(companyId);
    }
  }

  async function handleAddChild(parentId: string | null) {
    if (!companyId) return;
    const siblings = positions.filter((p) => p.parent_id === parentId);
    const maxOrdem = siblings.reduce((acc, p) => Math.max(acc, p.ordem), -1);

    const { error } = await supabase.from("org_positions").insert({
      titulo: "Cargo por preencher",
      parent_id: parentId,
      company_id: companyId,
      ordem: maxOrdem + 1,
    });

    if (error) {
      toast.error("Erro ao adicionar posição");
    } else {
      loadData(companyId);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("org_positions").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover posição");
    } else {
      toast.success("Posição removida");
      if (companyId) loadData(companyId);
    }
  }

  const total = positions.length;
  const preenchidas = positions.filter((p) => !!p.employee_id).length;
  const deptsCount = new Set(positions.map((p) => p.department_id).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organograma</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Estrutura hierárquica — {total} posições
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleAddChild(null)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nova posição raiz
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Posições"
          value={total}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          label="Preenchidas"
          value={preenchidas}
        />
        <StatCard
          icon={<Building2 className="w-5 h-5 text-orange-500" />}
          label="Departamentos"
          value={deptsCount}
        />
      </div>

      {/* Chart */}
      <div className="overflow-auto pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
            A carregar organograma...
          </div>
        ) : (
          <OrgChart
            positions={positions}
            departments={departments}
            employees={employees}
            onSave={handleSave}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
