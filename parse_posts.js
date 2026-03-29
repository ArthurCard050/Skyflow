const fs = require('fs');

const rawText = `01/04 - Terça-feira	Reels	Apetite Appeal	POV: câmera lenta do açaí sendo servido, calda escorregando, frutas caindo sobre o copo. Fundo clean bege, iluminação quente.	"Você não está com fome. Você está com saudade do que ainda não provou. 🍇\n\n[Trilha: beat viral trending]"	👇 Salva esse vídeo e manda pra quem você quer trazer no Vila Carioca!
02/04 - Quarta-feira	Story	Interativo	Enquete animada: 'Qual é o seu combo favorito?' com sticker de poll. Fundo roxo da marca, tipografia clean.	"Enquete: 🍓 Morango + Granola  VS  🍫 Chocolate + Leite Ninho\n\nDiz aí, qual time você é?"	Vote e veja o resultado amanhã nos Stories!
03/04 - Quinta-feira	Carrossel	Apetite Appeal	Slide 1: foto hero do açaí mais vendido. Slides seguintes: close em cada complemento (granola, leite ninho, frutas). Última slide: nome + preço.	"Slide 1: O açaí perfeito não exis... 👀\nSlides: [detalhe de cada complemento com legenda curta]\nÚltimo: Este aqui. Tem nome e tem preço. 🍇"	📍 Salva esse carrossel e já sabe o que pedir na próxima visita!
04/04 - Sexta-feira	Reels	Trend/Humor	Trend: 'Isso ou Aquilo' — edição rápida com cortes entre duas opções de açaí com texto na tela. Humor leve e atual.	"[Texto na tela]\nPedido pequeno: R$ XX\nPedido grande: R$ XX\n\nVocê: *pede o grande de qualquer jeito* 😂\n\nSe reconheceu, a culpa é do açaí."	Marca aqui o amigo que sempre faz isso 👇
05/04 - Sábado	Estático	Comercial	Flat lay impecável do copo do açaí premium sobre superfície de madeira clara. Luz natural suave. Sem excesso de elementos gráficos.	Sábado pede um açaí na medida certa. E a medida certa tem nome: [Nome do produto]. 🍇✨	Peça pelo iFood ou nos chama no Direct! Link na bio. 🔗
06/04 - Domingo	Story	Bastidores	Vídeo rápido (15s) mostrando a montagem do açaí: etapas de preparo, complementos sendo adicionados. Sem texto, só o visual falando.	"[Sem narração] — Música: beat chill trending\n\nSticker de quiz: 'Você saberia montar igual?'"	Responde o quiz e vê se você é craque da montagem! 🏆
07/04 - Segunda-feira	Carrossel	Interativo	Carrossel educativo e divertido: 'Os 5 erros que você comete ao pedir açaí'. Design clean, ícones simples, cores da marca.	"Slide 1: Para tudo. Você está cometendo esses erros no seu pedido? 🚨\nSlides: [cada erro com humor e dica]\nÚltimo: Agora você sabe. Vem certo da próxima vez. 😅"	Salva e manda pro seu amigo que sempre erra o pedido 😂👇
08/04 - Terça-feira	Reels	Apetite Appeal	Close macro em câmera lenta da calda de chocolate escorrendo sobre o açaí. Iluminação controlada para destacar brilho e textura.	"[Sem fala, só texto na tela]\n\n'Chocolate + Açaí = combinação que não precisa de explicação'\n\n🍫🍇"	Quem é de chocolate aqui? Comenta abaixo 👇
09/04 - Quarta-feira	Story	Comercial	Stories sequenciais: Produto 1, Produto 2, Produto 3 com preço e CTA. Design com fundo escuro e produto em destaque total.	"Story 1: Bora escolher o seu? 👀\nStory 2-4: [foto + nome + preço de cada produto]\nStory 5: Qual vai ser hoje?"	Sticker de link: Pedir agora 🛵
10/04 - Quinta-feira	Estático	Apetite Appeal	Foto do açaí com granola artesanal. Fundo neutro bege/creme. Composição centralizada, sem texto na imagem.	Granola crocante, açaí cremoso. A combinação que você não sabia que precisava — até o primeiro gosto. 😌🍇	Qual complemento você nunca abre mão? Comenta aqui! 👇
11/04 - Sexta-feira	Reels	Trend/Humor	Trend: 'POV: você só veio tomar um açaí pequenininho' — edição com cortes rápidos mostrando o copo grande na mão no final. Legenda irônica.	"[Texto progressivo na tela]\nPOV: Veio pedir o pequeno...\n...acabou pedindo o grande\n...com todos os complementos\n...e não se arrependeu. 🤷‍♀️"	Marca alguém que se identifica MUITO com esse vídeo 👇
12/04 - Sábado	Carrossel	Apetite Appeal	Carrossel 'antes e depois': Slide 1 açaí sem complementos, slides seguintes o mesmo açaí montado com cada adição. Visual de transformação.	"Slide 1: Um açaí simples pode ser bom.\nSlides: Mas com os complementos certos...\nÚltimo: Ele vira uma obra de arte. 🎨🍇"	Qual complemento você adicionaria? Comenta abaixo!
13/04 - Domingo	Story	Interativo	Caixinha de perguntas sobre preferências de açaí. Fundo com gradient roxo da marca. Tipografia limpa e moderna.	"Caixinha: 'Conta pra gente — qual é o seu açaí dos sonhos? Monta pra nós aqui! 💬'\n\n[Responder nos próximos Stories]"	Manda a sua montagem ideal e a gente pode criar pra você! 🍇
14/04 - Segunda-feira	Reels	Bastidores	Bastidores do preparo: vídeo de 15-30s mostrando o açaí sendo preparado desde a base até o toque final. Câmera overhead ou lateral limpa.	"[Narração ou texto]\n'Cada copo é feito com atenção. Do açaí à última fruta. Isso é o Vila Carioca.' ✨"	Salva e lembra de pedir o próximo com todo carinho que ele merece 🍇
15/04 - Terça-feira	Estático	Comercial	Layout clean com o produto do dia em destaque total. Tipografia mínima com nome e chamada. Fundo branco ou textura neutra.	"Hoje o destaque é [Nome do Produto]. Cremoso, generoso e do jeito que você merece. 🍇\n\nDisponível agora!"	Vem buscar ou pede pelo iFood! Link na bio 🔗
16/04 - Quarta-feira	Carrossel	Trend/Humor	Carrossel estilo 'red flags de pedir açaí em outro lugar'. Humor inteligente e atual. Cards com design clean e copy afiada.	"Slide 1: Red flags que você ignora quando pede açaí em outro lugar 🚩\nSlides: [red flags com humor]\nÚltimo: No Vila Carioca, zero red flags. Só açaí de verdade. 💜"	Marca alguém que já caiu em alguma dessas 😂👇
17/04 - Quinta-feira	Reels	Apetite Appeal	Vídeo estático + transição: zoom lento no copo do açaí, câmera afastando para revelar o ambiente gostoso onde está sendo consumido.	"[Trilha chill/emocional]\n\nTexto: 'Esse momento é seu. Aproveita.' 🍇✨"	Marca quem você quer trazer pro Vila Carioca agora 👇
18/04 - Sexta-feira	Story	Interativo	Poll de fim de semana: 'O que você vai fazer esse final de semana?' com opções incluindo açaí como resposta óbvia. Tom bem-humorado.	"Story: O que tá nos planos esse final de semana?\n☑️ Praia + Açaí\n☑️ Série + Açaí\n☑️ Rolê + Açaí\n☑️ Só Açaí mesmo"	Responde aí e já vem! A gente tá esperando 🍇
19/04 - Sábado	Reels	Comercial	Vídeo estilo 'unboxing' do pedido: câmera abrindo o copo, revelando os complementos, primeira colherada. Apresentação premium e desejável.	"[Texto na tela]\n'Você merecia algo especial hoje. Aqui está.' 🎁🍇\n\n[Nome do produto + preço aparece no final]"	Pede o seu agora — link na bio ou iFood! 🛵
20/04 - Domingo	Estático	Apetite Appeal	Flat lay domingo: açaí + fruta vermelha fresca ao redor do copo. Iluminação natural. Composição artística e limpa.	"Domingo sem açaí é domingo incompleto. 🍇☀️\n\nA gente tá aqui pra resolver isso."	Que horas você vem? Comenta aí! 👇
21/04 - Segunda-feira	Story	Bastidores	Série de Stories de bastidores do dia: chegada dos ingredientes frescos, preparação da loja, equipe começando o dia. Autêntico e humanizado.	"Story 1: Segunda já começou aqui no Vila Carioca! ☕🍇\nStory 2: Ingredientes frescos chegando...\nStory 3: A gente tá pronto. E você?"	Vem nos visitar hoje! 📍 [endereço ou link]
22/04 - Terça-feira	Carrossel	Interativo	Quiz interativo: 'Descubra qual açaí do Vila Carioca combina com você'. Cada slide é uma pergunta/resposta. Final revela o 'açaí da sua personalidade'.	"Slide 1: Qual açaí do Vila Carioca é o seu? Responde e descobre! 🍇\nSlides: [perguntas de personalidade divertidas]\nÚltimo: Seu açaí é o [Nome] — vem provar!"	Comenta aqui qual açaí deu pra você! 👇
23/04 - Quarta-feira	Reels	Trend/Humor	Trend atual adaptada: 'Coisas que minha carteira diz vs o que meu coração quer' — corte rápido com o açaí como resposta do coração.	"[Texto]\nCarteira: Não gasta...\nCoração: [foto do açaí aparece]\n\nO coração sempre ganha. 💜🍇"	Quem mais perde essa batalha todo dia? Marca alguém igual 😂👇
24/04 - Quinta-feira	Estático	Apetite Appeal	Close perfeito em câmera: açaí cremoso com Leite Ninho polvilhado. Profundidade de campo rasa, fundo desfocado clean.	Leite Ninho + Açaí = o duo que nunca erra. Alguma dúvida? 🥛🍇	Você é time Leite Ninho? Comenta aqui! 👇
25/04 - Sexta-feira	Reels	Apetite Appeal	Vídeo de montagem rápida do açaí com efeito de câmera rápida: cada complemento sendo adicionado em sequência. Beat ritmado sincronizado.	"[Texto surgindo em sincronia com os cortes]\nAçaí. Granola. Morango. Leite Ninho. Calda.\n\nPerfeição tem receita. 🍇✨"	Salva pra lembrar do que pedir da próxima vez! 👇
26/04 - Sábado	Carrossel	Comercial	Cardápio visual premium: cada slide apresenta um produto com foto hero, nome, descrição curta e preço. Design clean com identidade visual.	"Slide 1: Chegou a hora de escolher o seu 👀\nSlides: [produto por produto]\nÚltimo: Qual foi o seu favorito? 🍇"	Pede pelo iFood ou nos chama no Direct! Link na bio 🔗
27/04 - Domingo	Story	Interativo	Votação semanal nos Stories: 'Qual novo sabor você gostaria de ver?' com opções e enquete. Fomenta sugestão e participação.	"Você manda, a gente escuta! 👂\nQual sabor novo você quer ver no cardápio?\n[Opção A] vs [Opção B] vs [Opção C]"	Vote agora e influencia o próximo lançamento! 🗳️
28/04 - Segunda-feira	Reels	Bastidores	Segunda-feira motivacional: vídeo curto mostrando equipe na abertura da loja, sorrindo, preparando tudo. Trilha animada e positiva.	"[Texto]\n'Segunda não precisa ser difícil quando termina com açaí. 🍇'\n\nA equipe Vila Carioca já tá de plantão pra você!"	Vem começar a semana com a gente! 📍
29/04 - Terça-feira	Estático	Trend/Humor	Meme visual adaptado: layout clean com a identidade da marca aplicado em formato de meme atual. Humor inteligente sobre o vício em açaí.	"Pessoas normais: tomam açaí de vez em quando.\nNós e nossos clientes: [foto do copo na mão todos os dias] 😂🍇"	Tá falando de você? Marca um cúmplice aqui 👇
30/04 - Quarta-feira	Carrossel	Apetite Appeal	Carrossel de encerramento de abril: 'O melhor mês em fotos'. Compilação das melhores imagens do mês com copy emocional e conexão com a comunidade.	"Slide 1: Abril foi assim com vocês. 🍇💜\nSlides: [melhores fotos/vídeos do mês]\nÚltimo: Maio vem com muito mais. Tamo junto!"	Salva essa memória e já marca de voltar em maio! 💜`;

