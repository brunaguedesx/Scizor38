# Capim Dourado Connect

# utilize o link do site para avaliação de uso do produto:
Link do site: https://capim-dourado-connect.lovable.app

<img width="300" height="300" alt="image" src="https://github.com/user-attachments/assets/8d7b0f82-33dc-4dd1-9b76-276c5fe75dab" />




Protótipo funcional da equipe **Scizor38** para o Desafio 04 do HackaRun UniCatólica 2026: integração da jornada de compra digital e física.

Alunos: Bruna Guedes Machado, Víctor Emanuel Rodrigues Mota Gomes, Vinicius Rodrigues Araújo e Maria Antonia Barros Ribeiro.

> Demonstração não oficial. Lojas, marcas, produtos, preços, reservas, notificações e cupons são fictícios. Não há integração com o aplicativo, ERP, estoque ou sistemas do shopping.

## Executar localmente

Requisitos: Bun 1.3+ e acesso ao projeto com Lovable Cloud conectado.

```sh
bun install
bun run dev
```

A aplicação abre em `http://localhost:8080`.

```sh
bun run test
```

## Contas fictícias de demonstração

Todas usam a senha `Demo2026!`:

| Perfil | E-mail | Escopo |
|---|---|---|
| Cliente | `cliente.demo@exemplo.test` | Catálogo, favoritos e próprias reservas |
| Lojista A | `lojista.a@exemplo.test` | Somente Movida |
| Lojista B | `lojista.b@exemplo.test` | Somente Essenza |

Também há cadastro por e-mail com confirmação, Google e Lovable. O cadastro público sempre cria o papel de cliente; não permite escolher loja ou papel de lojista.

## Fluxo para demonstrar

1. Abra a landing e entre como cliente demo.
2. Autorize a CapimAI na vitrine e pesquise “Quero um tênis branco até R$ 250”. A autorização é opcional para navegar e usar filtros manuais.
3. Abra o tênis, compare Movida e Essenza, favorite e adicione ofertas à seleção.
4. Adicione outro item, revise e confirme a solicitação multiloja.
5. Veja os códigos e a contagem regressiva demonstrativa de 20 segundos; ao zerar, o gato avisa que a reserva expirou. Entre 5 e 20 segundos após a solicitação, uma notificação de disponibilidade explicitamente simulada pode aparecer no sino antes da expiração; ela não altera o status nem substitui o lojista. A regra original de 2 horas foi acelerada somente neste mockup.
6. Saia e entre como Lojista Movida; confirme somente a parte da Movida.
7. Entre como Lojista Essenza; recuse ou marque uma oferta como indisponível.
8. Volte ao cliente e atualize as reservas para observar os estados independentes.

## Implementado

- Landing pública de entrada por QR/link, com nota de não-oficialidade.
- Autenticação e autorização por cliente/lojista, com isolamento por loja no banco.
- Catálogo responsivo com busca textual estruturada, voz quando suportada, filtros combináveis e comparativo.
- Favoritos persistentes e privados por cliente.
- Seleção e reserva multiloja com grupo, reservas independentes, snapshot de preço e idempotência; novas reservas do mockup expiram em 20 segundos no servidor, enquanto a regra original de 2 horas permanece documentada.
- Estados pendente, confirmada, recusada, cancelada e expirada; contador acelerado, aviso do gato ao zerar e cancelamento em duas etapas.
- Painel do lojista com confirmação/recusa e disponibilidade manual compartilhada.
- Indisponibilidade recusa automaticamente pendentes afetadas, sem cancelar confirmadas silenciosamente.
- Recomendações em cartões de produto, cupons ilustrativos e notificações in-app.
- Insights agregados de pesquisas, clientes distintos, favoritos, solicitações e confirmações reais da demonstração, sem favoritos identificáveis.
- Easter eggs acessíveis da aranha e do gato, com redução de movimento.
- CapimAI: extração estruturada com Gemini, sugestões de produtos e análise de oportunidades por ação explícita.
- Agregados da própria loja atualizados pelas interações das contas; tendências conservadoras, sem identidade dos clientes.
- Visita com entrada por link QR, mapa fictício legível e paradas numeradas das reservas ativas.
- Lojas de moda com convite “te aguarda nos provadores”.
- Missões simuladas e cupons persistentes na conta.

## Fora do MVP / sem integração real

Pagamento online, ERP, estoque numérico, WhatsApp Business, mapas indoor reais, provador inteligente, fidelidade, push nativo e integração técnica com o aplicativo oficial. O reconhecimento de voz é um recurso do navegador. Gemini usa Lovable AI Gateway e consome créditos; a chave exposta no chat não foi salva nem utilizada. Não há desconto comercial ou estacionamento grátis real.

## Estrutura

- `src/routes`: landing, autenticação, área protegida do cliente e painel do lojista.
- `src/features`: catálogo, conta, autenticação, reservas, IA, recomendações, lojista, visita e missões.
- `src/lib`: tipos, parser, filtros e regras puras testáveis.
- `drizzle/migrations`: esquema, RLS, funções transacionais e dados fictícios.
- `docs/scizor38`: documentos de origem importados do repositório.

## Tecnologia e origem dos recursos

TanStack Start, React, TypeScript, Tailwind CSS, Lucide, Lovable Cloud (autenticação e PostgreSQL). As imagens de produtos foram geradas para esta demonstração e não representam marcas reais. Fontes: Cormorant Garamond e Inter, distribuídas pelo Google Fonts. Consulte `DECISOES.md`, `USO_DE_IA.md` e `TESTES_E_EVIDENCIAS.md`.

**Para outra ferramenta:** comece por `GUIA_DO_PROJETO.md`, que descreve módulos, contratos, segurança, justificativas e preparação para escala. Não altere os documentos originais em `docs/scizor38/`.
