# Decisões de implementação

## Escopo

A versão 2 do escopo consolidado prevalece sobre o planejamento inicial. O núcleo é descoberta, favoritos e reserva multiloja com atendimento do lojista. WhatsApp, mapa, provador, fidelidade e pagamentos não foram apresentados como entregues.

## Stack

O projeto utiliza TanStack Start, React e TypeScript por ser a arquitetura já configurada. A persistência e autenticação usam Lovable Cloud. As operações compostas de reserva e decisão do lojista são funções PostgreSQL transacionais chamadas por server functions autenticadas. O frontend não é tratado como barreira de segurança.

## Perfis e demonstração

O cadastro público cria somente clientes. Papéis ficam em `user_roles`, separados do perfil. Lojistas são vinculados por `merchant_memberships`. As três contas seed usam e-mails reservados `.test`, senha fictícia documentada e dados exclusivamente demonstrativos.

## Reservas

Uma operação cria um grupo e uma reserva por loja. A regra original calcula `expires_at = now() + 2 horas`; por decisão explícita de demonstração em 14/11/2026, apenas as novas reservas deste mockup usam `now() + 20 segundos` no servidor para permitir observar a expiração e o gato sem esperar duas horas. O preço é copiado para snapshot. Uma chave de idempotência evita duplicação por repetição de envio. A expiração continua derivada pela data e verificada em cada mutação, sem depender do timer do navegador; para produção, restaura-se o prazo de 2 horas.

## Estoque

O modo implementado é `MANUAL_CONFIRMATION`. Não há dedução ou promessa de estoque físico. Ao marcar uma oferta indisponível, pendências com a oferta são recusadas com motivo `UNAVAILABLE`; reservas confirmadas permanecem inalteradas.

## Busca e recomendações

A busca por linguagem natural é um parser determinístico local com categorias, cores, marcas, lojas e limites de preço conhecidos. Não usa modelo externo e nunca gera produtos. A transcrição por voz só ocorre quando o navegador oferece Web Speech API e precisa ser confirmada pelo usuário. Recomendações usam pontuação por categoria, marca e promoção.

## Easter eggs

A aranha usa o botão secundário de ajuda após 13 cliques, evitando 13 navegações no CTA principal. O gato aparece uma vez quando uma reserva antes ativa zera durante a sessão; reservas antigas já expiradas não disparam o easter egg ao abrir a página. Ambos respeitam `prefers-reduced-motion` e não bloqueiam controles.

## Imagens e marca

As oito fotografias de produto foram geradas especificamente para o protótipo, sem logotipos. A identidade é textual e baseada nas cores aproximadas propostas no escopo; não pressupõe autorização de marca oficial.

## Incremento solicitado — 14/11/2026

Estas decisões atualizam os tópicos anteriores sem apagar sua rastreabilidade. Os documentos originais permanecem intocados. Hierarquia adotada conforme solicitação: regulamento → Scizor → planejamento inicial complementar → V2 compatível → imagens.

| Mudança | Implementação e justificativa |
|---|---|
| Busca antes apenas local | Gemini 3.1 Flash Lite real, via gateway gerenciado, extração validada. Solicitado para inovação verificável; reduz risco de chave exposta e mantém chamadas server-side. |
| Recomendações antes só por favoritos | Ranking incorpora reservas com peso maior; análise Gemini explícita interpreta sinais mínimos. Sem treinamento ou probabilidades inventadas, conforme amostra pequena prevista em RF09. |
| Insights antes favoritos/reservas | Acrescenta pesquisas recentes por produto, comparação temporal e ações de oportunidade. Agregação por vínculo da sessão protege identidades e mantém o escopo de atendimento/descoberta. |
| Aranha antes em ajuda da landing | Transferida para o botão Buscar, no clique 13, conforme novo pedido. Mesmo texto reutiliza resultado para não causar 13 chamadas; efeito não bloqueia controles e respeita movimento reduzido. |
| Entrada/roteiro antes adiados | Extensão opcional implementada como roteiro fictício com entrada no link QR, reservas ativas e compartilhamento manual. Não equivale a mapa indoor, localização ou WhatsApp automático. |
| Gamificação antes pós-MVP | Missões demonstrativas com concessão única de cupom fictício de 10% por produto/loja. Preserva RF08; sem comprovação de visita, estacionamento real, pontos ou parceria. |
| Preparação de escala | Módulos por domínio, contratos puros, índices e eventos minimizados. Nenhuma fila, microserviço, treinamento ou infraestrutura prematura. |

