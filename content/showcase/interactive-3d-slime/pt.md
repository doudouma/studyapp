---
summary: Um tutorial de Codex + GPT-6 para criar um slime de gel translúcido e apertável com WebGPU em Three.js, com o conjunto completo de prompts incluído.
tags: [Three.js, WebGPU, Tutorial, Gerado por IA, Interativo]
---

## O que é

Este é um tutorial capítulo por capítulo que mostra como construir um slime de gel 3D apertável como um brinquedo real de navegador usando Codex + GPT-6, Three.js e WebGPU nativo. É uma cena 3D de verdade — malhas, iluminação, materiais físicos e câmera — e não uma imagem colada num canvas: os dois olhos pretos e a boquinha ficam ancorados na face frontal da mesma malha e se deformam junto com o corpo quando você pressiona, arrasta para cima e solta.

A página final combina um palco branco quente com um painel de controle que oferece cinco esquemas de cor, rigidez, amortecimento, escala (65%–115%) e um botão "Poke". No final há um conjunto completo de prompts, um bloco por capítulo.

## Proposta de valor central

O atrativo do tutorial é que o apertar é real: um modelo leve de molas impulsiona uma única malha contínua, então o rosto e os reflexos se movem com a superfície em vez de deslizar por cima dela.

- **Uma malha de gel contínua**: um primitivo de cúpula é fundido a vários elipsoides inferiores via Marching Cubes, gerando uma base macia e espalhada com volume e curvatura reais.
- **Traços faciais que acompanham**: olhos e boca são projetados da face frontal e compartilham exatamente a mesma passagem `deform()` e as mesmas atualizações de normais do corpo.
- **Translucidez só com WebGPU**: `MeshPhysicalNodeMaterial` com nós TSL combinam tinta de absorção, espessura, baixa rugosidade e reflexos de estúdio, além de 640 microbolhas instanciadas para dar profundidade interna.
- **Prompts reutilizáveis**: cinco prompts de capítulo — objetivo e mockup, página e entrada de render, malha e translucidez, interação e física, empacotamento — que podem ser entregues ao Codex um de cada vez.

## O que pode substituir

| Abordagem alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Clipes de produto 3D pré-renderizados | Alta | Substitui os loops mp4 pré-gravados das imagens principais por um canvas em tempo real que responde ao ponteiro. |
| Colar uma imagem de mascote 2D no canvas | Alta | Substitui o atalho do falso 3D por uma malha cujo rosto e reflexos especulares se deformam juntos sob pressão. |
| Protótipos com engine de jogo (Unity/Godot) | Parcial | Cobre um brinquedo interativo de objeto único no navegador sem engine nem build; não substitui um jogo completo. |
| Sandboxes de física (matter.js/rapier) | Moderada | Resolve de forma barata um corpo mole estilizado de molas e gravidade; não é simulação precisa de corpos rígidos ou tecidos. |
| Marketplaces de ativos 3D de estoque | Baixa | O slime é totalmente procedural e não compra modelos, mas personagens sob medida ainda exigem ferramentas de modelagem. |

## Realidades e limitações atuais

- **WebGPU é requisito obrigatório**: não há fallback para WebGL e a degradação automática do Three.js é desativada de propósito, então navegadores sem suporte veem um erro e os controles ficam desabilitados.
- **Versão fixada**: o build fixa Three.js 0.180.0 / r180 e usa propriedades internas (`_getFallback`, `backend.isWebGPUBackend`), então subir de versão pode quebrar a checagem de backend.
- **Voltado para desktop**: os benchmarks foram feitos num M4 Pro com canvas de 990×720; dispositivos móveis e GPUs de entrada não são avaliados.

## Veredito

> **Recomendação principal**
>
> Um bom modelo para desenvolvedores que querem um brinquedo 3D que se deforma de verdade no navegador — e uma referência limpa para fixar WebGPU nativo em vez de cair silenciosamente para WebGL.

## Ciclo de vida do desenvolvimento e loop de iteração

