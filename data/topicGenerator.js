import { parseTopicDescriptor } from "./topicUtils.js";
import { CHAPTERS } from "./chapters.js";

export function generateTopicData(rawTopic = "Allgemeines Wissen") {
  const { chapter, topic } = parseTopicDescriptor(rawTopic);
  const keywords = buildKeywords(topic);

  return {
    chapter,
    topic,
    keywords,
    quiz: buildQuiz(topic, chapter, keywords),
    riddles: buildRiddles(topic, chapter, keywords),
    scenarios: buildScenarios(topic),
    connections: buildConnections(topic, chapter),
    chains: buildChains(topic, chapter)
  };
}

function buildKeywords(topic) {
  const baseWords = topic
    .split(/[^A-Za-zÄÖÜäöüß]+/)
    .map(capitalize)
    .filter(Boolean)
    .filter(word => word.length > 2);

  const extras = [
    "Forschen",
    "Entdecken",
    "Beobachten",
    "Erklären",
    "Fragen",
    "Teamarbeit",
    "Dokumentieren",
    "Anwenden"
  ];

  const set = new Set([...baseWords, ...extras]);
  const keywords = Array.from(set);

  while (keywords.length < 6) {
    keywords.push(extras[keywords.length % extras.length]);
  }

  return keywords.slice(0, 6);
}

