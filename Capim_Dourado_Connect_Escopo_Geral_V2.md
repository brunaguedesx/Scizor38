# CAPIM DOURADO CONNECT — ESCOPO GERAL E ESPECIFICAÇÃO PARA IMPLEMENTAÇÃO

**Versão:** 2.0 — consolidação para implementação do MVP  
**Data:** 14/11/2026  
**Contexto:** 1º HackaRun UniCatólica 2026 — Desafio 04: Integração da jornada de compra digital e física  
**Status:** plano proposto; funcionalidades só devem ser declaradas entregues após implementação e verificação.

> **Instrução principal ao Claude Code:** este documento é a fonte central de escopo. Prioridade em caso de conflito: (1) regulamento oficial do evento, (2) requisitos funcionais Scizor, (3) decisões de produto desta consolidação, (4) planejamento técnico inicial, (5) referências visuais. Qualquer decisão que altere comportamento funcional deve ser documentada. Não alegar integrações ou testes inexistentes. Implementar incrementos pequenos verificáveis, mantendo a aplicação executável.

---

## 1. VISÃO, PROBLEMA E PROPOSTA

### Problema
A descoberta e comparação de produtos pela internet está desconectada da visita e da compra nas lojas físicas do shopping. O cliente não sabe facilmente se o produto existe, qual loja o oferece ou se poderá experimentá-lo; o lojista tem pouca visibilidade sobre intenções de compra e reservas.

### Proposta
**Capim Dourado Connect** é uma **evolução proposta do aplicativo já existente do Shopping Capim Dourado**, concebida como uma experiência integrada de descoberta de produtos, busca inteligente, comparação, lista de interesses, reservas temporárias e atendimento do lojista. Não propomos lançar mais um aplicativo independente. O protótipo demonstra um **módulo novo e integrável**, com experiência de cliente e lojista na mesma base de código, isoladas por perfis no login.

### Benefícios e diferenciais
- **Cliente:** encontra, compara e reserva produtos de diferentes lojas antes de ir ao shopping; recebe recomendações e cupons relevantes.
- **Lojista:** recebe solicitações de reserva, confirma disponibilidade, visualiza intenção agregada de demanda e gerencia compromissos.
- **Shopping:** aproxima descoberta digital e compra física sem adotar checkout online no MVP.
- **IA com propósito:** transformar linguagem natural (inclusive fala, quando disponível) em filtros estruturados de produtos existentes no catálogo; recomendações rastreáveis e sinais simples de demanda.

### Posicionamento ético e de marca
A integração ao aplicativo existente **é conceito de produto**, não integração técnica realizada. Não existe autorização presumida para usar API, marca, logotipo, planta, estoques ou dados reais do shopping. Usar dados demonstrativos fictícios e elementos de marca somente se autorizados; caso contrário, utilizar marca textual/visual própria do protótipo com aviso de não-oficialidade. **Nunca simular acesso a sistemas externos como se fosse real.**

### Público-alvo
1. Consumidores do shopping (mobile-first).
2. Lojistas/atendentes das lojas participantes (painel responsivo mobile/desktop).
3. Administração do shopping como futura parte interessada, **sem painel administrativo adicional no MVP**.

### Limites
Compra e pagamento continuam **presenciais**. Uma reserva é uma solicitação temporária de disponibilidade; **não é compra nem garantia até confirmação do lojista**. A implementação pode usar dados demonstrativos; funcionalidades não realizadas devem ser identificadas no README e na apresentação.

---

## 2. ORIGEM DAS DECISÕES E MUDANÇAS JUSTIFICADAS

| ID | Mudança relativa à Entrega 1 | Decisão V2 | Justificativa e origem |
|---|---|---|---|
| M01 | Web App independente + landing page → módulo do app existente | Produto conceitualmente embutido no app do shopping; protótipo web mobile-first standalone para demonstrar telas | Nova decisão da equipe: reduz fricção para usuário; não pressupõe acesso à base tecnológica do shopping. |
| M02 | Landing de onboarding no navegador como entrada principal | Landing pública de QR na entrada com chamada para abrir/baixar o app; no protótipo, CTA abre demo | Scizor exige landing pós-QR para download; preserva tecnologia sorteada **Landing Page**. |
| M03 | Reservar provador com escolha da entrada como eixo principal | Reservar produtos de múltiplas lojas por **2h**, com confirmação pelo lojista; visita física é consequência | Scizor prioriza reserva, tempo, status e atendimento de lojista. |
| M04 | Comparativo, avaliações e estoques “em tempo real” | Comparativo de ofertas e disponibilidade **da base do protótipo**, sincronizada com ação do lojista; não alegar tempo real de ERP | Dados reais indisponíveis; prioriza consistência e demonstração correta. |
| M05 | Múltiplos códigos de provador e código único de fidelidade | Códigos curtos de reserva para identificação; fidelidade, pontos e resgate passam a extensão pós-MVP | Scizor prioriza gestão de reserva e cupons, não fidelidade; reduz complexidade. |
| M06 | Guia sequencial com WhatsApp e escolha de entrada | Extensão opcional após o núcleo; no máximo link de compartilhamento manual de roteiro textual, se sobrar tempo | Não exigido no Scizor; mapa indoor e API externa elevam risco. |
| M07 | Provador inteligente e troca de tamanho | Pós-MVP; opcional somente como destaque conceitual | Funcionalidade valiosa, mas cria novo fluxo operacional fora do núcleo principal. |
| M08 | Sem autenticação e perfis definidos | Login/cadastro de cliente e login de lojista, com RBAC/isolamento por loja | Scizor e requisitos de segurança; demonstra duas pontas. |
| M09 | Sem IA conversacional especificada | Busca por texto e voz quando suportada, sempre com transcrição editável e interpretação estruturada sobre o catálogo | Scizor: destaque de IA verificável. |
| M10 | Fidelidade genérica | Cupons por engajamento/interesses e por carrinho/reservas; descontos fictícios com regras explícitas | Scizor; melhor conexão entre descoberta e conversão. |
| M11 | Sem efeitos especiais | Aranha após 13 cliques em botão definido; gato preto quando reserva expira | Scizor; prioridade baixa, sem atrapalhar fluxo nem acessibilidade. |
| M12 | Stack Node/Express e GitFlow | Preferir frontend React/TS, backend Supabase se disponível/estável; alternativa full-stack Node local; escolha técnica condicionada a verificação | Minimizar tempo, erros e configuração. A escolha final deve ser registrada em DECISOES.md. |

