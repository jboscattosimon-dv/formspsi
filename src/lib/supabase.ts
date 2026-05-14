import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ProntuarioRow {
  id: string;
  paciente_nome: string;
  data_nascimento?: string;
  genero?: string;
  estado_civil?: string;
  cpf?: string;
  endereco?: string;
  cidade_estado?: string;
  modalidade?: string;
  whatsapp?: string;
  email?: string;
  profissao?: string;
  medicacao?: string;
  motivo?: string;
  status?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export async function listarProntuarios() {
  const { data, error } = await supabase
    .from("prontuarios")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data as ProntuarioRow[];
}

export async function buscarProntuario(id: string) {
  const { data, error } = await supabase
    .from("prontuarios")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as ProntuarioRow;
}

export async function salvarProntuario(prontuario: ProntuarioRow) {
  const { data, error } = await supabase
    .from("prontuarios")
    .upsert({
      id:               prontuario.id,
      paciente_nome:    prontuario.paciente_nome,
      data_nascimento:  prontuario.data_nascimento,
      genero:           prontuario.genero,
      estado_civil:     prontuario.estado_civil,
      cpf:              prontuario.cpf,
      endereco:         prontuario.endereco,
      cidade_estado:    prontuario.cidade_estado,
      modalidade:       prontuario.modalidade,
      whatsapp:         prontuario.whatsapp,
      email:            prontuario.email,
      profissao:        prontuario.profissao,
      medicacao:        prontuario.medicacao,
      motivo:           prontuario.motivo,
      status:           prontuario.status ?? "completo",
    })
    .select()
    .single();
  if (error) throw error;
  return data as ProntuarioRow;
}

export async function atualizarProntuario(id: string, campos: Partial<ProntuarioRow>) {
  const { data, error } = await supabase
    .from("prontuarios")
    .update(campos)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ProntuarioRow;
}

export async function deletarProntuario(id: string) {
  const { error } = await supabase.from("prontuarios").delete().eq("id", id);
  if (error) throw error;
}

export interface IndicacaoRow {
  id: string;
  tipo: "livro" | "serie" | "filme";
  titulo: string;
  autor?: string;
  notas?: string;
  paciente?: string;
  criado_em?: string;
}

export async function listarIndicacoes() {
  const { data, error } = await supabase
    .from("indicacoes")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data as IndicacaoRow[];
}

export async function salvarIndicacao(ind: IndicacaoRow) {
  const { data, error } = await supabase
    .from("indicacoes")
    .upsert(ind)
    .select()
    .single();
  if (error) throw error;
  return data as IndicacaoRow;
}

export async function deletarIndicacao(id: string) {
  const { error } = await supabase.from("indicacoes").delete().eq("id", id);
  if (error) throw error;
}
