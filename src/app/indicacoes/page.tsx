"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, BookOpen, Tv, Film, Trash2, FileText, LogOut, X, Check, ChevronDown } from "lucide-react";

type Tipo = "livro" | "serie" | "filme";
type Filtro = "todos" | Tipo;

interface Indicacao {
  id: string;
  tipo: Tipo;
  titulo: string;
  autor: string;
  notas: string;
  paciente: string;
  criado_em: string;
}

const VAZIO: Omit<Indicacao, "id" | "criado_em"> = {
  tipo: "livro",
  titulo: "",
  autor: "",
  notas: "",
  paciente: "",
};

const TIPO_LABEL: Record<Tipo, string> = { livro: "Livro", serie: "Série", filme: "Filme" };
const TIPO_ICON: Record<Tipo, React.ReactNode> = {
  livro: <BookOpen size={13} strokeWidth={1.8} />,
  serie: <Tv size={13} strokeWidth={1.8} />,
  filme: <Film size={13} strokeWidth={1.8} />,
};
const TIPO_COLOR: Record<Tipo, string> = {
  livro: "#8B1A2E",
  serie: "#5A6B8B",
  filme: "#3D6B4F",
};

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function IndicacoesPage() {
  const router = useRouter();
  const [lista, setLista] = useState<Indicacao[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [show, setShow] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ ...VAZIO });
  const [salvando, setSalvando] = useState(false);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("formspsi-auth");
    if (!auth) { router.push("/login"); return; }
    const salvo = JSON.parse(localStorage.getItem("formspsi-indicacoes") || "[]");
    setLista(salvo);
    setTimeout(() => setShow(true), 80);
  }, [router]);

  const salvar = () => {
    if (!form.titulo.trim()) return;
    setSalvando(true);
    setTimeout(() => {
      const nova: Indicacao = {
        ...form,
        id: crypto.randomUUID(),
        criado_em: new Date().toISOString(),
      };
      const atualizada = [nova, ...lista];
      setLista(atualizada);
      localStorage.setItem("formspsi-indicacoes", JSON.stringify(atualizada));
      setForm({ ...VAZIO });
      setModalAberto(false);
      setSalvando(false);
    }, 400);
  };

  const deletar = (id: string) => {
    setDeletandoId(id);
    setTimeout(() => {
      const nova = lista.filter(i => i.id !== id);
      setLista(nova);
      localStorage.setItem("formspsi-indicacoes", JSON.stringify(nova));
      setDeletandoId(null);
    }, 300);
  };

  const sair = () => {
    localStorage.removeItem("formspsi-auth");
    router.push("/login");
  };

  const filtradas = filtro === "todos" ? lista : lista.filter(i => i.tipo === filtro);
  const counts: Record<Filtro, number> = {
    todos: lista.length,
    livro: lista.filter(i => i.tipo === "livro").length,
    serie: lista.filter(i => i.tipo === "serie").length,
    filme: lista.filter(i => i.tipo === "filme").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dash-bg)", display: "flex", flexDirection: "column" }}>
      <style>{`
        :root {
          --dash-bg: #FAF5EE; --dash-surface: #FDF9F4; --dash-border: #E8DDD0;
          --dash-muted: #6E6258; --dash-fg: #1A1410; --dash-red: #8B1A2E;
          --dash-red-deep: #6B1222; --dash-card: #FEFCF8; --dash-pale: #A89888;
        }
        .dark {
          --dash-bg: #0F0F0F; --dash-surface: #1A1A1A; --dash-border: #2E2E2E;
          --dash-muted: #666666; --dash-fg: #EEEEEE; --dash-red: #A8263C;
          --dash-red-deep: #8B1A2E; --dash-card: #222222; --dash-pale: #444444;
        }
        * { font-family: 'Montserrat', sans-serif; }
        .nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 10px; border: none;
          background: transparent; cursor: pointer; width: 100%;
          font-size: 0.82rem; font-family: 'Montserrat', sans-serif; font-weight: 400;
          color: var(--dash-muted); transition: all 0.18s; text-align: left;
        }
        .nav-link:hover { background: var(--dash-bg); color: var(--dash-fg); }
        .nav-link.active { background: rgba(139,26,46,0.08); color: var(--dash-red); font-weight: 600; }
        .btn-novo {
          display: inline-flex; align-items: center; gap: 8px;
          background: #8B1A2E; color: #fff; border: none; border-radius: 12px;
          padding: 11px 22px; font-size: 0.8rem;
          font-family: 'Montserrat', sans-serif; font-weight: 600;
          letter-spacing: 0.06em; cursor: pointer; white-space: nowrap;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .btn-novo:hover { background: #6B1222; box-shadow: 0 4px 16px rgba(139,26,46,0.25); }
        .filtro-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 20px; border: 1.5px solid var(--dash-border);
          background: transparent; font-size: 0.75rem; font-family: 'Montserrat', sans-serif;
          font-weight: 500; color: var(--dash-muted); cursor: pointer; transition: all 0.18s;
        }
        .filtro-btn:hover { border-color: var(--dash-red); color: var(--dash-fg); }
        .filtro-btn.active { background: rgba(139,26,46,0.08); border-color: var(--dash-red); color: var(--dash-red); font-weight: 600; }
        .ind-card {
          background: var(--dash-card); border: 1.5px solid var(--dash-border);
          border-radius: 16px; padding: 20px 24px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .ind-card:hover { border-color: #D8D0C8; box-shadow: 0 4px 24px rgba(139,26,46,0.07); transform: translateY(-1px); }
        .dark .ind-card:hover { border-color: #3A3A3A; }
        .icon-btn {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          display: flex; align-items: center; justify-content: center;
          background: transparent; cursor: pointer; color: var(--dash-pale);
          transition: color 0.2s, background 0.2s;
        }
        .icon-btn.danger:hover { color: #E53935; background: rgba(229,57,53,0.08); }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .modal-box {
          background: var(--dash-surface); border: 1.5px solid var(--dash-border);
          border-radius: 20px; padding: 36px; width: 100%; max-width: 520px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
        }
        .field-label {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--dash-muted); margin-bottom: 8px; display: block;
        }
        .field-input {
          width: 100%; background: var(--dash-bg);
          border: 1.5px solid var(--dash-border); border-radius: 10px;
          padding: 11px 14px; font-size: 0.88rem; font-family: 'Montserrat', sans-serif;
          font-weight: 300; color: var(--dash-fg); outline: none; transition: border-color 0.2s;
        }
        .field-input:focus { border-color: var(--dash-red); }
        .field-input::placeholder { color: var(--dash-pale); }
        .tipo-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 8px; border-radius: 10px; border: 1.5px solid var(--dash-border);
          background: var(--dash-bg); font-size: 0.78rem; font-family: 'Montserrat', sans-serif;
          font-weight: 500; color: var(--dash-muted); cursor: pointer; transition: all 0.18s;
        }
        .tipo-btn.active-livro { border-color: #8B1A2E; background: rgba(139,26,46,0.07); color: #8B1A2E; }
        .tipo-btn.active-serie { border-color: #5A6B8B; background: rgba(90,107,139,0.07); color: #5A6B8B; }
        .tipo-btn.active-filme { border-color: #3D6B4F; background: rgba(61,107,79,0.07); color: #3D6B4F; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* SIDEBAR */}
        <aside style={{
          width: 240, minHeight: "100vh", flexShrink: 0,
          background: "var(--dash-surface)", borderRight: "1.5px solid var(--dash-border)",
          display: "flex", flexDirection: "column", padding: "32px 16px",
          position: "sticky", top: 0, height: "100vh",
        }}>
          <div style={{ padding: "0 8px", marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#8B1A2E" }} />
              <span style={{ fontSize: "0.6rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "#8B1A2E", fontWeight: 700 }}>
                formspsi
              </span>
            </div>
            <p style={{ fontWeight: 500, fontSize: "0.95rem", color: "var(--dash-fg)" }}>
              área da psicóloga
            </p>
          </div>

          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <button className="nav-link" onClick={() => router.push("/dashboard")}>
              <FileText size={15} strokeWidth={1.5} />
              Prontuários
            </button>
            <button className="nav-link" onClick={() => { localStorage.removeItem("formspsi-draft"); router.push("/prontuario"); }}>
              <Plus size={15} strokeWidth={1.5} />
              Novo prontuário
            </button>
            <button className="nav-link active">
              <BookOpen size={15} strokeWidth={1.5} />
              Indicações
            </button>
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ThemeToggle />
            <button className="nav-link" onClick={sair}>
              <LogOut size={15} strokeWidth={1.5} />
              Sair
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
          <div style={{ maxWidth: 880, margin: "0 auto", opacity: show ? 1 : 0, transform: show ? "none" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>

            {/* HEADER */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, gap: 16 }}>
              <div>
                <h1 style={{ fontWeight: 700, fontSize: "1.9rem", color: "var(--dash-fg)", marginBottom: 4, lineHeight: 1.2 }}>
                  Indicações
                </h1>
                <p style={{ fontWeight: 300, fontSize: "0.82rem", color: "var(--dash-muted)" }}>
                  {lista.length} {lista.length === 1 ? "indicação registrada" : "indicações registradas"}
                </p>
              </div>
              <button className="btn-novo" onClick={() => setModalAberto(true)}>
                <Plus size={15} strokeWidth={2.5} />
                Nova indicação
              </button>
            </div>

            {/* FILTROS */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
              {(["todos", "livro", "serie", "filme"] as Filtro[]).map(f => (
                <button
                  key={f}
                  className={`filtro-btn${filtro === f ? " active" : ""}`}
                  onClick={() => setFiltro(f)}
                >
                  {f === "todos" ? null : TIPO_ICON[f as Tipo]}
                  {f === "todos" ? "Todos" : TIPO_LABEL[f as Tipo]}
                  <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>({counts[f]})</span>
                </button>
              ))}
            </div>

            {/* LISTA */}
            {filtradas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(139,26,46,0.07)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <BookOpen size={24} strokeWidth={1.2} style={{ color: "#8B1A2E", opacity: 0.6 }} />
                </div>
                <p style={{ fontWeight: 500, fontSize: "0.95rem", color: "var(--dash-fg)", marginBottom: 6 }}>
                  {filtro === "todos" ? "Nenhuma indicação ainda" : `Nenhum ${TIPO_LABEL[filtro as Tipo].toLowerCase()} indicado`}
                </p>
                <p style={{ fontWeight: 300, fontSize: "0.8rem", color: "var(--dash-muted)", marginBottom: 24 }}>
                  Adicione livros, séries e filmes para seus pacientes.
                </p>
                <button className="btn-novo" onClick={() => setModalAberto(true)}>
                  <Plus size={14} strokeWidth={2.5} />
                  Nova indicação
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                {filtradas.map((ind, i) => {
                  const apagando = deletandoId === ind.id;
                  return (
                    <div
                      key={ind.id}
                      className="ind-card"
                      style={{
                        opacity: apagando ? 0 : show ? 1 : 0,
                        transform: apagando ? "scale(0.97)" : show ? "translateY(0)" : "translateY(12px)",
                        transition: `opacity 0.3s ease, transform 0.3s ease ${i * 0.04}s, box-shadow 0.2s, border-color 0.2s`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "4px 10px", borderRadius: 20,
                            background: `${TIPO_COLOR[ind.tipo]}14`,
                            color: TIPO_COLOR[ind.tipo],
                            fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.08em",
                          }}>
                            {TIPO_ICON[ind.tipo]}
                            {TIPO_LABEL[ind.tipo]}
                          </span>
                        </div>
                        <button className="icon-btn danger" onClick={() => deletar(ind.id)}>
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>

                      <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--dash-fg)", marginBottom: 4, lineHeight: 1.3 }}>
                        {ind.titulo}
                      </p>
                      {ind.autor && (
                        <p style={{ fontWeight: 300, fontSize: "0.78rem", color: "var(--dash-muted)", marginBottom: ind.notas || ind.paciente ? 12 : 0 }}>
                          {ind.autor}
                        </p>
                      )}

                      {ind.notas && (
                        <p style={{
                          fontWeight: 300, fontSize: "0.8rem", color: "var(--dash-fg)",
                          lineHeight: 1.55, marginBottom: ind.paciente ? 12 : 0,
                          padding: "10px 12px", borderRadius: 10,
                          background: "var(--dash-bg)", borderLeft: `3px solid ${TIPO_COLOR[ind.tipo]}`,
                        }}>
                          {ind.notas}
                        </p>
                      )}

                      {ind.paciente && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: ind.notas ? 10 : 0 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--dash-pale)", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.72rem", color: "var(--dash-muted)", fontWeight: 400 }}>
                            Para {ind.paciente}
                          </span>
                        </div>
                      )}

                      <p style={{ fontSize: "0.65rem", color: "var(--dash-pale)", marginTop: 14, textAlign: "right" }}>
                        {formatData(ind.criado_em)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalAberto(false); }}>
          <div className="modal-box">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--dash-fg)" }}>
                Nova indicação
              </h2>
              <button className="icon-btn" onClick={() => setModalAberto(false)} style={{ color: "var(--dash-muted)" }}>
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* TIPO */}
              <div>
                <label className="field-label">Tipo</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["livro", "serie", "filme"] as Tipo[]).map(t => (
                    <button
                      key={t}
                      className={`tipo-btn${form.tipo === t ? ` active-${t}` : ""}`}
                      onClick={() => setForm(f => ({ ...f, tipo: t }))}
                    >
                      {TIPO_ICON[t]}
                      {TIPO_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* TÍTULO */}
              <div>
                <label className="field-label">Título *</label>
                <input
                  className="field-input"
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder={form.tipo === "livro" ? "Nome do livro" : form.tipo === "serie" ? "Nome da série" : "Nome do filme"}
                />
              </div>

              {/* AUTOR */}
              <div>
                <label className="field-label">
                  {form.tipo === "livro" ? "Autor(a)" : form.tipo === "serie" ? "Criador(a) / Plataforma" : "Diretor(a) / Ano"}
                </label>
                <input
                  className="field-input"
                  value={form.autor}
                  onChange={e => setForm(f => ({ ...f, autor: e.target.value }))}
                  placeholder={form.tipo === "livro" ? "Ex: Viktor Frankl" : form.tipo === "serie" ? "Ex: Netflix, 2019" : "Ex: Greta Gerwig, 2023"}
                />
              </div>

              {/* NOTAS */}
              <div>
                <label className="field-label">Notas terapêuticas</label>
                <textarea
                  className="field-input"
                  rows={3}
                  value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Por que você está indicando? O que trabalha terapeuticamente?"
                  style={{ resize: "none" }}
                />
              </div>

              {/* PACIENTE */}
              <div>
                <label className="field-label">Para qual paciente (opcional)</label>
                <input
                  className="field-input"
                  value={form.paciente}
                  onChange={e => setForm(f => ({ ...f, paciente: e.target.value }))}
                  placeholder="Nome da paciente"
                />
              </div>

              {/* BOTÕES */}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setModalAberto(false)}
                  style={{
                    flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid var(--dash-border)",
                    background: "transparent", color: "var(--dash-muted)", fontSize: "0.82rem",
                    fontFamily: "'Montserrat', sans-serif", fontWeight: 500, cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn-novo"
                  onClick={salvar}
                  disabled={!form.titulo.trim() || salvando}
                  style={{ flex: 2, justifyContent: "center", opacity: !form.titulo.trim() ? 0.5 : 1 }}
                >
                  {salvando ? (
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  ) : (
                    <Check size={14} strokeWidth={2.5} />
                  )}
                  {salvando ? "Salvando..." : "Salvar indicação"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