function buildQuiz(topic, chapter, keywords = []) {
  const lcTopic = topic.toLowerCase();
  const chapterLabel = chapter || "Sachunterricht";
  const context = buildChapterContext(chapterLabel, topic);
  const primaryKeyword = keywords[0] || capitalize(topic.split(" ")[0] || topic);

  const questions = [];

  questions.push({
    q: `Worum geht es beim Thema "${topic}" im Kapitel "${chapterLabel}"?`,
    a: [
      `Es zeigt dir, wie ${lcTopic} im Kapitel "${chapterLabel}" erforscht und verstanden wird.`,
      "Es ist ein Fantasiethema ohne Bezug zu deinem Unterricht.",
      "Es beschreibt etwas, das nichts mit dem Kapitel zu tun hat.",
      "Es dreht sich nur um Sportarten und Wettbewerbe."
    ],
    correct: 0,
    hint: `Denk daran, warum das Kapitel "${chapterLabel}" dieses Thema behandelt.`
  });

  const chapterOptions = buildOptions(
    `Es gehört zum Kapitel "${chapterLabel}".`,
    context.chapterAlternatives.map(name => `Es gehört zum Kapitel "${name}".`),
    [
      "Es gehört zu keinem Kapitel und steht ganz alleine.",
      "Es ist ein Kapitel über Tiere im Dschungel.",
      "Es ist Teil eines Sport-Handbuchs."
    ]
  );
  questions.push({
    q: `Zu welchem Kapitel zählt das Thema "${topic}"?`,
    a: chapterOptions,
    correct: 0,
    hint: `Schau nach, welches Kapitel du im Menü ausgewählt hast.`
  });

  const partLabel = context.part ? `Teil ${context.part}` : "allgemeinen Bereich";
  const correctPartText = context.part
    ? `Zum ${partLabel} der Klugonauten-Themensammlung.`
    : "Zum allgemeinen Bereich der Klugonauten-Themensammlung.";
  const partOptions = buildOptions(
    correctPartText,
    [
      "Zum Teil A der Sammlung.",
      "Zum Teil B der Sammlung.",
      "Zum Teil C der Sammlung."
    ].filter(option => option !== correctPartText),
    [
      "Zu keinem Teil, weil es nur online existiert.",
      "Zu einer geheimen Zusatzsammlung, die niemand kennt."
    ]
  );
  questions.push({
    q: `Zu welchem Bereich der Klugonauten-Sammlung gehört das Kapitel "${chapterLabel}"?`,
    a: partOptions,
    correct: 0,
    hint: `Merke dir, in welchem Teil (A, B oder C) du das Kapitel gefunden hast.`
  });

  if (context.pages.length) {
    const page = context.pages[0];
    const pageDistractors = buildPageDistractors(page);
    const pageOptions = buildOptions(
      `Auf Seite ${page}.`,
      pageDistractors.map(num => `Auf Seite ${num}.`),
      [
        "Es steht auf keiner Seite, weil es nur im Internet vorkommt.",
        "Auf der Titelseite des Buches.",
        "Auf der Rückseite des Arbeitsblatts."
      ]
    );
    questions.push({
      q: `Auf welcher Seite im Buch findest du Informationen zu "${topic}"?`,
      a: pageOptions,
      correct: 0,
      hint: `Notiere dir die Seitenzahlen, die beim Kapitel "${chapterLabel}" angegeben sind.`
    });
  } else {
    questions.push({
      q: `Wie findest du die passenden Seiten zum Thema "${topic}"?`,
      a: [
        "Du orientierst dich an den Seitenzahlen, die neben dem Kapitel im Inhaltsverzeichnis stehen.",
        "Du schlägst eine zufällige Seite im Buch auf.",
        "Du suchst nur im Internet danach.",
        "Du wartest, bis jemand anderes es dir vorliest."
      ],
      correct: 0,
      hint: `Im Inhaltsverzeichnis stehen die Seiten, auf denen du mehr über das Kapitel erfährst.`
    });
  }

  if (context.otherTopics.length) {
    const otherTopic = context.otherTopics[0];
    const topicDistractors = buildTopicDistractors(otherTopic, context.unrelatedTopics);
    const options = buildOptions(
      otherTopic,
      topicDistractors,
      [
        "Nichts, es gibt keine weiteren Themen.",
        "Ein Thema über etwas ganz anderes."
      ]
    );
    questions.push({
      q: `Welches weitere Thema lernst du im Kapitel "${chapterLabel}" kennen?`,
      a: options,
      correct: 0,
      hint: `Schau dir an, welche anderen Themen neben "${topic}" im Kapitel stehen.`
    });
  } else {
    questions.push({
      q: `Was kannst du tun, wenn du im Kapitel "${chapterLabel}" noch mehr entdecken möchtest?`,
      a: [
        `Du schaust dir auch die anderen Themen des Kapitels an und vergleichst sie mit "${topic}".`,
        "Du ignorierst die weiteren Themen des Kapitels.",
        "Du schließt das Buch sofort wieder.",
        "Du liest nur die Überschrift und hörst auf."
      ],
      correct: 0,
      hint: `Im Kapitel findest du mehrere Themen, die zusammenpassen.`
    });
  }

  const keywordOptions = buildOptions(
    primaryKeyword,
    keywords.slice(1, 4),
    [
      "Schlafen",
      "Vergessen",
      "Wegschauen",
      "Nichtstun"
    ]
  );
  questions.push({
    q: `Welches Stichwort passt besonders gut zu "${topic}"?`,
    a: keywordOptions,
    correct: 0,
    hint: `Denk an Wörter, die dir helfen, ${lcTopic} genauer zu erklären.`
  });

  questions.push({
    q: `Wie kannst du im Alltag mehr über "${topic}" lernen?`,
    a: [
      `Achte auf Situationen, in denen ${lcTopic} eine Rolle spielt, und stelle Fragen.`,
      "Ignoriere jede Information dazu.",
      "Sprich mit niemandem darüber.",
      "Tu so, als gäbe es das Thema nicht."
    ],
    correct: 0,
    hint: `Überlege, wann ${lcTopic} für dich wichtig ist.`
  });

  questions.push({
    q: `Was bringt es dir, Beispiele zu "${topic}" im Kapitel "${chapterLabel}" zu sammeln?`,
    a: [
      `Du erkennst, wie ${lcTopic} in deinem Alltag vorkommt.`,
      "Es lenkt dich nur vom Lernen ab.",
      "Du darfst dann keine Fragen mehr stellen.",
      "Das Thema verwandelt sich in ein Spielzeug."
    ],
    correct: 0,
    hint: `Beispiele helfen dir, ${lcTopic} wirklich zu verstehen.`
  });

  questions.push({
    q: `Wie kannst du mit anderen über "${topic}" ins Gespräch kommen?`,
    a: [
      `Ihr besprecht gemeinsam, was ${lcTopic} im Kapitel "${chapterLabel}" bedeutet.`,
      "Ihr vermeidet das Thema vollständig.",
      "Du behältst alles Wissen nur für dich.",
      "Ihr redet lieber über ein ganz anderes Kapitel."
    ],
    correct: 0,
    hint: `Gemeinsames Lernen macht das Kapitel lebendig.`
  });

  questions.push({
    q: `Was ist dein Ziel, wenn du das Thema "${topic}" genauer untersuchst?`,
    a: [
      `Du möchtest ${lcTopic} so verstehen, dass du es anderen erklären kannst.`,
      "Du willst es geheim halten, damit niemand etwas lernt.",
      `Du willst beweisen, dass das Kapitel "${chapterLabel}" keine Bedeutung hat.`,
      "Du willst nichts Neues entdecken."
    ],
    correct: 0,
    hint: `Im Kapitel "${chapterLabel}" geht es darum, Wissen weiterzugeben.`
  });

  return questions.slice(0, 10);
}

