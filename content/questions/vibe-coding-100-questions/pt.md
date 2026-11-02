---
title: 100 perguntas sobre Vibe Coding
summary: De «falar e criar um app» ao deploy seguro, controle de qualidade e decisões de carreira: 100 perguntas para entender os limites reais, as ferramentas e os erros do vibe coding.
tags: [Vibe Coding, Programação com IA, Sem código, Segurança, Guia temático]
author: 100mini Editorial
publishedAt: 2026-11-01
updatedAt: 2026-11-01
questionCount: 100
chapterCount: 7
facts:
  - key: Autor
    value: 100mini Editorial
  - key: Perguntas
    value: 100
    highlight: true
  - key: Capítulos
    value: 7
  - key: Tema
    value: Vibe Coding / criação com IA
  - key: Para quem
    value: Criadores sem código / produto / trabalhadores diante da IA
  - key: Atualizado
    value: 2026-11-01
---

## Prefácio

Este é um guia de «100 perguntas»: uma forma de dividir um tema grande em perguntas e depois lê-lo uma por uma.

O vibe coding torna possível «criar um app falando», mas há um longo caminho entre uma demo que funciona e um produto seguro, implantável e sustentável. O guia segue sete etapas: uma checagem de realidade honesta, o primeiro dia, por que a saída continua errada, como colocar online, como evitar desastres, como julgar a qualidade e a questão profissional.

**Respostas rápidas**

- O vibe coding transforma ideias em demos rápido, mas deploy de produção, segurança, dados e manutenção ainda exigem julgamento humano.
- Iniciantes sem código devem começar com uma ferramenta hospedada no navegador, não com Node, Git ou terminal.
- Divida a ideia em quem usa, o que faz, onde ficam os dados e o que o produto não fará.
- Mude uma coisa por vez, revise após cada mudança e confira manualmente tudo que envolve dinheiro, privacidade ou dados de usuários.
- «Funciona» não é «está correto». Critérios de aceitação, backups e o básico de segurança são a verdadeira linha entre uma demo e algo que você pode publicar.

> Esta é uma tradução condensada: alguns trechos ainda estão sendo conferidos com o OCR original.

## 1. Dá para criar um app conversando com a IA?

### 1. Dá para criar um app só conversando? Vamos começar com a água fria

Sim, a IA consegue transformar uma frase em um pequeno app que abre e funciona. A parte difícil não é a primeira tela, mas tudo entre uma demo e um produto em que usuários reais confiem com seus dados. As ferramentas evoluíram muito, mas os vídeos de «um app em uma hora» cortam deploy, autenticação, pagamentos, segurança de dados e manutenção.

### 2. Minha mãe também pode criar um app? Até onde vai alguém sem código?

Alguém sem código pode ir surpreendentemente longe com protótipos, ferramentas internas e projetos pessoais. Sistemas de produção são outra história: exigem julgamento sobre arquitetura, segurança e operações que a IA não oferece. O vibe coding amplifica o que você traz: clareza ou confusão.

### 3. «Quero criar um e-commerce»: por que a IA não entende?

Um pedido de uma linha esconde dezenas de suposições: quem faz login, como os produtos são listados, como o dinheiro é cobrado, quem vê quais dados. Divida a ideia em pessoas e ações: quem usa, o que cada um faz, onde os dados ficam e o que o produto não fará. Um breve documento escrito vale mais que um desejo.

### 4. A IA vai substituir os programadores? Primeiro a conclusão, depois o que fazer

Substitui quem apenas traduz uma especificação pronta em código. Programadores que desenham sistemas, avaliam trade-offs, depuram causas-raiz e decidem o que construir ficam mais valiosos. Aprenda a dirigir a IA, não apenas a digitar código.

### 5. Sou um trabalhador afetado pela IA e não sei programar. Ainda tenho chance?

Sim, e a oportunidade é maior do que parece. A habilidade escassa não é mais digitar sintaxe, mas transformar uma ideia vaga em um pedido claro e passo a passo que a IA possa executar, e depois julgar o resultado. Comece por um incômodo pequeno e real e pratique explicá-lo com precisão.

### 6. Meu chefe quer usar IA e não contratar programadores. As contas fecham?

Para ferramentas pequenas e sistemas internos, muitas vezes sim. Para sistemas de produção que tocam autenticação, pagamentos e dados de usuários, normalmente não. A IA reduz código repetitivo, mas não substitui quem é dono da arquitetura, da revisão e da resposta a incidentes.

### 7. Vibe coding, programação assistida por IA, agentic: qual é a diferença?