A chave de terceiro colada no chat não foi armazenada nem usada. Recomenda-se sua revogação. Lovable AI exige créditos; autenticação/catalogação/filtros manuais não dependem da disponibilidade do Gemini. O guia de manutenção foi o primeiro arquivo criado neste incremento.

## Ajustes de experiência, dados e hospedagem — 14/11/2026

| Mudança | Implementação e justificativa |
|---|---|
| Conta | O nome no cabeçalho deixou de ser um segundo link para Conta. “Sair da conta” passou para o topo da própria página, visível sem abrir Preferências. |
| Notificação de disponibilidade | Uma função transacional cria notificações internas idempotentes após atraso aleatório de 5 a 20 segundos no navegador. O título e o conteúdo dizem “simulação”; o status da reserva não muda e a decisão real continua exclusiva do lojista. Se a aba for fechada antes do atraso, o agendamento local não é executado; não é push nem fila persistente. |
| Mapa | A galeria continua fictícia, mas agora mostra entrada atual, praça central, corredores, traçado e paradas numeradas. Não passa a ser orientação física oficial. |
| CapimAI | CapimAI é o nome do produto na interface. Gemini 3.1 Flash Lite permanece o modelo técnico, sem troca de endpoint ou credencial. Recomendações aparecem como cartões de produtos; a justificativa textual fica recolhida. |
| Interações reais e LGPD | O radar agrega contas distintas, favoritos, solicitações e confirmações persistidas por loja. A CapimAI recebe somente essas contagens por ação explícita do lojista, sem nome, contato, user ID ou frase. Agregação reduz exposição, mas não elimina a necessidade de finalidade, base legal, retenção e revisão jurídica antes de produção. |
| Provadores | Ofertas da categoria Moda informam que a loja “te aguarda nos provadores”. É texto de experiência, não integração com provador inteligente. |

### Banco de dados e Vercel

**Lovable Cloud com PostgreSQL e autenticação gerenciada foi mantido.** A Vercel pode hospedar a aplicação e suas funções de servidor, mas não substitui o banco, a autenticação, as políticas RLS ou as transações necessárias para reservas multiloja e isolamento entre lojas. Trocar agora para outro banco exigiria recriar autenticação, RLS, funções transacionais e migração de dados sem benefício funcional demonstrado.

Na implantação Vercel, as variáveis públicas do Cloud e os segredos do servidor devem ser configurados no ambiente de hospedagem; segredos nunca entram no bundle do navegador. O adaptador/destino de deployment e os fluxos publicados precisam ser validados na Vercel antes de afirmar prontidão. Nenhuma migração de hospedagem foi executada neste ajuste.

### Integridade das fontes para o handoff

Nenhum documento original em `docs/scizor38/` foi alterado ou removido, neste ou nos incrementos anteriores: `README.md`, `Capim_Dourado_Connect_Escopo_Geral_V2.md`, `Planejamento Técnico_inicial.md` e `regulamento-hackarun-2026.md`. Foram alterados apenas documentos de manutenção criados neste projeto: `GUIA_DO_PROJETO.md`, `README.md` da raiz, `DECISOES.md`, `USO_DE_IA.md`, `TESTES_E_EVIDENCIAS.md` e `roadmap.md`. Nenhum requisito foi apagado das fontes.