function buildChapterContext(chapter, topic) {
  const normalizedTopic = topic.toLowerCase();
  const chapterAlternatives = new Set();
  const unrelatedTopics = new Set();
  const context = {
    part: null,
    pages: [],
    otherTopics: [],
    chapterAlternatives: [],
    unrelatedTopics: []
  };

  for (const [part, chapters] of Object.entries(CHAPTERS)) {
    for (const [chapterName, entries] of Object.entries(chapters || {})) {
      if (chapterName !== chapter) {
        chapterAlternatives.add(chapterName);
      }
      entries.forEach(entry => {
        const parsed = parseTopicDescriptor(`${chapterName} – ${entry}`);
        if (chapterName === chapter && parsed.topic.toLowerCase() === normalizedTopic) {
          context.part = part;
          context.pages = parsed.pages;
          context.otherTopics = entries
            .filter(other => other !== entry)
            .map(other => parseTopicDescriptor(`${chapterName} – ${other}`).topic);
        } else if (chapterName !== chapter) {
          unrelatedTopics.add(parsed.topic);
        }
      });
      if (!context.part && chapterName === chapter) {
        context.part = part;
      }
    }
  }

  context.chapterAlternatives = Array.from(chapterAlternatives);
  context.unrelatedTopics = Array.from(unrelatedTopics);
  return context;
}

function buildPageDistractors(page) {
  const candidates = new Set();
  const offsets = [1, 2, -1, 3, -2];
  offsets.forEach(offset => {
    const value = page + offset;
    if (value > 0) candidates.add(value);
  });
  return Array.from(candidates).slice(0, 3);
}

function buildTopicDistractors(correctTopic, availableTopics) {
  const distractors = [];
  availableTopics.forEach(name => {
    if (distractors.length >= 3) return;
    if (!name || name === correctTopic || distractors.includes(name)) return;
    distractors.push(name);
  });

  const fallback = [
    "Geheimnisse des Weltalls",
    "Basketball-Taktiken",
    "Rezepte für Kuchen",
    "Abenteuer im Urwald"
  ];

  for (const option of fallback) {
    if (distractors.length >= 3) break;
    if (option !== correctTopic && !distractors.includes(option)) {
      distractors.push(option);
    }
  }

  return distractors.slice(0, 3);
}

function buildOptions(correct, distractors = [], fallback = []) {
  const result = [correct];
  const used = new Set(result);

  distractors.forEach(option => {
    if (result.length >= 4) return;
    if (!option || used.has(option)) return;
    result.push(option);
    used.add(option);
  });

  fallback.forEach(option => {
    if (result.length >= 4) return;
    if (!option || used.has(option)) return;
    result.push(option);
    used.add(option);
  });

  while (result.length < 4) {
    const filler = `Option ${result.length + 1}`;
    if (!used.has(filler)) {
      result.push(filler);
      used.add(filler);
    }
  }

  return result.slice(0, 4);
}