A linha divisória é se você revisa o código. Programação assistida significa que você lê, testa e entende o que foi gerado. Vibe coding significa que você aceita a saída e itera por resultados sem ler o código. Agentic significa que você orquestra um time de agentes e atua como supervisor.

### 8. «Criar um app em uma hora» é real? O que é cortado do vídeo?

A hora do protótipo é real. O que é cortado é tudo depois: corrigir a lógica, adicionar login e armazenamento, escolher um banco de dados, fazer deploy, proteger os dados e atender usuários reais. A demo é os setenta por cento fáceis; os últimos trinta são onde a maioria para.

### 9. Um iniciante absoluto consegue criar algo usável ou só brinquedos?

Você consegue criar coisas pequenas realmente úteis: um site pessoal, uma ferramenta interna, um protótipo para validar uma ideia. Não dá para pular a infraestrutura que você ainda não entende quando chegam usuários, dados ou tráfego reais. O vibe coding é mais forte no meio do caminho.

### 10. «Feito» e «feito corretamente» não são a mesma coisa. O que isso significa?

Uma página abrir não prova que a lógica de negócio está certa nem que os dados estão seguros. O código gerado por IA pode parecer confiante enquanto erra nomes de campos, permissões ou comportamento assíncrono. Faça três perguntas: faz o que eu queria, trata os dados com segurança e eu perceberia se falhasse?

### 11. Grandes empresas lançam ferramentas como Miaoda, TRAE e Coze. Onde está a oportunidade para pessoas comuns?

Não em competir pelo modelo ou pela plataforma. A oportunidade está em entender um público específico e transformar uma necessidade real em um protótipo funcional mais rápido. As ferramentas baixam a barreira de execução; critério, conhecimento de domínio e distribuição continuam importando.

### 12. Quem criou o termo «vibe coding» e por que todo mundo falou disso em 2025?

Andrej Karpathy popularizou o termo no início de 2025. Ele se espalhou porque a capacidade finalmente alcançou a promessa: os modelos ficaram bons o bastante para pessoas sem código criarem pequenos apps conversando. A frase deu nome a uma sensação que muita gente já tinha.

### 13. Tenho uma ideia de produto. A IA pode torná-la real? Até onde ela vai

A IA pode levar você de uma ideia a uma demo clicável e, muitas vezes, até o deploy. Ela não toma decisões de posicionamento, não avalia trade-offs de privacidade nem assume a responsabilidade por um incidente em produção. A última milha continua sendo sua.

### 14. Para quem é este guia e para quem não é?

É para pessoas sem código com uma ideia ou uma tarefa repetitiva, trabalhadores preocupados com a IA e gente de produto ou negócio que quer prototipar antes de contratar. Não é para quem espera um produto lucrativo aparecer sem pensar.

## 2. Você não sabe programar: por onde começar no primeiro dia?

### 15. Não sei nada de código. O que instalo primeiro e posso evitar o terminal?

No primeiro dia você provavelmente não instala nada. Abra uma ferramenta no navegador, escreva uma descrição e deixe-a gerar o app; a plataforma gerencia o ambiente. Terminal, Node e Git são para outro caminho. Comece pelo caminho que produz um resultado hoje.

### 16. Como escolho a ferramenta: totalmente hospedada ou auto-hospedada? Miaoda, WorkBuddy, Tencent Marvis, Zhipu zcode?

Ferramentas totalmente hospedadas (Miaoda, WorkBuddy, Zhipu zcode) cuidam do ambiente e do deploy. As auto-hospedadas (Cursor, Claude Code, Trae) são mais poderosas, mas exigem editor, terminal e gestão de arquivos. Iniciantes devem começar pelas hospedadas e trocar só quando o projeto realmente precisar de mais controle.

### 17. Dizem que preciso de Node e Git. Alguém sem código pode evitar?

Sim. Plataformas no navegador gerenciam essas ferramentas por trás. Tutoriais que começam instalando Node e Git são escritos para programadores. Procure ferramentas rotuladas como «sem código» ou «criação por linguagem natural»; se um tutorial pede para instalar um pacote primeiro, provavelmente não é o seu caminho.

### 18. Não quero tocar no terminal. Existe uma ferramenta onde eu só converso?

Sim. Construtores hospedados e centrados no chat são feitos para isso. Você descreve o app, revisa a prévia e pede mudanças em linguagem natural. Mantenha o projeto pequeno e use os botões de prévia e publicação da plataforma em vez de comandos locais.

### 19. Como transformo «quero um app de orçamento» em algo que a IA entenda e construa?

