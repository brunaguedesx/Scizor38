# Capim Dourado Connect — guia para manutenção e refatoração

## 1. Leia antes de alterar

Este guia é o ponto de entrada para outra ferramenta entender o aplicativo. Não modifique os documentos originais de `docs/scizor38/`: regulamento, escopo Capim Dourado, planejamento técnico e README da equipe. Conflitos obedecem: regulamento → requisitos Scizor → planejamento inicial para requisitos complementares → V2 compatível com essas fontes → imagens. Registre qualquer mudança funcional em `DECISOES.md`; requisitos adiados não estão descartados.

O aplicativo é um protótipo não oficial com produtos, lojas, preços e benefícios demonstrativos. Seu objetivo é conectar pesquisa digital e visita presencial, sem pagamento online. A experiência prioritária é o navegador mobile.

## 2. O que já funciona

- Cadastro público de cliente; lojistas previamente vinculados a suas lojas.
- Catálogo compartilhado, ofertas por loja, comparação, favoritos privados e carrinho multiloja.
- Uma transação cria um grupo e uma reserva por loja. Neste mockup, novas reservas usam 20 segundos calculados no banco para demonstrar expiração/gato; a regra original de 2 horas permanece registrada em `DECISOES.md`. Preço congelado, envio idempotente e decisões independentes.
- Disponibilidade manual: não existe promessa de estoque físico nem dedução automática. Indisponibilidade recusa pendentes afetadas, preservando confirmadas.
- Cupons ilustrativos de boas-vindas/confirmação e notificações internas.
- CapimAI (Gemini no provedor) com filtros validados, autorização separada e resultados apenas do catálogo; recomendações exibidas como cartões de produtos.
- Radar com pesquisas, clientes distintos, favoritos, solicitações e confirmações reais agregadas da loja; rota fictícia com mapa numerado e missões persistentes.
- Notificações simuladas de disponibilidade entre 5 e 20 segundos, identificadas como simulação e sem alterar o status decidido pelo lojista.

## 3. Mapa de arquivos e responsabilidades

