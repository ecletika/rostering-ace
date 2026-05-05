import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EscalaTable } from "@/components/escala/EscalaTable";
import {
  ADMIN_PASSWORD, MESES, getDiasDoMes, isAdminAuthed, setAdminAuthed, toIsoDate, type TipoEscala,
} from "@/lib/escala-utils";
import type { Colaborador, Configuracoes, EscalaRow, Versiculo } from "@/lib/types-escala";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, LogOut, Trash2, Plus, Sparkles, Upload, Download, Image as ImgIcon, Palette } from "lucide-react";
import { exportarEscala } from "@/lib/export-escala";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Escalas" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  useEffect(() => setAuthed(isAdminAuthed()), []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-page)" }}>
        <Card className="w-full max-w-sm p-6 space-y-4">
          <h1 className="text-xl font-bold text-center">Área administrativa</h1>
          <p className="text-sm text-muted-foreground text-center">Digite a senha para acessar.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pwd === ADMIN_PASSWORD) { setAdminAuthed(true); setAuthed(true); toast.success("Bem-vindo!"); }
              else toast.error("Senha incorreta");
            }}
            className="space-y-3"
          >
            <Input type="password" placeholder="Senha" value={pwd} onChange={(e) => setPwd(e.target.value)} autoFocus />
            <Button type="submit" className="w-full">Entrar</Button>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:underline">← Voltar</Link>
          </form>
          <p className="text-[10px] text-center text-muted-foreground">Senha padrão: <code>{ADMIN_PASSWORD}</code></p>
        </Card>
        <Toaster />
      </div>
    );
  }

  return <AdminDashboard onLogout={() => { setAdminAuthed(false); setAuthed(false); }} />;
}

type EditableField = "pregador_id" | "ministro_id" | "back1_id" | "back2_id" | "back3_id" | "instrumento_id";