Escreva um brief de uma página: quem é o usuário, as três ações principais, onde ficam os dados, o que o app não deve fazer e como você saberá que funciona. Depois peça à IA um plano antes de escrever código. O brief é a diferença entre uma primeira versão útil e um monte de telas aleatórias.

### 20. Como deve ser um PRD para a IA e por que «o que não fará» importa mais que «o que fará»?

Um bom PRD indica o usuário, o objetivo, os fluxos principais, os dados, as restrições e os não-objetivos explícitos. Os não-objetivos impedem que a IA invente escopo. Curto o bastante para ler e específico o bastante para testar.

### 21. Quão detalhada deve ser minha especificação em comparação com um pedido de uma linha?

Detalhada o suficiente para outra pessoa dizer se o resultado está correto. Inclua o caminho feliz, os casos-limite que importam e os critérios de aceitação. Um pedido de uma linha deixa a IA adivinhar; uma boa especificação a deixa executar.

### 22. Descrevo a ideia toda de uma vez ou construo e reviso?

Comece com uma fatia pequena de ponta a ponta e depois revise. Um brief gigante convida a um primeiro rascunho gigante e frágil. Construa a menor versão que demonstre o valor central, verifique e adicione uma funcionalidade por vez.

### 23. Como dou a primeira instrução à IA sem desviá-la?

Diga o objetivo, as restrições, os arquivos ou telas envolvidos e como você verificará o resultado. Peça um plano primeiro se a tarefa tocar mais de um arquivo. Evite verbos vagos como «melhore»; diga o que «melhor» significa.

### 24. A IA gerou um monte de arquivos que não entendo. É normal? Devo me preocupar?

É normal, e você deve se preocupar com os poucos arquivos que importam: a página de entrada, o modelo de dados, a lógica de autenticação e a configuração de deploy. Não precisa ler cada linha, mas precisa saber onde estão as partes de risco e quem pode revisá-las.

### 25. Dá para rodar localmente? O que é «localhost» e por que importa?

Localhost significa que o app roda na sua máquina e só você vê. Serve para prévia e depuração, mas não é um produto implantado. Para outras pessoas usarem, você precisa publicá-lo em uma plataforma de hospedagem e configurar domínio e serviços de dados.

### 26. Apareceu um monte de erros vermelhos. Devo colar na IA ou investigar primeiro?

Cole o erro completo, o comando que o causou e o que você esperava. A IA é boa em reconhecer padrões em stack traces, mas precisa do contexto real. Se o mesmo erro se repetir, pare e reduza o problema em vez de deixar a IA tentar para sempre.

### 27. As ferramentas custam dinheiro? Até onde vai o plano gratuito para um iniciante?

A maioria tem um plano gratuito suficiente para um primeiro protótipo. Os limites costumam aparecer em cotas de mensagens, deploys, domínios personalizados ou uso. Comece grátis, aprenda o fluxo e pague só quando o projeto tiver um usuário real ou um custo real de falha.

### 28. Escolhi a ferramenta ou o caminho errado. Posso trocar no meio e quanto custa?

Normalmente sim, mas o custo depende de quanto código e dados específicos da plataforma você tem. Mantenha a lógica e a exportação de dados portáveis, evite prender dados críticos em formato proprietário e troque antes de o projeto se tornar crítico para produção.

### 29. Existe um «caminho mínimo para pessoas sem código» que produza uma demo?

Sim: escolha uma ferramenta hospedada, escreva um brief de uma página, gere o menor fluxo funcional, teste com um usuário real, corrija os três principais problemas e publique. Não adicione autenticação, pagamentos ou banco de dados até o fluxo central merecê-los.

## 3. Por que minha IA constrói sempre a coisa errada?

### 30. A ideia é grande demais para uma execução. Como dividir sem quebrar tudo?

Divida por comportamento visível ao usuário, não por camada técnica. Cada fatia deve ter entrada, saída e teste de aceitação claros. Mantenha dados e interfaces compartilhados estáveis e verifique cada fatia antes de começar a próxima.

### 31. Como divido «criar um e-commerce» em partes que a IA possa construir e remontar?

Comece pelo catálogo e uma página de produto, depois adicione carrinho, checkout, contas e pedidos. Defina o modelo de dados e os limites entre fatias desde o início. Cada fatia deve poder ser testada e implantada de forma independente atrás de uma feature flag.

### 32. Construo primeiro a interface ou a funcionalidade?

Construa primeiro o fluxo mais fino de ponta a ponta: uma tela, uma ação, um dado. Uma interface bonita sem lógica esconde os riscos reais. Quando o fluxo funcionar, melhore a interface e adicione casos-limite.