**Regra de rastreabilidade:** nenhum item da Entrega 1 é apresentado como automaticamente implementado. Itens removidos do MVP ficam explicitamente em backlog posterior.

---

## 3. PRIORIZAÇÃO DE EXECUÇÃO

### P0 — mínimo demonstrável, bloquear outras features até estar operante
1. Página QR/landing de entrada + identificação clara de que é demonstração.
2. Login/cadastro de cliente e login de lojista; papéis realmente protegidos no backend.
3. Catálogo responsivo com busca, filtros, detalhe e preços por loja; dados seed consistentes.
4. Favoritar produtos e usar favoritos como sinal de interesse.
5. Reservar **vários itens de várias lojas**, com expiração de **2h**, visão de cliente e lojista e estados coerentes.
6. Lojista recebe solicitações e confirma/rejeita disponibilidade; produto sinalizado indisponível reflete no catálogo compartilhado; isolamento por loja.
7. Cliente vê estados, prazo, alerta de expiração e cancela via confirmação em duas etapas (não bloquear direito de cancelar).
8. Busca inteligente de texto: interpretar intenção em filtros estruturados, consultar APENAS o catálogo existente e mostrar resultados reais, sem inventar produtos.
9. Testes de regras de reserva e permissões + roteiro de demonstração funcional + README reproduzível.

### P1 — implementar após P0 estabilizado, em ordem
10. Busca por microfone com API do navegador **somente se suportada**, transcrição editável, fallback texto; implementação pode ser demonstrativa de voz sem fingir modelo externo.
11. Sugestão de itens similares ou iguais em outras lojas quando indisponível; recomendações pós-reserva.
12. Cupons por uso/interesse e por reserva com regras transparentes e validação de elegibilidade.
13. Centro de notificações in-app para promoção de favoritos, promoção geral e proximidade da expiração; notificações podem ser geradas por eventos locais/servidor sem push remoto.
14. Lojista: painel de interesse **agregado** e alerta explicável de demanda crescente, com marcador “estimativa demonstrativa”; dados pequenos não justificam predição sofisticada.

### P2 — apenas se tudo essencial estiver testado
15. Easter eggs (gato ao expirar, aranha após 13 cliques no CTA da landing).
16. Guia opcional de visita/link WhatsApp sem envio automático; entrada do shopping; provador inteligente.
17. Avaliações, pontos de fidelidade, resgate de recompensas, integrações a ERP, push nativo, mapas indoor, WhatsApp Business API, chatbot geral, pagamentos online.

**Critério de corte:** se prazo ameaçar testes, registro de evidência ou pitch, parar P1/P2. O entregável vale mais que cobertura nominal de todo backlog.

---

## 4. FLUXOS DE PONTA A PONTA

### Fluxo A — cliente
`QR → Landing → Abrir demonstração → Login/Cadastro → Vitrine → Busca/IA/Filtros → Detalhe/Comparativo → Favoritar → Carrinho de reserva multiloja → Confirmar solicitação → Minhas reservas (aguardando/confirmada/rejeitada/expirada/cancelada) → Visitar loja física`

Regras de interface:
- Landing com CTA principal de entrada; jamais redirecionar para lojas de aplicativo inexistentes.
- Usuário sem login pode explorar landing, e opcionalmente vitrine, mas **reservar e favoritar exigem conta**.
- Vitrine reutiliza layout dos screenshots, com categorias, grade de produtos e painel de filtros em drawer.
- Detalhe apresenta ofertas disponíveis, variações, indicador de disponibilidade e alternativa em outra loja.
- Carrinho distingue a quantidade/itens de cada loja. Uma operação cria **um grupo de reservas** e **reservas por loja** para permissões e confirmação independentes.
- Tela de reservas oferece status por loja, prazo restante, alerta, confirmação de cancelamento em duas etapas; detalhes e cupom quando disponível.

### Fluxo B — lojista
`Login lojista → Painel → Novas solicitações → Detalhes de reserva de sua loja → Confirmar/Recusar disponibilidade → Reservas confirmadas com contagem regressiva → Acompanhar interesses agregados/tendências (P1)`

Regras de interface:
- O lojista acessa **apenas** solicitações/itens de sua própria loja.
- Ação “indisponível” altera a disponibilidade daquela oferta no catálogo de clientes **para todos os usuários** da demo; o registro é persistido.
- Reserva multiloja pode ficar confirmada para uma loja e recusada para outra.
- Nunca mostrar ao lojista favoritos de pessoas identificáveis por padrão. Mostrar agregados e apenas itens da própria reserva necessários para atendê-la; interesses individuais fora da reserva requerem opt-in explícito, controle de acesso e finalidade documentada.
- Confirmação/rejeição tem efeito observável imediatamente (atualização ao refazer consulta; realtime somente se implementado).

