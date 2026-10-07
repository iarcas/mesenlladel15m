export const LOCALES = ["ca", "es", "en"];

export const nav = {
  ca: { vis: "Visualització", about: "Sobre el projecte", contact: "Contactar" },
  es: { vis: "Visualización", about: "Sobre el proyecto", contact: "Contactar" },
  en: { vis: "Visualization", about: "About this project", contact: "Contact" },
};

export const langSwitch = { ca: "CA", es: "ES", en: "EN" };

export const madeWith = {
  ca: "Fet amb AMOR a Amsterdam el 2012, renascut a Londres el 2026",
  es: "Hecho con AMOR en Ámsterdam en 2012, renacido en Londres en 2026",
  en: "Made with LOVE in Amsterdam in 2012, reborn in London in 2026",
};

export const pages = {
  about: {
    ca: {
      title: "Sobre el projecte",
      html: `
<p>Aquest projecte va ser el meu Treball de Fi de Grau a ESDi (Escola Superior de Disseny), tutoritzat per Victoria Sacco i presentat el setembre de 2012.</p>
<p>Partia de la hipòtesi: <b>Twitter (avui X) és més que una plataforma de microblogging; és una eina d'apoderament social que exerceix un paper important en esdeveniments socials com el Moviment #15M</b>.</p>
<p>En aquells anys es van poder observar diverses accions col·lectives protagonitzades per les <em>multituds intel·ligents</em>, que feien servir Twitter com a canal per organitzar-se i manifestar-se.</p>
<p>El Moviment #15M va ser un moviment social que va consistir en una sèrie de mobilitzacions ciutadanes pacífiques, sorgides sobretot a Twitter. Davant la dificultat de seguir en directe la quantitat de <em>tweets</em> generats amb les eines d'aquella xarxa, aquest projecte va proposar utilitzar els missatges enviats a Twitter per construir una història més enllà dels mitjans de comunicació tradicionals.</p>
<p><b>Més enllà dels Trending Topics: una visualització sonoritzada sobre el #15M</b> va consistir en la creació d'una plataforma visual i sonora online capaç de llegir els <em>tweets</em> que milers d'usuaris van enviar durant el primer mes d'aquest moviment (corresponent al període de les acampades) i donar com a resultat una narració col·lectiva.</p>

<h3>El moment actual</h3>
<p>Aquesta pàgina s'ha reconstruït l'octubre de 2026, coincidint amb una nova onada d'acampades i mobilitzacions a la Puerta del Sol de Madrid que recorden, quinze anys després, l'esperit del #15M original. Tant de bo aquest arxiu serveixi per recordar que aquestes mobilitzacions no són fets aïllats, sinó capítols d'una mateixa conversa col·lectiva que continua oberta.</p>

<h3>El codi</h3>
<p>La versió original (2012) es va fer amb <a href="https://processing.org" target="_blank" rel="noopener">Processing</a> (mode Java), empaquetada com a applet. Els applets de Java van quedar fora de suport a tots els navegadors cap al 2015-2017, de manera que aquella versió ja no es podia executar. El 2026 s'ha reconstruït la visualització amb JavaScript i canvas natiu del navegador, seguint la mateixa lògica de l'original, perquè torni a funcionar a qualsevol navegador modern i sigui responsiva.</p>
<p>A més de fer-la funcionar de nou, he aprofitat per millorar-la. La interfície ara s'adapta a qualsevol pantalla, els tweets es poden fixar amb un clic per llegir-los amb calma, i el so s'activa o se silencia amb un interruptor visual clar. També he recuperat, sempre que ha estat possible, les fotos, vídeos i notícies originals enllaçats als tweets (molts enllaços de 2011 ja no existeixen, però els que encara hi són ara es poden veure sense sortir de la pàgina). Res d'això hauria estat possible en tan poc temps sense eines d'intel·ligència artificial com Claude (Anthropic), que han fet possible adaptar tot el projecte a les tecnologies actuals. El 2026 torno a aquest projecte amb més experiència i coneixements dels que tenia el 2012, i m'ha fet molta il·lusió poder deixar-lo millor del que el vaig deixar aleshores.</p>
<p>Les dades (<em>tweets</em> i usuaris de l'AcampadaBCN, maig-juny 2011) provenen de la mateixa base de dades original, exportada ara com a fitxer estàtic. Ja no hi ha cap connexió a cap servidor extern.</p>
<p>La llicència original es manté: es permet copiar, distribuir, comunicar públicament i fins i tot fer un ús comercial de l'obra, sempre que es mantingui aquesta llicència i el reconeixement de l'autoria.</p>
<p>El codi d'aquesta reconstrucció de 2026 és obert i el pots consultar a <a href="https://github.com/iarcas/mesenlladel15m" target="_blank" rel="noopener">GitHub</a>.</p>
<p><a href="../downloads/memoria_teorica.pdf" target="_blank">Memòria teòrica (2012)</a> · <a href="../downloads/memoria_tecnica.pdf" target="_blank">Memòria tècnica (2012)</a></p>

<h3>Agraïments</h3>
<p>El desenvolupament d'aquest projecte no hauria estat possible sense el suport de moltes persones. De manera <b>especial</b> vull agrair a <b>Victoria Sacco</b>, per tutoritzar el projecte i per creure sempre en mi; <b><a href="http://www.albertmeronyo.org/" target="_blank" rel="noopener">Albert Meroño</a></b>, per ajudar-me tècnicament a aconseguir els <em>tweets</em> i les imatges dels usuaris; <b><a href="http://flic.kr/p/9MhsHs" target="_blank" rel="noopener">Julien Lagarde</a></b>, autor de la imatge de la capçalera; i al <b><a href="https://discourse.processing.org/" target="_blank" rel="noopener">Fòrum de Processing</a></b>, per acollir-me com a una programadora més.</p>
<p>Per descomptat, també als meus <b>amics</b> i <b>amigues</b>, a la meva <b>parella</b> i, sobretot, a la meva <b>família</b>, per no deixar mai de recolzar-me tot i estar lluny d'ells.</p>`,
    },
    es: {
      title: "Sobre el proyecto",
      html: `
<p>Este proyecto fue mi Trabajo de Fin de Grado en ESDi (Escola Superior de Disseny), tutorizado por Victoria Sacco y presentado en septiembre de 2012.</p>
<p>Partía de la hipótesis: <b>Twitter (hoy X) es más que una plataforma de microblogging; es una herramienta de empoderamiento social que ejerce un papel importante en acontecimientos sociales como el Movimiento #15M</b>.</p>
<p>En aquellos años se pudieron observar diversas acciones colectivas protagonizadas por las <em>multitudes inteligentes</em>, que usaban Twitter como canal para organizarse y manifestarse.</p>
<p>El Movimiento #15M fue un movimiento social que consistió en una serie de movilizaciones ciudadanas pacíficas, surgidas sobre todo en Twitter. Frente a la dificultad de seguir en directo la cantidad de <em>tweets</em> generados con las herramientas de aquella red, este proyecto propuso utilizar los mensajes enviados a Twitter para construir una historia más allá de los medios de comunicación tradicionales.</p>
<p><b>Más allá de los Trending Topics: una visualización sonorizada sobre el #15M</b> consistió en la creación de una plataforma visual y sonora online capaz de leer los <em>tweets</em> que miles de usuarios enviaron durante el primer mes de este movimiento (correspondiente al período de las acampadas) y dar como resultado una narración colectiva.</p>

<h3>El momento actual</h3>
<p>Esta página se ha reconstruido en octubre de 2026, coincidiendo con una nueva ola de acampadas y movilizaciones en la Puerta del Sol de Madrid que recuerdan, quince años después, el espíritu del #15M original. Ojalá este archivo sirva para recordar que estas movilizaciones no son hechos aislados, sino capítulos de una misma conversación colectiva que sigue abierta.</p>

<h3>El código</h3>
<p>La versión original (2012) se hizo con <a href="https://processing.org" target="_blank" rel="noopener">Processing</a> (modo Java), empaquetada como applet. Los applets de Java quedaron sin soporte en todos los navegadores hacia 2015-2017, por lo que aquella versión dejó de poder ejecutarse. En 2026 se ha reconstruido la visualización con JavaScript y canvas nativo del navegador, siguiendo la misma lógica del original, para que vuelva a funcionar en cualquier navegador moderno y sea responsiva.</p>
<p>Además de hacerla funcionar de nuevo, he aprovechado para mejorarla. La interfaz ahora se adapta a cualquier pantalla, los tweets se pueden fijar con un clic para leerlos con calma, y el sonido se activa o silencia con un interruptor visual claro. También he recuperado, siempre que ha sido posible, las fotos, vídeos y noticias originales enlazados en los tweets (muchos enlaces de 2011 ya no existen, pero los que todavía están ahora se pueden ver sin salir de la página). Nada de esto habría sido posible en tan poco tiempo sin herramientas de inteligencia artificial como Claude (Anthropic), que han hecho posible adaptar todo el proyecto a las tecnologías actuales. En 2026 vuelvo a este proyecto con más experiencia y conocimientos de los que tenía en 2012, y me ha hecho mucha ilusión poder dejarlo mejor de como lo dejé entonces.</p>
<p>Los datos (<em>tweets</em> y usuarios de la AcampadaBCN, mayo-junio de 2011) provienen de la misma base de datos original, exportada ahora como fichero estático. Ya no hay ninguna conexión a ningún servidor externo.</p>
<p>Se mantiene la licencia original: se permite copiar, distribuir, comunicar públicamente e incluso hacer un uso comercial de la obra, siempre que se mantenga esta licencia y el reconocimiento de la autoría.</p>
<p>El código de esta reconstrucción de 2026 es abierto y puedes consultarlo en <a href="https://github.com/iarcas/mesenlladel15m" target="_blank" rel="noopener">GitHub</a>.</p>
<p><a href="../downloads/memoria_teorica.pdf" target="_blank">Memoria teórica (2012, en catalán)</a> · <a href="../downloads/memoria_tecnica.pdf" target="_blank">Memoria técnica (2012, en catalán)</a></p>

<h3>Agradecimientos</h3>
<p>El desarrollo de este proyecto no hubiera sido posible sin el apoyo de muchas personas. De manera <b>especial</b> quiero agradecer a <b>Victoria Sacco</b>, por tutorizar el proyecto y por creer siempre en mí; <b><a href="http://www.albertmeronyo.org/" target="_blank" rel="noopener">Albert Meroño</a></b>, por ayudarme técnicamente a conseguir los <em>tweets</em> y las imágenes de los usuarios; <b><a href="http://flic.kr/p/9MhsHs" target="_blank" rel="noopener">Julien Lagarde</a></b>, autor de la imagen de la cabecera; y al <b><a href="https://discourse.processing.org/" target="_blank" rel="noopener">Foro de Processing</a></b>, por acogerme como una programadora más.</p>
<p>Por descontado, también a mis <b>amigos</b> y <b>amigas</b>, a mi <b>pareja</b> y, sobre todo, a mi <b>familia</b>, por no dejar nunca de apoyarme aun estando lejos de ellos.</p>`,
    },
    en: {
      title: "About this project",
      html: `
<p>This project was my final degree project at ESDi (Escola Superior de Disseny), supervised by Victoria Sacco and presented in September 2012.</p>
<p>It started with the following hypothesis: <b>Twitter (now X) is more than a microblogging platform; it is a social empowerment tool that plays an important role in social movements like the #15M Movement</b>.</p>
<p>In those years, <em>smart mobs</em> were responsible for different collective actions, using Twitter to organize and demonstrate.</p>
<p>The #15M Movement was a social movement consisting of peaceful citizen mobilizations that arose mostly on Twitter. Facing the difficulty of following in real time the number of <em>tweets</em> generated with that network's tools, this project proposed using the messages sent to Twitter to build a story beyond traditional media.</p>
<p><b>Beyond Trending Topics: a sonified visualization about #15M</b> consisted of an online visual and audible platform able to read the <em>tweets</em> that thousands of users sent during the first month of this movement (the camping period), resulting in a collective narration.</p>

<h3>The present moment</h3>
<p>This page was rebuilt in October 2026, coinciding with a new wave of encampments and demonstrations in Madrid's Puerta del Sol that echo, fifteen years on, the spirit of the original #15M. Hopefully this archive is a reminder that these mobilizations aren't isolated events, but chapters in the same ongoing collective conversation.</p>

<h3>The code</h3>
<p>The original version (2012) was built with <a href="https://processing.org" target="_blank" rel="noopener">Processing</a> (Java mode), packaged as a Java applet. Java applets lost browser support everywhere around 2015-2017, so that version stopped running. In 2026 the visualization was rebuilt with JavaScript and the browser's native canvas, following the same logic as the original, so it runs again in any modern browser and is responsive.</p>
<p>Beyond making it work again, I took the chance to improve it. The interface now adapts to any screen, tweets can be pinned in place with a click so you can read them at your own pace, and sound can be turned on or off with a clear visual switch. I also recovered, wherever it was still possible, the original photos, videos and news articles linked from the tweets (many 2011 links are gone for good, but the ones that survive can now be seen without leaving the page). None of this would have been possible in so little time without AI tools like Claude (Anthropic), which made it possible to adapt the whole project to today's technologies. Coming back to this project in 2026, with more experience and knowledge than I had in 2012, I was glad to be able to leave it better than I found it.</p>
<p>The data (tweets and users from AcampadaBCN, May-June 2011) comes from the same original database, now exported as a static file. There is no connection to any external server anymore.</p>
<p>The original license still applies: copying, distributing, publicly communicating and even commercial use of the work is allowed, as long as this license and authorship credit are kept.</p>
<p>The code for this 2026 rebuild is open and you can check it out on <a href="https://github.com/iarcas/mesenlladel15m" target="_blank" rel="noopener">GitHub</a>.</p>
<p><a href="../downloads/memoria_teorica.pdf" target="_blank">Theoretical report (2012, Catalan)</a> · <a href="../downloads/memoria_tecnica.pdf" target="_blank">Technical report (2012, Catalan)</a></p>

<h3>Acknowledgements</h3>
<p>The development of this project would not have been possible without the support of many people. I want to express my special <b>gratitude</b> to <b>Victoria Sacco</b>, for supervising the project and for always believing in me; <b><a href="http://www.albertmeronyo.org/" target="_blank" rel="noopener">Albert Meroño</a></b>, for the technical support in getting the tweets and user images; <b><a href="http://flic.kr/p/9MhsHs" target="_blank" rel="noopener">Julien Lagarde</a></b>, author of the header image; and the <b><a href="https://discourse.processing.org/" target="_blank" rel="noopener">Processing forum</a></b>, for welcoming me as one more programmer.</p>
<p>Of course, I also want to thank my <b>friends</b>, my <b>partner</b> and, especially, my <b>family</b>, for never stopping supporting me even while being far from them.</p>`,
    },
  },

  contact: {
    ca: {
      title: "Contactar",
      html: `<p>Per qualsevol comentari o problema podeu posar-vos en contacte amb mi a la següent adreça de correu electrònic:</p><p><b>hello@ingridarcas.com</b></p>`,
    },
    es: {
      title: "Contactar",
      html: `<p>Para cualquier comentario o problema puedes ponerte en contacto conmigo en la siguiente dirección de correo electrónico:</p><p><b>hello@ingridarcas.com</b></p>`,
    },
    en: {
      title: "Contact",
      html: `<p>Feel free to contact me if you want to make any comments or suggestions, or if you want to report a problem, at this address:</p><p><b>hello@ingridarcas.com</b></p>`,
    },
  },
};