### 33. O que eu queria e o que a IA construiu são diferentes. Como corrijo para ela entender?

Mostre a diferença de forma concreta: uma captura, uma entrada que falha, a saída esperada. Peça à IA que reformule o requisito com as próprias palavras antes de mudar código. Se ainda errar, reduza a tarefa a um comportamento e teste.

### 34. O mesmo bug sobrevive a dez correções da IA e piora. Como saio do loop?

Pare o loop. Peça um diagnóstico escrito, uma reprodução mínima e a menor correção possível. Se a terceira tentativa falhar, volte à última versão que funcionava e mude a abordagem ou reduza o escopo.

### 35. Como sei que esta versão está «pronta» sem depender de uma sensação?

Escreva uma lista curta de aceitação antes de construir: as ações principais, os dados esperados, os estados de erro e o básico de segurança. Teste cada item manualmente. Se não souber descrever como verificar, não está pronta.

### 36. A demo funciona, mas fica lenta com mais dados. É normal e como corrigir?

Sim. Demos costumam usar dados em memória ou sem índices. O uso real precisa de banco de dados, índices, paginação e cache. Peça à IA para identificar o gargalo antes de otimizar e teste com volume realista.

### 37. Não consigo ler o código que a IA escreveu. Como vou mantê-lo? Vou ficar preso?

Você não precisa ler cada linha, mas precisa ser dono da arquitetura, do modelo de dados e do deploy. Peça à IA para documentar o sistema, guarde o código em um repositório e exija revisão humana nas partes críticas de segurança. Se não consegue explicar como funciona, não consegue mudar com segurança.

### 38. Conforme o projeto cresce, a IA começa a esquecer e se contradizer. Como evitar a podridão?

Contextos longos se degradam. Mantenha um brief e um documento de arquitetura, abra threads novas para tarefas separadas e repita as restrições importantes. Revise os diffs e execute os testes existentes após cada mudança.

### 39. Como faço a IA «lembrar» decisões em vez de começar do zero sempre?

Coloque decisões duráveis em um documento do projeto (AGENTS.md, ARCHITECTURE.md ou um PRD) e aponte para ele no início de cada tarefa. Mantenha o documento curto e atualizado; um documento obsoleto é pior que nenhum.

### 40. Numa conversa longa, a IA esquece o que dissemos. Como trazê-la de volta?

Resuma as decisões e restrições em uma mensagem curta e peça à IA que confirme antes de continuar. Para projetos longos, abra uma thread nova com o resumo e os arquivos relevantes em vez de esticar uma única conversa.

### 41. A IA diz «sim» a uma funcionalidade nova e a build quebra. Como evitar?

Exija um plano e uma avaliação de impacto antes da implementação. Pergunte quais arquivos e interfaces mudarão, adicione um teste de regressão para o comportamento existente e implemente atrás de uma mudança pequena e reversível.

### 42. Como deixo um «manual» do que construí para poder mudar depois?

Escreva um README curto: o que faz, como rodar, onde ficam os dados, como fazer deploy, quais são as partes de risco e quem procurar. Mantenha junto ao código e atualize quando a arquitetura mudar.

### 43. O protótipo está pronto. Como mostro a amigos e recebo feedback útil?

Dê a eles uma tarefa concreta para completar, não um «o que você achou?» genérico. Peça que contem o que esperam, onde travam e se o resultado cumpre a promessa. Corrija os três principais atritos antes de adicionar funcionalidades.

### 44. Dizem que minha interface é feia. A IA pode deixá-la mais bonita?

Sim, se você der uma referência e restrições. Descreva o público, o tom desejado, o layout e os componentes; peça duas ou três variantes e compare. Não deixe uma reescrita visual mudar a lógica que funciona.

## 4. Funciona localmente: como deixo outras pessoas usarem?

### 45. A demo roda no meu computador. Como a torno acessível ao mundo?

Faça deploy em uma plataforma de hospedagem, conecte um domínio, configure variáveis de ambiente e um banco de dados, e teste de um dispositivo que não seja o seu. «Funciona na minha máquina» é o começo do deploy, não o fim.

### 46. Preciso alugar um servidor para fazer deploy ou existe opção gratuita?

Muitas plataformas oferecem plano gratuito para sites estáticos e apps pequenos. Planos gratuitos têm limites de banda, minutos de build, bancos de dados ou domínios personalizados. Comece por aí e passe para um plano pago quando chegarem usuários ou dados reais.

### 47. Qual é a diferença entre «estar online» e «ser usável online»?

