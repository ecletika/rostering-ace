export type TipoEscala = "quarta" | "domingo";

export const MESES = [
  "JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO",
  "JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO",
];

// year, month (0-11), tipo -> Date[] (datas no mês inteiro)
export function getDiasDoMes(year: number, month: number, tipo: TipoEscala): Date[] {
  // 0=domingo, 3=quarta
  const targetDow = tipo === "domingo" ? 0 : 3;
  const datas: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (d.getDay() === targetDow) datas.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return datas;
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function tituloTipo(tipo: TipoEscala): string {
  return tipo === "quarta" ? "QUARTA-FEIRA" : "DOMINGO";
}
