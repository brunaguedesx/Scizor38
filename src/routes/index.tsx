import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Check, Clock3, GitCompareArrows, MapPin, QrCode, Search, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import { validEntrance } from "@/features/visit/model";
import { Brand } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import tenisHero from "@/assets/products/tenis-branco.jpg";
import bolsaHero from "@/assets/products/bolsa-caramelo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Capim Dourado Connect — Reserve online. Compre na loja." },
    { name: "description", content: "Explore produtos, compare ofertas e reserve nas lojas do shopping por duas horas. Demonstração do HackaRun 2026." },
    { property: "og:title", content: "Capim Dourado Connect" },
    { property: "og:description", content: "Encontre o que procura. Reserve online. Compre na loja." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LandingPage,
});

function LandingPage() {
  useEffect(() => {
    const entry = new URLSearchParams(window.location.search).get("entrada");
    if (entry) sessionStorage.setItem("capim-entrance", validEntrance(entry));
  }, []);
  return (
    <main className="overflow-hidden bg-background">
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Brand />
        <nav className="hidden items-center gap-8 text-xs font-medium text-muted-foreground md:flex" aria-label="Navegação principal"><a className="hover:text-primary" href="#como-funciona">Como funciona</a><a className="hover:text-primary" href="#lojistas">Para lojistas</a><a className="hover:text-primary" href="#sobre">Sobre a demo</a></nav>
        <div className="flex items-center gap-1"><Button asChild variant="ghost" size="sm"><Link to="/auth">Entrar</Link></Button></div>
      </header>
      <section className="hero-surface relative flex min-h-[100svh] items-center pt-24">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
          <div className="animate-fade-up max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-primary"><QrCode className="h-3.5 w-3.5" />Sua jornada começa aqui</div>
            <h1 className="editorial-title text-[clamp(3.4rem,8vw,6.8rem)] leading-[0.88] text-foreground">Encontre o que<br /><em className="font-normal text-primary">procura.</em></h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">Explore produtos das lojas do shopping, compare possibilidades e reserve para experimentar. Sem pagamento online, sem perder a experiência presencial.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"><Button asChild size="lg" className="h-13 rounded-full px-7"><Link to="/auth">Explorar lojas e produtos<ArrowRight /></Link></Button><span className="flex items-center justify-center gap-2 text-xs text-muted-foreground sm:justify-start"><Clock3 className="h-4 w-4 text-primary" />Reserva temporária de 2 horas</span></div>
            <p className="mt-6 text-[0.68rem] leading-relaxed text-muted-foreground">Protótipo não oficial · Demonstração com produtos e preços ilustrativos.<br />Disponibilidade sujeita à confirmação da loja.</p>
          </div>
          <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[560px]" aria-label="Seleção de produtos demonstrativos">
            <div className="absolute right-0 top-0 h-[82%] w-[72%] overflow-hidden rounded-t-[10rem] rounded-b-lg shadow-lift"><img src={tenisHero} alt="Tênis branco demonstrativo" width={912} height={1104} className="h-full w-full object-cover" /></div>
            <div className="absolute bottom-0 left-0 h-[52%] w-[45%] overflow-hidden rounded-lg border-8 border-background shadow-lift"><img src={bolsaHero} alt="Bolsa caramelo demonstrativa" width={912} height={1104} className="h-full w-full object-cover" /></div>
            <div className="absolute bottom-[18%] right-[2%] rounded-lg bg-card p-4 shadow-soft sm:right-[-4%]"><div className="flex items-center gap-3"><span className="rounded-full bg-gold-soft p-2 text-primary"><ShoppingBag className="h-5 w-5" /></span><div><p className="text-xs font-semibold">Reserve. Experimente.</p><p className="mt-0.5 text-[0.65rem] text-muted-foreground">A compra acontece na loja.</p></div></div></div>
          </div>
        </div>
      </section>
      <section id="como-funciona" className="mx-auto max-w-7xl scroll-mt-10 px-5 py-24 sm:px-8 lg:px-12">
        <div className="max-w-xl"><p className="eyebrow text-primary">Do digital ao presencial</p><h2 className="editorial-title mt-4 text-5xl leading-none sm:text-6xl">Uma jornada, sem fragmentos.</h2></div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[{ icon: Search, n: "01", title: "Descubra", text: "Busque por texto ou voz e encontre itens reais do catálogo demonstrativo." }, { icon: GitCompareArrows, n: "02", title: "Compare", text: "Veja preços, variações e disponibilidade entre diferentes lojas." }, { icon: Clock3, n: "03", title: "Reserve", text: "Selecione produtos de várias lojas em uma única jornada de 2 horas." }, { icon: MapPin, n: "04", title: "Viva a loja", text: "Apresente o código, experimente e pague presencialmente no caixa." }].map((step) => <div key={step.n} className="bg-card p-7"><div className="flex items-center justify-between"><step.icon className="h-5 w-5 text-primary" /><span className="font-display text-2xl text-primary/55">{step.n}</span></div><h3 className="mt-10 font-display text-3xl">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p></div>)}
        </div>
      </section>
      <section id="lojistas" className="bg-foreground py-24 text-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-12"><div><p className="eyebrow text-gold">Para quem atende</p><h2 className="editorial-title mt-4 text-5xl leading-none sm:text-6xl">A intenção de compra chega antes do cliente.</h2></div><div className="space-y-6 text-sm leading-relaxed text-background/70"><p>O lojista recebe apenas as solicitações da própria loja, confirma a disponibilidade e acompanha sinais agregados de interesse.</p><ul className="space-y-3">{["Decisões independentes para reservas multiloja", "Disponibilidade sincronizada com a vitrine", "Favoritos privados e insights sem identificação"].map((item) => <li key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-gold" />{item}</li>)}</ul><Button asChild variant="secondary" className="rounded-full"><Link to="/auth">Acessar painel do lojista<Store /></Link></Button></div></div>
      </section>
      <section id="sobre" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12"><div className="flex flex-col gap-6 rounded-lg bg-surface p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10"><div className="flex max-w-3xl gap-4"><ShieldCheck className="h-7 w-7 shrink-0 text-primary" /><div><h2 className="font-display text-2xl">Conceito integrável, não integração oficial.</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Este protótipo apresenta uma evolução conceitual do aplicativo do shopping. Não utiliza APIs, plantas, marcas oficiais, estoques ou dados reais. Toda a experiência usa informações fictícias.</p></div></div><Button asChild variant="outline" className="shrink-0 rounded-full"><Link to="/auth">Abrir demonstração<ArrowRight /></Link></Button></div></section>
      <footer className="border-t bg-secondary/60 px-5 py-10 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><Brand /><div className="text-xs leading-relaxed text-muted-foreground"><p>HackaRun UniCatólica 2026 · Desafio 04</p><p className="mt-1">Equipe Scizor38 · Dados 100% demonstrativos</p></div></div></footer>
    </main>
  );
}