«Online» significa que a URL responde. «Usável» significa que a autenticação funciona, os dados persistem, os erros são tratados, o site é rápido o bastante e você consegue se recuperar de uma falha. Teste a jornada completa, não só a home.

### 48. Onde os dados devem ficar? Excel não basta: o que é um banco de dados?

Um banco de dados armazena dados estruturados, lida com acesso concorrente e permite consultas seguras. Para um app pequeno, um Postgres ou SQLite hospedado basta. Mantenha backups e nunca guarde dados de produção apenas numa planilha local.

### 49. Usuários precisam se cadastrar e fazer login. Como guardo senhas sem vazá-las?

Nunca guarde senhas em texto puro. Use um provedor de autenticação gerenciado ou uma biblioteca bem testada que faça hash, gerencie sessões e permita redefinir senha. Se não tiver certeza, não construa a autenticação você mesmo.

### 50. O que é um backend e por que uma interface não basta?

O backend cuida de dados, autenticação, permissões, pagamentos e integrações. Um app só de frontend pode parecer completo, mas não tem lugar seguro para guardar dados nem para aplicar regras. A maioria dos riscos de produção vive no backend.

### 51. Quero adicionar pagamentos, mapas e SMS. A IA consegue conectar?

Sim, mas essas integrações envolvem credenciais, conformidade e dinheiro. Use o SDK oficial do provedor e teste primeiro em sandbox. Mantenha segredos no servidor, nunca no navegador, e faça uma pessoa revisar o fluxo de pagamento.

### 52. O que é uma API e por que não dá para criar um produto real sem ela?

Uma API é um contrato que permite ao seu app falar com outro serviço. Pagamentos, mapas, email, autenticação e modelos de IA expõem APIs. Você não precisa memorizar os detalhes, mas precisa entender chaves, cotas, erros e limites de requisição.

### 53. Meu site não tem o cadeado HTTPS. O que acontece?

Sem HTTPS, o tráfego pode ser interceptado e os navegadores avisam os usuários. A maioria dos hosts oferece HTTPS automático; ative, force o redirecionamento de HTTP e nunca envie credenciais ou tokens por HTTP puro.

### 54. O deploy falhou com «build error». Como um iniciante se recupera?

Leia o primeiro erro, não o último. Confira o comando de build, as variáveis de ambiente e os caminhos de arquivo. Cole o log completo na IA e peça a menor correção; se persistir, faça deploy do último commit que funcionava e mude uma coisa por vez.

### 55. Consigo manter sozinho um produto no ar e quanto esforço isso exige?

Você consegue manter um produto pequeno e de baixo risco, mas exige trabalho contínuo: monitoramento, backups, atualizações de dependências, patches de segurança e suporte. Se tocar dinheiro ou dados sensíveis, planeje ajuda humana antes do lançamento, não depois de um incidente.

### 56. O site fica lento conforme os usuários crescem. A culpa é minha ou da IA?

Normalmente de nenhum dos dois: é um problema de capacidade. Verifique consultas ao banco, índices, tamanho de imagens, cache e limites do servidor. Meça antes de otimizar e corrija o maior gargalo primeiro.

### 57. Como subo uma demo local sem vazar segredos?

Use variáveis de ambiente para segredos, mantenha arquivos `.env` fora do Git, rotacione qualquer chave que já tenha sido commitada e revise o diff de deploy. Nunca cole chaves privadas em um chat nem em um bundle do cliente.

### 58. Existe um checklist pré-lançamento que eu possa seguir?

Sim: HTTPS, autenticação, permissões, backup de dados, monitoramento de erros, política de privacidade, termos, limites de requisição, plano de rollback e um teste com um usuário real. Se faltar algum item, o produto não está pronto para tráfego real.

## 5. Desastres de IA acontecem: meu projeto também vai explodir?

### 59. Existem falhas reais de vibe coding? Dê alguns incidentes de produção

Sim. Os padrões comuns são chaves de API vazadas, verificações de autorização ausentes, dados de usuários expostos e contas de nuvem descontroladas. Raramente vêm de um bug dramático; vêm de pular a revisão, dar permissões amplas e colocar segredos onde o navegador alcança.

### 60. Como acontecem três desastres de segurança de IA em uma semana?

Normalmente pelos mesmos buracos: credenciais commitadas em repositório público, um endpoint de administração sem autorização e uma regra de banco que confia no cliente. A IA escreve código plausível rápido, mas não conhece seu modelo de ameaças se você não explicar.

### 61. Por que quase metade dos programas escritos por IA falha em testes de segurança e 15% expõe chaves?