| Local | Responsabilidade |
|---|---|
| `src/router.tsx` | Cria o roteador e o contexto de cache de consultas. |
| `src/start.ts` | Inicializa o servidor, proteção de requisições e envio do token de sessão às funções. |
| `src/routes/__root.tsx` | Documento HTML, fontes, provedores globais, notificações e tratamento de erros. |
| `src/routes/index.tsx` | Entrada pública/landing e identificação do protótipo. |
| `src/routes/auth.tsx` | Login/cadastro e provedores sociais. |
| `src/routes/_authenticated/route.tsx` | Proteção gerenciada do conjunto de páginas autenticadas. |
| `src/routes/_authenticated/app.tsx` | Navegação do cliente, cabeçalho e carrinho. |
| `src/routes/_authenticated/app.index.tsx` | Vitrine, busca e filtros. |
| `src/routes/_authenticated/app.produto.$id.tsx` | Produto e comparação das ofertas. |
| `src/routes/_authenticated/app.reservas.tsx` | Entrada da página de reservas. |
| `src/routes/_authenticated/app.conta.tsx` | Entrada da conta. |
| `src/routes/_authenticated/lojista.tsx` | Pedidos e disponibilidade da própria loja. |
| `src/features/auth/functions.ts` | Resolve identidade, papel e vínculo com loja no servidor. |
| `src/features/catalog/functions.ts` | Consulta pública do catálogo e configuração de cache. |
| `src/features/account/functions.ts` | Favoritos, preferências, cupons e notificações da conta. |
| `src/features/account/account-page.tsx` | Interface da conta. |
| `src/features/reservations/functions.ts` | Consultas autenticadas e chamadas das transações de reserva. |
| `src/features/reservations/reservations-page.tsx` | Selecionados, revisão, reservas, cancelamento e expiração. |
| `src/features/ai/contracts.ts` | Schemas pequenos, validação contra catálogo, gatilho de 13 cliques e critério estatístico de demanda. |
| `src/features/ai/ai.functions.ts` | Autorização, consulta dos dados mínimos, extração Gemini, registro minimizado e análises autenticadas. |
| `src/features/ai/server/` | Adaptador Gemini, helpers de gateway e IDs por chamada; apenas servidor. |
| `src/features/ai/search-panel.tsx` | Busca, autorização revogável, voz editável, erros e aranha. |
| `src/features/recommendations/model.ts` | Ranking por categoria/marca de favoritos e reservas, excluindo itens já escolhidos. |
| `src/features/recommendations/recommendations-section.tsx` | Sugestões e ação de análise de interesses. |
| `src/features/merchant/contracts.ts` | Contrato de contagens agregadas por produto. |
| `src/features/merchant/insights-panel.tsx` | Radar, períodos, interesse e análise de oportunidades. |
| `src/features/visit/` | Entradas, ordenação fictícia de paradas ativas, planta ilustrativa e compartilhamento manual. |
| `src/features/missions/` | Listagem de missões, conclusão simulada e cupom persistido em transação. |
| `src/routes/_authenticated/app.visita.tsx` | URL da visita e validação do parâmetro entrada. |
| `src/routes/_authenticated/app.missoes.tsx` | URL das missões com catálogo carregado. |
| `src/lib/catalog.ts` | Tipos, imagens, filtros, parser local e pontuação base. |
| `src/lib/reservations.ts` | Tipos e regras puras de status/tempo. |
| `src/components/app/` | Marca, cartões de produto, carrinho e notificações compartilhadas. |
| `src/components/ui/` | Componentes acessíveis de interface; reutilize-os. |
| `src/styles.css` | Tokens de cores, tipografia, efeitos e movimento reduzido. |
| `src/integrations/` | Clientes e autenticação gerados pela plataforma; não editar arquivos gerados. |
| `src/test/` | Testes de regras e navegação. |
| `drizzle/migrations/` | Histórico das mudanças do banco gerenciado pela plataforma. |
| `docs/evidencias/` | Capturas das verificações anteriores; não representam automaticamente as funcionalidades novas. |

## 4. Dados e segurança

`profiles` contém perfil, não privilégios. `user_roles` contém papéis; `merchant_memberships` contém vínculo com loja. `products`, `stores` e `offers` são o catálogo. `favorites` pertence ao cliente. `reservation_groups`, `reservations` e `reservation_items` modelam o pedido dividido. `coupons`, `user_coupons` e `notifications` completam o engajamento.

`ai_preferences`: autorização específica por conta. `search_events`: horário, IDs de produtos resultantes, categoria, quantidade e chave idempotente — não armazena a frase original nem áudio. `ai_access_state`: bloqueio persistido se o provedor negar acesso. `mission_completions`: conclusão única por conta/produto/loja. Lojista só lê agregados pelo RPC `search_demand_insights()`, que resolve a loja pela sessão.

Políticas PostgreSQL RLS são a barreira de acesso. Funções autenticadas recebem o cliente do banco limitado à sessão; funções transacionais verificam proprietário/papel/loja. Não use privilégio administrativo para consultas normais. Nunca exponha favoritos individuais ao lojista nem confie em IDs ou papéis enviados pelo navegador.

## 5. Por que esta stack

