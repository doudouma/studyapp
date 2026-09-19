---
summary: "Um app de bandeja do Windows de código aberto que escuta gritos na madrugada e interrompe gamers barulhentos para manter a casa em silêncio."
tags: [Monitoramento de áudio, App de desktop, Código aberto, Controle parental, Feito com Claude]
facts:
  - key: author
    value: u/omricn
  - key: platforms
    value: Windows
  - key: version
    value: v1.1.0
    highlight: true
  - key: price
    value: Grátis (código aberto)
  - key: offline
    value: 100% local (sem armazenar áudio)
---

## O que é

[S.T.F.U](https://github.com/omricn/stfu/releases/latest?utm_source=gemini) (Sound Trigger Focus Utility) é um utilitário de bandeja do sistema Windows, de código aberto, criado para conter os gritos involuntários de madrugada de gamers que usam fones de ouvido. Feito pelo desenvolvedor u/omricn com o Claude Code, o app monitora continuamente a entrada do microfone de forma local, diferencia fala normal de grito em volume máximo por meio de uma calibração personalizada e força interrupções imediatas na área de trabalho sempre que o limite de volume é ultrapassado.

## Proposta de valor

A ferramenta substitui a bronca verbal ou o corte bruto de rede por um ciclo de feedback imediato, determinístico e combinado de antemão:

- **Calibração adaptativa em 3 passos**: no primeiro início, o app pede que o usuário fique quieto, fale normalmente e grite, estabelecendo uma faixa dinâmica de referência precisa.
- **Penalidades escalonadas**: o primeiro grito minimiza o jogo ativo, dispara um efeito sonoro e exibe um popup em tela cheia impossível de spammar, com botão de fechar móvel que exige 4 cliques; as reincidências jogam o usuário direto para a área de trabalho por 10 segundos.
- **Configurações e auditoria protegidas por PIN**: ajustes de limite, agendamento e ligar/desligar exigem um PIN configurado pelos pais, com um gráfico de incidentes que registra cada disparo.
- **Processamento local com foco em privacidade**: calcula o volume RMS a cada 20ms e descarta os buffers de áudio na hora, sem gravar, armazenar ou transmitir telemetria.
- **Faixas de horário programadas**: adicionadas na v1.1.0, permitem definir janelas ativas específicas para que o jogo diurno normal não seja afetado.

## O que pode substituir

| Software alvo | Viabilidade | Veredito e contexto de uso |
| --- | --- | --- |
| Suítes comerciais de controle parental | Moderada | Melhor para impor limites de ruído específicos, sem espionagem invasiva nem assinaturas. |
| Descarte de pacotes / corte de Wi-Fi no roteador | Alta | Muito mais cirúrgico; evita a raiva por lag e mantém a internet para tarefas silenciosas. |
| Plugins de noise gate / cabos de áudio virtuais | Baixa | Cabos virtuais apenas cortam ou silenciam a voz de saída no Discord, em vez de punir o grito em si. |
| Medidores de nível sonoro de hardware | Parcial | Elimina luzes de alerta físicas presas à parede, optando pela interrupção direta no sistema operacional. |

## Realidades e limitações atuais

- **Vulnerabilidades de contorno**: como apontaram membros da comunidade, é possível desligar o interruptor físico do microfone antes de gritar ou enganar a calibração soprando no microfone.
- **Exclusividade de sistema**: atualmente restrito a desktops Windows; não oferece suporte a consoles como PlayStation ou Xbox.
- **Sintoma comportamental vs. causa raiz**: o desenvolvedor reconhece que o app ensina os jogadores a gritar mais baixo, em vez de tratar a autorregulação emocional noturna.
- **Interrupção de partidas cooperativas**: minimizar o jogo ou expulsar o jogador para a área de trabalho em títulos multijogador competitivos (ex.: ranqueadas) também prejudica os colegas.

## Veredito

> **Recomendação principal**
> [S.T.F.U](https://github.com/omricn/stfu/releases/latest?utm_source=gemini) é um utilitário engenhoso e deliciosamente mesquinho que funciona melhor como um "contrato social" explícito do que como spyware disfarçado. Se a sua casa sofre com explosões de madrugada causadas por fones durante maratonas de jogo nas férias, ele entrega feedback pavloviano instantâneo sem qualquer compromisso com a privacidade dos dados.

## Ciclo de desenvolvimento e iteração

O desenvolvedor criou o utilitário com o Claude Code para transformar rapidamente um atrito doméstico irritante em uma ferramenta publicável em uma única noite. O feedback da comunidade ditou imediatamente o ritmo das versões.

| Etapa | Modelo / Ferramenta | Foco |
| --- | --- | --- |
| Arquitetura inicial e UI | Claude Code | Estrutura de bandeja do Windows, sondagem de volume a cada 20ms, posicionamento dinâmico do botão |
| Versão v1.0.0 | Claude Code | Painel bloqueado por PIN, visualizador do histórico de disparos, assistente de calibração |
| Patch v1.1.0 | Claude Code | Integração de janelas programadas de monitoramento ativo/passivo com base nas sugestões do Reddit |

## Métricas e monetização

- **Preço**: 100% gratuito e de código aberto em um repositório público no GitHub.
- **Adoção**: mais de 3.600 upvotes e 700+ comentários em semanas desde a publicação no Reddit.
- **Monetização**: nenhuma; distribuído puramente como utilitário comunitário e vitrine do desenvolvedor.

## Recepção da comunidade e debates principais

O post gerou debates intensos sobre filosofia de criação e estilos de escrita de IA:

- **Engenharia vs. criação tradicional**: os comentaristas se dividiram entre elogiar a solução como "criação heroica e compassiva por meio de consequências naturais" e criticá-la como uma "coleira de choque digital" para pais relutantes em confiscar consoles.
- **Táticas de troll alternativas**: sysadmins veteranos e pais compartilharam táticas de retaliação antigas, como configurar pontos de acesso para descartar aleatoriamente 30% dos pacotes dos consoles ou revogar as concessões DHCP do roteador à meia-noite.
- **Detecção de clichês de escrita de IA**: vários comentaristas notaram a dependência do post de marcadores estilísticos típicos do Claude — sobretudo a expressão "load-bearing" —, o que gerou um meta-debate sobre se os desenvolvedores agora escrevem naturalmente na cadência das LLMs com que colaboram.
