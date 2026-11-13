# 🚀 Capim Dourado Connect

**Repositório de Planejamento Técnico e Arquitetura para a Primeira Entrega do HakaRun 2026**

---

## 📄 1. Documentação Inicial do Projeto (Desafio 04)

### 📌 Contexto e Problemática Oficial

* **Desafio Selecionado:** 04. Integração da jornada de compra digital e física.

* **Contexto:** Os consumidores pesquisam produtos pela internet, comparam preços, consultam avaliações e posteriormente procuram experiências de compra presenciais.

* **Problemática:** A experiência de compra pode ficar fragmentada entre os ambientes digitais e físicos, dificultando a continuidade da jornada do consumidor e o relacionamento com o shopping e seus estabelecimentos comerciais.

* **Objetivo:** Melhorar a integração da experiência de compra entre os ambientes digitais, o Shopping Capim Dourado e seus lojistas.

### 💡 Descrição da Solução Proposta

O **Capim Dourado Connect** é um ecossistema Web (Landing Page e Web App) desenvolvido para unificar a jornada de compra sem a necessidade de instalação de aplicativos nativos pesados ou pagamentos online.

* **Vitrine Consultiva e Comparativo:** O cliente pesquisa produtos, verifica estoques em tempo real nas lojas do Shopping Capim Dourado e visualiza tabelas comparativas de preços e avaliações de outros compradores.

* **Reserva de Provador e Escolha da Entrada:** O consumidor seleciona itens de lojas diferentes (ex.: Renner e Marisa) para reserva no provador — com validade limitada (ex.: 2 horas) e geração de código individual por loja — e informa por qual porta pretende acessar o shopping.

* **Guia Passo a Passo no WhatsApp:** O sistema calcula a rota sequencial de caminhada e envia o itinerário e o mapa diretamente para o WhatsApp do cliente, evitando a necessidade de reabrir o site ao chegar ao estabelecimento.

* **Provador Inteligente:** Na cabine de teste, o cliente pode solicitar a troca de tamanho diretamente pelo navegador mobile, acionando o painel de atendimento do lojista sem precisar sair do provador.

* **Checkout e Fidelidade por Código Único:** O pagamento é feito presencialmente no caixa da loja e, para acumular pontos de fidelidade, o cliente apenas informa seu Código Único Alfanumérico de 7 dígitos (ex.: `839201A`), dispensando o uso de QR Codes durante a finalização.

* **Hub de Recompensas:** Os pontos acumulados são trocados por benefícios práticos no Shopping Capim Dourado, como descontos no estacionamento ou cupons de alimentação.

### 🛠️ Escopo do MVP

Em alinhamento com os critérios do evento de entregar uma versão básica e funcional que comprove a viabilidade da ideia:

* **No Escopo do MVP (Entrega Final):**

  * Interface da Landing Page responsiva e fluxo de onboarding.

  * Módulo de busca, comparativo de estoques e visualização de avaliações entre lojas parceiras.

  * Fluxo de reserva multiloja com seleção da entrada do shopping.

  * Simulação da geração e envio do Guia Passo a Passo sequencial para o WhatsApp.

  * Interface do Provador Inteligente com chamada de atendimento.

  * Painel do Perfil com geração do Código Único Alfanumérico (`839201A`) e saldo de pontos de fidelidade.

---

## 🎨 2. Proposta e Estrutura Inicial das Telas

O protótipo das telas e wireframes vai ser desenhado no Figma.

* **Tela 1 (Landing Page de Onboarding):** Apresentar a proposta de valor da plataforma e servir como porta de entrada rápida para o cliente iniciar sua jornada no shopping sem precisar baixar aplicativos.

* **Tela 2 (Vitrine Digital & Filtros):** Possui barra de busca, filtros por categoria (Moda, Calçados, etc.) e grade de produtos com marcadores de disponibilidade em lojas.

* **Tela 3 (Detalhes do Produto & Comparativo):** Exibe imagens, especificações técnicas, avaliações dos consumidores e tabela comparativa mostrando preços e estoques por tamanho em cada loja parceira do shopping.

* **Tela 4 (Modal de Reserva & Escolha da Entrada):** Lista os produtos reservados, gera os códigos de provador e faz identifica por qual porta o cliente vai entrar no shopping.

* **Tela 5 (Guia Passo a Passo Sequencial):** Orientar o deslocamento do cliente dentro do shopping por meio de um roteiro sequencial integrado ao WhatsApp.

* **Tela 6 (Provador Inteligente):** Agilizar o atendimento presencial, permitindo que o cliente solicite trocas de tamanho diretamente de dentro da cabine.

