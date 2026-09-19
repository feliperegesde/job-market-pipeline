export interface Job {
  titulo_vaga: string;
  empresa: string;
  fonte: string;
  link: string;
  data_coleta: string;
  localizacao?: string;
  descricao?: string;
  nivel?: string; // Estágio, Junior, Pleno, Senior
}