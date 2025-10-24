import { parseTopicDescriptor } from "./topicUtils.js";

export function generateTopicData(rawTopic = "Allgemeines Wissen") {
  const { chapter, topic } = parseTopicDescriptor(rawTopic);
  const keywords = buildKeywords(topic);

  return {
    chapter,
    topic,
    keywords,
    quiz: buildQuiz(topic, chapter),
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

function buildQuiz(topic, chapter) {
  const lcTopic = topic.toLowerCase();
  const chapterLabel = chapter || "Sachunterricht";
  return [
    {
      q: `Was beschreibt das Thema "${topic}" am besten?`,
      a: [
        `${topic} gehört zum Kapitel "${chapterLabel}" und hilft dir, Neues zu entdecken.`,
        "Es ist nur eine Fantasiegeschichte ohne Bezug zur Wirklichkeit.",
        "Es hat nichts mit dem Unterricht zu tun.",
        "Es ist ein Sport, der nichts erklärt."
      ],
      correct: 0,
      hint: `Überlege, warum wir ${lcTopic} im Kapitel ${chapterLabel} besprechen.`
    },
    {
      q: `Wie kannst du im Alltag mehr über "${topic}" lernen?`,
      a: [
        `Achte auf Situationen, in denen ${lcTopic} eine Rolle spielt, und stelle Fragen.`,
        "Ignoriere jede Information dazu.",
        "Sprich mit niemandem darüber.",
        "Tue so, als gäbe es das Thema nicht."
      ],
      correct: 0,
      hint: `Denk daran, wann ${lcTopic} für dich wichtig ist.`
    },
    {
      q: `Warum ist das Thema "${topic}" wichtig für dich?`,
      a: [
        `Es hilft dir, die Welt zu verstehen und ${lcTopic} zu erkennen.`,
        "Nur weil es lustig klingt.",
        "Weil es gar nichts mit dir zu tun hat.",
        "Weil es ein Geheimnis bleiben soll."
      ],
      correct: 0,
      hint: `Welche neuen Ideen bekommst du, wenn du über ${lcTopic} nachdenkst?`
    }
  ];
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