- **TanStack Start + React + TypeScript:** mantém a stack existente, oferece páginas e funções tipadas no mesmo projeto e evita migrar para Express/React Router sem benefício demonstrado. TypeScript explicita contratos entre módulos.
- **TanStack Query:** cache, atualização e invalidação após mutações sem duplicar estado remoto nos componentes.
- **Lovable Cloud / PostgreSQL:** autenticação gerenciada, transações, chaves estrangeiras, índices e RLS atendem ao isolamento de clientes/lojistas e à reserva multiloja. SQLite isolado não atenderia a essa concorrência/distribuição sem outro servidor. Para hospedar na Vercel, mantém-se esse serviço externo de banco/autenticação: a Vercel serve a aplicação e as server functions, não substitui o Cloud. Configurar as variáveis de ambiente e validar o adaptador/destino publicado são etapas de deploy ainda não executadas; trocar de banco agora não traz benefício que compense recriar segurança e transações.
- **Tailwind v4 + componentes Radix/shadcn existentes + Lucide:** reaproveitamento da interface e controles acessíveis, sem um segundo sistema visual.
- **Gemini 3.1 Flash Lite via Lovable AI Gateway + Vercel AI SDK:** modelo leve disponível no catálogo autenticado, adequado à extração curta. Usa Chat Completions na superfície de retenção zero declarada pelo gateway, stream consumido no servidor, chave exclusivamente no servidor e correlação das chamadas. Gemini recebe JSON mode mais instrução explícita dos campos, com validação Zod local; não afirmar que o provedor garante schema estrito. Extração leve não exige agente autônomo nem treinamento próprio. A chave colada no chat não foi incorporada ao código; recomenda-se revogá-la. Chamadas consomem créditos Lovable AI.
- **Vitest + Playwright:** regras puras e percursos reais, respectivamente; testes de UI não substituem verificação de autorização no banco.

## 6. Preparação para escala, não infraestrutura nova

Organize por domínio, mantenha funções pequenas e contratos serializáveis. Regras puras ficam fora das telas; segredos e prompts em arquivos server-only. Futuramente: paginação, agregações periódicas, retenção auditada, filas limitadas/idempotentes, observabilidade, avaliação de extração, testes de carga e mapa oficial. Não introduzir agora microserviços, Redis, filas ou pipelines de treinamento.

## 7. Como validar e documentar

`bun run test` executa a suíte. O ambiente Lovable verifica compilação automaticamente. Verifique no navegador sessões de cliente e lojista, favoritos, reserva em duas lojas, recusa/confirmação independente, indisponibilidade, expiração e mobile. Nunca registrar credenciais em capturas ou logs.

`README.md`: entrada e execução. `DECISOES.md`: mudanças e justificativas. `USO_DE_IA.md`: técnica, dados enviados e limites. `TESTES_E_EVIDENCIAS.md`: verificações efetivamente executadas. `roadmap.md`: tarefas abertas. `AGENTS.md`: regras técnicas para ferramentas futuras.

## 8. Incremento solicitado

1. Gemini extrai filtros de linguagem natural, com autorização específica, validação e consulta apenas ao catálogo.
2. Recomendações explicáveis usam favoritos/reservas; Gemini interpreta sinais minimizados somente por ação explícita. Não chamar pontuação de probabilidade treinada.
3. Lojista vê pesquisas agregadas recentes, comparação entre períodos e oportunidades fundamentadas, não identidade dos pesquisadores.
4. Aranha desce após 13 cliques no botão Buscar, sem gerar chamadas repetidas de IA.
5. Guia de visita por entrada informada no QR, com planta/rota fictícia claramente identificada.
6. Missões e recompensas demonstrativas, sem prometer estacionamento grátis real ou comprovar uma visita inexistente.

WhatsApp automático, ERP, estoque físico, pagamento, provador inteligente e fidelidade oficial permanecem fora desta implementação; os requisitos continuam registrados nas fontes.

## 9. Contratos e percursos novos

**Busca:** `SearchPanel` → `interpretSearch` → sessão/papel/consentimento/bloqueio → catálogo permitido → Gemini → schema Zod → whitelist/limites → `filterProducts` → `search_events` → filtros visíveis. Mesma oferta deve cumprir mínimo e máximo. Pesquisa repetida sem alteração reutiliza o resultado no navegador; 13 cliques não geram 13 chamadas. Falha não vira resposta fictícia nem fallback silencioso.

**Interesses:** favoritos e reservas não canceladas/recusadas → ranking conteúdo → candidatos → Gemini seleciona somente IDs permitidos. Categoria favoritada soma 3, reservada 5; marca favoritada 1, reservada 2; promoção 1. São sinais explicáveis, não probabilidades calibradas nem previsão de venda. Nenhum modelo foi treinado. Sem sinais, a análise não chama IA.