### Fluxo C — IA
`Usuário digita ou dita → transcrição visível e editável → usuário confirma pesquisa → parser estruturado → validação dos filtros → consulta ao catálogo autorizado → lista de resultados → explicação curta dos filtros aplicados`

Ex.: “Quero um tênis branco até 250 reais” → `{categoria:'Calçados', termo:'tênis', cor:'branco', precoMax:250}` → retorno só de itens que obedecem ao banco. Se vazio, mostrar “Nenhum item disponível com estes critérios” e sugestões de relaxamento de filtros, sem gerar inventário fictício.

A IA pode ser implementada com **parser determinístico** seguro no MVP, e opcionalmente LLM server-side para extração estruturada validada (schema + whitelist de categorias + limite de preço); chamar de IA generativa **apenas se houver modelo real integrado**. A inovação também pode ser demonstrada por um pipeline híbrido explicável; documentar claramente a técnica aplicada. Chave de API nunca no browser.

---

## 5. TELAS — MÍNIMO DE TELAS NECESSÁRIAS

**Objetivo de UX:** 7 rotas principais + modais/drawers/abas internos, evitando uma tela por operação.

| Rota / tela | Perfil | Obrigatório | Componentes e ações |
|---|---|---|---|
| `/` Landing QR | Público | P0 | Hero do screenshot, CTA “Explorar”, como funciona, info de integração conceitual e nota de demo; aranha P2. |
| `/auth` Entrada | Ambos | P0 | Alternância login/cadastro cliente, acesso lojista de demonstração, erros, consentimento opcional separado. |
| `/app` Vitrine | Cliente | P0 | Navbar, busca com microfone P1, categorias, filtros drawer, produtos, coração, badge disponibilidade, notificações P1. |
| `/app/produto/:id` Detalhe | Cliente | P0 | Fotos, oferta por loja, preço, opções, comparativo, alternativas, botão adicionar à reserva. |
| `/app/reservas` Reservas & carrinho | Cliente | P0 | Abas “Selecionados” e “Minhas reservas”; agrupar por loja; enviar, acompanhar, cancelar em duas etapas, prazo e cupons P1. |
| `/app/conta` Conta & favoritos | Cliente | P0 | Aba favoritos + dados mínimos, preferências/consentimento/saída; notificações P1. |
| `/lojista` Painel | Lojista | P0 | Abas “Solicitações”, “Confirmadas”, “Estoque/Disponibilidade” (manual no MVP) e “Insights” P1; modais de aprovação/rejeição. |

**Modais/drawers reutilizáveis (não rotas):** filtros (screenshot), chatbot/busca guiada, caixa de confirmação de reserva, cancelar, detalhes de solicitação, notificações, consentimento, promoção/cupom e efeitos P2.

**Observação:** caso a equipe precise reduzir ainda mais, integrar `/app/conta` em drawer e `/app/produto/:id` em detalhe modal, mantendo URLs acessíveis por links. Não cortar ações críticas nem controle de acesso.

---

## 6. DESIGN SYSTEM A PARTIR DOS SCREENSHOTS

### Identidade visual
- Estilo: **premium, editorial, minimalista, comercial**, bastante espaço em branco, aparência sofisticada.
- Tons: branco `#FFFFFF`, off-white `#F8F7F4`, superfície suave `#F4F2ED`, bege de rodapé `#E7E4DC`, dourado principal aproximado `#C6A15A`, marrom/dourado escuro `#806331`, texto `#252523`, texto auxiliar `#777670`, borda `#E5E0D7`. **Valores são aproximações propostas**, não cores oficiais extraídas do shopping.
- Títulos: serifada editorial (preferir `Cormorant Garamond` ou `Georgia` como fallback); interface: `Inter`/`Arial`.
- Ícones: linha fina (Lucide); botões principais dourados e bordas discretas.
- Mobile-first: referência de viewport estreita (~390px), cards em 2–3 colunas conforme legibilidade e largura; navbar fixa/simples; sidebar/drawer para filtros; desktop adaptativo para painel lojista.
- Acessibilidade: contraste adequado (verificar textos dourados), foco visível, botão com área tocável, rótulos, redução de movimento para animações, fallback para microfone.

### Reaproveitamento direto do conceito visual
1. **`Capim Dourado Connect • Mobile.png`:** landing hero, tipografia, CTA dourado, passo a passo numerado, seções de valor, rodapé.
2. **`Vitrine digital • Mobile.png`:** cabeçalho, categorias circulares, busca, seleção de produtos, preços e marcas, favoritar, aviso de compra presencial.
3. **`Filtros • Mobile.png`:** drawer com chips por categoria, selects de marca/loja, preço mínimo/máximo e CTA “Ver N produtos”.

**Não reutilizar screenshot inteiro como interface falsa.** Implementar os componentes reais. Imagens de produtos demonstrativos devem ter licença/atribuição quando necessário. Não presumir uso permitido do logotipo do shopping.

### Copy importante
- “Encontre o que procura.”
- “Explore produtos das lojas do shopping.”
- “Reserve online. Compre na loja.”
- “Disponibilidade sujeita à confirmação da loja.”
- “Demonstração com produtos e preços ilustrativos.”

---

## 7. REQUISITOS FUNCIONAIS DETALHADOS E ACEITE

### RF01 Autenticação e autorização (P0)
- Cliente cria conta com e-mail e senha (ou mecanismo gerenciado equivalente); lojista entra com conta previamente provisionada.
- Nunca permitir que cadastro público se atribua papel `merchant` nem escolha qualquer loja.
- Uma sessão autentica e resolve papel no servidor; a navegação muda por papel e rotas de outro papel são bloqueadas.
- **Aceite:** cliente não acessa `/lojista` nem seus endpoints; lojista não lê reservas de outra loja.