Porque segurança não aparece numa demo. A IA tende a otimizar o caminho feliz, não entradas adversariais, limites de permissão ou manuseio de segredos. Adicione revisão de segurança ao fluxo em vez de supor que «funciona» significa «é seguro».

### 62. O que é injeção de prompt e como um atacante pode entrar no meu sistema com ela?

A injeção esconde instruções no conteúdo que o modelo lê: uma página, um PDF, um email. Se o modelo também tem ferramentas ou credenciais, essas instruções podem disparar ações. Trate todo conteúdo externo como não confiável, limite permissões de ferramentas e exija confirmação para operações sensíveis.

### 63. O que são RLS e autorização, e por que ignorá-los vaza dados de usuários?

Segurança em nível de linha e autorização decidem quem pode ler ou alterar quais registros. Se o banco confia no cliente ou a API só verifica «está logado» em vez de «é dono deste registro», um usuário lê os dados de outro. Teste com duas contas, não uma.

### 64. Meu app coleta informações pessoais reais. Como protejo a privacidade dos usuários?

Colete só o necessário, criptografe em trânsito e em repouso, restrinja quem acessa e exclua os dados quando não forem mais necessários. Publique uma política de privacidade e saiba quais leis se aplicam aos seus usuários. Se não consegue explicar o fluxo de dados, não lance.

### 65. Alguém vazou 1,5 milhão de chaves online. Como evito isso?

Nunca faça commit de segredos, nunca os coloque no código do cliente e escaneie o repositório antes de cada push. Use variáveis de ambiente e um gerenciador de segredos, rotacione chaves regularmente e assuma que qualquer chave que tocou um lugar público está comprometida.

### 66. A IA pode chamar secretamente APIs pagas que eu não queria e queimar meu orçamento?

Sim, se tiver credenciais e nenhum limite de gasto. Defina cotas rígidas e alertas em cada provedor, use chaves sandbox durante o desenvolvimento e revise o código em busca de tarefas em segundo plano, retentativas e loops que multipliquem o custo.

### 67. Como evito que a IA escreva uma senha de administrador no código e deixe uma porta dos fundos?

Proíba credenciais hard-coded nas regras do projeto, exija variáveis de ambiente e revise cada diff que toque autenticação. Use um provedor de autenticação gerenciado, faça hash de senhas e nunca publique uma conta de administrador padrão.

### 68. Como faço uma autoverificação básica de segurança antes de lançar sem contratar uma agência?

Teste autenticação e permissões com duas contas, inspecione a aba de rede em busca de segredos, confirme que HTTPS está forçado, revise dependências com vulnerabilidades conhecidas, faça backup do banco e leia o OWASP Top Ten. Corrija o óbvio antes de convidar usuários.

### 69. Fui hackeado ou vazaram dados. O que faço primeiro para limitar o dano?

Revogue chaves, tire o serviço comprometido do ar se necessário, preserve logs, troque senhas e notifique usuários e autoridades conforme a lei. Não apague evidências. Depois encontre a causa-raiz e corrija antes de restaurar o serviço.

### 70. O que nunca deve ser entregue ao vibe coding? Casos reais e quatro erros de iniciante

Não entregue pagamentos, autenticação, bancos de produção, sistemas de permissão ou qualquer coisa que você não consiga verificar. Os quatro erros comuns são aceitar tudo, pular a revisão, expor segredos e achar que uma demo que funciona equivale a um produto seguro.

### 71. Quais problemas de copyright e conformidade devo conhecer ao usar código gerado por IA?

Código gerado por IA pode reproduzir padrões licenciados e sua procedência é difícil de provar. Verifique os termos da ferramenta, evite copiar código proprietário, mantenha licenças de dependências e faça uma pessoa revisar tudo que toque dados regulados ou um produto pago.

### 72. Como julgo se uma ferramenta de IA é confiável?

Veja quem a opera, onde os dados ficam, se ela treina com suas entradas, seu histórico de disponibilidade e segurança, e se permite exportar e excluir. Evite plataformas desconhecidas que pedem permissões amplas de conta.

### 73. Num incidente de segurança, quem é responsável e como a lei trata pessoas comuns?

A responsabilidade depende do contrato, da jurisdição e dos dados envolvidos. A pessoa ou empresa que opera o serviço costuma carregar o dever legal e regulatório. «A IA escreveu» não é defesa. Busque orientação profissional para qualquer coisa que envolva pagamentos, saúde ou dados pessoais.

### 74. Dê dez bases de segurança para criadores sem código