* **Tela 7 (Perfil & Código Único de Fidelidade):** Centralizar o código único de identificação do cliente para acúmulo de pontos no caixa e resgate de benefícios.

* **Telas do Lojista (Painel de Gestão):** Permitir que a equipe da loja visualize as reservas feitas, valide os códigos de provador na chegada do cliente e receba alertas de solicitação de troca de tamanho vindos das cabines.
---

## 💻 3. Linguagem de Programação Escolhida

Em alinhamento com a tecnologia de Landing Page selecionada na roleta tecnológica, o projeto é estruturado como um Web App de execução direta em navegadores mobile:

* **JavaScript (ES6+) / TypeScript:** Linguagem principal adotada para a lógica de programação do frontend, manipulação de estado, buscas em tempo real e integração com serviços de API.

* **HTML5 & CSS3:** Linguagens para marcação semântica e estilização responsiva focada em dispositivos móveis (Mobile-First).

* **Node.js (JavaScript/TypeScript):** Ambiente de execução backend utilizado para a criação das rotas de API de simulação de estoque, provador e pontuação.

---

## 🏗️ 4. Arquitetura Proposta

A arquitetura segue a premissa de que a excelência da estruturação precede a execução, organizando os fluxos de dados de ponta a ponta:

```
[ Cliente: QR Code / Anúncio ]
      |
      ▼
[ 1. Frontend Web (Landing Page) ] ──▶ (HTML5 / CSS3 / JavaScript / TypeScript)
      |
      ├─▶ [ Consulta de Estoques & Avaliações Multiloja ]
      ├─▶ [ Seleção de Peças & Definição da Entrada do Shopping ]
      |
      ▼
[ 2. Backend / API Node.js ]
      |
      ├─▶ [ Roteamento Sequencial ] ──▶ (API WhatsApp ➔ Celular do Cliente)
      ├─▶ [ Alerta no Provador ] ──▶ (Painel de Atendimento do Lojista)
      |
      ▼
[ 3. Caixa da Loja Física ]
      |
      └─▶ [ Digitação do Código Alfanumérico (ex.: 839201A) ]
            |
            ▼
      [ 4. Registro de Pontos e Fidelidade ]
```

* **Frontend Web (Mobile First):** Camada de interface acessada via navegador ao escanear os QR Codes presenciais ou clicar nos anúncios digitais.

* **Backend Node.js & APIs:** Camada de serviços que processa consultas de estoque, controla o status do provador inteligente e calcula as rotas de navegação.

* **Módulo de Mensageria (WhatsApp):** Integração via API de link para envio do texto do roteiro e imagem da planta baixa.

* **Módulo de Fidelidade:** Validação do código de 7 dígitos (`839201A`) para acúmulo de pontos no caixa da loja sem interromper operações.

---

## 🛠️ 5. Plataforma e Tecnologias Adotadas

As ferramentas e plataformas selecionadas para governança e desenvolvimento do projeto abrangem:

* **Versionamento e Governança:** Repositório público no **GitHub** utilizando a metodologia de fluxo de ramificação **GitFlow** (`main`, `develop`, `feature/*`).

* **Prototipação e UI Design:** **Figma** para a elaboração das telas e mapeamento do fluxo de navegação.

* **Desenvolvimento Frontend:** **HTML5, CSS3 e JavaScript/TypeScript** para execução leve no navegador mobile.

* **Desenvolvimento Backend:** **Node.js** com **Express** para gerenciamento dos endpoints da aplicação.

* **Integração de Comunicação:** API de link nativo do **WhatsApp** para envio de roteiros.

---

## 🎲 6. Descrição de Como a Tecnologia Sorteada (Landing Page) Foi Incorporada à Solução

A **Landing Page** foi incorporada como o portal oficial de atração, onboarding e conversão do ecossistema Capim Dourado Connect.

Ela atua como a porta de entrada principal para o consumidor que escaneia QR Codes de campanha nos corredores do shopping ou clica em anúncios digitais. Em vez de criar atritos exigindo o download de aplicativos pesados nas lojas virtuais, a Landing Page apresenta a proposta de valor do programa, oferece acesso instantâneo ao catálogo consultivo e comparativo de estoques das lojas do Shopping Capim Dourado, coleta a porta de entrada do cliente e gera o seu Guia de Visita enviado diretamente ao WhatsApp.

Dessa forma, a Landing Page cumpre um papel estratégico e indispensável na jornada, conectando o ambiente online ao fluxo físico com zero fricção de uso.