**Lojista:** `search_demand_insights()` → contagens reais por produto/loja, clientes distintos, favoritos, solicitações, confirmações e sete dias contra sete anteriores → tendência somente com ao menos três registros em ambos os períodos e crescimento maior que 20%. Pesquisa conta itens retornados, não cliques nem compras; uma pesquisa pode sinalizar produtos de várias lojas. Sem resultados não atribuímos demanda a uma loja por adivinhação. Análise CapimAI envia somente agregados mediante clique, nunca identidade ou frase.

**QR/visita:** configure QR externo para `https://DOMINIO-DO-APP/?entrada=norte`, `sul` ou `leste`. O aplicativo usa o parâmetro do link, não geolocalização. Landing guarda entrada na sessão do navegador; após login, abra Visita. Link direto `/app/visita?entrada=sul` também funciona. Câmera/scanner e QR físico oficial não foram implementados. Mapa é galeria fictícia; reservas ativas são deduplicadas por loja e ordenadas por proximidade ilustrativa. Tempos não são medições reais.

**Missões:** `complete_demo_mission()` valida cliente/produto/oferta, concede uma conclusão por conta/produto/loja e adiciona cupom ilustrativo. Visita precisa ser explicitamente simulada; não há prova de presença, pontos, estacionamento grátis ou parceria oficial. Recompensa de 10% é conteúdo fictício escolhido para a demo, não um benefício informado pelo shopping. A equipe deve fornecer regras reais antes de produção.

## 10. Cuidados para outra ferramenta

- Não modificar clientes gerados, árvore de rotas gerada ou arquivos de origem protegidos.
- Não importar helpers server-only diretamente em componentes. Não usar Node-only packages no runtime publicado.
- Não trocar o modelo/endpoint, limites ou lógica de outras chamadas durante refatoração não relacionada.
- Não registrar dados pessoais, tokens, prompts completos com dados do usuário ou chaves nos logs.
- Revogação impede novas chamadas pessoais; exclusão de histórico e política jurídica de retenção ainda precisam de implantação própria antes de produção.
- Não adicionar chamadas de IA por renderização, atualização periódica ou clique em cada produto. Leituras de insights são SQL; Gemini somente por ação explícita.
- Provider denial persiste bloqueio; a retomada requer acesso restaurado e ação do responsável. Não existe rotina de probe ou troca silenciosa de modelo.
- Apenas preparar escala: eventos minimizados e índices sustentam consultas atuais; paginação e agregados periódicos são próximas etapas, não entregas existentes.

## 11. Ajustes atuais e handoff para refatoração

- A interface chama a experiência de **CapimAI**; o identificador técnico `google/gemini-3.1-flash-lite` e o adaptador continuam inalterados.
- `simulate_demo_availability()` valida dono/papel, cria somente para reservas pendentes ativas e usa `deduplication_key` para não repetir alertas. O atraso é local de 5–20 segundos; fechar a aba antes dele impede o agendamento. Não há push nem alteração automática de status.
- Favoritos e reservas invalidam as consultas de demanda; o lojista também pode atualizar manualmente. A análise da CapimAI faz nova leitura agregada somente no clique.
- A conta tem um único atalho de navegação e logout no topo. Produtos de Moda exibem o convite aos provadores sem alegar integração física.
- O mapa continua uma galeria fictícia; entrada, praça, corredores, linha tracejada e números apenas comunicam a ordem calculada.

### Documentos originais: alterações e remoções

**Nenhum original foi alterado ou removido.** Permanecem preservados em `docs/scizor38/`:

1. `README.md` da equipe;
2. `Capim_Dourado_Connect_Escopo_Geral_V2.md`;
3. `Planejamento Técnico_inicial.md`;
4. `regulamento-hackarun-2026.md`.

Os documentos de manutenção alterados neste projeto são este guia, o `README.md` da raiz, `DECISOES.md`, `USO_DE_IA.md`, `TESTES_E_EVIDENCIAS.md` e `roadmap.md`. As alterações neles registram implementação, decisões e verificações; não substituem as fontes originais.