function buildRiddles(topic, chapter, keywords) {
  const lcTopic = topic.toLowerCase();
  const chapterLabel = chapter || "Sachunterricht";
  const firstKeyword = keywords[0] || topic;
  const secondKeyword = keywords[1] || "Forschen";

  return [
    {
      hints: [
        `Ich gehöre zum Thema "${topic}".`,
        `Im Kapitel "${chapterLabel}" lernst du mehr über mich.`,
        `Ich zeige dir, warum ${lcTopic} wichtig ist.`
      ],
      answer: lcTopic
    },
    {
      hints: [
        `Ich bin ein wichtiges Wort, wenn du "${topic}" beschreiben möchtest.`,
        `Mein Anfangsbuchstabe ist "${firstKeyword.charAt(0)}".`,
        `Ich hilft dir, ${lcTopic} besser zu verstehen.`
      ],
      answer: firstKeyword.toLowerCase()
    },
    {
      hints: [
        `Ohne mich würdest du bei "${topic}" weniger entdecken.`,
        `Ich lade dich ein, aktiv zu werden.`,
        `Mein Wort klingt ein bisschen wie "${secondKeyword}".`
      ],
      answer: secondKeyword.toLowerCase()
    }
  ];
}

function buildScenarios(topic) {
  const lcTopic = topic.toLowerCase();
  return [
    {
      question: `Was passiert, wenn du neugierig Fragen zu "${topic}" stellst?`,
      answers: [
        `Du findest neue Informationen über ${lcTopic}.`,
        "Nichts, denn Fragen sind verboten.",
        "Alles Wissen verschwindet.",
        "Das Thema wird plötzlich zu Musik."
      ],
      correct: 0,
      explanation: `Fragen helfen dir, ${lcTopic} Schritt für Schritt zu verstehen.`
    },
    {
      question: `Was passiert, wenn du dein Wissen über "${topic}" mit anderen teilst?`,
      answers: [
        `Ihr lernt gemeinsam und könnt ${lcTopic} besser erklären.`,
        "Alle vergessen sofort alles.",
        "Es entsteht ein Sturm im Klassenzimmer.",
        "Das Thema wird dadurch unsichtbar."
      ],
      correct: 0,
      explanation: `Gemeinsames Lernen macht ${lcTopic} für alle klarer.`
    },
    {
      question: `Was passiert, wenn du Beispiele für "${topic}" suchst?`,
      answers: [
        `Du erkennst ${lcTopic} auch in deinem Alltag.`,
        "Es ist Zeitverschwendung.",
        "Das Thema verwandelt sich in ein Spielzeug.",
        "Du darfst nichts mehr fragen."
      ],
      correct: 0,
      explanation: `Beispiele zeigen dir, wie ${lcTopic} wirklich funktioniert.`
    }
  ];
}

function buildConnections(topic, chapter) {
  const lcTopic = topic.toLowerCase();
  const chapterLabel = chapter || "Sachunterricht";
  return [
    { left: topic, right: `ist ein Schwerpunkt im Kapitel "${chapterLabel}".` },
    { left: "Fragen stellen", right: `hilft dir, ${lcTopic} genauer zu verstehen.` },
    { left: "Beobachten", right: `zeigt dir Beispiele für ${lcTopic}.` },
    { left: "Notizen machen", right: `sammelt deine Ideen zu ${lcTopic}.` },
    { left: "Teilen", right: `lässt andere an deinem Wissen über ${lcTopic} teilhaben.` }
  ];
}

function buildChains(topic, chapter) {
  const lcTopic = topic.toLowerCase();
  const chapterLabel = chapter || "Sachunterricht";
  return [
    {
      title: `Entdeckungsreise zu ${topic}`,
      steps: [
        `Du stellst eine Frage zu ${lcTopic}.`,
        `Du sammelst Informationen im Kapitel "${chapterLabel}".`,
        `Du ordnest deine Beobachtungen zu ${lcTopic}.`,
        `Du erklärst ${lcTopic} mit eigenen Worten.`
      ]
    },
    {
      title: `Anwendung von ${topic}`,
      steps: [
        `Du suchst ein Beispiel aus deinem Alltag.`,
        `Du prüfst, wie ${lcTopic} dort vorkommt.`,
        `Du besprichst deine Erkenntnisse mit anderen.`,
        `Ihr überlegt gemeinsam neue Ideen zu ${lcTopic}.`
      ]
    }
  ];
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
