# Declaração de uso de IA

## Ferramentas e finalidades

- **Lovable / agente de programação:** leitura e organização dos requisitos, implementação da interface, server functions, regras de dados, testes e documentação a partir dos documentos fornecidos pela equipe.
- **Geração de imagens do Lovable:** criação de oito fotografias fictícias de produtos, sem marcas ou logotipos, para compor o catálogo demonstrativo.

## Uso responsável

As verificações utilizaram contas fictícias. **CapimAI** é o nome apresentado na interface; a integração técnica continua usando Gemini 3.1 Flash Lite via Lovable AI Gateway, com Vercel AI SDK: busca em linguagem natural, análise opcional de interesses e oportunidades agregadas da loja. O modelo foi confirmado no catálogo autenticado e chamadas bem-sucedidas foram verificadas no navegador e nos registros do gateway.

A busca envia a frase confirmada e metadados do catálogo; o cliente autoriza explicitamente e pode revogar. Não envie dados pessoais na frase. Recomendações enviam categorias, contagens e candidatos, não nome/e-mail/IDs de conta; os resultados são apresentados como cartões de produtos. Lojistas enviam somente contagens agregadas reais da própria loja por ação explícita: pesquisas, clientes distintos, favoritos, solicitações e confirmações. Nenhuma identidade, frase ou áudio de cliente é enviada ao modelo nessas análises; voz depende do navegador.

Gemini retorna JSON, validado por Zod e listas permitidas. Nunca cria produtos ou estoque. Ranking e tendência são regras de conteúdo/estatística, não modelos treinados; análise generativa não equivale a probabilidade de compra. Eventos persistidos não incluem frase ou áudio. Chamadas consomem créditos Lovable AI; não há retries automáticos, fan-out por produto ou execução por render. Negação do provedor persiste bloqueio.

Workflow aplicado: AI SDK gateway, com streaming consumido no servidor e recuperação validada de saída. A chave colada no chat não foi armazenada nem usada; recomenda-se revogá-la. Não foram inventados testes, integrações oficiais ou benefícios comerciais. A equipe deve revisar segurança, finalidade/base legal e retenção antes de produção.
