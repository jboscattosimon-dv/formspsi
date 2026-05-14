"use client";

import { useEffect, useState } from "react";
import { BookOpen, Tv, Film, Plus, X, Check, Trash2, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { listarIndicacoes, salvarIndicacao, deletarIndicacao, type IndicacaoRow } from "@/lib/supabase";

type Tipo = "livro" | "serie" | "filme";
type Filtro = "todos" | Tipo;

const TIPO_LABEL: Record<Tipo, string> = { livro: "Livro", serie: "Série", filme: "Filme" };
const TIPO_ICON: Record<Tipo, React.ReactNode> = {
  livro: <BookOpen size={13} strokeWidth={1.8} />,
  serie: <Tv size={13} strokeWidth={1.8} />,
  filme: <Film size={13} strokeWidth={1.8} />,
};
const TIPO_COLOR: Record<Tipo, string> = {
  livro: "#8B1A2E",
  serie: "#4A6080",
  filme: "#3D6450",
};

const VAZIO = { tipo: "livro" as Tipo, titulo: "", autor: "", notas: "", paciente: "" };

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function IndicacoesPage() {
  const [lista, setLista] = useState<IndicacaoRow[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [show, setShow] = useState(false);
  const [isPsi, setIsPsi] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ ...VAZIO });
  const [salvando, setSalvando] = useState(false);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("formspsi-auth");
    if (auth) setIsPsi(true);

    listarIndicacoes()
      .then(data => { setLista(data); })
      .catch(() => {})
      .finally(() => {
        setCarregando(false);
        setTimeout(() => setShow(true), 80);
      });
  }, []);

  const salvar = async () => {
    if (!form.titulo.trim()) return;
    setSalvando(true);
    try {
      const nova: IndicacaoRow = {
        ...form,
        id: crypto.randomUUID(),
        criado_em: new Date().toISOString(),
      };
      const salva = await salvarIndicacao(nova);
      setLista(prev => [salva, ...prev]);
      setForm({ ...VAZIO });
      setModalAberto(false);
    } catch {}
    setSalvando(false);
  };

  const deletar = async (id: string) => {
    setDeletandoId(id);
    try {
      await deletarIndicacao(id);
      setLista(prev => prev.filter(i => i.id !== id));
    } catch {}
    setDeletandoId(null);
  };

  const filtradas = filtro === "todos" ? lista : lista.filter(i => i.tipo === filtro);
  const counts: Record<Filtro, number> = {
    todos: lista.length,
    livro: lista.filter(i => i.tipo === "livro").length,
    serie: lista.filter(i => i.tipo === "serie").length,
    filme: lista.filter(i => i.tipo === "filme").length,
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <style>{`
        :root {
          --bg: #FAF5EE; --fg: #1A1410; --muted: #6E6258;
          --border: #E8DDD0; --red: #8B1A2E; --red-deep: #6B1222;
          --surface: #FDF9F4; --card: #FEFCF8; --pale: #A89888;
        }
        .dark {
          --bg: #0F0F0F; --fg: #EEEEEE; --muted: #666666;
          --border: #2E2E2E; --red: #A8263C; --red-deep: #8B1A2E;
          --surface: #1A1A1A; --card: #222222; --pale: #444444;
        }
        * { font-family: 'Montserrat', sans-serif; }
        .btn-novo {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--red); color: #fff; border: none; border-radius: 12px;
          padding: 11px 22px; font-size: 0.8rem; font-weight: 600;
          letter-spacing: 0.06em; cursor: pointer; white-space: nowrap;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .btn-novo:hover { background: var(--red-deep); box-shadow: 0 4px 16px rgba(139,26,46,0.25); }
        .filtro-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 20px; border: 1.5px solid var(--border);
          background: transparent; font-size: 0.75rem; font-weight: 500;
          color: var(--muted); cursor: pointer; transition: all 0.18s;
        }
        .filtro-btn:hover { border-color: var(--red); color: var(--fg); }
        .filtro-btn.ativo { background: rgba(139,26,46,0.08); border-color: var(--red); color: var(--red); font-weight: 600; }
        .ind-card {
          background: var(--card); border: 1.5px solid var(--border);
          border-radius: 16px; padding: 22px 24px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .ind-card:hover { box-shadow: 0 4px 24px rgba(139,26,46,0.07); transform: translateY(-1px); }
        .icon-btn {
          width: 30px; height: 30px; border-radius: 8px; border: none;
          display: flex; align-items: center; justify-content: center;
          background: transparent; cursor: pointer; color: var(--pale);
          transition: color 0.2s, background 0.2s;
        }
        .icon-btn:hover { color: #E53935; background: rgba(229,57,53,0.08); }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          backdrop-filter: blur(5px); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .modal-box {
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: 20px; padding: 36px; width: 100%; max-width: 500px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.2);
        }
        .field-label {
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 8px; display: block;
        }
        .field-input {
          width: 100%; background: var(--bg); border: 1.5px solid var(--border);
          border-radius: 10px; padding: 11px 14px; font-size: 0.88rem;
          font-weight: 300; color: var(--fg); outline: none; transition: border-color 0.2s;
          font-family: 'Montserrat', sans-serif;
        }
        .field-input:focus { border-color: var(--red); }
        .field-input::placeholder { color: var(--pale); }
        .tipo-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 8px; border-radius: 10px; border: 1.5px solid var(--border);
          background: var(--bg); font-size: 0.78rem; font-weight: 500;
          color: var(--muted); cursor: pointer; transition: all 0.18s;
        }
        .tipo-livro { border-color: #8B1A2E; background: rgba(139,26,46,0.07); color: #8B1A2E; }
        .tipo-serie { border-color: #4A6080; background: rgba(74,96,128,0.07); color: #4A6080; }
        .tipo-filme { border-color: #3D6450; background: rgba(61,100,80,0.07); color: #3D6450; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* HEADER */}
      <header style={{ background: "var(--surface)", borderBottom: "1.5px solid var(--border)", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#8B1A2E" }} />
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#8B1A2E", fontWeight: 700 }}>
              formspsi
            </span>
          </div>
          <span style={{ color: "var(--border)", fontSize: "0.8rem" }}>·</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--fg)" }}>Indicações</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          {isPsi && (
            <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 8, border: "1.5px solid var(--border)", transition: "all 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--red)", e.currentTarget.style.color = "var(--red)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)", e.currentTarget.style.color = "var(--muted)")}
            >
              <ArrowLeft size={12} strokeWidth={2} />
              Dashboard
            </a>
          )}
        </div>
      </header>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: "48px 40px", maxWidth: 960, margin: "0 auto", width: "100%", opacity: show ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* HERO */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--red)", fontWeight: 600, marginBottom: 10 }}>
            Laura Danieli da Silva — CRP 08/47844
          </p>
          <h1 style={{ fontWeight: 700, fontSize: "2.2rem", color: "var(--fg)", lineHeight: 1.2, marginBottom: 12 }}>
            Indicações terapêuticas
          </h1>
          <p style={{ fontWeight: 300, fontSize: "0.9rem", color: "var(--muted)", maxWidth: 520, lineHeight: 1.7 }}>
            Livros, séries e filmes selecionados com intenção terapêutica para apoiar o seu processo.
          </p>
        </div>

        {/* AÇÕES */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["todos", "livro", "serie", "filme"] as Filtro[]).map(f => (
              <button key={f} className={`filtro-btn${filtro === f ? " ativo" : ""}`} onClick={() => setFiltro(f)}>
                {f !== "todos" && TIPO_ICON[f as Tipo]}
                {f === "todos" ? "Todos" : TIPO_LABEL[f as Tipo]}
                <span style={{ fontSize: "0.65rem", opacity: 0.65 }}>({counts[f]})</span>
              </button>
            ))}
          </div>
          {isPsi && (
            <button className="btn-novo" onClick={() => setModalAberto(true)}>
              <Plus size={14} strokeWidth={2.5} />
              Nova indicação
            </button>
          )}
        </div>

        {/* LISTA */}
        {carregando ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--red)", animation: "spin 0.9s linear infinite" }} />
          </div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(139,26,46,0.07)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <BookOpen size={24} strokeWidth={1.2} style={{ color: "#8B1A2E", opacity: 0.6 }} />
            </div>
            <p style={{ fontWeight: 500, color: "var(--fg)", marginBottom: 6 }}>
              {filtro === "todos" ? "Nenhuma indicação ainda" : `Nenhum ${TIPO_LABEL[filtro as Tipo].toLowerCase()} indicado`}
            </p>
            <p style={{ fontWeight: 300, fontSize: "0.82rem", color: "var(--muted)" }}>
              Em breve você terá indicações personalizadas aqui.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {filtradas.map((ind, i) => {
              const apagando = deletandoId === ind.id;
              return (
                <div
                  key={ind.id}
                  className="ind-card"
                  style={{
                    opacity: apagando ? 0 : 1,
                    transform: apagando ? "scale(0.97)" : "translateY(0)",
                    transition: `opacity 0.3s ease, transform 0.3s ease ${i * 0.04}s, box-shadow 0.2s`,
                    animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 20,
                      background: `${TIPO_COLOR[ind.tipo]}18`,
                      color: TIPO_COLOR[ind.tipo],
                      fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em",
                    }}>
                      {TIPO_ICON[ind.tipo]}
                      {TIPO_LABEL[ind.tipo]}
                    </span>
                    {isPsi && (
                      <button className="icon-btn" onClick={() => deletar(ind.id)}>
                        <Trash2 size={12} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>

                  <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--fg)", marginBottom: ind.autor ? 4 : 0, lineHeight: 1.3 }}>
                    {ind.titulo}
                  </p>
                  {ind.autor && (
                    <p style={{ fontWeight: 300, fontSize: "0.78rem", color: "var(--muted)", marginBottom: ind.notas ? 14 : 0 }}>
                      {ind.autor}
                    </p>
                  )}
                  {ind.notas && (
                    <p style={{
                      fontWeight: 300, fontSize: "0.82rem", color: "var(--fg)",
                      lineHeight: 1.6, padding: "10px 14px", borderRadius: 10,
                      background: "var(--bg)", borderLeft: `3px solid ${TIPO_COLOR[ind.tipo]}`,
                      marginTop: ind.autor ? 0 : 14,
                    }}>
                      {ind.notas}
                    </p>
                  )}
                  {ind.paciente && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--pale)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Para {ind.paciente}</span>
                    </div>
                  )}
                  {ind.criado_em && (
                    <p style={{ fontSize: "0.65rem", color: "var(--pale)", marginTop: 14, textAlign: "right" }}>
                      {formatData(ind.criado_em)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1.5px solid var(--border)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: "0.7rem", color: "var(--pale)", fontWeight: 300 }}>
          Laura Danieli da Silva · CRP 08/47844 · formspsi
        </p>
      </footer>

      {/* MODAL — visível só para psi */}
      {modalAberto && isPsi && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalAberto(false); }}>
          <div className="modal-box">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--fg)" }}>Nova indicação</h2>
              <button className="icon-btn" onClick={() => setModalAberto(false)} style={{ color: "var(--muted)" }}>
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="field-label">Tipo</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["livro", "serie", "filme"] as Tipo[]).map(t => (
                    <button
                      key={t}
                      className={`tipo-btn${form.tipo === t ? ` tipo-${t}` : ""}`}
                      onClick={() => setForm(f => ({ ...f, tipo: t }))}
                    >
                      {TIPO_ICON[t]}
                      {TIPO_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">Título *</label>
                <input
                  className="field-input"
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder={form.tipo === "livro" ? "Nome do livro" : form.tipo === "serie" ? "Nome da série" : "Nome do filme"}
                />
              </div>

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

              <div>
                <label className="field-label">Notas terapêuticas</label>
                <textarea
                  className="field-input"
                  rows={3}
                  value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Por que está indicando? O que trabalha terapeuticamente?"
                  style={{ resize: "none" }}
                />
              </div>

              <div>
                <label className="field-label">Para qual paciente (opcional)</label>
                <input
                  className="field-input"
                  value={form.paciente}
                  onChange={e => setForm(f => ({ ...f, paciente: e.target.value }))}
                  placeholder="Nome da paciente"
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setModalAberto(false)}
                  style={{
                    flex: 1, padding: 11, borderRadius: 10, border: "1.5px solid var(--border)",
                    background: "transparent", color: "var(--muted)", fontSize: "0.82rem",
                    fontWeight: 500, cursor: "pointer",
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
                  {salvando
                    ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    : <Check size={14} strokeWidth={2.5} />
                  }
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