Use HTTPS, nunca hard-code segredos, aplique autorização no servidor, valide entradas, faça hash de senhas, faça backups, limite acesso de administrador, monitore erros, mantenha dependências atualizadas e tenha um plano de rollback. Se não conseguir verificar um destes pontos, busque ajuda antes de lançar.

## 6. O que significa algo ser «realmente confiável»?

### 75. O app não para de gerar bugs. Como faço a IA escrever menos? A regra 70/30

Use a regra 70/30: deixe a IA cuidar de código repetitivo, testes, documentação e refatorações, enquanto humanos cuidam de arquitetura, lógica complexa, segurança e revisão. O erro é entregar 95% e depois perguntar por que falta o 5% crítico para a segurança.

### 76. O que são testes e como alguém sem código pede à IA para escrevê-los primeiro (TDD)?

Um teste é uma verificação repetível de que um comportamento continua funcionando. Peça à IA um teste que falhe para o comportamento, depois implemente até passar. TDD dá uma rede de segurança para mudanças futuras, mesmo que você não leia cada linha.

### 77. O que é a «dívida técnica» gerada por IA e por que ela piora com o tempo?

Dívida técnica é o custo extra de um código difícil de mudar: lógica duplicada, testes ausentes, limites pouco claros. A IA pode adicioná-la rápido porque cada patch pode introduzir um novo contorno. Pague-a continuamente com pequenas refatorações e testes, não com uma reescrita heroica.

### 78. Como garanto que cada mudança da IA não quebre o que já funcionava?

Revise após cada mudança, execute os testes existentes e mude uma coisa por vez. Mantenha uma lista dos fluxos críticos e teste novamente após cada deploy. Uma regressão é mais barata de pegar na hora do que depois de uma semana de funcionalidades novas.

### 79. Como dou regras de projeto à IA (CLAUDE.md, ARCHITECTURE.md, ciclo plan-review) em linguagem simples?

Escreva um documento curto do projeto: stack, estrutura de pastas, convenções, objetivo atual e ações proibidas. Depois use um ciclo plan-review: peça um plano, faça outro modelo ou uma pessoa revisar e só então implemente. O documento é o contexto que a IA não tem.

### 80. Como aceito o resultado como «bom o suficiente» para entregar?

Defina critérios de aceitação antes de construir e teste manualmente. Confira o fluxo principal, os estados de erro, as permissões, a persistência de dados e o layout móvel. «Parece bom» não é aceitação; «estas cinco verificações passam» é.

### 81. Na visão de um chefe, como julgo um projeto terceirizado ou entregue por IA?

Peça a arquitetura, o fluxo de dados, a cobertura de testes, a revisão de segurança e o plano de rollback. Uma demo não prova quase nada. Uma entrega confiável explica o que acontece quando algo falha e quem é responsável por corrigir.

### 82. Como um time deve gerenciar a qualidade do código depois de adotar IA?

Trate a saída da IA como o pull request de um júnior: exija revisão, testes e uma descrição clara. Meça a taxa de defeitos, mantenha mudanças sensíveis de segurança sob aprovação humana e atualize as regras compartilhadas conforme o código evolui.

### 83. Como passo de «a IA escreve e eu adivinho» para «eu especifico e a IA segue»? Cinco padrões de prompt

Use cinco padrões: especifique objetivo e restrições; dê um exemplo concreto; peça um plano antes do código; peça o menor diff; e exija uma etapa de verificação. O padrão importa menos que o hábito de escrever um brief e conferir o resultado.

### 84. A IA deve escrever a documentação e os comentários, ou eu?

Deixe a IA redigir as partes repetitivas, mas você é dono das decisões de arquitetura, do runbook e das notas de segurança. Comentários devem explicar por quê, não o quê. Se a IA não consegue explicar o sistema em linguagem simples, é sinal de que o design não está claro.

### 85. O projeto virou uma bagunça. Existe um procedimento geral de limpeza?

Congele funcionalidades novas, escreva o comportamento atual, adicione testes para os caminhos críticos, remova código morto e refatore em passos pequenos. Se a bagunça for profunda demais, reconstrua a menor versão funcional e migre os dados com cuidado.

### 86. Como controlo o custo (tokens, cota, tempo) e evito a espiral de «mais correções, mais gasto»?

Defina um orçamento por tarefa, use o modelo mais barato que funcione, pare cedo tarefas em loop e meça o custo de cada iteração. Planeje antes de executar e evite relançar uma tarefa falha sem mudanças. Controle de custo é um fluxo de trabalho, não um cupom.

### 87. Quando devo trazer um programador de verdade em vez de insistir?

