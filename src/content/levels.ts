import type { LevelId } from "./schema";

export type QuestionKind = "choice" | "select" | "text";

export type PartSpec = {
  part: 1 | 2 | 3 | 4;
  focus: string;
  task: string;
  questions: number;
  kind: QuestionKind;
  /** Number of options shared across the part for "select" questions. */
  selectOptions?: number;
};

export type WritingSpec = {
  task: 1 | 2;
  focus: string;
  minWords: number;
  maxWords: number;
  register: "formal" | "informal";
};

export type SpeakingSpec = {
  totalMinutes: number;
  partMinutes: [number, number, number, number];
  longTurnSeconds: number;
};

export type LevelSpec = {
  id: LevelId;
  cefr: string;
  name: string;
  listeningMinutes: number;
  readingWritingMinutes: number;
  listening: PartSpec[];
  reading: PartSpec[];
  writing: [WritingSpec, WritingSpec];
  speaking: SpeakingSpec;
};

export const WRITTEN_MAX = 150;
export const WRITTEN_PASS = 75;
export const WRITTEN_HIGH_PASS = 101;
export const SPOKEN_MAX = 50;
export const SPOKEN_PASS = 25;
export const SPOKEN_HIGH_PASS = 38;

export const LEVELS: LevelSpec[] = [
  {
    id: "a1",
    cefr: "A1",
    name: "Preliminary",
    listeningMinutes: 20,
    readingWritingMinutes: 80,
    listening: [
      { part: 1, focus: "Recognise simple key information in short statements", task: "Listen to 7 short statements. For each, choose the option (a letter, word, number or simple description) that matches what you hear.", questions: 7, kind: "choice" },
      { part: 2, focus: "Identify functions in short utterances", task: "Listen to 7 short utterances. Choose the best reply to each one.", questions: 7, kind: "choice" },
      { part: 3, focus: "Identify a specific aspect of a conversation", task: "Listen to 6 short conversations between two speakers. Answer one question about each (topic, purpose, place, speakers or feeling).", questions: 6, kind: "choice" },
      { part: 4, focus: "Extract key information from a dialogue", task: "Listen to one conversation between two speakers. Choose the correct information for each of the 6 headings on a form.", questions: 6, kind: "choice" },
    ],
    reading: [
      { part: 1, focus: "Organisational and lexical features of short texts", task: "Read 6 short texts (sign, note, list, label). Each has one gap. Choose the word that fills it.", questions: 6, kind: "choice" },
      { part: 2, focus: "Structure of a short simple text", task: "A short text has 5 gaps. Choose the right word or phrase for each gap from 6 options. One option is not needed.", questions: 5, kind: "select", selectOptions: 6 },
      { part: 3, focus: "Purpose of texts and specific information", task: "Read 4 short texts (A to D) on a linked theme. Answer 7 questions by choosing which text gives the answer.", questions: 7, kind: "select", selectOptions: 4 },
      { part: 4, focus: "Meaning in short texts", task: "Read 8 very short texts (A to H). Match each of the 8 statements to the right text.", questions: 8, kind: "select", selectOptions: 8 },
    ],
    writing: [
      { task: 1, focus: "Simple sentences about yourself, daily life, people, where you live or what you do", minWords: 25, maxWords: 35, register: "informal" },
      { task: 2, focus: "A short message, card or postcard covering two given functions", minWords: 20, maxWords: 30, register: "informal" },
    ],
    speaking: { totalMinutes: 6, partMinutes: [1.5, 1, 1.5, 2], longTurnSeconds: 30 },
  },
  {
    id: "a2",
    cefr: "A2",
    name: "Access",
    listeningMinutes: 20,
    readingWritingMinutes: 80,
    listening: [
      { part: 1, focus: "Recognise simple key information in short statements", task: "Listen to 7 short statements, each with two pieces of information (numbers, spellings, places, times). Choose the matching option.", questions: 7, kind: "choice" },
      { part: 2, focus: "Identify functions in short utterances", task: "Listen to 7 short utterances. Choose the best reply to each one.", questions: 7, kind: "choice" },
      { part: 3, focus: "Identify a specific aspect of a conversation", task: "Listen to 6 short conversations between two speakers. Answer one question about each (topic, purpose, context, relationship or feeling).", questions: 6, kind: "choice" },
      { part: 4, focus: "Extract key information from a monologue", task: "Listen to a message or announcement. Complete the 6 headings on a message pad with a word, number or short phrase.", questions: 6, kind: "text" },
    ],
    reading: [
      { part: 1, focus: "Coherence and cohesion of short texts", task: "Read 6 short texts (list, label, address, notice). Each has a gap. Choose the option that completes it.", questions: 6, kind: "choice" },
      { part: 2, focus: "Structure of a short simple text", task: "A short text has 6 gaps. Choose the right sentence or phrase for each gap from 7 options. One option is not needed.", questions: 6, kind: "select", selectOptions: 7 },
      { part: 3, focus: "Purpose of texts and specific information", task: "Read 4 short texts (A to D) on a linked theme with different purposes. Answer 7 questions by choosing which text gives the answer.", questions: 7, kind: "select", selectOptions: 4 },
      { part: 4, focus: "Specific information through detailed reading", task: "Read one continuous text (narrative, descriptive or explanatory). Answer 7 multiple choice questions.", questions: 7, kind: "choice" },
    ],
    writing: [
      { task: 1, focus: "An informal reply (email, message or card) answering three questions, suggestions or requests in a given text", minWords: 30, maxWords: 50, register: "informal" },
      { task: 2, focus: "A neutral or formal text (letter, message or note) for a given reader, including three content points", minWords: 30, maxWords: 50, register: "formal" },
    ],
    speaking: { totalMinutes: 9, partMinutes: [2, 2, 2, 3], longTurnSeconds: 60 },
  },
  {
    id: "b1",
    cefr: "B1",
    name: "Achiever",
    listeningMinutes: 30,
    readingWritingMinutes: 130,
    listening: [
      { part: 1, focus: "Context, meaning and function of utterances", task: "Listen to 7 short sentences (statement, explanation, description, instruction or question). Choose the best response to each.", questions: 7, kind: "choice" },
      { part: 2, focus: "Identify a specific aspect of a conversation", task: "Listen to 3 conversations between two speakers. Answer 2 questions about each (topic, purpose, relationship, attitude or opinion).", questions: 6, kind: "choice" },
      { part: 3, focus: "Extract key information from a monologue", task: "Listen to a talk, radio broadcast or presentation. Complete the 7 headings on a message pad with the correct information.", questions: 7, kind: "text" },
      { part: 4, focus: "Follow a discussion between two speakers", task: "Listen to a discussion. Answer 6 multiple choice questions about gist, opinion, purpose, attitude, and cause and effect.", questions: 6, kind: "choice" },
    ],
    reading: [
      { part: 1, focus: "Coherence and cohesion of authentic texts", task: "Read 5 short texts. Each has one gap testing layout, vocabulary or linking words. Choose the option that completes it.", questions: 5, kind: "choice" },
      { part: 2, focus: "How meaning is built up in a text", task: "Six sentences have been removed from a text. Choose the right sentence for each gap from 7 options. One option is not needed.", questions: 6, kind: "select", selectOptions: 7 },
      { part: 3, focus: "Purpose of texts and specific information", task: "Read 4 short texts (A to D) such as an email, article or advert. Answer 7 questions by choosing which text gives the answer.", questions: 7, kind: "select", selectOptions: 4 },
      { part: 4, focus: "Specific information through detailed reading", task: "Read one continuous text. Answer 8 'wh' questions with short answers.", questions: 8, kind: "text" },
    ],
    writing: [
      { task: 1, focus: "A formal response to a letter, poster, timetable or leaflet for a public audience, covering the given content points", minWords: 70, maxWords: 100, register: "formal" },
      { task: 2, focus: "An informal letter to a friend on a topic of personal interest, including two functions (for example invite, describe plans)", minWords: 100, maxWords: 120, register: "informal" },
    ],
    speaking: { totalMinutes: 12, partMinutes: [3, 3, 3, 3], longTurnSeconds: 90 },
  },
  {
    id: "b2",
    cefr: "B2",
    name: "Communicator",
    listeningMinutes: 30,
    readingWritingMinutes: 130,
    listening: [
      { part: 1, focus: "Context, meaning and function in short conversations", task: "Listen to 7 unfinished conversations between two speakers. Choose the best way to complete or continue each one.", questions: 7, kind: "choice" },
      { part: 2, focus: "Identify a specific aspect of a conversation", task: "Listen to 3 conversations between two speakers. Answer 2 questions about each (topic, purpose, relationship, attitude, feeling or opinion).", questions: 6, kind: "choice" },
      { part: 3, focus: "Extract key information from a monologue", task: "Listen to a radio broadcast, narrative or presentation. Write notes for the 7 headings on the message pad.", questions: 7, kind: "text" },
      { part: 4, focus: "Follow a discussion between two speakers", task: "Listen to a discussion. Answer 6 multiple choice questions about gist, fact, opinion, contrast, attitude, and cause and effect.", questions: 6, kind: "choice" },
    ],
    reading: [
      { part: 1, focus: "Understand information, ideas and opinions in detail", task: "Read one long text (news story, article, review or proposal). Answer 6 multiple choice questions.", questions: 6, kind: "choice" },
      { part: 2, focus: "How meaning is built up in a text", task: "Six sentences have been removed from a text. Choose the right sentence for each gap from 7 options. One option is not needed.", questions: 6, kind: "select", selectOptions: 7 },
      { part: 3, focus: "Purpose, specific information and writers' stance", task: "Read 4 texts (A to D) such as an email, article, advert or brochure. Answer 7 questions by choosing which text gives the answer.", questions: 7, kind: "select", selectOptions: 4 },
      { part: 4, focus: "Specific information through detailed reading", task: "Read one continuous text. Answer 7 'wh' questions with short answers.", questions: 7, kind: "text" },
    ],
    writing: [
      { task: 1, focus: "A formal response to a written input for a specified reader, covering all the content points", minWords: 100, maxWords: 150, register: "formal" },
      { task: 2, focus: "An informal letter, story or descriptive composition for a specified reader on a general subject", minWords: 150, maxWords: 200, register: "informal" },
    ],
    speaking: { totalMinutes: 13, partMinutes: [3, 3, 3, 4], longTurnSeconds: 120 },
  },
  {
    id: "c1",
    cefr: "C1",
    name: "Expert",
    listeningMinutes: 30,
    readingWritingMinutes: 160,
    listening: [
      { part: 1, focus: "Context, meaning and function in short conversations", task: "Listen to 6 unfinished conversations with idiomatic language and register shifts. Choose the best way to complete or continue each one.", questions: 6, kind: "choice" },
      { part: 2, focus: "Identify a specific aspect of a conversation", task: "Listen to 3 conversations between two speakers. Answer 2 questions about each.", questions: 6, kind: "choice" },
      { part: 3, focus: "Extract key information from a monologue", task: "Listen to a lecture, broadcast or presentation dense with facts. Write notes for the 7 headings.", questions: 7, kind: "text" },
      { part: 4, focus: "Follow a discussion between two speakers", task: "Listen to a discussion. Answer 7 multiple choice questions.", questions: 7, kind: "choice" },
    ],
    reading: [
      { part: 1, focus: "Articles and texts dense with complex structures", task: "Read one text with idiomatic language and complex arguments. Decide whether each of 5 statements is true or false.", questions: 5, kind: "select", selectOptions: 2 },
      { part: 2, focus: "How meaning is built up in discourse", task: "Six sentences have been removed from a text. Choose the right sentence for each gap from 8 options. Two options are not needed.", questions: 6, kind: "select", selectOptions: 8 },
      { part: 3, focus: "Purpose of different texts and specific information", task: "Read 4 texts (A to D) on a linked theme. Answer 7 questions by choosing which text gives the answer.", questions: 7, kind: "select", selectOptions: 4 },
      { part: 4, focus: "Discourse, purpose, gist and specific information", task: "Read one continuous text. Answer 8 'wh' questions with short answers.", questions: 8, kind: "text" },
    ],
    writing: [
      { task: 1, focus: "A formal letter, report, argument or article responding to a written or visual input, expressing stance and justification", minWords: 150, maxWords: 200, register: "formal" },
      { task: 2, focus: "A personal letter, narrative or descriptive composition that persuades, hypothesises, evaluates or expresses mood", minWords: 250, maxWords: 300, register: "informal" },
    ],
    speaking: { totalMinutes: 15, partMinutes: [3, 3, 4, 5], longTurnSeconds: 120 },
  },
  {
    id: "c2",
    cefr: "C2",
    name: "Mastery",
    listeningMinutes: 30,
    readingWritingMinutes: 160,
    listening: [
      { part: 1, focus: "Context, meaning and function in single utterances", task: "Listen to 6 short sentences with idiomatic language, register shifts and attitude shown through stress and intonation. Choose the best response to each.", questions: 6, kind: "choice" },
      { part: 2, focus: "Identify a specific aspect of a conversation", task: "Listen to 3 conversations between two speakers. Answer 2 questions about each.", questions: 6, kind: "choice" },
      { part: 3, focus: "Extract key information from a monologue", task: "Listen to a lecture, broadcast or presentation dense with facts. Write notes for the 7 headings.", questions: 7, kind: "text" },
      { part: 4, focus: "Follow a discussion between two speakers", task: "Listen to a discussion. Answer 7 multiple choice questions.", questions: 7, kind: "choice" },
    ],
    reading: [
      { part: 1, focus: "Literary texts, emotive language and complex structures", task: "Read one text with metaphor, simile and idiomatic language. Decide whether each of 5 statements is true or false.", questions: 5, kind: "select", selectOptions: 2 },
      { part: 2, focus: "How meaning is built up in discourse", task: "Six sentences have been removed from a text. Choose the right sentence for each gap from 8 options. Two options are not needed.", questions: 6, kind: "select", selectOptions: 8 },
      { part: 3, focus: "Purpose of authentic texts and specific information", task: "Read 4 texts (A to D) on a linked theme. Answer 7 questions by choosing which text gives the answer.", questions: 7, kind: "select", selectOptions: 4 },
      { part: 4, focus: "Locate specific information", task: "Read one continuous text. Answer 8 'wh' questions in a few words.", questions: 8, kind: "text" },
    ],
    writing: [
      { task: 1, focus: "A formal letter, report, argument or article responding to a written or visual input, expressing stance and justification", minWords: 200, maxWords: 250, register: "formal" },
      { task: 2, focus: "A personal letter, narrative or descriptive composition that persuades, hypothesises, evaluates or expresses mood", minWords: 250, maxWords: 300, register: "informal" },
    ],
    speaking: { totalMinutes: 17, partMinutes: [4, 4, 4, 5], longTurnSeconds: 180 },
  },
];

export function getLevel(id: string): LevelSpec | undefined {
  return LEVELS.find((level) => level.id === id);
}

export const OFFICIAL_MATERIALS_URL =
  "https://www.languagecert.org/en/preparation/practice-material/languagecert-international-esol";
