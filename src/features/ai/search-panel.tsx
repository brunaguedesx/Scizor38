import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Mic, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getAiConsent, interpretSearch, setAiConsent } from "./ai.functions";
import { isSpiderClick } from "./contracts";
import { emptyFilters, type SearchFilters } from "@/lib/catalog";

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
};
type RecognitionConstructor = new () => Recognition;

export function SearchPanel({ onResult }: { onResult: (filters: SearchFilters) => void }) {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [spider, setSpider] = useState(false);
  const clicks = useRef(0);
  const lastSearch = useRef<{ query: string; filters: SearchFilters } | null>(null);
  const queryClient = useQueryClient();
  const search = useServerFn(interpretSearch);
  const saveConsent = useServerFn(setAiConsent);
  const { data: consent = false } = useQuery({
    queryKey: ["ai-consent"],
    queryFn: () => getAiConsent(),
  });
  const preference = useMutation({
    mutationFn: (value: boolean) => saveConsent({ data: { consent: value } }),
    onSuccess: (value) => queryClient.setQueryData(["ai-consent"], value),
    onError: (e) => toast.error(e.message),
  });
  const mutation = useMutation({
    mutationFn: (value: string) =>
      search({ data: { query: value, requestId: crypto.randomUUID() } }),
    onSuccess: (result, value) => {
      lastSearch.current = { query: value, filters: result.filters };
      onResult(result.filters);
      queryClient.invalidateQueries({ queryKey: ["search-demand"] });
    },
  });
  useEffect(() => {
    if (!spider) return;
    const timer = setTimeout(() => setSpider(false), 4500);
    return () => clearTimeout(timer);
  }, [spider]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (mutation.isPending) return;
    if (!query.trim()) {
      onResult(emptyFilters);
      return;
    }
    if (!consent) {
      toast.info("Autorize o CapimAI ou utilize os filtros manuais.");
      return;
    }
    if (lastSearch.current?.query === query.trim()) {
      onResult(lastSearch.current.filters);
      return;
    }
    mutation.mutate(query.trim());
  }
  function countClick() {
    clicks.current += 1;
    if (isSpiderClick(clicks.current)) setSpider(true);
  }
  function voice() {
    const w = window as unknown as {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    const Constructor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Constructor) {
      toast.info("A voz não está disponível neste navegador.");
      return;
    }
    const recognition = new Constructor();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      setQuery(event.results[0]?.[0].transcript ?? "");
      toast.success("Revise a transcrição antes de buscar.");
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Não foi possível ouvir sua pesquisa.");
    };
    recognition.onend = () => setListening(false);
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      toast.error("O microfone não pôde ser iniciado.");
    }
  }
  return (
    <section className="mt-7" aria-label="Pesquisa com CapimAI">
      <form onSubmit={submit} className="flex gap-2" role="search">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-full bg-card pl-9 pr-11"
            placeholder="Tênis branco até R$ 250"
            aria-label="Descreva o produto que procura"
            maxLength={240}
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="absolute right-1 top-1 rounded-full"
            aria-label={listening ? "Ouvindo pesquisa" : "Buscar por voz"}
            disabled={listening}
            onClick={voice}
          >
            <Mic />
          </Button>
        </div>
        <Button className="h-11 rounded-full px-4" type="submit" onClick={countClick}>
          {mutation.isPending ? (
            <LoaderCircle className="animate-spin motion-reduce:animate-none" />
          ) : null}
          Buscar
        </Button>
      </form>
      <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Checkbox
          checked={consent}
          disabled={preference.isPending}
          onCheckedChange={(value) => preference.mutate(value === true)}
          aria-label="Autorizar CapimAI"
        />
        <span>
          Autorizo enviar minha pesquisa e sinais de favoritos/reservas ao CapimAI para busca e
          sugestões. Sem nome ou e-mail. Posso revogar aqui. Não envie dados pessoais. A voz pode
          usar serviço do navegador.
        </span>
      </label>
      {mutation.error && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {mutation.error.message}
        </p>
      )}
      {spider && (
        <div
          className="spider-dropping pointer-events-none fixed right-8 top-0 z-50 flex flex-col items-center text-foreground"
          role="status"
          aria-label="Aranhinha na teia"
        >
          <span className="h-48 w-px bg-foreground/50" />
          <svg width="68" height="56" viewBox="0 0 68 56" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M27 27 12 17 4 7M25 32 8 28 2 18M25 37 8 41 2 50M28 41 17 49 15 55M41 27 56 17 64 7M43 32 60 28 66 18M43 37 60 41 66 50M40 41 51 49 53 55" />
            </g>
            <ellipse cx="34" cy="35" rx="13" ry="15" fill="currentColor" />
            <circle cx="34" cy="19" r="8" fill="currentColor" />
            <g className="fill-background">
              <circle cx="31" cy="18" r="2" />
              <circle cx="37" cy="18" r="2" />
            </g>
          </svg>
        </div>
      )}
    </section>
  );
}

export function AppliedFilters({
  filters,
  stores,
}: {
  filters: SearchFilters;
  stores: { id: string; name: string }[];
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => setVisible(true), [filters]);
  if (!visible) return null;
  const labels = [
    filters.text,
    filters.category,
    filters.color,
    filters.priceMin && `a partir de R$ ${filters.priceMin}`,
    filters.priceMax && `até R$ ${filters.priceMax}`,
    filters.brand,
    stores.find((s) => s.id === filters.store)?.name,
  ].filter(Boolean);
  if (!labels.length) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 bg-gold-soft/50 p-3 text-xs">
      <p>
        <strong>Filtros aplicados:</strong> {labels.join(" · ")}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Fechar filtros aplicados"
        onClick={() => setVisible(false)}
      >
        <X />
      </Button>
    </div>
  );
}
