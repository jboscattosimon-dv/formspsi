"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, ArrowRight, Check } from "lucide-react";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { type ProntuarioForm } from "@/lib/types";
import { salvarProntuario } from "@/lib/supabase";

type Etapa =
  | "intro"
  | "identificacao"
  | "contato"
  | "profissao"
  | "saude"
  | "motivo"
  | "finalizando"
  | "concluido";

const VAZIO: ProntuarioForm = {
  nome: "", data_nascimento: "", genero: "", estado_civil: "",
  cpf: "", endereco: "", cidade_estado: "", modalidade: "",
  whatsapp: "", email: "", profissao: "", medicacao: "", motivo: "",
};

function pctEtapa(etapa: Etapa): number {
  const map: Record<Etapa, number> = {
    intro: 0, identificacao: 20, contato: 40, profissao: 60, saude: 75, motivo: 88,
    finalizando: 100, concluido: 100,
  };
  return map[etapa] ?? 0;
}

export default function ProntuarioPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [form, setForm] = useState<ProntuarioForm>(VAZIO);
  const [animando, setAnimando] = useState(false);
  const [animDir, setAnimDir] = useState<"out" | "in">("in");
  const [prontuarioId, setProntuarioId] = useState<string | null>(null);

  useEffect(() => {
    const draft = localStorage.getItem("formspsi-draft");
    if (draft) { try { setForm(JSON.parse(draft)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem("formspsi-draft", JSON.stringify(form));
  }, [form]);

  const ir = useCallback((fn: () => void) => {
    setAnimDir("out");
    setAnimando(true);
    setTimeout(() => {
      fn();
      setAnimDir("in");
      setAnimando(false);
    }, 280);
  }, []);

  const proximaEtapa: Record<Etapa, Etapa | null> = {
    intro: "identificacao", identificacao: "contato", contato: "profissao",
    profissao: "saude", saude: "motivo", motivo: "finalizando",
    finalizando: "concluido", concluido: null,
  };

  const etapaAnterior: Record<Etapa, Etapa | null> = {
    intro: null, identificacao: "intro", contato: "identificacao",
    profissao: "contato", saude: "profissao", motivo: "saude",
    finalizando: null, concluido: null,
  };

  const avancar = () => {
    const prox = proximaEtapa[etapa];
    if (!prox) return;
    if (prox === "finalizando") {
      ir(() => setEtapa("finalizando"));
      setTimeout(finalizar, 400);
    } else {
      ir(() => setEtapa(prox));
    }
  };

  const voltar = () => {
    const ant = etapaAnterior[etapa];
    if (ant) ir(() => setEtapa(ant));
  };

  const finalizar = async () => {
    const id = `pron_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const dados = {
      id, paciente_nome: form.nome, data_nascimento: form.data_nascimento,
      genero: form.genero, estado_civil: form.estado_civil, cpf: form.cpf,
      endereco: form.endereco, cidade_estado: form.cidade_estado,
      modalidade: form.modalidade, whatsapp: form.whatsapp, email: form.email,
      profissao: form.profissao, medicacao: form.medicacao, motivo: form.motivo,
      criado_em: new Date().toISOString(), status: "completo",
    };
    const hist = JSON.parse(localStorage.getItem("formspsi-historico") || "[]");
    hist.unshift({ ...dados, nome: form.nome });
    localStorage.setItem("formspsi-historico", JSON.stringify(hist));
    localStorage.removeItem("formspsi-draft");
    try { await salvarProntuario(dados); } catch {}
    setProntuarioId(id);
    setTimeout(() => setEtapa("concluido"), 1800);
  };

  const animStyle: React.CSSProperties = {
    opacity: animando ? 0 : 1,
    transform: animando ? (animDir === "out" ? "translateY(14px)" : "translateY(-14px)") : "translateY(0)",
    transition: "opacity 0.28s ease, transform 0.28s ease",
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", position: "relative" }}>
      <style>{`
        :root {
          --bg: #FAF6F0; --fg: #2A1815; --muted: #8A7A74;
          --border: #E5D8CC; --red: #C0392B; --red-deep: #9B2E22;
          --cream: #F0E8DC; --pale: #B5A8A0;
        }
        .dark {
          --bg: #1A0F0D; --fg: #F0E5DC; --muted: #8A7A74;
          --border: #3A201A; --red: #D44030; --red-deep: #C0392B;
          --cream: #231411; --pale: #6A5A54;
        }
        .pron-input {
          width: 100%; background: transparent;
          border: none; border-bottom: 1.5px solid #D9CBBF;
          color: var(--fg); padding: 12px 0; font-size: 1rem;
          font-family: 'Montserrat', sans-serif; font-weight: 300;
          transition: border-color 0.2s;
        }
        .pron-input::placeholder { color: #CEC0B8; }
        .pron-input:focus { outline: none; border-color: var(--red); }
        .dark .pron-input { border-color: #3A201A; color: #F0E5DC; }
        .dark .pron-input:focus { border-color: var(--red); }
        .pron-textarea {
          width: 100%; background: transparent;
          border: 1.5px solid var(--border); border-radius: 12px;
          color: var(--fg); padding: 18px 20px;
          font-size: 0.95rem; font-family: 'Montserrat', sans-serif;
          font-weight: 300; line-height: 1.85; resize: none;
          transition: border-color 0.2s;
        }
        .pron-textarea::placeholder { color: #CEC0B8; }
        .pron-textarea:focus { outline: none; border-color: var(--red); }
        .dark .pron-textarea { border-color: #3A201A; color: #F0E5DC; }
        .dark .pron-textarea:focus { border-color: var(--red); }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 32px; border-radius: 999px; border: none; cursor: pointer;
          background: #C0392B; color: #fff;
          font-family: 'Montserrat', sans-serif; font-size: 0.75rem;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .btn-primary:hover { background: #9B2E22; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(192,57,43,0.3); }
        .btn-red {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 999px; border: none; cursor: pointer;
          background: #C0392B; color: #fff;
          font-family: 'Montserrat', sans-serif; font-size: 0.75rem;
          font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .btn-red:hover { background: #9B2E22; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(192,57,43,0.32); }
        .btn-red:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer;
          background: transparent; color: var(--pale);
          font-family: 'Montserrat', sans-serif; font-size: 0.8rem;
          font-weight: 400; transition: color 0.2s;
        }
        .btn-ghost:hover { color: var(--fg); }
        .label-sm {
          display: block; font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem; font-weight: 700; color: var(--pale);
          text-transform: uppercase; letter-spacing: 0.22em; margin-bottom: 10px;
        }
        .pill-btn {
          padding: 10px 20px; border-radius: 999px; border: 1.5px solid var(--border);
          background: transparent; color: var(--fg); cursor: pointer;
          font-family: 'Montserrat', sans-serif; font-size: 0.8rem;
          font-weight: 400; transition: all 0.18s ease;
        }
        .pill-btn:hover { border-color: var(--red); color: var(--red); }
        .pill-btn.ativo { border-color: var(--red); background: var(--red); color: #fff; font-weight: 600; }
        .dark .pill-btn { border-color: #3A201A; }
        .field-grid { display: grid; gap: 32px; }
        .field-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 24px; }
        @media (max-width: 480px) { .field-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* Orbs */}
      <div style={{ position: "fixed", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, #F2C8C3 0%, transparent 70%)", filter: "blur(90px)", opacity: 0.45, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: 40, left: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, #F5DDD9 0%, transparent 70%)", filter: "blur(100px)", opacity: 0.35, pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid var(--border)", position: "relative", zIndex: 10, background: "var(--bg)" }}>
        <span style={{ fontSize: "0.65rem", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: "#C0392B", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          formspsi
        </span>
        <ThemeToggle />
      </nav>

      {/* Progresso */}
      <div style={{ height: 3, background: "rgba(192,57,43,0.1)" }}>
        <div style={{ height: "100%", width: `${pctEtapa(etapa)}%`, background: "linear-gradient(90deg, #C0392B, #9B2E22)", transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 580, ...animStyle }}>
          {etapa === "intro"          && <EtapaIntro onAvancar={avancar} />}
          {etapa === "identificacao"  && <EtapaIdentificacao form={form} setForm={setForm} onAvancar={avancar} onVoltar={voltar} />}
          {etapa === "contato"        && <EtapaContato form={form} setForm={setForm} onAvancar={avancar} onVoltar={voltar} />}
          {etapa === "profissao"      && <EtapaProfissao form={form} setForm={setForm} onAvancar={avancar} onVoltar={voltar} />}
          {etapa === "saude"          && <EtapaSaude form={form} setForm={setForm} onAvancar={avancar} onVoltar={voltar} />}
          {etapa === "motivo"         && <EtapaMotivo form={form} setForm={setForm} onAvancar={avancar} onVoltar={voltar} />}
          {etapa === "finalizando"    && <EtapaFinalizando />}
          {etapa === "concluido"      && <EtapaConcluido nome={form.nome} onVer={() => prontuarioId && router.push(`/prontuario/${prontuarioId}`)} />}
        </div>
      </div>

      <MusicPlayer />
    </main>
  );
}

/* ─── AUXILIARES ─── */

function Divisor() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C0392B" }} />
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function NavButtons({ onVoltar, onAvancar, desabilitado, labelAvancar = "Continuar" }: {
  onVoltar?: () => void;
  onAvancar: () => void;
  desabilitado?: boolean;
  labelAvancar?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: onVoltar ? "space-between" : "flex-end", marginTop: 48 }}>
      {onVoltar && (
        <button className="btn-ghost" onClick={onVoltar}>
          <ChevronLeft size={16} strokeWidth={1.5} />Voltar
        </button>
      )}
      <button className="btn-red" onClick={onAvancar} disabled={desabilitado}>
        {labelAvancar} <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-sm">{label}</label>
      {children}
    </div>
  );
}

/* ─── ETAPAS ─── */

function EtapaIntro({ onAvancar }: { onAvancar: () => void }) {
  return (
    <div style={{ textAlign: "center" }}>
      <Divisor />
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "0.6rem", color: "#C0392B", textTransform: "uppercase", letterSpacing: "0.28em", marginBottom: 20 }}>
        prontuário psicológico
      </p>
      <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "var(--fg)", lineHeight: 1.2, marginBottom: 28 }}>
        Cadastro de Prontuário
      </h2>

      <div style={{ background: "var(--cream)", borderRadius: 16, padding: "24px 28px", marginBottom: 36, textAlign: "left", border: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.9, margin: 0 }}>
          De acordo com a <strong style={{ fontWeight: 600, color: "var(--fg)" }}>Resolução 001/2009</strong> do Conselho Federal de Psicologia,
          toda sessão de psicoterapia deve ser documentada em um prontuário do paciente.
        </p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.9, margin: "12px 0 0" }}>
          As informações preenchidas aqui são <strong style={{ fontWeight: 600, color: "var(--fg)" }}>confidenciais</strong> e
          utilizadas exclusivamente para compor o prontuário psicológico.
        </p>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C0392B", flexShrink: 0 }} />
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#C0392B", margin: 0 }}>
            Letícia Bittencourt Reis — CRP 06/189562
          </p>
        </div>
      </div>

      <button className="btn-primary" onClick={onAvancar}>
        Preencher cadastro <ArrowRight size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

function EtapaIdentificacao({ form, setForm, onAvancar, onVoltar }: {
  form: ProntuarioForm;
  setForm: React.Dispatch<React.SetStateAction<ProntuarioForm>>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  const set = (k: keyof ProntuarioForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const GENEROS = ["Feminino", "Masculino", "Não-binário", "Prefiro não dizer"];
  const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União estável"];

  return (
    <div>
      <p className="label-sm" style={{ textAlign: "center", marginBottom: 4 }}>01 — identificação</p>
      <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "var(--fg)", textAlign: "center", marginBottom: 36 }}>
        Quem é você?
      </h3>
      <div className="field-grid">
        <Campo label="Nome Completo / Nome Social">
          <input className="pron-input" type="text" value={form.nome} onChange={e => set("nome")(e.target.value)} placeholder="Seu nome completo..." autoFocus />
        </Campo>
        <Campo label="Data de Nascimento">
          <input className="pron-input" type="text" value={form.data_nascimento} onChange={e => set("data_nascimento")(e.target.value)} placeholder="DD/MM/AAAA" inputMode="numeric" />
        </Campo>
        <Campo label="Gênero / Identidade de Gênero">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {GENEROS.map(g => (
              <button key={g} className={`pill-btn${form.genero === g ? " ativo" : ""}`} onClick={() => set("genero")(g)}>{g}</button>
            ))}
          </div>
          <input className="pron-input" type="text" value={GENEROS.includes(form.genero) ? "" : form.genero} onChange={e => set("genero")(e.target.value)} placeholder="Outro..." style={{ marginTop: 12 }} />
        </Campo>
        <Campo label="Estado Civil">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {ESTADOS_CIVIS.map(e => (
              <button key={e} className={`pill-btn${form.estado_civil === e ? " ativo" : ""}`} onClick={() => set("estado_civil")(e)}>{e}</button>
            ))}
          </div>
        </Campo>
      </div>
      <NavButtons onVoltar={onVoltar} onAvancar={onAvancar} desabilitado={!form.nome.trim()} />
    </div>
  );
}

function EtapaContato({ form, setForm, onAvancar, onVoltar }: {
  form: ProntuarioForm;
  setForm: React.Dispatch<React.SetStateAction<ProntuarioForm>>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  const set = (k: keyof ProntuarioForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <p className="label-sm" style={{ textAlign: "center", marginBottom: 4 }}>02 — contato e localização</p>
      <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "var(--fg)", textAlign: "center", marginBottom: 36 }}>
        Como encontrar você?
      </h3>
      <div className="field-grid">
        <Campo label="CPF">
          <input className="pron-input" type="text" value={form.cpf} onChange={e => set("cpf")(e.target.value)} placeholder="000.000.000-00" inputMode="numeric" />
        </Campo>
        <Campo label="Endereço">
          <input className="pron-input" type="text" value={form.endereco} onChange={e => set("endereco")(e.target.value)} placeholder="Rua, número, bairro..." />
        </Campo>
        <div className="field-grid-2">
          <Campo label="Cidade e Estado">
            <input className="pron-input" type="text" value={form.cidade_estado} onChange={e => set("cidade_estado")(e.target.value)} placeholder="São Paulo, SP" />
          </Campo>
          <Campo label="WhatsApp">
            <input className="pron-input" type="text" value={form.whatsapp} onChange={e => set("whatsapp")(e.target.value)} placeholder="(11) 99999-9999" inputMode="tel" />
          </Campo>
        </div>
        <Campo label="E-mail">
          <input className="pron-input" type="email" value={form.email} onChange={e => set("email")(e.target.value)} placeholder="seu@email.com" inputMode="email" />
        </Campo>
      </div>
      <NavButtons onVoltar={onVoltar} onAvancar={onAvancar} />
    </div>
  );
}

function EtapaProfissao({ form, setForm, onAvancar, onVoltar }: {
  form: ProntuarioForm;
  setForm: React.Dispatch<React.SetStateAction<ProntuarioForm>>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  const set = (k: keyof ProntuarioForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const MODALIDADES = ["Online", "Presencial", "Híbrido"];

  return (
    <div>
      <p className="label-sm" style={{ textAlign: "center", marginBottom: 4 }}>03 — sobre você</p>
      <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "var(--fg)", textAlign: "center", marginBottom: 36 }}>
        Sua vida e preferências
      </h3>
      <div className="field-grid">
        <Campo label="Profissão">
          <input className="pron-input" type="text" value={form.profissao} onChange={e => set("profissao")(e.target.value)} placeholder="O que você faz?" autoFocus />
        </Campo>
        <Campo label="Modalidade de Atendimento">
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {MODALIDADES.map(m => (
              <button key={m} className={`pill-btn${form.modalidade === m ? " ativo" : ""}`} onClick={() => set("modalidade")(m)}
                style={{ flex: 1, textAlign: "center", padding: "14px 8px" }}>
                {m}
              </button>
            ))}
          </div>
        </Campo>
      </div>
      <NavButtons onVoltar={onVoltar} onAvancar={onAvancar} />
    </div>
  );
}

function EtapaSaude({ form, setForm, onAvancar, onVoltar }: {
  form: ProntuarioForm;
  setForm: React.Dispatch<React.SetStateAction<ProntuarioForm>>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  const set = (k: keyof ProntuarioForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const usaMedicacao = form.medicacao.startsWith("Sim");
  const descMedicacao = usaMedicacao ? form.medicacao.replace(/^Sim[,:]?\s*/i, "") : "";

  return (
    <div>
      <p className="label-sm" style={{ textAlign: "center", marginBottom: 4 }}>04 — saúde</p>
      <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "var(--fg)", textAlign: "center", marginBottom: 36 }}>
        Um pouco sobre sua saúde
      </h3>
      <div className="field-grid">
        <Campo label="Faz uso de medicação psiquiátrica?">
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button className={`pill-btn${usaMedicacao ? " ativo" : ""}`} onClick={() => set("medicacao")("Sim — ")}
              style={{ flex: 1, textAlign: "center", padding: "14px 8px" }}>Sim</button>
            <button className={`pill-btn${form.medicacao === "Não" ? " ativo" : ""}`} onClick={() => set("medicacao")("Não")}
              style={{ flex: 1, textAlign: "center", padding: "14px 8px" }}>Não</button>
          </div>
          {usaMedicacao && (
            <div style={{ marginTop: 20 }}>
              <label className="label-sm">Qual medicação?</label>
              <input
                className="pron-input"
                type="text"
                value={descMedicacao}
                onChange={e => set("medicacao")(`Sim — ${e.target.value}`)}
                placeholder="Nome do medicamento, dosagem..."
                autoFocus
              />
            </div>
          )}
        </Campo>
      </div>
      <NavButtons onVoltar={onVoltar} onAvancar={onAvancar} desabilitado={!form.medicacao} />
    </div>
  );
}

function EtapaMotivo({ form, setForm, onAvancar, onVoltar }: {
  form: ProntuarioForm;
  setForm: React.Dispatch<React.SetStateAction<ProntuarioForm>>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  const set = (k: keyof ProntuarioForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <p className="label-sm" style={{ textAlign: "center", marginBottom: 4 }}>05 — motivo</p>
      <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "clamp(1.3rem, 3vw, 1.7rem)", color: "var(--fg)", textAlign: "center", lineHeight: 1.3, marginBottom: 10 }}>
        O que te trouxe até aqui?
      </h3>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "var(--muted)", textAlign: "center", marginBottom: 28 }}>
        Pode começar de onde quiser. Não há resposta certa.
      </p>
      <textarea
        className="pron-textarea"
        value={form.motivo}
        onChange={e => set("motivo")(e.target.value)}
        placeholder="Conte o que te motivou a buscar atendimento..."
        rows={9}
        autoFocus
      />
      <NavButtons onVoltar={onVoltar} onAvancar={onAvancar} labelAvancar="Finalizar" desabilitado={!form.motivo.trim()} />
    </div>
  );
}

function EtapaFinalizando() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #C0392B", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "breathe 2s ease-in-out infinite" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#C0392B", animation: "breathe 2s ease-in-out infinite 0.4s" }} />
      </div>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "var(--muted)" }}>
        Guardando seu cadastro com cuidado...
      </p>
    </div>
  );
}

function EtapaConcluido({ nome, onVer }: { nome: string; onVer: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 150); }, []);
  const primeiro = nome.split(" ")[0];
  return (
    <div style={{ textAlign: "center", opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
      <Divisor />
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #C0392B, #9B2E22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
        <Check size={24} strokeWidth={2.5} color="#fff" />
      </div>
      <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--fg)", lineHeight: 1.25, marginBottom: 16 }}>
        Cadastro recebido{primeiro ? `, ${primeiro}` : ""}!
      </h2>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.92rem", color: "var(--muted)", marginBottom: 48, lineHeight: 1.8 }}>
        Obrigada por confiar. Nos vemos em breve.
      </p>
      <button className="btn-primary" onClick={onVer}>
        Ver meu prontuário <ArrowRight size={15} strokeWidth={2} />
      </button>
    </div>
  );
}
