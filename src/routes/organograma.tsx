import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  OrgChart,
  type Department,
  type Employee,
} from "@/components/organograma/OrgChart";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/organograma")({
  head: () => ({ meta: [{ title: "Organograma" }] }),
  component: OrganogramaPage,
});

function OrganogramaPage() {
  const [ceo, setCeo] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (cid: string) => {
    const [deptRes, empRes] = await Promise.all([
      supabase
        .from("departments")
        .select("id, name, color")
        .eq("company_id", cid)
        .order("name"),
      supabase
        .from("employees")
        .select("id, first_name, last_name, full_name, job_title, photo_url, department, role, manager_id, reports_to")
        .eq("company_id", cid)
        .eq("status", "active")
        .order("first_name"),
    ]);

    const allEmps: Employee[] = (empRes.data ?? []) as Employee[];

    // CEO = active employee with no reports_to and no manager_id (root)
    const root =
      allEmps.find(e => !e.reports_to && !e.manager_id) ??
      allEmps.find(e => e.role === "admin") ??
      null;

    setCeo(root);
    setDepartments((deptRes.data ?? []) as Department[]);
    // Employees in the chart are all EXCEPT the CEO
    setEmployees(allEmps.filter(e => e.id !== root?.id));
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
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

  async function handleAddDepartment(data: { name: string; color: string }) {
    if (!companyId) return;
    const { error } = await supabase.from("departments").insert({
      name: data.name,
      color: data.color,
      company_id: companyId,
    });
    if (error) {
      toast.error("Erro ao criar departamento");
    } else {
      toast.success("Departamento criado");
      loadData(companyId);
    }
  }

  async function handleAddPosition(deptId: string, empId: string, jobTitle: string) {
    if (!companyId) return;
    // Get dept name to update employee's department text field
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

    const { error } = await supabase
      .from("employees")
      .update({
        department: dept.name,
        job_title: jobTitle || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", empId);

    if (error) {
      toast.error("Erro ao adicionar cargo");
    } else {
      toast.success("Cargo adicionado");
      loadData(companyId);
    }
  }

  function handleReorderDepts(ids: string[]) {
    // Client-side reorder only — can be persisted later
    setDepartments(prev => {
      const map = new Map(prev.map(d => [d.id, d]));
      return ids.map(id => map.get(id)!).filter(Boolean);
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#EEECEA" }}>
      <Toaster />

      {/* Header */}
      <div style={{
        background: "white", borderBottom: "0.5px solid #E4E4E0",
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: "#2C2C2A" }}>Organograma</h1>
          <p style={{ fontSize: 12, color: "#8A8A85", marginTop: 1 }}>
            Estrutura hierárquica da empresa
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#8A8A85" }}>
          <span><b style={{ color: "#2C2C2A" }}>{departments.length}</b> departamentos</span>
          <span><b style={{ color: "#2C2C2A" }}>{employees.length}</b> colaboradores</span>
        </div>
      </div>

      {/* Chart canvas */}
      <div style={{ overflow: "auto", padding: "32px 24px 48px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#8A8A85", paddingTop: 80, fontSize: 13 }}>
            A carregar organograma...
          </div>
        ) : (
          <OrgChart
            ceo={ceo}
            departments={departments}
            employees={employees}
            isAdmin={isAdmin}
            onAddDepartment={handleAddDepartment}
            onAddPosition={handleAddPosition}
            onReorderDepts={handleReorderDepts}
          />
        )}
      </div>
    </div>
  );
}
