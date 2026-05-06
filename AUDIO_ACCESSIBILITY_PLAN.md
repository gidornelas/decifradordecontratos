# Plano de Possibilidade: Leitura em Audio das Clausulas Simplificadas

## Objetivo

Avaliar uma forma gratuita de adicionar leitura em audio para a explicacao simplificada das clausulas no dashboard, melhorando acessibilidade para pessoas com baixa visao, fadiga de leitura ou preferencia por consumo auditivo.

Este documento nao implementa a feature. Ele apenas organiza a viabilidade tecnica e um plano recomendado.

## Conclusao Rapida

Sim, existe uma forma de incrementar isso sem custo adicional recorrente no projeto.

A opcao mais viavel e usar a API nativa do navegador:

- `SpeechSynthesis` / Web Speech API

Essa abordagem:

- nao exige servidor novo
- nao exige provedor pago de TTS
- nao exige armazenamento de audio
- funciona direto no navegador do usuario
- reaproveita o texto simplificado que ja existe no dashboard

## Onde a feature se encaixa hoje

O ponto mais natural para esse recurso e a aba `Revisao guiada`, dentro das clausulas expandidas.

Hoje a UI ja exibe:

- `Texto original`
- `Explicacao simplificada`
- `Por que isso importa`

Os pontos mais aderentes para um botao de audio sao:

1. Ler apenas a `Explicacao simplificada`
2. Ler `Explicacao simplificada` + `Por que isso importa`
3. Oferecer um comando maior: `Ler esta clausula`

Recomendacao inicial:

- Comecar com `Ouvir explicacao`

Isso reduz complexidade, mantem o foco na parte mais acessivel do conteudo e evita que a leitura fique longa demais.

## Opcao Gratuita Recomendada

### Opcao A: Web Speech API no navegador

Implementacao conceitual:

- adicionar um botao de audio em cada clausula expandida
- ao clicar, usar `window.speechSynthesis`
- montar um texto curto com:
  - titulo da clausula
  - explicacao simplificada
  - opcionalmente o bloco `por que isso importa`
- permitir:
  - reproduzir
  - pausar
  - parar
  - trocar entre `ouvir` e `parar`

### Vantagens

- custo zero de infraestrutura
- sem impacto no banco
- sem chamadas para API externa
- mais rapido de entregar
- funciona bem como primeira versao

### Limites reais

- qualidade da voz depende do navegador e do sistema operacional
- algumas vozes em portugues variam bastante entre Chrome, Edge, Safari e Android
- nao ha garantia de timbre padronizado entre usuarios
- em alguns navegadores a lista de vozes demora a carregar
- comportamento historicamente menos consistente no Firefox

## Outras alternativas gratuitas

### Opcao B: Apoiar leitores de tela, sem TTS proprio

Consiste em:

- melhorar semantica e foco da interface
- adicionar `aria-label`, `aria-live` e boa navegacao por teclado
- deixar o conteudo amigavel para NVDA, VoiceOver e TalkBack

Vantagem:

- tambem e importante para acessibilidade real

Limite:

- nao resolve o pedido de "clicar num botao e ouvir"

Recomendacao:

- fazer isso junto da Opcao A, nao como substituto

### Opcao C: Gerar audio no backend

Seria o caminho com melhor padronizacao de voz, mas foge da exigencia de custo zero.

Desvantagens:

- normalmente exige API paga ou servico externo
- aumenta custo por uso
- exige storage ou streaming
- adiciona manutencao backend

Recomendacao:

- nao seguir agora

## Recomendacao de Produto

### Fase 1: MVP gratuito

Adicionar audio apenas na `Revisao guiada`, por clausula.

Escopo sugerido:

- botao `Ouvir explicacao`
- usa somente Web Speech API
- le o texto simplificado
- se ja estiver tocando, o botao vira `Parar`
- apenas uma clausula pode tocar por vez

### Fase 2: Refinamento de acessibilidade

- adicionar preferencia de velocidade de leitura
- permitir escolher voz quando houver mais de uma em portugues
- acrescentar leitura opcional do bloco `Por que isso importa`
- melhorar `aria-labels`, foco e estados de botao

### Fase 3: Expansao opcional

Se a experiencia for boa:

- levar o audio tambem para cards de risco
- criar `Ouvir resumo da analise`
- criar `Ouvir recomendacoes`

## Plano Tecnico Sugerido

### 1. Camada de UI

Adicionar um botao pequeno ao lado da explicacao simplificada nas clausulas:

- label inicial: `Ouvir explicacao`
- estado tocando: `Parar audio`

Pontos provaveis:

- `createClauseMarkup` em `js/dashboard.js`
- estilos em `css/dashboard-v2.css`

### 2. Camada de comportamento

Criar um controlador unico de audio no front:

- manter referencia do `speechSynthesis`
- rastrear qual clausula esta tocando
- cancelar audio anterior ao iniciar outro
- reagir a:
  - `start`
  - `end`
  - `error`

### 3. Texto lido

Montar um payload curto para fala, por exemplo:

`Clausula 4.2. Explicacao simplificada: Se voce cancelar o contrato por qualquer motivo, pagara tres meses de aluguel como multa.`

Recomendacao:

- evitar ler o texto juridico original no MVP
- priorizar linguagem simples

### 4. Compatibilidade

Antes de habilitar o botao:

- verificar se `window.speechSynthesis` existe

Se nao existir:

- esconder o botao
ou
- mostrar estado desabilitado com tooltip curta

### 5. Acessibilidade

O botao precisa ter:

- `type="button"`
- `aria-label` claro
- estado textual visivel
- feedback para leitor de tela quando a reproducao iniciar/parar

## Riscos e Cuidados

### Risco 1: voz ruim ou inconsistente

Mitigacao:

- assumir isso explicitamente como limitacao do MVP gratuito
- testar pelo menos em Chrome e Edge

### Risco 2: leitura longa e cansativa

Mitigacao:

- ler primeiro so a explicacao simplificada
- deixar `Por que isso importa` como expansao futura

### Risco 3: multiplos audios ao mesmo tempo

Mitigacao:

- implementar um unico player logico global
- ao iniciar um novo, cancelar o anterior

### Risco 4: usuarios confundirem com arquivo de audio gravado

Mitigacao:

- usar copy clara:
  - `Ouvir explicacao`
  - `Parar audio`
- evitar icones que sugiram download

## Custo

### Custo de implementacao

- baixo

### Custo recorrente

- zero, se ficar apenas no Web Speech API

### Impacto de infraestrutura

- nenhum relevante

## Recomendacao Final

Vale a pena seguir.

O melhor caminho sem custo adicional e:

1. usar Web Speech API no frontend
2. aplicar primeiro na `Revisao guiada`
3. ler apenas a `Explicacao simplificada`
4. tratar isso como MVP de acessibilidade

## Proximo passo recomendado

Se quiser seguir depois deste plano, a proxima entrega deveria ser:

- um prototipo pequeno em `dashboard.html` com botao `Ouvir explicacao` dentro de cada clausula
- controle unico de reproducao
- fallback silencioso quando o navegador nao suportar TTS