let postId = 100;
const posts = [];

const rows = rawText.split('\\n');

rows.forEach(row => {
  const parts = row.split('\\t');
  if (parts.length < 5) return;
  
  const dateStr = parts[0].trim().split(' - ')[0]; // "01/04"
  const day = dateStr.split('/')[0];
  const dateObj = "2025-04-" + day;
  
  const format = parts[1].trim(); 
  const pillar = parts[2].trim();
  const visual = parts[3].trim();
  const copyRaw = parts[4].trim();
  const cta = parts.length > 5 ? parts[5].trim() : '';

  let platform = 'Instagram'; 
  if (format === 'Reels') platform = 'Instagram';
  if (format === 'Story') platform = 'Instagram';
  
  const copy = copyRaw.replace(/^"|"$/g, '').trim() + "\\n\\n" + cta;

  posts.push({
    id: postId.toString(),
    clientId: '4', 
    batchId: 'b4',
    imageUrl: "https://picsum.photos/seed/acai" + postId + "/800/800",
    caption: copy,
    status: 'copy_production',
    date: dateObj,
    platform: platform,
    title: format + " | " + pillar,
    version: 1,
    commentsCount: 0,
    createdAt: '2025-03-29T10:00:00Z',
    createdBy: 'Equipe SkyFlow',
    history: [
      { id: "h_" + postId, type: 'created', user: 'Equipe SkyFlow', timestamp: '2025-03-29T10:00:00Z' }
    ]
  });
  postId++;
});

let out = "export const VILA_CARIOCA_POSTS: Post[] = " + JSON.stringify(posts, null, 2).replace(/"([^"]+)":/g, '$1:') + ";";
fs.writeFileSync('H:\\\\Job\\\\SkyFlow\\\\posts_generated.js', out);
console.log('Generated ' + posts.length + ' posts');