O build segue o mesmo loop ensinado no artigo: escolher um mockup de referência, entregar ao Codex um capítulo por vez, comparar o resultado com o mockup e iterar. A forma vem antes do material — a malha e seus traços faciais são definidos primeiro, depois o sombreamento de transmissão e as bolhas.

| Etapa | Modelo usado |
| --- | --- |
| Mockup conceitual e base visual | Geração de imagem do GPT-6 |
| Layout e inicialização do WebGPU nativo | Codex · GPT-6 |
| Malha, traços ajustados e translucidez | Codex · GPT-6 |
| Interação e ajuste da física | Codex · GPT-6 |
| Reprodução e empacotamento | Codex · GPT-6 |

## Métricas e monetização

Os benchmarks da v0.8 foram registrados num M4 Pro / 48 GB, Headless Chrome 152 / Metal 3, viewport de 1440×1000, canvas de 990×720, DPR 1: 59,40 FPS ocioso por 10,02 s, 59,26 FPS em interação contínua por 13,50 s e P95 de tempo de quadro de 16,8 ms.

Não há monetização: o tutorial é distribuído gratuitamente, com o conjunto completo de prompts incluído para reuso.

## Debates centrais e reprodutibilidade

A postura deliberadamente inegociável é usar apenas WebGPU. O `WebGPURenderer` padrão do Three.js pode cair silenciosamente para WebGL 2, então o tutorial confere o nome da classe e afirma `renderer.backend.isWebGPUBackend`; se um dispositivo não estiver disponível, ele mostra uma explicação em vez de degradar. É um trade-off claro: renderização nativa real e código de shader mais limpo em troca de um alcance menor de dispositivos.

A reprodutibilidade é o ponto do formato: os cinco prompts estão em ordem para que o build possa ser repetido capítulo a capítulo, e o mockup de referência dá a cada etapa um alvo visual fixo para comparar.

## O conjunto completo de prompts

Entregue estes prompts ao Codex em ordem, um capítulo por vez. O mockup do Prompt 01 é a referência de calibração para todos os capítulos seguintes.

### Prompt 01 · Objetivo e mockup visual

```text
Crie no projeto atual uma página web interativa com um slime 3D usando Three.js e WebGPU nativo. Fallbacks para WebGL ou downgrades automáticos são estritamente proibidos.

Primeiro, gere uma imagem de mockup conceitual de página inteira, salvando tanto a imagem quanto o prompt de geração, e aguarde minha confirmação antes de implementar. (Se não houver ferramenta de imagem disponível, use a imagem de referência fornecida.)
O layout da página exige um fundo branco quente e limpo, um título chinês em negrito "捏捏，放轻松。" ("Aperte, relaxe.") e o subtítulo "一团软乎乎，接住你的无聊。" ("Um companheiro macio para o seu tédio.").
À esquerda: um slime de gel verde-menta semitransparente com cúpula, base carnuda e espalhada, bolhas internas finas, faixas de luz de estúdio e sombras de contato sutis. Dois olhinhos pretos e uma boca se ajustam firmemente à face frontal.
À direita: um painel de controle arredondado com opções de cor, rigidez, amortecimento, escala e um botão "Poke". Bastante espaço negativo, sem poluição.

O personagem final deve suportar apertar localizado, arrastar para cima, rebote elástico ao soltar e pouso suave no chão, com os traços faciais se deformando sem emendas junto com a superfície. Meta de 60 FPS e verificação em hardware real ao concluir.
```

### Prompt 02 · Página e entrada de render

