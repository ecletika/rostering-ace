import { Church } from "lucide-react";
import { MESES, getDiasDoMes, toIsoDate, tituloTipo, type TipoEscala } from "@/lib/escala-utils";
import type { Colaborador, Configuracoes, EscalaRow, Versiculo } from "@/lib/types-escala";

type EditableField = "pregador_id" | "ministro_id" | "back1_id" | "back2_id" | "back3_id" | "instrumento_id";

interface Props {
  year: number;
  month: number;
  tipo: TipoEscala;
  escalas: EscalaRow[];
  colaboradores: Colaborador[];
  versiculo?: Versiculo | null;
  config?: Configuracoes | null;
  editable?: boolean;
  onChange?: (data: string, field: EditableField, value: string | null) => void;
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

const FIELDS: { key: EditableField; label: string }[] = [
  { key: "pregador_id", label: "MESA DE SOM" },
  { key: "ministro_id", label: "PC (PROJEÇÃO)" },
  { key: "back1_id", label: "FOTOS / VIDEOS" },
];

function getPaleta(config?: Configuracoes | null) {
  const principal = config?.cor_principal ?? "#366EB4";
  return {
    azulEscuro: principal,
    azulClaro: config?.cor_linha1 ?? "#1FA6DE",
    azulClaroAlt: config?.cor_linha2 ?? "#72C8EA",
    fundo: config?.cor_fundo ?? "#FBF4F2",
    mesAno: config?.cor_mes_ano ?? principal,
    logoTamanho: config?.logo_tamanho ?? 96,
  };
}

export function EscalaTable({
  year, month, tipo, escalas, colaboradores, versiculo, config, editable, onChange, exportRef,
}: Props) {
  const PALETA = getPaleta(config);
  const datas = getDiasDoMes(year, month, tipo);
  const map = new Map(escalas.map((e) => [e.data, e]));
  const nome = (id: string | null | undefined) =>
    id ? colaboradores.find((c) => c.id === id)?.nome ?? "" : "";

  const logoSz = PALETA.logoTamanho;
  const divider: React.CSSProperties = { borderRight: "2px solid rgba(255,255,255,0.45)" };

  return (
    <div
      ref={exportRef}
      className="rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4"
      style={{ background: PALETA.fundo, borderColor: PALETA.azulEscuro, boxShadow: "0 10px 30px -10px rgba(22, 65, 122, 0.25)" }}
    >
      <div
        className="grid grid-cols-[64px_1fr] md:grid-cols-[112px_1fr_112px] items-center gap-2 md:gap-3 px-3 md:px-5 pt-3 md:pt-5 pb-3 md:pb-4"
        style={{ background: PALETA.fundo }}
      >
        <div className="flex justify-start">
          {config?.logo_url ? (
            <img
              src={config.logo_url}
              alt="Logo"
              className="object-contain rounded-full bg-white"
              style={{ width: logoSz, maxWidth: "100%", aspectRatio: "1 / 1", border: "3px solid #ffffff" }}
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: logoSz, maxWidth: "100%", aspectRatio: "1 / 1", background: PALETA.azulEscuro, border: "3px solid #ffffff" }}
            >
              <Church style={{ width: "50%", height: "50%" }} className="text-white" />
            </div>
          )}
        </div>
        <div className="text-center min-w-0">
          <h2
            className="text-xl sm:text-2xl md:text-5xl font-extrabold tracking-normal leading-none"
            style={{ color: PALETA.azulEscuro }}
          >
            ESCALA DE
          </h2>
          <h3
            className="text-xl sm:text-2xl md:text-5xl font-extrabold tracking-normal leading-none mt-1"
            style={{ color: PALETA.azulEscuro }}
          >
            {tituloTipo(tipo)}
          </h3>
          <div
            className="text-base sm:text-lg md:text-3xl font-bold mt-1 md:mt-2"
            style={{ color: PALETA.mesAno }}
          >
            {MESES[month]} / {year}
          </div>
        </div>
        <div className="hidden md:block" />
      </div>

      <div className="px-2 md:px-3 pb-3 md:pb-4 overflow-x-auto">
        <table
          className="w-full border-separate border-spacing-y-1 text-[10px] sm:text-xs md:text-sm"
          style={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              <th
                className="py-2 px-1 rounded-l-md w-[36px] md:w-auto font-bold"
                style={{ background: PALETA.azulEscuro, color: "#000", ...divider }}
              >
                DIA
              </th>
              {FIELDS.map((f, i) => (
                <th
                  key={f.key}
                  className={`py-2 px-0.5 md:px-1 font-bold ${i === FIELDS.length - 1 ? "rounded-r-md" : ""}`}
                  style={{
                    background: PALETA.azulEscuro,
                    color: "#000",
                    ...(i < FIELDS.length - 1 ? divider : {}),
                  }}
                >
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datas.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">
                  Sem datas neste mês.
                </td>
              </tr>
            )}
            {datas.map((d, idx) => {
              const iso = toIsoDate(d);
              const row = map.get(iso);
              const bg = idx % 2 === 0 ? PALETA.azulClaro : PALETA.azulClaroAlt;
              return (
                <tr key={iso} className="text-black font-semibold">
                  <td
                    className="text-center py-2 md:py-3 px-1 md:px-2 text-lg md:text-2xl font-extrabold rounded-l-md"
                    style={{ background: bg, ...divider }}
                  >
                    {String(d.getDate()).padStart(2, "0")}
                  </td>
                  {FIELDS.map((f, i) => (
                    <td
                      key={f.key}
                      className={`text-center py-1.5 md:py-2 px-0.5 md:px-1 ${i === FIELDS.length - 1 ? "rounded-r-md" : ""}`}
                      style={{ background: bg, ...(i < FIELDS.length - 1 ? divider : {}) }}
                    >
                      {editable ? (
                        <select
                          value={(row?.[f.key] as string | null) ?? ""}
                          onChange={(e) => onChange?.(iso, f.key, e.target.value || null)}
                          className="w-full bg-white/95 text-foreground rounded px-0.5 md:px-1 py-1 text-[10px] md:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          <option value="">—</option>
                          {colaboradores.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nome}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="block leading-tight break-words">
                          {nome(row?.[f.key] as string | null) || "—"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="relative overflow-hidden text-center min-h-40 md:min-h-56 border-t-2 border-dashed"
        style={{ background: PALETA.fundo, borderTopColor: "rgba(54, 110, 180, 0.3)" }}
      >
        {config?.rodape_image_url && (
          <img
            src={config.rodape_image_url}
            alt="Imagem"
            crossOrigin="anonymous"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {config?.rodape_image_url && (
          <div className="absolute inset-0" style={{ background: "rgba(255, 255, 255, 0.7)" }} />
        )}
        <div className="relative z-10 flex min-h-40 md:min-h-56 flex-col items-center justify-center px-4 md:px-6 py-5 md:py-7">
          <p
            className="font-extrabold uppercase text-xs sm:text-sm md:text-lg leading-snug drop-shadow-sm"
            style={{ color: PALETA.azulEscuro }}
          >
            {versiculo?.texto ?? "Venham! Adoremos prostrados e ajoelhemos diante do Senhor, o nosso Criador"}
          </p>
          <p className="font-extrabold mt-2 text-sm md:text-lg" style={{ color: PALETA.azulEscuro }}>
            {versiculo?.referencia ?? "Salmos 95:6"}
          </p>
        </div>
      </div>
    </div>
  );
}
