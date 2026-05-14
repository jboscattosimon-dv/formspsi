"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostraSenha, setMostraSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("formspsi-auth");
    if (auth) router.push("/dashboard");
    setTimeout(() => setShow(true), 100);
  }, [router]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    await new Promise((r) => setTimeout(r, 800));

    // Credenciais demo — substituir por Supabase Auth
    if (email === "psi@indicapsi.com" && senha === "indicapsi2024") {
      localStorage.setItem("formspsi-auth", JSON.stringify({ email, entrou_em: new Date().toISOString() }));
      router.push("/dashboard");
    } else {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF9F7] dark:bg-[#1A1614] px-6 relative">
      {/* Orb */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[350px] h-[350px] opacity-15 dark:opacity-8"
        style={{ background: "radial-gradient(circle, #E8C4BB 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[300px] h-[300px] opacity-10 dark:opacity-5"
        style={{ background: "radial-gradient(circle, #D9CEBF 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* Nav */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="text-xs text-[#9B9088] hover:text-[#C4897A] transition-colors"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
        >
          ← início
        </button>
        <ThemeToggle />
      </div>

      <div
        className="w-full max-w-sm"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="h-px w-8 bg-[#D9CEBF] dark:bg-[#3D302C]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C4897A]" />
            <div className="h-px w-8 bg-[#D9CEBF] dark:bg-[#3D302C]" />
          </div>

          <p
            className="text-xs uppercase tracking-widest text-[#B5ABA3] mb-3"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.2em" }}
          >
            indicapsi
          </p>

          <h1
            className="text-3xl text-[#4A3328] dark:text-[#E8DDD1]"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
          >
            Bem-vinda de volta.
          </h1>
        </div>

        {/* Formulário */}
        <form onSubmit={entrar} className="space-y-6">
          <div>
            <label
              className="block text-xs uppercase tracking-widest text-[#B5ABA3] mb-3"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.16em" }}
            >
              e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
              className="
                w-full bg-transparent border-b border-[#D9CEBF] dark:border-[#3D302C]
                focus:border-[#C4897A] dark:focus:border-[#C4897A]
                text-[#4A3328] dark:text-[#E8DDD1] placeholder-[#CEC8C2] dark:placeholder-[#4A3328]
                py-3 text-base transition-colors
              "
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
            />
          </div>

          <div>
            <label
              className="block text-xs uppercase tracking-widest text-[#B5ABA3] mb-3"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.16em" }}
            >
              senha
            </label>
            <div className="relative">
              <input
                type={mostraSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="
                  w-full bg-transparent border-b border-[#D9CEBF] dark:border-[#3D302C]
                  focus:border-[#C4897A] dark:focus:border-[#C4897A]
                  text-[#4A3328] dark:text-[#E8DDD1] placeholder-[#CEC8C2] dark:placeholder-[#4A3328]
                  py-3 pr-10 text-base transition-colors
                "
                style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
              />
              <button
                type="button"
                onClick={() => setMostraSenha((p) => !p)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#B5ABA3] hover:text-[#9B9088] transition-colors p-1"
                aria-label={mostraSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostraSenha ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {erro && (
            <p
              className="text-xs text-[#C4897A]"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
            >
              {erro}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={carregando}
              className="
                w-full flex items-center justify-center gap-3 py-4 rounded-full
                bg-[#4A3328] dark:bg-[#C4897A] text-[#FAF9F7] dark:text-white
                text-sm hover:bg-[#6B4C3B] dark:hover:bg-[#A96B5C]
                disabled:opacity-60 transition-all duration-300
                hover:shadow-[0_8px_24px_rgba(196,137,122,0.25)]
              "
              style={{ fontFamily: "var(--font-inter)", fontWeight: 400, letterSpacing: "0.08em" }}
            >
              {carregando ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-white/30 border-t-white animate-spin"
                    style={{ borderTopColor: "white" }}
                  />
                  entrando...
                </span>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={15} strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo hint */}
        <div className="mt-8 p-4 rounded-xl bg-[#F0EBE3] dark:bg-[#231C1A] border border-[#EDE6DC] dark:border-[#2C2320]">
          <p
            className="text-xs text-[#9B9088] text-center mb-1"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
          >
            acesso demonstração
          </p>
          <p className="text-xs text-center text-[#B5ABA3]" style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}>
            psi@indicapsi.com · indicapsi2024
          </p>
        </div>

        <p className="text-center text-xs text-[#CEC8C2] mt-8" style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}>
          acesso restrito à psicóloga responsável
        </p>
      </div>
    </main>
  );
}