```text
Crie uma página web executável com base no mockup escolhido. Use fundo branco quente #F8F6F3, tipografia em negrito, um palco de canvas 3D à esquerda e um painel de controle à direita (reposicionado abaixo em mobile/telas estreitas).
Organize o projeto de forma limpa em arquivos separados: layout da página, geração de malha, física de corpo mole e inicialização do WebGPU. Mantenha o design de referência sem falsificar o 3D colando a imagem no canvas.

Fixe e empacote localmente o Three.js 0.180.0 / r180. Solicite um dispositivo WebGPU nativo, desative os mecanismos de fallback automático para WebGL desta versão e verifique o backend ativo após inicializar o renderizador.
Se usar propriedades internas, documente explicitamente as restrições de versão.
Mostre uma explicação ao usuário, desabilite os controles e pare os loops de execução se o WebGPU não estiver disponível, falhar na inicialização ou perder o contexto.

Suba um servidor local, forneça a URL local e confirme em um navegador real que a cena carrega limpa, sem criar um contexto WebGL.
```

### Prompt 03 · Malha, traços faciais e translucidez

```text
Construa uma malha de gel 3D suave e contínua seguindo a referência alvo, garantindo uma cúpula arredondada, uma base macia e carnuda e profundidade de volume adequada. Não a substitua por uma esfera rígida padrão.
Gere olhos e boca ancorados nas coordenadas da face frontal, compartilhando exatamente a mesma lógica de deformação e as mesmas atualizações de normais do corpo, para manter reflexos contínuos e suaves em todo o rosto.

Implemente materiais de transmissão física compatíveis com WebGPU, combinando tinta de absorção, mapas de espessura, baixa rugosidade e reflexos de ambiente suaves para obter um gel turquesa luminoso. Controle o custo usando malhas instanciadas para as microbolhas internas.
Mantenha a base mais clara e leve usando coordenadas de repouso locais, para que as regiões permaneçam estáveis durante o estiramento e o arraste.

Fixe câmera, viewport, cor base e escala, capture uma captura de tela real do navegador, compare contornos, volume e translucidez com a referência e refine os detalhes sutis.
```

### Prompt 04 · Interação e ajuste da física

```text
Implemente compressão localizada, arraste, rebote elástico e colisão sutil com o chão. Garanta que corpo, traços faciais e reflexos especulares compartilhem o mesmo pipeline de deformação, atualizando um sistema leve de mola-amortecedor-gravidade com passo de tempo fixo.
Implemente 5 cores predefinidas, rigidez, amortecimento, escala de 65%–115% e uma ação "Poke". As operações de escala devem atualizar de forma síncrona o mapeamento de coordenadas para os acertos do raycast.
Trate com elegância o cancelamento do ponteiro, a perda de foco e entradas rápidas, para evitar estados de arraste travados ou elementos voando para fora da tela.

Inclua um carregador de gel que respira suavemente durante a preparação inicial dos recursos, com transição suave assim que a GPU conclui o custo do primeiro quadro antes de habilitar os controles do usuário. Respeite as configurações de 'prefers-reduced-motion'.

Teste minuciosamente interações, variações de cor, valores-limite de escala, visualizações mobile e estados de erro. Faça profiling e reporte os FPS sustentados (ocioso e ativo), registrando especificações do dispositivo, versão do navegador, tamanho do viewport, DPR, duração da amostra e quaisquer quedas de quadro no percentil 95.
```

### Prompt 05 · Reprodução e empacotamento

```text
Organize e valide este projeto de slime 3D para que possa ser reproduzido de forma confiável em outros ambientes.

Empacote index.html, estilos, arquivos-fonte de src/, dependências locais de vendor e licenças em um ZIP completo, junto com um README sem caminhos absolutos.
Documente pré-requisitos, comandos de inicialização local, URLs, soluções para conflitos de porta e procedimentos de saída limpa, enfatizando os requisitos obrigatórios de WebGPU.
Execute uma execução em ambiente limpo diretamente a partir do arquivo descompactado para verificar que não falta nenhuma dependência.

Grave uma breve captura de tela do navegador demonstrando as interações de apertar, arrastar, soltar, recolorir e cutucar.
Inclua uma comparação lado a lado entre a imagem de referência inicial e o render atual com WebGPU, apontando discrepâncias visuais e critérios de desempenho medidos.
Forneça URLs de demo ao vivo, links de download e insira os prompts de capítulo reutilizáveis sequencialmente na documentação.
```
