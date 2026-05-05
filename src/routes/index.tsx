import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EscalaTable } from "@/components/escala/EscalaTable";
import { MESES, type TipoEscala } from "@/lib/escala-utils";
import type { Colaborador, Configuracoes, EscalaRow, Versiculo } from "@/lib/types-escala";
import { Button } from "@/components/ui/button";
import { Settings, Download, Image as ImgIcon } from "lucide-react";
import { exportarEscala } from "@/lib/export-escala";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Escala de Cultos" },
      { name: "description", content: "Escala mensal de cultos: quartas e domingos." },
    ],
  }),
  component: Index,
});

function Index() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tipo, setTipo] = useState<TipoEscala>("quarta");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [escalas, setEscalas] = useState<EscalaRow[]>([]);
  const [versiculos, setVersiculos] = useState<Versiculo[]>([]);
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("colaboradores").select("id,nome").order("nome").then(({ data }) => {
      if (data) setColaboradores(data);
    });
    supabase.from("versiculos").select("*").then(({ data }) => {
      if (data) setVersiculos(data as Versiculo[]);
    });
    supabase.from("configuracoes").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setConfig(data as Configuracoes);
    });
  }, []);

  useEffect(() => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = new Date(year, month + 1, 1);
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-01`;
    supabase
      .from("escalas")
      .select("*")
      .eq("tipo", tipo)
      .gte("data", start)
      .lt("data", end)
      .then(({ data }) => {
        setEscalas((data as EscalaRow[]) ?? []);
      });
  }, [year, month, tipo]);

  const versiculo =
    versiculos.find((v) => v.id === escalas[0]?.versiculo_id) ?? versiculos[0] ?? null;

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 1 + i);

  const filename = `escala-${tipo}-${MESES[month].toLowerCase()}-${year}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-page)" }}>
      <header className="px-4 py-6 max-w-3xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-[oklch(0.55_0.14_220)]">Escalas</h1>
        <Link to="/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" /> Admin
          </Button>
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-4 pb-3 grid grid-cols-3 gap-2">
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoEscala)} className="rounded-md border border-input bg-white px-3 py-2 text-sm font-medium">
          <option value="quarta">Quarta-feira</option>
          <option value="domingo">Domingo</option>
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-md border border-input bg-white px-3 py-2 text-sm font-medium">
          {MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-md border border-input bg-white px-3 py-2 text-sm font-medium">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 justify-end">
        <Button size="sm" variant="outline" className="gap-2" onClick={() => exportRef.current && exportarEscala(exportRef.current, filename, "png")}>
          <ImgIcon className="h-4 w-4" /> PNG
        </Button>
        <Button size="sm" className="gap-2" onClick={() => exportRef.current && exportarEscala(exportRef.current, filename, "pdf")}>
          <Download className="h-4 w-4" /> PDF
        </Button>
      </div>

      <main className="max-w-3xl mx-auto px-4 pb-12">
        <EscalaTable
          year={year}
          month={month}
          tipo={tipo}
          escalas={escalas}
          colaboradores={colaboradores}
          versiculo={versiculo}
          config={config}
          exportRef={exportRef}
        />
      </main>
    </div>
  );
}
