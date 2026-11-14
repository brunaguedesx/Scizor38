import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { getCurrentProfile } from "@/features/auth/functions";
import { Brand } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import "@lovable.dev/cloud-auth-js/styles.css";
import authImage from "@/assets/products/camisa-linho.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar ou criar conta | Capim Dourado Connect" },
    { name: "description", content: "Acesse a demonstração como cliente ou lojista e continue sua jornada de compra." },
    { property: "og:title", content: "Acesse o Capim Dourado Connect" },
    { property: "og:description", content: "Uma conta para descobrir, reservar e comprar presencialmente." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AuthPage,
});

function GoogleIcon() {
  return <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [profileType, setProfileType] = useState<"customer" | "merchant">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function goToProfile() {
    const profile = await getCurrentProfile();
    await navigate({ to: profile.role === "MERCHANT" ? "/lojista" : "/app" });
  }
  async function signIn(loginEmail: string, loginPassword: string) {
    setLoading(true); setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      await goToProfile();
    } catch (error) {
      const text = error instanceof Error && error.message.includes("Invalid login") ? "E-mail ou senha incorretos." : error instanceof Error ? error.message : "Não foi possível entrar.";
      setMessage(text);
    } finally { setLoading(false); }
  }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (mode === "login") return signIn(email, password);
    setLoading(true); setMessage("");
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name, marketing_opt_in: marketing } } });
      if (error) throw error;
      if (!data.session) { setMessage("Conta criada. Confirme o e-mail recebido para entrar na demonstração."); return; }
      toast.success("Conta criada com sucesso");
      await goToProfile();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível criar a conta."); }
    finally { setLoading(false); }
  }
  async function socialLogin(provider: "google" | "lovable") {
    setLoading(true); setMessage("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (result.redirected) return;
      await goToProfile();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível concluir o acesso."); setLoading(false); }
  }
  function selectDemo(type: "customer" | "merchant-a" | "merchant-b") {
    const demoEmail = type === "customer" ? "cliente.demo@exemplo.test" : type === "merchant-a" ? "lojista.a@exemplo.test" : "lojista.b@exemplo.test";
    void signIn(demoEmail, "Demo2026!");
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden lg:block"><img src={authImage} alt="Camisa de linho demonstrativa" width={912} height={1104} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-foreground/15" /><div className="absolute inset-x-12 bottom-12 rounded-lg bg-background/95 p-8 shadow-lift"><p className="eyebrow text-primary">Reserve online. Compre na loja.</p><h2 className="editorial-title mt-3 text-4xl">A melhor parte ainda é experimentar.</h2></div></section>
      <section className="flex items-center justify-center px-5 py-8 sm:px-10"><div className="w-full max-w-md">
        <div className="mb-10 flex items-center justify-between"><Brand /><Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft />Início</Link></Button></div>
        <p className="eyebrow text-primary">Bem-vindo ao Connect</p><h1 className="editorial-title mt-3 text-5xl">{mode === "login" ? "Continue sua jornada." : "Crie sua conta."}</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Favoritos e reservas ficam vinculados à sua conta. Não pedimos CPF, telefone ou localização.</p>
        <div className="mt-7 grid grid-cols-2 rounded-lg bg-surface p-1"><button type="button" onClick={() => { setProfileType("customer"); if (mode === "signup") setMode("login"); }} className={`flex h-10 items-center justify-center gap-2 rounded-md text-xs font-medium ${profileType === "customer" ? "bg-card shadow-sm" : "text-muted-foreground"}`}><UserRound className="h-4 w-4" />Cliente</button><button type="button" onClick={() => { setProfileType("merchant"); setMode("login"); }} className={`flex h-10 items-center justify-center gap-2 rounded-md text-xs font-medium ${profileType === "merchant" ? "bg-card shadow-sm" : "text-muted-foreground"}`}><Store className="h-4 w-4" />Lojista</button></div>
        {profileType === "customer" && <div className="mt-5 flex gap-5 text-sm"><button type="button" className={mode === "login" ? "border-b-2 border-primary pb-1 font-medium" : "text-muted-foreground"} onClick={() => setMode("login")}>Entrar</button><button type="button" className={mode === "signup" ? "border-b-2 border-primary pb-1 font-medium" : "text-muted-foreground"} onClick={() => setMode("signup")}>Criar conta</button></div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required placeholder="Como podemos chamar você?" /></div>}
          <div className="space-y-2"><Label htmlFor="email">E-mail</Label><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" className="pl-9" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="voce@exemplo.com" /></div></div>
          <div className="space-y-2"><Label htmlFor="password">Senha</Label><div className="relative"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="password" type={showPassword ? "text" : "password"} className="pl-9 pr-10" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Mínimo de 6 caracteres" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-3 top-3 text-muted-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          {mode === "signup" && <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-surface p-3 text-xs leading-relaxed text-muted-foreground"><Checkbox checked={marketing} onCheckedChange={(checked) => setMarketing(checked === true)} className="mt-0.5" /><span>Quero receber recomendações e promoções demonstrativas com base nos meus favoritos. Opcional e revogável.</span></label>}
          {message && <p role="alert" className="rounded-lg border border-primary/25 bg-gold-soft/50 p-3 text-xs leading-relaxed text-foreground">{message}</p>}
          <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>{loading ? "Aguarde…" : mode === "login" ? "Entrar na demonstração" : "Criar conta de cliente"}<ArrowRight /></Button>
        </form>
        {profileType === "customer" && <><div className="my-5 flex items-center gap-3 text-[0.65rem] uppercase tracking-wider text-muted-foreground"><span className="h-px flex-1 bg-border" />ou continue com<span className="h-px flex-1 bg-border" /></div><div className="space-y-3"><Button type="button" variant="outline" className="h-11 w-full rounded-full" disabled={loading} onClick={() => socialLogin("google")}><GoogleIcon />Continuar com Google</Button><button type="button" className="lovable-auth-button w-full" disabled={loading} onClick={() => socialLogin("lovable")}>Continuar com Lovable</button></div></>}
        <div className="mt-7 rounded-lg border border-dashed border-primary/35 bg-gold-soft/30 p-4"><p className="flex items-center gap-2 text-xs font-semibold"><Check className="h-4 w-4 text-primary" />Acesso rápido para apresentação</p><p className="mt-1 text-[0.68rem] text-muted-foreground">Contas fictícias com senha Demo2026!</p><div className="mt-3 flex flex-wrap gap-2">{profileType === "customer" ? <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={() => selectDemo("customer")}>Entrar como cliente demo</Button> : <><Button type="button" variant="secondary" size="sm" disabled={loading} onClick={() => selectDemo("merchant-a")}>Lojista Movida</Button><Button type="button" variant="secondary" size="sm" disabled={loading} onClick={() => selectDemo("merchant-b")}>Lojista Essenza</Button></>}</div></div>
        <p className="mt-6 text-center text-[0.65rem] leading-relaxed text-muted-foreground">Ao continuar, você usa um protótipo com dados fictícios. O consentimento de marketing não é obrigatório.</p>
      </div></section>
    </main>
  );
}