export const vis = {
  ca: {
    title: "Visualització Sonoritzada del #15M",
    whatIsThis: "Aquesta visualització mostra, dia a dia i hora a hora, els tweets amb #acampadabcn i #tomalacalle enviats durant el període de les acampades del Moviment #15M (maig-juny de 2011).",
    intro: "Passa el cursor (o toca, al mòbil) sobre un tweet per llegir-lo i sentir un fragment sonor; fes-hi clic per fixar-lo i poder interactuar-hi amb calma. Activa el so per viure l'experiència completa:",
    soundLabel: "So",
    muteTooltip: "Silenciar",
    unmuteTooltip: "Activar el so",
    playWithSound: "Visualitza amb so",
    closeTooltip: "Tanca",
    allTweets: "Tots els tweets",
    viewingAll: "Estàs veient tots els tweets",
    viewingDay: (d) => `Estàs veient els tweets del dia ${d}`,
    hint: "Tria un dia (aquí o al mateix gràfic) per veure'l amb més detall, minut a minut",
    months: { "05": "Maig", "06": "Juny" },
    formatFullDate: (day, month) => `${day} de ${{ "05": "maig", "06": "juny" }[month]} de 2011`,
    retweets: (n) => (n === 1 ? "1 retweet" : `${n} retweets`),
    noImage: "Sense foto de perfil desada",
    linkUnavailable: "Aquest enllaç és de 2011 i ja no es pot previsualitzar",
    back: "« Tornar a tots els dies",
    day: "Dia",
    hour: "Hora",
    min: "Min",
    legendTitle: "Llegenda",
    legendAcampada: "Tweets amb #acampadabcn",
    legendTomaLaCalle: "Tweets amb #tomalacalle",
    legendSize: "La mida de cada bombolla indica el nombre de retweets",
  },
  es: {
    title: "Visualización Sonorizada del #15M",
    whatIsThis: "Esta visualización muestra, día a día y hora a hora, los tweets con #acampadabcn y #tomalacalle enviados durante el período de las acampadas del Movimiento #15M (mayo-junio de 2011).",
    intro: "Pasa el cursor (o toca, en móvil) sobre un tweet para leerlo y escuchar un fragmento sonoro; haz clic para fijarlo e interactuar con calma. Activa el sonido para vivir la experiencia completa:",
    soundLabel: "Sonido",
    muteTooltip: "Silenciar",
    unmuteTooltip: "Activar el sonido",
    playWithSound: "Visualiza con sonido",
    closeTooltip: "Cerrar",
    allTweets: "Todos los tweets",
    viewingAll: "Estás viendo todos los tweets",
    viewingDay: (d) => `Estás viendo los tweets del día ${d}`,
    hint: "Elige un día (aquí o en el propio gráfico) para verlo con más detalle, minuto a minuto",
    months: { "05": "Mayo", "06": "Junio" },
    formatFullDate: (day, month) => `${day} de ${{ "05": "mayo", "06": "junio" }[month]} de 2011`,
    retweets: (n) => (n === 1 ? "1 retweet" : `${n} retweets`),
    noImage: "Sin foto de perfil guardada",
    linkUnavailable: "Este enlace es de 2011 y ya no se puede previsualizar",
    back: "« Volver a todos los días",
    day: "Día",
    hour: "Hora",
    min: "Min",
    legendTitle: "Leyenda",
    legendAcampada: "Tweets con #acampadabcn",
    legendTomaLaCalle: "Tweets con #tomalacalle",
    legendSize: "El tamaño de cada burbuja indica el número de retweets",
  },
  en: {
    title: "Sonified Visualization of #15M",
    whatIsThis: "This visualization maps, day by day and hour by hour, the tweets with #acampadabcn and #tomalacalle sent during the camping period of the #15M Movement (May-June 2011).",
    intro: "Hover (or tap, on mobile) a tweet to read it and hear a short sound clip; click it to pin it in place and interact at your own pace. Turn on sound for the full experience:",
    soundLabel: "Sound",
    muteTooltip: "Mute",
    unmuteTooltip: "Unmute",
    playWithSound: "View with sound",
    closeTooltip: "Close",
    allTweets: "All tweets",
    viewingAll: "You're viewing all tweets",
    viewingDay: (d) => `You're viewing tweets from day ${d}`,
    hint: "Pick a day (here or on the chart itself) to see it in more detail, minute by minute",
    months: { "05": "May", "06": "June" },
    formatFullDate: (day, month) => `${{ "05": "May", "06": "June" }[month]} ${day}, 2011`,
    retweets: (n) => (n === 1 ? "1 retweet" : `${n} retweets`),
    noImage: "No saved profile photo",
    linkUnavailable: "This is a 2011 link and can no longer be previewed",
    back: "« Back to all days",
    day: "Day",
    hour: "Hour",
    min: "Min",
    legendTitle: "Legend",
    legendAcampada: "Tweets with #acampadabcn",
    legendTomaLaCalle: "Tweets with #tomalacalle",
    legendSize: "Bubble size reflects the number of retweets",
  },
};