### RF02 Catálogo, filtros e comparativo (P0)
- Seed de pelo menos 2 lojas e produtos com ofertas/preços possivelmente distintos; produtos com imagem demonstrativa, marca, categoria, preço, descrição, disponibilidade.
- Categoria, busca, marca, loja e faixa de preço combináveis; detalhe apresenta ofertas por loja.
- **Aceite:** alterar disponibilidade de oferta no painel lojista reflete na busca e no detalhe do cliente após atualização; produto indisponível oferece alternativas P1.

### RF03 Lista de interesse (P0)
- Adicionar e remover favorito com persistência por cliente.
- **Aceite:** favorito persiste após logout/login e não é visível na conta de outro cliente.

### RF04 Reserva multiloja e estados (P0)
- Selecionar variação/oferta e quantidade; conferir resumo por loja, sem cobrança online.
- Criar grupo (pedido) e registros de reserva vinculados às lojas, cada um com `expires_at = created_at + 2h`, calculado no servidor.
- Estados por reserva de loja: `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `EXPIRED` (opcional `FULFILLED` apenas se implementado e testado).
- Uma reserva expirada não pode ser confirmada/cancelada como ativa; a UI reflete status derivado do horário do servidor.
- **Aceite:** cliente faz uma solicitação com itens de 2 lojas; cada lojista recebe somente a parte própria; um pode aprovar, outro recusar.
- Gestão de estoque: **modo padrão `MANUAL_CONFIRMATION`** evita prometer dedução/garantia de estoque. Apenas oferta explicitamente indisponível impede nova reserva. Confirmar não deve afirmar retenção de quantidade real, salvo inventário confiável configurado.

### RF05 Alertas e cancelamento (P0)
- Aviso visível de “menos de 30 minutos” por reserva ativa (limiar definido para MVP); atualizar contador periodicamente e após recarregar.
- Cancelar disponível em menu/detalhes com modal: “Você perderá esta reserva. Confirmar cancelamento?” + 2º clique deliberado. Não usar dark patterns para impedir cancelamento.
- **Aceite:** cancelar altera status persistentemente e lojista deixa de tratar como ativa. Expiração mostra estado mesmo quando app estava fechado.

### RF06 Painel lojista (P0)
- Listar pendentes, confirmadas, tempo restante e itens; confirmar/rejeitar pendente somente da própria loja.
- “Indisponível” atualiza oferta na base compartilhada; se houver solicitações pendentes afetadas, exibir aviso e adotar política clara: rejeitar manualmente ou automática para a oferta; **proposta MVP: rejeitar automaticamente reservas PENDING contendo a oferta, com motivo `UNAVAILABLE`, em transação**. Reservas confirmadas não devem ser silenciosamente canceladas.
- **Aceite:** troca de status observável para o cliente e nenhum lojista vê informações de outra loja.

### RF07 Busca conversacional (P0 texto, P1 microfone)
- Input com botão microfone em destaque; se voz indisponível, botão informa e texto segue funcionando.
- Após reconhecimento de fala, **exibir o texto transcrito, permitir edição**, e somente ao clicar “Buscar” interpretar.
- Extração de campos `texto`, `categoria`, `cor`, `precoMin`, `precoMax`, `marca`, `loja` e somente termos suportados; validar limites e reduzir a busca a query segura.
- **Aceite:** nunca retornar produto que não está cadastrado e não afirmar disponibilidade que não consta no banco; se não houver resultados, estado vazio honesto.

### RF08 Recomendações, cupons e promoções (P1)
- Recomendar pela categoria de favoritos e reservas (motor determinístico por pontuação; declarar essa abordagem).
- Gerar cupom demonstrativo por regra transparente: exemplo **cupom de boas-vindas uma vez por conta** e **cupom após reserva confirmada**. Evitar prometer desconto real; regra explícita de elegibilidade, validade e limite de uso.
- Promoção é mudança de `original_price`/`sale_price` ou flag de oferta; notificação in-app de favorito em promoção sem envio externo.
- **Aceite:** cupom só é concedido nas condições configuradas; notificação de promoção não inventa preço e não duplica a cada render.

### RF09 Insights lojista (P1)
- Exibir contagem de favoritos da própria loja **somente agregada**, volume de solicitações e tendência de 7 dias vs período anterior **se houver dados suficientes**.
- Alerta “Demanda em crescimento” apenas baseado em critério transparente (ex.: solicitações recentes > período anterior por margem e base mínima); **não chamar de aprendizado de máquina se for regra estatística**.
- **Aceite:** números batem com banco; quando amostra pequena, exibir “dados insuficientes para tendência”.

### RF10 Easter eggs (P2)
- Ao expirar uma reserva, mostrar um gato preto ilustrado atravessando a tela uma vez por expiração observada pelo usuário, sem bloquear controles.
- Após 13 cliques no **CTA “Explorar lojas e produtos” da landing** em uma mesma sessão, aranha amigável desce em teia; não fazer 13 navegações indesejadas: contador no botão acessório definido para demo **ou alterar para botão de ajuda/ícone da landing que não navega**; decisão final deve ser registrada.
- Respeitar `prefers-reduced-motion`; nunca usar sustos ou efeitos que impeçam interação.

### RF11 Modos de estoque (regra Scizor; MVP parcial)
- **Previstos para evolução:** inserção manual, integração ERP/API, quota de estoque reservada ao app, confirmação de disponibilidade em tempo real.
- **No MVP:** disponibilizar escolha **conceitual**/configuração de política e implementar apenas disponibilidade manual/validação humana corretamente. Se existir seletor de modos, os não implementados devem estar desabilitados e rotulados “Em breve”. Não simular integração inexistente.

### RF12 LGPD e privacidade (P0)
- Coletar apenas conta, identificador de usuário e registros necessários à reserva; não exigir CPF, endereço, telefone ou geolocalização no MVP.
- Autenticação de cliente não deve ficar subordinada a consentimento opcional de marketing; apresentar aviso de privacidade e controle de **opt-in separado** para uso de favoritos em promoções e compartilhamento de interesses identificáveis, caso funcionalidade exista.
- Dados de demo sempre fictícios; política clara de eliminação/remoção de conta em evolução e canal de solicitação no MVP; proteger registros e evitar expor dados ao lojista além dos dados operacionais necessários.
- Não enviar texto de voz ou dados de conta a LLM externo sem base legal/aviso adequado. Reconhecimento de voz de navegador pode envolver serviço externo: informar e manter fallback de texto.

---

## 8. MODELO DE DADOS — SUGESTÃO MÍNIMA

- `profiles (id, role: CUSTOMER|MERCHANT, display_name, created_at)`; `merchant_memberships (user_id, store_id, role)` para atrelar lojista à loja no servidor.
- `stores (id, name, location_label, active)`.
- `products (id, name, category, brand, description, image_url, tags, active)`.
- `offers (id, product_id, store_id, price_cents, original_price_cents, availability: AVAILABLE|UNAVAILABLE|CHECK_WITH_STORE, stock_mode, updated_at)`; diferenças de preço são por oferta/loja.
- `favorites (user_id, product_id, created_at)` com unicidade.
- `reservation_groups (id, customer_id, created_at)`.
- `reservations (id, group_id, store_id, customer_id, status, created_at, expires_at, decided_at, rejection_reason)`.
- `reservation_items (id, reservation_id, offer_id, quantity, unit_price_cents_snapshot)`.
- `notifications (id, user_id, type, title, message, read_at, created_at)` [P1].
- `coupons (id, code, rule_type, discount_description, active, expires_at)` e `user_coupons (id, user_id, coupon_id, reservation_id, claimed_at, redeemed_at)` [P1].
- `audit_events (id, actor_id, entity_type, entity_id, action, timestamp)` recomendável para transições.

**Integridade:** FKs, regras de unicidade, quantidade > 0, valores não-negativos, índices por `store_id/status` e `customer_id/status`, políticas de acesso no banco ou API. Valores em centavos inteiros; datas UTC armazenadas e exibidas no fuso local. Atualização de status atômica com condição `PENDING AND expires_at > now()` para evitar corrida entre aceite e expiração. Expiração pode ser computada sob leitura e persistida por rotina/job ou ao operar; não depender só de `setTimeout` no browser.

---

## 9. STACK — DECISÃO ORIENTADA À EXECUÇÃO

**Proposta preferencial para Claude Code:**
- **Interface:** React + TypeScript + Vite + Tailwind CSS + Lucide React; React Router para 7 rotas; componentes reutilizáveis, sem introduzir UI framework grande sem necessidade.
- **Dados e autenticação:** Supabase (PostgreSQL, Auth, políticas RLS), **se conta, credenciais e serviço estiverem imediatamente disponíveis e o Claude conseguir demonstrar isolamento real**. Frontend consome Supabase com chave pública anon e regras RLS; nunca usar `service_role` no cliente. Operações compostas de reserva por RPC/funções SQL ou endpoint server-side validado para transação atômica.
- **Alternativa segura se Supabase atrasar:** Node.js + Express + TypeScript com SQLite (ou PostgreSQL já acessível), auth server-side e acesso via API. Evitar mover stack após iniciar vertical slice.
- **IA:** parser determinístico local para busca estruturada, com opção de LLM via função de servidor/endpoint proxy **somente quando credencial e integração reais estiverem disponíveis**.
- **Voz:** Web Speech API com detecção de suporte, sem exigir instalação nativa.
- **Testes:** Vitest para regras/políticas puras + testes de API/RLS ou endpoints; Playwright para o fluxo ponta a ponta apenas se configurado e executado; testes manuais com evidências reais.
- **Deploy:** opção estática compatível com Vite + backend acessível; se deploy não couber, execução local reproduzível é obrigatória.

**Trade-off:** Supabase reduz código de auth/banco, mas RLS mal configurada compromete segurança; Express é mais previsível se já configurado, mas requer mais implementação própria. **Critério de decisão de stack:** ao final de um spike curto, conseguir login de ambos os perfis, leitura do catálogo e bloqueio do lojista em loja alheia. Se não, usar fallback. Não escolher por moda.

### Organização de pastas recomendada
```text
src/
  app/             # bootstrap, router, providers
  components/      # UI compartilhada: Header, Cards, FiltersDrawer, Dialog...
  features/
    auth/          # login, session, guards
    catalog/       # listagem, busca, detalhe, filtros
    favorites/
    reservations/  # carrinho, máquinas de estado, status
    merchant/      # painel e ações
    ai-search/     # interpretação estruturada + validação
    offers/        # disponibilidade e preços
    coupons/       # P1
    notifications/ # P1
  lib/             # API client, errors, validation, dates
  styles/