Traga ajuda quando o produto tocar dinheiro, dados pessoais, autenticação ou disponibilidade, ou quando você não conseguir entender nem verificar a falha. Quanto antes envolver um profissional, mais barato o conserto. Esperar um incidente é a opção mais cara.

### 88. Como faço backups para não perder tudo da noite para o dia?

Envie o código para um repositório remoto, exporte o banco regularmente, guarde um arquivo de uma versão que funcionava e teste a restauração. Um backup que você nunca restaurou é uma esperança, não um backup.

## 7. Os programadores serão substituídos e o que devo fazer?

### 89. O vibe coding pode substituir programadores? Outra resposta honesta

Substitui parte do trabalho, mas não a parte que você provavelmente imagina. A IA é boa em traduzir uma especificação clara em código; é fraca em decidir o que construir, desenhar um sistema e diagnosticar um incidente em produção. Em risco estão os que apenas traduzem especificações.

### 90. Se não escrevo código, qual é o meu valor central?

Seu valor passa de digitar código para esclarecer problemas ambíguos, descrevê-los com precisão e julgar o resultado. As habilidades escassas são decomposição, verificação e pensamento sistêmico. São aprendíveis e se acumulam.

### 91. O que vale mais: «descrever sistemas» ou «escrever código»?

Descrever sistemas ganha valor, mas só quando combinado com julgamento. Um engenheiro sênior consegue dirigir a IA porque sabe como é um bom sistema. Um criador sem código pode vencer conhecendo o usuário, o domínio e os critérios de aceitação.

### 92. Como programadores devem colaborar com a IA para continuarem empregáveis?

Atue como arquiteto e revisor, não como digitador. Passe de «escreva esta função» para «aqui está o design, implemente dentro destes limites». Revise a saída da IA, aprenda as ferramentas e construa um projeto completo do brief ao deploy.

### 93. Do vibe coding ao agentic engineering: quanto uma pessoa sem código precisa saber?

Você não precisa escrever código, mas precisa entender três coisas: como é um bom sistema, como dar regras e limites à IA e quais passos exigem aprovação humana. Agentic engineering é supervisão, não abdicação.

### 94. Minha pequena ferramenta está crescendo. Quando devo passá-la ao «exército regular»?

Passe quando ela servir usuários reais, tocar dinheiro ou privacidade, ou precisar ficar sempre online. Faça uma revisão de segurança antes de escalar. Entregar cedo não é fracasso; é como você protege o que validou.

### 95. Quais projetos são adequados ao vibe coding e quais nunca devo tocar?

Adequados: protótipos pessoais, ferramentas internas, experimentos de baixo risco e coisas que não tocam dinheiro nem privacidade. Evite: pagamentos, autenticação, permissões, dados sensíveis, serviços de alta disponibilidade e tudo que você não consegue verificar. Na dúvida, busque revisão humana.

### 96. Crianças e estudantes ainda devem aprender a programar ou só a usar IA?

Devem aprender as duas coisas: usar IA e entender lógica. Programar não é mais só sintaxe; é dirigir um sistema e conferir seu comportamento. Uma compreensão básica de computação torna você muito melhor no uso de IA.

### 97. Como será o vibe coding daqui a um ano? É tarde para começar?

Não é tarde, e a direção importa mais que o momento. Os vencedores serão os que usam bem a IA, não os primeiros a chegar. Comece agora, construa a intuição para dirigir a IA e mantenha um portfólio de projetos reais.

### 98. Sete conselhos honestos para fundadores sem código

Deixe claro o problema de quem você resolve; escreva um PRD que diga o que o produto não fará; publique a menor demo; use seu próprio produto; peça revisão de segurança antes de tocar dinheiro ou privacidade; mantenha backups e um runbook; traga profissionais antes de escalar. Cada conselho evita um tipo específico de retrabalho caro.

### 99. Sete conselhos honestos para trabalhadores diante da IA

Primeiro estabilize-se: substitui-se quem apenas traduz especificações, não quem pensa e julga. Não compita com a IA em velocidade de digitação; compita em decomposição e verificação. Entregue o código repetitivo à IA, aprenda arquitetura e negócio, e construa um projeto completo que você possa mostrar.

### 100. Palavra final: você não precisa escrever código, mas precisa pensar com clareza

Torne concreto: divida a ideia vaga em passos que a IA possa executar, defina o que significa «pronto» para cada passo e mantenha uma verificação humana onde houver dinheiro, privacidade ou dados de usuários. Essa é toda a linha entre entender o vibe coding e publicar algo confiável.

