export interface Colaborador {
  id: string;
  nome: string;
}

export interface EscalaRow {
  id?: string;
  data: string; // ISO yyyy-mm-dd
  tipo: "quarta" | "domingo";
  pregador_id: string | null;
  ministro_id: string | null;
  back1_id: string | null;
  back2_id: string | null;
  back3_id: string | null;
  instrumento_id: string | null;
  versiculo_id?: string | null;
}

export interface Versiculo {
  id: string;
  texto: string;
  referencia: string;
}

export interface Configuracoes {
  id: string;
  logo_url: string | null;
  rodape_image_url: string | null;
  cor_fundo: string | null;
  cor_principal: string | null;
  cor_linha1: string | null;
  cor_linha2: string | null;
  cor_mes_ano: string | null;
  logo_tamanho: number | null;
}