const APARENCIA_DEFAULTS = {
  cor_fundo: "#FBF4F2",
  cor_principal: "#366EB4",
  cor_linha1: "#1FA6DE",
  cor_linha2: "#72C8EA",
  cor_mes_ano: "#366EB4",
  logo_tamanho: 96,
};

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tipo, setTipo] = useState<TipoEscala>("quarta");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [novo, setNovo] = useState("");
  const [escalas, setEscalas] = useState<EscalaRow[]>([]);
  const [versiculos, setVersiculos] = useState<Versiculo[]>([]);
  const [vTexto, setVTexto] = useState("");
  const [vRef, setVRef] = useState("");
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [versiculoSelecionadoId, setVersiculoSelecionadoId] = useState<string>("");
  const [aparencia, setAparencia] = useState({ ...APARENCIA_DEFAULTS });
  const exportRef = useRef<HTMLDivElement>(null);

  const loadColab = async () => {
    const { data } = await supabase.from("colaboradores").select("id,nome").order("nome");
    if (data) setColaboradores(data);
  };
  const loadVers = async () => {
    const { data } = await supabase.from("versiculos").select("*").order("created_at");
    if (data) setVersiculos(data as Versiculo[]);
  };
  const loadConfig = async () => {
    const { data } = await supabase.from("configuracoes").select("*").limit(1).maybeSingle();
    if (data) setConfig(data as Configuracoes);
  };
  const loadEscalas = async () => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = new Date(year, month + 1, 1);
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-01`;
    const { data } = await supabase.from("escalas").select("*").eq("tipo", tipo).gte("data", start).lt("data", end);
    const list = (data as EscalaRow[]) ?? [];
    setEscalas(list);
    setVersiculoSelecionadoId(list[0]?.versiculo_id ?? "");
  };

  useEffect(() => { loadColab(); loadVers(); loadConfig(); }, []);
  useEffect(() => { loadEscalas(); /* eslint-disable-next-line */ }, [year, month, tipo]);

  // Sync aparencia from loaded config
  useEffect(() => {
    if (!config) return;
    setAparencia({
      cor_fundo: config.cor_fundo ?? APARENCIA_DEFAULTS.cor_fundo,
      cor_principal: config.cor_principal ?? APARENCIA_DEFAULTS.cor_principal,
      cor_linha1: config.cor_linha1 ?? APARENCIA_DEFAULTS.cor_linha1,
      cor_linha2: config.cor_linha2 ?? APARENCIA_DEFAULTS.cor_linha2,
      cor_mes_ano: config.cor_mes_ano ?? config.cor_principal ?? APARENCIA_DEFAULTS.cor_mes_ano,
      logo_tamanho: config.logo_tamanho ?? APARENCIA_DEFAULTS.logo_tamanho,
    });
  }, [config?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const configPreview: Configuracoes = {
    id: config?.id ?? "",
    logo_url: config?.logo_url ?? null,
    rodape_image_url: config?.rodape_image_url ?? null,
    ...aparencia,
  };

  const datas = useMemo(() => getDiasDoMes(year, month, tipo), [year, month, tipo]);

  const ensureRows = async () => {
    const existentes = new Set(escalas.map((e) => e.data));
    const faltando = datas.map(toIsoDate).filter((d) => !existentes.has(d));
    if (faltando.length === 0) return escalas;
    const inserts = faltando.map((d) => ({
      data: d, tipo,
      pregador_id: null, ministro_id: null, back1_id: null, back2_id: null, back3_id: null, instrumento_id: null,
    }));
    const { data, error } = await supabase.from("escalas").insert(inserts).select("*");
    if (error) { toast.error("Erro ao criar escala"); return escalas; }
    const merged = [...escalas, ...((data as EscalaRow[]) ?? [])];
    setEscalas(merged);
    return merged;
  };

  const onCellChange = async (data: string, field: EditableField, value: string | null) => {
    const current = await ensureRows();
    const row = current.find((e) => e.data === data);
    if (!row?.id) return;
    const updated = { ...row, [field]: value };
    setEscalas((prev) => prev.map((e) => (e.id === row.id ? updated : e)));
    const patch = { [field]: value } as Record<string, string | null>;
    const { error } = await supabase.from("escalas").update(patch as never).eq("id", row.id);
    if (error) toast.error("Erro ao salvar");
  };

  const aplicarVersiculo = async (vid: string) => {
    setVersiculoSelecionadoId(vid);
    const current = await ensureRows();
    const ids = current.map((r) => r.id).filter((x): x is string => Boolean(x));
    if (ids.length === 0) return;
    const { error } = await supabase.from("escalas").update({ versiculo_id: vid || null } as never).in("id", ids);
    if (error) { toast.error("Erro ao aplicar versículo"); return; }
    setEscalas((prev) => prev.map((e) => ({ ...e, versiculo_id: vid || null })));
    toast.success("Versículo aplicado");
  };

  const addColab = async () => {
    const nome = novo.trim(); if (!nome) return;
    const { error } = await supabase.from("colaboradores").insert({ nome });
    if (error) { toast.error("Erro"); return; }
    setNovo(""); toast.success("Cadastrado"); loadColab();
  };
  const removeColab = async (id: string) => {
    if (!confirm("Remover colaborador?")) return;
    await supabase.from("colaboradores").delete().eq("id", id);
    loadColab(); loadEscalas();
  };

  const addVers = async () => {
    if (!vTexto.trim() || !vRef.trim()) return;
    const { error } = await supabase.from("versiculos").insert({ texto: vTexto.trim(), referencia: vRef.trim() });
    if (error) { toast.error("Erro"); return; }
    setVTexto(""); setVRef(""); toast.success("Versículo adicionado"); loadVers();
  };
  const removeVers = async (id: string) => {
    if (!confirm("Remover versículo?")) return;
    await supabase.from("versiculos").delete().eq("id", id);
    loadVers();
  };

  const gerarVersiculoIA = async () => {
    toast.loading("Gerando com IA...", { id: "gen" });
    try {
      const { data, error } = await supabase.functions.invoke("gerar-versiculo");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const { error: insErr } = await supabase.from("versiculos").insert({ texto: data.texto, referencia: data.referencia });
      if (insErr) throw insErr;
      toast.success("Versículo gerado!", { id: "gen" });
      loadVers();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao gerar", { id: "gen" });
    }
  };

  const uploadImagem = async (file: File, campo: "logo_url" | "rodape_image_url") => {
    const ext = file.name.split(".").pop();
    const path = `${campo}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("escala-assets").upload(path, file, { upsert: true });
    if (upErr) { toast.error("Erro ao enviar"); return; }
    const { data } = supabase.storage.from("escala-assets").getPublicUrl(path);
    const url = data.publicUrl;
    if (!config) {
      const insertPayload = { [campo]: url } as Record<string, string>;
      const { data: ins } = await supabase.from("configuracoes").insert(insertPayload as never).select().single();
      setConfig(ins as Configuracoes);
    } else {
      const updatePayload = { [campo]: url } as Record<string, string>;
      const { error } = await supabase.from("configuracoes").update(updatePayload as never).eq("id", config.id);
      if (error) { toast.error("Erro"); return; }
      setConfig({ ...config, [campo]: url });
    }
    toast.success("Imagem atualizada");
  };

  const saveAparencia = async () => {
    try {
      if (!config) {
        const { data: ins, error } = await supabase.from("configuracoes").insert(aparencia as never).select().single();
        if (error) throw error;
        setConfig(ins as Configuracoes);
      } else {
        const { error } = await supabase.from("configuracoes").update(aparencia as never).eq("id", config.id);
        if (error) throw error;
        setConfig((prev) => (prev ? { ...prev, ...aparencia } : prev));
      }
      toast.success("Aparência salva");
    } catch {
      toast.error("Erro ao salvar aparência");
    }
  };

  const versiculoAtual = versiculos.find((v) => v.id === versiculoSelecionadoId) ?? versiculos[0] ?? null;
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 1 + i);
  const filename = `escala-${tipo}-${MESES[month].toLowerCase()}-${year}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-page)" }}>
      <header className="px-4 py-4 max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-[oklch(0.55_0.14_220)]">
          <ArrowLeft className="h-4 w-4" /> Ver escala
        </Link>
        <h1 className="text-lg font-bold text-[oklch(0.55_0.14_220)]">Painel Admin</h1>
        <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-12 grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4">
          {/* Colaboradores */}
          <Card className="p-4">
            <h2 className="font-bold mb-3">Colaboradores</h2>
            <div className="flex gap-2 mb-3">
              <Input placeholder="Nome" value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addColab()} />
              <Button onClick={addColab} size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
            <ul className="space-y-1 max-h-60 overflow-auto">
              {colaboradores.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded px-2 py-1 hover:bg-muted">
                  <span className="text-sm">{c.nome}</span>
                  <button onClick={() => removeColab(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
              {colaboradores.length === 0 && <li className="text-sm text-muted-foreground">Nenhum cadastrado.</li>}
            </ul>
          </Card>

          {/* Imagens */}
          <Card className="p-4">
            <h2 className="font-bold mb-3">Imagens</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Logo</label>
                {config?.logo_url && <img src={config.logo_url} alt="" className="h-16 w-16 object-contain rounded-full ring-2 ring-border bg-white mb-2" />}
                <label className="flex items-center gap-2 text-sm border border-input rounded-md px-3 py-2 cursor-pointer hover:bg-muted">
                  <Upload className="h-4 w-4" /> Trocar logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImagem(e.target.files[0], "logo_url")} />
                </label>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Imagem do rodapé</label>
                {config?.rodape_image_url && <img src={config.rodape_image_url} alt="" className="max-h-24 object-contain rounded-md mb-2" />}
                <label className="flex items-center gap-2 text-sm border border-input rounded-md px-3 py-2 cursor-pointer hover:bg-muted">
                  <Upload className="h-4 w-4" /> Trocar imagem
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImagem(e.target.files[0], "rodape_image_url")} />
                </label>
              </div>
            </div>
          </Card>

          {/* Aparência */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <h2 className="font-bold">Aparência</h2>
              </div>
              <Button size="sm" onClick={saveAparencia}>Salvar</Button>
            </div>
            <div className="space-y-3">
              <ColorRow
                label="Fundo (branco)"
                value={aparencia.cor_fundo}
                onChange={(v) => setAparencia((p) => ({ ...p, cor_fundo: v }))}
              />
              <ColorRow
                label="Cor principal (azul)"
                value={aparencia.cor_principal}
                onChange={(v) => setAparencia((p) => ({ ...p, cor_principal: v }))}
              />
              <ColorRow
                label="Linha par"
                value={aparencia.cor_linha1}
                onChange={(v) => setAparencia((p) => ({ ...p, cor_linha1: v }))}
              />
              <ColorRow
                label="Linha ímpar"
                value={aparencia.cor_linha2}
                onChange={(v) => setAparencia((p) => ({ ...p, cor_linha2: v }))}
              />
              <ColorRow
                label="Mês / Ano"
                value={aparencia.cor_mes_ano}
                onChange={(v) => setAparencia((p) => ({ ...p, cor_mes_ano: v }))}
              />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm">Tamanho da logo</label>
                  <span className="text-sm font-medium tabular-nums">{aparencia.logo_tamanho}px</span>
                </div>
                <input
                  type="range"
                  min={48}
                  max={192}
                  step={8}
                  value={aparencia.logo_tamanho}
                  onChange={(e) => setAparencia((p) => ({ ...p, logo_tamanho: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>48px</span>
                  <span>192px</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Versículos */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Versículos</h2>
              <Button size="sm" variant="outline" className="gap-1" onClick={gerarVersiculoIA}>
                <Sparkles className="h-3 w-3" /> IA
              </Button>
            </div>
            <div className="space-y-2 mb-3">
              <Input placeholder="Texto do versículo" value={vTexto} onChange={(e) => setVTexto(e.target.value)} />
              <div className="flex gap-2">
                <Input placeholder="Referência (ex: Salmos 95:6)" value={vRef} onChange={(e) => setVRef(e.target.value)} />
                <Button onClick={addVers} size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <ul className="space-y-2 max-h-60 overflow-auto">
              {versiculos.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-2 rounded p-2 hover:bg-muted text-xs">
                  <div>
                    <p className="line-clamp-2">{v.texto}</p>
                    <p className="font-bold mt-1">{v.referencia}</p>
                  </div>
                  <button onClick={() => removeVers(v.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-3 w-3" /></button>
                </li>
              ))}
              {versiculos.length === 0 && <li className="text-sm text-muted-foreground">Nenhum cadastrado.</li>}
            </ul>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
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

          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-sm font-medium">Versículo desta escala:</label>
            <select value={versiculoSelecionadoId} onChange={(e) => aplicarVersiculo(e.target.value)} className="flex-1 min-w-[200px] rounded-md border border-input bg-white px-3 py-2 text-sm">
              <option value="">— padrão —</option>
              {versiculos.map((v) => <option key={v.id} value={v.id}>{v.referencia} — {v.texto.slice(0, 40)}...</option>)}
            </select>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => exportRef.current && exportarEscala(exportRef.current, filename, "png")}>
              <ImgIcon className="h-4 w-4" /> PNG
            </Button>
            <Button size="sm" className="gap-2" onClick={() => exportRef.current && exportarEscala(exportRef.current, filename, "pdf")}>
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>

          <EscalaTable
            year={year} month={month} tipo={tipo}
            escalas={escalas} colaboradores={colaboradores}
            versiculo={versiculoAtual} config={configPreview}
            editable onChange={onCellChange} exportRef={exportRef}
          />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm flex-1">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground tabular-nums font-mono">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 rounded border border-input cursor-pointer p-0.5 bg-white"
          title={label}
        />
      </div>
    </div>
  );
}
