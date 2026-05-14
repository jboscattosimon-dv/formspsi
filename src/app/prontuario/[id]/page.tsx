"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer, Edit3, Save, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ProntuarioData {
  id: string;
  nome?: string;
  paciente_nome?: string;
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
  criado_em: string;
  status?: string;
}

function getNome(d: ProntuarioData) {
  return d.paciente_nome || d.nome || "—";
}

function formatDataLonga(iso: string) {
  try { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return "—"; }
}

function formatDataCurta(iso: string) {
  try { return new Date(iso).toLocaleDateString("pt-BR"); }
  catch { return "—"; }
}

export default function ProntuarioViewPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params.id as string;

  const [dados,      setDados]      = useState<ProntuarioData | null>(null);
  const [editando,   setEditando]   = useState(false);
  const [editForm,   setEditForm]   = useState<ProntuarioData | null>(null);
  const [exportando, setExportando] = useState(false);
  const [show,       setShow]       = useState(false);

  useEffect(() => {
    const hist: ProntuarioData[] = JSON.parse(localStorage.getItem("formspsi-historico") || "[]");
    const pron = hist.find(p => p.id === id);
    if (pron) { setDados(pron); setEditForm(pron); }
    setTimeout(() => setShow(true), 120);
  }, [id]);

  const salvar = () => {
    if (!editForm) return;
    const hist: ProntuarioData[] = JSON.parse(localStorage.getItem("formspsi-historico") || "[]");
    const i = hist.findIndex(p => p.id === id);
    if (i !== -1) { hist[i] = editForm; localStorage.setItem("formspsi-historico", JSON.stringify(hist)); }
    setDados(editForm);
    setEditando(false);
  };

  const cancelar = () => { setEditForm(dados); setEditando(false); };

  const exportarPDF = async () => {
    if (!dados) return;
    setExportando(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const W = 210, ML = 20, MR = 20, colW = W - ML - MR;
      let y = 24;
      const nome = getNome(dados);

      const checkPage = (need: number) => { if (y + need > 272) { pdf.addPage(); y = 24; } };

      const hline = (color = "#E5D8CC") => {
        pdf.setDrawColor(color); pdf.setLineWidth(0.3);
        pdf.line(ML, y, W - MR, y); y += 6;
      };

      /* Cabeçalho */
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7); pdf.setTextColor("#B5A8A0");
      pdf.text("FORMSPSI  ·  PRONTUÁRIO PSICOLÓGICO", ML, y);
      pdf.text(formatDataCurta(dados.criado_em), W - MR, y, { align: "right" });
      y += 6; hline("#D9CBBF");

      /* CRP */
      pdf.setFontSize(7); pdf.setTextColor("#8A7A74");
      pdf.text("Laura Danieli da Silva  —  CRP 08/47844", ML, y); y += 10;

      /* Nome */
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(26); pdf.setTextColor("#2A1815");
      pdf.text(nome, ML, y); y += 12;

      /* Dados pessoais */
      const cols = [
        { label: "DATA DE NASC.", valor: dados.data_nascimento },
        { label: "GÊNERO", valor: dados.genero },
        { label: "ESTADO CIVIL", valor: dados.estado_civil },
      ].filter(c => c.valor);

      if (cols.length) {
        pdf.setFont("helvetica", "normal");
        const cw = colW / Math.min(cols.length, 3);
        cols.forEach((c, i) => {
          const x = ML + i * cw;
          pdf.setFontSize(7); pdf.setTextColor("#8A7A74");
          pdf.text(c.label!, x, y);
          pdf.setFontSize(9.5); pdf.setTextColor("#2A1815");
          pdf.text(c.valor || "—", x, y + 5);
        });
        y += 16;
      }
      hline();

      /* Contato */
      const contato = [
        { label: "CPF", valor: dados.cpf },
        { label: "WHATSAPP", valor: dados.whatsapp },
        { label: "E-MAIL", valor: dados.email },
        { label: "ENDEREÇO", valor: dados.endereco },
        { label: "CIDADE / ESTADO", valor: dados.cidade_estado },
      ].filter(c => c.valor);

      if (contato.length) {
        checkPage(20);
        pdf.setFontSize(8); pdf.setTextColor("#8B1A2E"); pdf.setFont("helvetica", "bold");
        pdf.text("CONTATO E LOCALIZAÇÃO", ML, y); y += 6;
        const cw2 = contato.length >= 2 ? colW / 2 : colW;
        const linhas = Math.ceil(contato.length / 2);
        contato.forEach((c, i) => {
          const col = i % 2; const lin = Math.floor(i / 2);
          const x = ML + col * cw2; const yy = y + lin * 12;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7); pdf.setTextColor("#8A7A74"); pdf.text(c.label!, x, yy);
          pdf.setFontSize(9); pdf.setTextColor("#2A1815"); pdf.text(c.valor || "—", x, yy + 4.5);
        });
        y += linhas * 12 + 4; hline();
      }

      /* Perfil */
      const perfil = [
        { label: "PROFISSÃO", valor: dados.profissao },
        { label: "MODALIDADE", valor: dados.modalidade },
      ].filter(c => c.valor);
      if (perfil.length) {
        checkPage(16);
        pdf.setFontSize(8); pdf.setTextColor("#8B1A2E"); pdf.setFont("helvetica", "bold");
        pdf.text("PERFIL", ML, y); y += 6;
        perfil.forEach((c, i) => {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7); pdf.setTextColor("#8A7A74"); pdf.text(c.label!, ML + i * (colW / 2), y);
          pdf.setFontSize(9.5); pdf.setTextColor("#2A1815"); pdf.text(c.valor || "—", ML + i * (colW / 2), y + 5);
        });
        y += 16; hline();
      }

      /* Medicação */
      if (dados.medicacao) {
        checkPage(20);
        pdf.setFontSize(8); pdf.setTextColor("#8B1A2E"); pdf.setFont("helvetica", "bold");
        pdf.text("MEDICAÇÃO PSIQUIÁTRICA", ML, y); y += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5); pdf.setTextColor("#2A1815");
        const mLines = pdf.splitTextToSize(dados.medicacao, colW);
        mLines.forEach((l: string) => { checkPage(6); pdf.text(l, ML, y); y += 5.5; });
        y += 4; hline();
      }

      /* Motivo */
      if (dados.motivo) {
        checkPage(24); y += 4;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8); pdf.setTextColor("#8B1A2E");
        pdf.text("MOTIVO DA CONSULTA", ML, y); y += 8;
        pdf.setDrawColor("#E5D8CC"); pdf.setLineWidth(0.2);
        pdf.line(ML, y - 4, W - MR, y - 4);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5); pdf.setTextColor("#2A1815");
        const mLines = pdf.splitTextToSize(dados.motivo, colW);
        mLines.forEach((l: string) => { checkPage(6); pdf.text(l, ML, y); y += 5.5; });
      }

      /* Rodapé */
      const total = pdf.getNumberOfPages();
      for (let pg = 1; pg <= total; pg++) {
        pdf.setPage(pg);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7); pdf.setTextColor("#CEC0B8");
        pdf.text("formspsi — documento confidencial  ·  Resolução CFP 001/2009", ML, 288);
        pdf.text(`${pg} / ${total}`, W - MR, 288, { align: "right" });
      }

      pdf.save(`prontuario_${nome.replace(/\s+/g, "_")}_${formatDataCurta(dados.criado_em).replace(/\//g, "-")}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setExportando(false);
    }
  };

  if (!dados) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF5EE" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #8B1A2E", display: "flex", alignItems: "center", justifyContent: "center", animation: "breathe 2s ease-in-out infinite" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B1A2E" }} />
      </div>
    </div>
  );

  const nome = getNome(dados);
  const ef = editForm || dados;
  const setEF = (k: keyof ProntuarioData) => (v: string) => setEditForm(f => f ? { ...f, [k]: v } : f);

  return (
    <div style={{ minHeight: "100vh", background: "var(--pv-bg)" }}>
      <style>{`
        :root { --pv-bg:#FAF5EE; --pv-surface:#FDF9F4; --pv-border:#E8DDD0; --pv-fg:#1A1410; --pv-muted:#6E6258; --pv-pale:#A89888; --pv-red:#8B1A2E; --pv-doc:#FEFCF8; }
        .dark { --pv-bg:#0F0F0F; --pv-surface:#1A1A1A; --pv-border:#2E2E2E; --pv-fg:#EEEEEE; --pv-muted:#666666; --pv-pale:#444444; --pv-red:#A8263C; --pv-doc:#111111; }
        * { font-family: 'Montserrat', sans-serif; }
        .pv-toolbar { position:sticky; top:0; z-index:50; background:var(--pv-surface); border-bottom:1.5px solid var(--pv-border); }
        .pv-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-size:0.75rem; font-family:'Montserrat',sans-serif; font-weight:500; letter-spacing:0.03em; transition:all 0.18s; }
        .pv-btn-ghost { background:transparent; color:var(--pv-muted); }
        .pv-btn-ghost:hover { background:var(--pv-bg); color:var(--pv-fg); }
        .pv-btn-outline { background:transparent; border:1.5px solid var(--pv-border) !important; color:var(--pv-muted); }
        .pv-btn-outline:hover { border-color:var(--pv-red) !important; color:var(--pv-red); }
        .pv-btn-red { background:#8B1A2E; color:#fff; }
        .pv-btn-red:hover { background:#6B1222; }
        .pv-btn-dark { background:var(--pv-fg); color:var(--pv-doc); }
        .pv-btn-dark:hover { opacity:0.85; }
        .pv-btn-dark:disabled { opacity:0.5; cursor:not-allowed; }
        .pv-edit { width:100%; background:transparent; border:none; border-bottom:1.5px solid var(--pv-red); color:var(--pv-fg); font-family:'Montserrat',sans-serif; font-size:0.92rem; font-weight:400; padding:6px 0; outline:none; }
        .pv-edit-area { width:100%; background:transparent; border:none; border-bottom:1.5px solid var(--pv-red); color:var(--pv-fg); font-family:'Montserrat',sans-serif; font-size:0.92rem; font-weight:300; line-height:1.85; padding:8px 0; resize:none; outline:none; }
        @media print { .pv-toolbar { display:none !important; } .pv-doc { box-shadow:none !important; border:none !important; } }
      `}</style>

      {/* TOOLBAR */}
      <div className="pv-toolbar">
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button className="pv-btn pv-btn-ghost" onClick={() => router.push("/dashboard")} style={{ paddingLeft: 0 }}>
            <ArrowLeft size={15} strokeWidth={1.5} /> Painel
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {editando ? (
              <>
                <button className="pv-btn pv-btn-outline" onClick={cancelar}><X size={13} strokeWidth={1.5} /> cancelar</button>
                <button className="pv-btn pv-btn-red" onClick={salvar}><Save size={13} strokeWidth={1.5} /> salvar</button>
              </>
            ) : (
              <>
                <button className="pv-btn pv-btn-ghost" onClick={() => setEditando(true)}><Edit3 size={13} strokeWidth={1.5} /> editar</button>
                <button className="pv-btn pv-btn-ghost" onClick={() => window.print()}><Printer size={13} strokeWidth={1.5} /> imprimir</button>
                <button className="pv-btn pv-btn-dark" onClick={exportarPDF} disabled={exportando}>
                  <Download size={13} strokeWidth={1.5} />{exportando ? "gerando..." : "exportar PDF"}
                </button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* DOCUMENTO */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 28px 80px" }}>
        <div
          className="pv-doc"
          style={{ background: "var(--pv-doc)", borderRadius: 20, border: "1.5px solid var(--pv-border)", boxShadow: "0 8px 48px rgba(192,57,43,0.06)", overflow: "hidden", opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
        >
          {/* CAPA */}
          <div style={{ background: "#8B1A2E", padding: "52px 56px 44px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(139,26,46,0.25)", filter: "blur(60px)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -20, width: 240, height: 240, borderRadius: "50%", background: "rgba(247,239,228,0.06)", filter: "blur(50px)" }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
                prontuário psicológico
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#fff", lineHeight: 1.15 }}>
                    {nome}
                  </h1>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", marginTop: 10 }}>
                    Laura Danieli da Silva — CRP 08/47844
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.6)", marginLeft: "auto", marginBottom: 8 }} />
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                    {formatDataLonga(dados.criado_em)}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <InfoChip label="Nome" valor={nome} />
                {dados.data_nascimento && <InfoChip label="Nascimento" valor={dados.data_nascimento} />}
                {dados.modalidade && <InfoChip label="Modalidade" valor={dados.modalidade} />}
                <InfoChip label="Status" valor="Completo" destaque />
              </div>
            </div>
          </div>

          {/* CORPO */}
          <div style={{ padding: "52px 56px" }}>
            <Secao titulo="Identificação">
              <GridCampos>
                <CampoView label="Nome Completo / Nome Social" valor={ef.paciente_nome || ef.nome} editando={editando} onChange={setEF("paciente_nome")} />
                <CampoView label="Data de Nascimento" valor={ef.data_nascimento} editando={editando} onChange={setEF("data_nascimento")} />
                <CampoView label="Gênero / Identidade de Gênero" valor={ef.genero} editando={editando} onChange={setEF("genero")} />
                <CampoView label="Estado Civil" valor={ef.estado_civil} editando={editando} onChange={setEF("estado_civil")} />
              </GridCampos>
            </Secao>

            <Secao titulo="Contato e Localização">
              <GridCampos>
                <CampoView label="CPF" valor={ef.cpf} editando={editando} onChange={setEF("cpf")} />
                <CampoView label="WhatsApp" valor={ef.whatsapp} editando={editando} onChange={setEF("whatsapp")} />
                <CampoView label="E-mail" valor={ef.email} editando={editando} onChange={setEF("email")} />
                <CampoView label="Cidade e Estado" valor={ef.cidade_estado} editando={editando} onChange={setEF("cidade_estado")} />
              </GridCampos>
              <div style={{ marginTop: 24 }}>
                <CampoView label="Endereço" valor={ef.endereco} editando={editando} onChange={setEF("endereco")} />
              </div>
            </Secao>

            <Secao titulo="Perfil">
              <GridCampos>
                <CampoView label="Profissão" valor={ef.profissao} editando={editando} onChange={setEF("profissao")} />
                <CampoView label="Modalidade de Atendimento" valor={ef.modalidade} editando={editando} onChange={setEF("modalidade")} />
              </GridCampos>
            </Secao>

            <Secao titulo="Saúde">
              <CampoView label="Medicação Psiquiátrica" valor={ef.medicacao} editando={editando} onChange={setEF("medicacao")} />
            </Secao>

            <Secao titulo="Motivo da Consulta" ultima>
              {editando ? (
                <textarea className="pv-edit-area" value={ef.motivo || ""} onChange={e => setEF("motivo")(e.target.value)} rows={8} />
              ) : (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.95rem", color: "var(--pv-fg)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
                  {ef.motivo?.trim() || (
                    <span style={{ fontStyle: "italic", color: "var(--pv-pale)", fontSize: "0.88rem" }}>não informado</span>
                  )}
                </p>
              )}
            </Secao>

            <div style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid var(--pv-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--pv-pale)" }}>
                formspsi
              </p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "0.72rem", color: "var(--pv-pale)", letterSpacing: "0.08em" }}>
                Resolução CFP 001/2009 · documento confidencial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SUB-COMPONENTES ── */

function InfoChip({ label, valor, destaque = false }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div style={{ padding: "6px 14px", borderRadius: 999, background: destaque ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)", border: `1px solid ${destaque ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}` }}>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: destaque ? "#fff" : "rgba(255,255,255,0.5)", marginRight: 6 }}>{label}</span>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: "0.82rem", color: "#fff" }}>{valor}</span>
    </div>
  );
}

function Secao({ titulo, children, ultima = false }: { titulo: string; children: React.ReactNode; ultima?: boolean }) {
  return (
    <div style={{ marginBottom: ultima ? 0 : 48, paddingBottom: ultima ? 0 : 48, borderBottom: ultima ? "none" : "1px solid var(--pv-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#8B1A2E", whiteSpace: "nowrap" }}>
          {titulo}
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--pv-border)" }} />
      </div>
      {children}
    </div>
  );
}

function GridCampos({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px 32px" }}>
      {children}
    </div>
  );
}

function CampoView({ label, valor, editando, onChange }: {
  label: string; valor?: string; editando: boolean; onChange: (v: string) => void;
}) {
  return (
    <div>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--pv-pale)", marginBottom: 6 }}>
        {label}
      </p>
      {editando ? (
        <input className="pv-edit" type="text" value={valor || ""} onChange={e => onChange(e.target.value)} />
      ) : (
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: "0.92rem", color: "var(--pv-fg)", lineHeight: 1.5 }}>
          {valor?.trim() || <span style={{ fontStyle: "italic", color: "var(--pv-pale)", fontSize: "0.85rem" }}>—</span>}
        </p>
      )}
    </div>
  );
}