server/             # somente se usar backend Node
supabase/           # somente se usar Supabase, SQL + policies
seed/               # dados fictícios
public/             # assets autorizados
README.md
DECISOES.md
TESTES_E_EVIDENCIAS.md
USO_DE_IA.md
```

### Convenções obrigatórias
- Tipos TS estritos; evitar `any` e estados duplicados.
- Regras de negócio em serviços/funções testáveis fora dos componentes React.
- Validar no servidor todos os parâmetros e permissões; frontend é apenas experiência, não proteção.
- Centralizar categorias, regras de desconto e transições; não repetir constantes em telas.
- Tratamento explícito de loading, vazio, erro e sucesso.
- `.env.example` sem chaves secretas; `.gitignore` correto; nunca commit de credenciais.
- Evitar dependências desnecessárias, microserviços, filas, infraestrutura complexa e abstrações que não sustentem o MVP.

---

## 10. AUTORIZAÇÃO E SEGURANÇA — REGRAS DE ACESSO

| Operação | Público | Cliente dono | Lojista da loja | Outro lojista |
|---|---|---|---|---|
| Ver catálogo/ofertas públicos | Sim | Sim | Sim | Sim |
| Ver/alterar próprios favoritos | Não | Sim | Não | Não |
| Criar reserva em nome próprio | Não | Sim | Não | Não |
| Ver/cancelar reserva própria | Não | Sim | Não | Não |
| Ver reservas de sua loja | Não | Não | Sim | Não |
| Confirmar/rejeitar reserva de sua loja | Não | Não | Sim | Não |
| Alterar disponibilidade de sua loja | Não | Não | Sim | Não |
| Ver interesse agregado da própria loja [P1] | Não | Não | Sim | Não |

**Segurança mínima:** login real, políticas RLS/validação de sessão e loja em toda query, autorização server-side, senhas sob provedor seguro/hash robusto, proteção contra injeção via consultas parametrizadas, limites de tamanho de entrada, mensagens sem vazamento de segredos, não confiar em IDs de loja do cliente. Log de ações sensíveis, não exibir dados de teste reais sensíveis.

**LGPD:** tratar consentimento de marketing de modo separado e revogável, indicar finalidades e retenção; não afirmar conformidade jurídica completa apenas por implementar checkbox. Aviso de privacidade do protótipo deve distinguir demonstração de eventual produto real.

---

## 11. REGRAS OPERACIONAIS E CASOS DE BORDA

1. Reserva com 2 lojas é duas decisões independentes sob um agrupador.
2. Preço da reserva deve usar snapshot da oferta no instante de criar; preço promocional posterior não reescreve histórico.
3. Se oferta tornar indisponível antes de confirmar, cancelar/rejeitar apenas pendentes pertinentes; evitar afetar confirmadas sem processo explícito.
4. Sem disponibilidade confirmada, mostrar `Aguardando confirmação da loja`; não prometer estoque.
5. Expiração calculada em servidor, não relógio de dispositivo; ao alcançar 2h, ações são bloqueadas e status é `EXPIRED` mesmo sem o navegador aberto.
6. Repetir envio por clique duplo não deve criar reservas duplicadas; usar idempotência ou bloquear enquanto processa, idealmente ambos.
7. Cancelamento em duas etapas preserva autonomia e não pode ser manipulação coercitiva.
8. Favoritos são privados; loja vê agregados sem identificar pessoas, a menos que exista consentimento específico e necessidade legítima.
9. Sem suporte a voz, input de texto permanece completo.
10. Sem resultado de IA, oferecer alternativas de filtro, sem inventar produto.
11. Falha de rede/DB oferece ação de tentar novamente, sem simular conclusão.
12. Seed não deve inserir marcas/produtos do shopping como se fossem oficiais; usar lojas e produtos fictícios claramente identificados.
13. Notificações e cupons são somente demonstrativos sem promessa de desconto comercial.
14. Não implementar “estoque real” de modo inconsistente: modo manual significa confirmação pela loja; estoque numérico só se a lógica de concorrência for testada.

---

## 12. SEED E DEMONSTRAÇÃO REALISTA

Seed mínimo: 3 lojas fictícias com 3–5 produtos por loja; pelo menos 2 ofertas do mesmo produto em lojas diferentes para comparativo, um item indisponível, um em promoção [P1], uma reserva pendente, uma confirmada, uma prestes a expirar e dados históricos artificiais agregados [P1] **claramente rotulados**. Imagens licenciadas ou placeholders coerentes com as referências.

Credenciais demo: disponibilizar contas de demonstração geradas por script ou no README **somente em ambiente local/demonstração**, nunca expor credenciais de ambiente real. Ex.: `cliente.demo@exemplo.test`, `lojista.a@exemplo.test`, `lojista.b@exemplo.test` com senhas temporárias configuradas localmente; criar mecanismo claro para reprodução.

Roteiro demonstrável (6–8 ações):
1. Abrir landing QR, entrar como cliente e mostrar vitrine com filtros.
2. Pesquisar em linguagem natural “tênis branco até R$ 250” e verificar resultados do seed; favoritar item.
3. Comparar mesmo produto entre duas lojas e adicionar duas ofertas de lojas diferentes à reserva.
4. Confirmar; exibir código, relógio de 2h e status pendente.
5. Entrar como lojista A e confirmar; entrar como lojista B e marcar outro item indisponível.
6. Voltar ao cliente: ver confirmação parcial, indisponibilidade propagada e alternativa; demonstrar cancelamento quando aplicável.
7. Se P1 pronto: mostrar cupom e notificação, ou demanda agregada; não sacrificar P0.
8. Exibir testes executados e arquitetura, enfatizando a continuidade entre visita digital e presencial.

---

## 13. PLANO DE IMPLEMENTAÇÃO COM VIBE-CODING CONTROLADO

**Orientação:** Claude Code implementa código, equipe valida produto; não gerar tudo numa única chamada. Cada etapa termina com app rodando e uma checagem observável.

### Etapa 0 — inventário e decisão rápida de stack
Inspecionar repositório real, tecnologias já instaladas, assets, env, serviços disponíveis. Não apagar trabalho útil nem criar outro projeto do zero sem necessidade. Escolher caminho de menor risco e registrar. Fazer commit/estado-base. Caso nenhuma API/backend esteja pronto, preferir o que permita persistência e RBAC verificável.

### Etapa 1 — fundação vertical
Tema, layout, rotas, auth real de dois perfis, banco/seed e policies/endpoints. Testar acesso negado cruzado. **Critério:** cliente e lojista entram, vêem telas diferentes, consulta pública funciona.

### Etapa 2 — fluxo reserva completo
Vitrine e filtros → detalhe/comparativo → carrinho → reserva multiloja → painel lojista → confirmar/recusar → cliente recebe status. **Esta etapa é o coração do projeto; não avançar antes de demonstrar ponta a ponta.**

### Etapa 3 — busca inteligente e robustez
Busca estruturada, transcrição editável se voz suportada, favoritos, validações, contagem de 2h, expiração, cancelamento em duas etapas e erros. Testes de estados e autorização.

### Etapa 4 — recursos Scizor P1
Recomendações, promoções/notificações, cupons, insights agregados explicáveis. Cada recurso só entra se for executável com dados coerentes; UI sem regra real não conta como entregue.

### Etapa 5 — acabamento e entrega
Ajustar visual segundo screenshots, responsividade, acessibilidade básica, testagem, README, evidências reais, declaração de IA, vídeo e submissão. Congelar novas features antes do prazo para garantir artefatos obrigatórios.

### Microciclo de implementação para Claude Code
1. **Ler escopo e estado do código** antes de alterar.
2. Declarar arquivos afetados e critérios de aceite da tarefa.
3. Implementar no máximo uma fatia vertical pequena por vez, sem inventar contratos nem schemas.
4. Rodar lint/typecheck/test/build apropriados; se falhar, corrigir ou registrar com transparência.
5. Informar o que foi implementado, o que é mock, o que ainda não funciona, comandos executados e resultado real.
6. Criar commit pequeno com mensagem clara quando solicitado/autorizado pela equipe.

### Prompt de trabalho recomendado ao Claude Code
> Leia `Capim_Dourado_Connect_Escopo_Geral_V2.md` integralmente, inspecione o repositório e não escreva código antes de relatar brevemente seu estado atual, a stack recomendada, os contratos existentes e o menor próximo incremento P0 que possa ser testado. Não substitua funcionalidade real por tela decorativa. Use Scizor como fonte funcional prioritária, dentro do regulamento; escolha a implementação mais simples e segura, sem overengineering. Preserve a estética dos 3 screenshots. Entregue um fluxo vertical cliente→reserva→lojista→confirmação→cliente. Diferencie demonstrativo, simulação e integração real. Não alegue testes não executados. Ao concluir cada incremento, relate alterações, comandos e pendências objetivas.

---

## 14. TESTES E EVIDÊNCIAS — MÍNIMO ACEITÁVEL

### Testes automatizados indispensáveis
- Usuário não autenticado não reserva.
- Cliente não confirma reserva e não lê dados de outro cliente.
- Lojista da loja A não acessa/atualiza reserva ou oferta da loja B.
- Grupo multiloja cria reservas independentes com itens corretos.
- Confirmar reserva expirada ou rejeitada falha corretamente.
- Duplo clique não duplica reserva (ou documentar limitação se não implementado).
- Cancelar reserva altera estado; usuário errado não cancela.
- Indisponibilidade de oferta se reflete no catálogo e nas pendentes conforme política.
- Busca por IA/parser não retorna itens inexistentes e trata campos inválidos.
- Favoritos pertencem apenas a seu cliente.

### Evidências reais (capturar antes da entrega)
- Screenshot/video da landing QR.
- Fluxo de busca/comparativo.
- Reserva multiloja e painel de cada lojista.
- Resultado depois da confirmação/rejeição.
- Saída de testes automatizados realmente executados e correção de pelo menos um bug (se houver).
- Registro curto de decisões técnicas, ferramentas de IA e origem de imagens/dados.

**Não inventar resultados de teste, screenshots ou commits.** Documentar limitações reais.

---

## 15. CHECKLIST DE ENTREGA PELO REGULAMENTO

### Requisitos obrigatórios (confirmados no documento oficial)
- [ ] Link do repositório Git com código versionado.
- [ ] Instruções de execução reproduzíveis em `README.md`.
- [ ] Documentação da solução e decisões.
- [ ] Evidências das missões 1, 2 e 3, conforme orientações oficiais.
- [ ] Evidências de testes e correções (Missão 2).
- [ ] Vídeo de pitch **entre 1min15s e 2min** mostrando problema, solução, funcionalidades e diferencial.
- [ ] Declaração de uso relevante de IA (ferramentas + finalidades).
- [ ] Fontes/licenças de bibliotecas, assets e bases externas.
- [ ] Submissão **até 13h de 14/11/2026** pelo canal oficial.

### Critérios e pesos
- **30%:** funcionalidade e atendimento a requisitos.
- **20%:** qualidade técnica, testes e correção de falhas.
- **20%:** inovação e aplicação crítica de IA.
- **20%:** missões e qualidade das evidências.
- **10%:** pitch presencial das finalistas. Seleção das finalistas considera os 90% iniciais e verificação do pitch em vídeo obrigatório.

**Nota:** cumprir regras, missões e evidências vale mais do que recursos extras. O regulamento veda apresentar recursos gerados por IA sem comprovação, falsificar testes, usar marcas/dados sem autorização e inserir dados sensíveis em IA sem base adequada.

---

## 16. CANVAS SIMPLIFICADO — CONTINUIDADE DA MISSÃO 1

| Campo | Conteúdo |
|---|---|
| Segmentos | Consumidores e lojistas do shopping; administração como parceira potencial. |
| Proposta de valor | Encontrar, comparar e reservar produtos antes da visita; transformar interesse digital em fluxo presencial. |
| Canais | Módulo do app já existente (visão-alvo) e landing de QR/links para acesso e divulgação. |
| Relacionamento | Recomendações e alertas relevantes; confirmação direta pelo lojista. |
| Atividades-chave | Catálogo, reserva, confirmação de disponibilidade, busca inteligente e comunicação de status. |
| Recursos-chave | Catálogo de lojas, backend seguro, autenticação, dados de ofertas, experiência mobile. |
| Parceiros-chave | Administração do shopping, lojas participantes, responsáveis pelos sistemas atuais. |
| Custos principais | Desenvolvimento, hospedagem, manutenção, integração futura de catálogos, conformidade LGPD. |
| Métricas sugeridas | Buscas úteis, produtos favoritados, solicitações/confirmadas, taxa de comparecimento (futura), tempo de resposta lojista. |
| Sustentabilidade hipotética | Maior conversão em lojas físicas e engajamento no app; monetização comercial futura a validar com shopping. |

---

## 17. RISCOS E PLANO DE CONTINGÊNCIA

| Risco | Impacto | Mitigação |
|---|---|---|
| Tempo insuficiente | Não entregar funcionalidade/evidências | Congelar features em P0 e entregar fluxo vertical + documentação. |
| Stack/backend não configurado | Login ou persistência quebrada | Spike inicial; fallback definido; evitar migração tardia. |
| IA inventa produtos | Falha de credibilidade | Retorno estruturado validado e consulta só ao catálogo; parser determinístico de fallback. |
| Dados “em tempo real” falsos | Avaliação negativa/ética | Explicitar seed e disponibilidade sob confirmação. |
| Vazamento de dados entre lojas | Falha crítica | RBAC no backend/RLS e teste negativo obrigatório. |
| Expiração em relógio do navegador | Reserva inconsistente | Timestamp do servidor e verificação em toda mutação. |
| Uso não autorizado de marca/assets | Risco regulatório | Solicitar autorização ou usar identidade demonstrativa própria. |
| Escopo disperso | Produto inacabado | Proibição de P2 antes da conclusão e testes de P0. |
| Vídeo/evidências não prontos | Perda de pontos/desclassificação | Reservar etapa final para capturas, README, pitch e submissão. |

---

## 18. PONTOS A VALIDAR SEM BLOQUEAR O MVP

Estas questões ficam registradas; o MVP usa os padrões propostos acima até decisão explícita:
1. **Tecnologia do aplicativo oficial:** não conhecida; a demo é módulo conceitual web, não integração efetiva. Depois será necessário confirmar stack/SDK/API oficial.
2. **Autorização de marca e dados:** não demonstrada. Trabalhar com dados/lojas fictícios e assets licenciados.
3. **Confirmação de estoque:** padrão MVP é confirmação manual, sem garantia automática de retenção física.
4. **Regra do cupom:** percentuais, valores e condições comerciais não fornecidos. Criar apenas cupons ilustrativos e documentar regras.
5. **Interesses individuais ao lojista:** não compartilhar por padrão; usar agregados e dados da reserva até haver base/consentimento.
6. **Busca por voz:** recurso do browser varia por navegador/idioma; nunca bloquear busca textual.
7. **Previsão de demanda:** usar regra estatística explicável com dados fictícios; se houver tempo/dados, evolução para modelo preditivo validado.
8. **Easter egg aranha:** evitar conflito com CTA de navegação; inserir contador em controle secundário ou ação opcional documentada.
9. **Reserva de 2h:** começa na criação; caso cada loja confirme depois, não reiniciar prazo sem regra explícita.
10. **Notificações:** in-app primeiro; push real requer autorização do sistema/navegador e infraestrutura adicional.

---

## 19. DEFINIÇÃO DE PRONTO (DoD) DO PRODUTO

O MVP está **entregável** quando a equipe consegue, em um ambiente reproduzível, entrar com conta cliente, localizar um produto real no catálogo de demonstração, comparar ofertas, reservar itens em duas lojas, entrar como lojista de uma loja e confirmar/rejeitar, voltar ao cliente e verificar os estados e o cronômetro corretos, sem atravessar permissões, com testes relevantes rodados, aparência fiel ao conceito visual e README/evidências/pitch prontos.

**Não é necessário ter todas as funcionalidades listadas em Scizor para demonstrar um bom MVP.** É necessário ser transparente sobre o que foi implementado e justificar o backlog, preservando coerência com a proposta, regras e objetivos da competição.

---

## FONTES PRIMÁRIAS (arquivos fornecidos pela equipe)
1. `Scizor (1).md` — requisitos de cliente, lojista, negócios e easter eggs; **prioridade funcional**.
2. `Planejamento Técnico_inicial (1).md` — Entrega 1; ideia original, fluxo físico e tecnologia sorteada Landing Page.
3. `regulamento-hackarun-2026 (1).md` — regras obrigatórias, prazos, uso de IA, entregas, pontuação e integridade.
4. `Capim Dourado Connect • Mobile.png`, `Vitrine digital • Mobile.png`, `Filtros • Mobile.png` — referência estética, não evidência de funcionamento.

**Atualização após implementação:** registrar em `DECISOES.md` cada desvio relevante e em `TESTES_E_EVIDENCIAS.md` o comportamento efetivamente verificado.
