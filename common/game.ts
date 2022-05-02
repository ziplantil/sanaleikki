import { getDice } from './dice';
import Options from './options';
import RandomSource from './random';
import { WordListValidator, WordLetterValidator, pointsForWord } from './word';
import { LETTER_ORDER } from './letter';

export type ScoreTable = {[player: string]: number};
export enum WordStatus {
  OK,
  DUPLICATE,
  SELF_DUPLICATE,
  WRONG_LENGTH,
  WRONG_LETTERS,
  NOT_IN_WORDLIST
}
export interface EnteredWord {
  word: string;
  status: WordStatus;
  points: number;
}
export type EnteredWords = EnteredWord[];
export type PlayerEnteredWords = {[player: string]: EnteredWords};
export type PlayerWords = {[player: string]: string[]};

export const MAXIMUM_WORDS = 10;
export const MAXIMUM_PLAYERS = 16;

export interface GameMedium {
  initializeScores(): ScoreTable;
  roundResults(words: PlayerEnteredWords, scores: ScoreTable): void;
  timeout(): void;
  getWordList(): string[];
}

function cleanUpLetters(letters: string[]): string[] {
  return letters.
    map(letter => letter.toUpperCase()).
    sort((a: string, b: string) => LETTER_ORDER.indexOf(a) - LETTER_ORDER.indexOf(b));
}

function flagWordsForPlayer(playerWords: PlayerEnteredWords, player: string,
                            flag: WordStatus, condition: (word: string) => boolean): void {
  playerWords[player] = playerWords[player].map(entry =>
    ({ word: entry.word, status: condition(entry.word) ? flag : entry.status, points: entry.points }));
}

function flagWords(playerWords: PlayerEnteredWords, flag: WordStatus,
                   condition: (word: string) => boolean): void {
  for (const player of Object.keys(playerWords))
    flagWordsForPlayer(playerWords, player, flag, condition);
}

export function cleanUpPlayerName(nick: string): string {
  return nick.replace(/\s+/, ' ').trim();
}

export function isValidPlayerName(nick: string): boolean {
  nick = cleanUpPlayerName(nick || '');
  if (!nick) return false;
  return !nick.match(/[^0-9A-ZÄÖ_ -]/i) && nick.length <= 32;
}

export default class Game {
  private medium: GameMedium;
  private letters: string[] | null = null;
  private options: Options;
  private randomSource: RandomSource = new RandomSource();
  private roundTimeout: NodeJS.Timeout | null = null;
  private scores: ScoreTable;
  private wordListValidator: WordListValidator;
  private roundNumber: number;
  private roundsLeft: number;

  constructor(medium: GameMedium, options: Options) {
    this.medium = medium;
    this.options = options;
    this.scores = medium.initializeScores();
    this.wordListValidator = new WordListValidator(medium.getWordList());
    this.roundsLeft = options.rounds;
    this.roundNumber = 0;
  }

  startRound(): string[] {
    if (this.letters) {
      throw "Round already started";
    }
    if (!this.roundsLeft) {
      return [];
    }
    --this.roundsLeft;
    ++this.roundNumber;
    this.roundTimeout = setTimeout(() => this.medium.timeout(), this.options.roundTime * 1000);
    this.letters = cleanUpLetters(getDice(this.options).generate(this.randomSource));
    return this.letters;
  }

  getRoundNumber() : number {
    return this.roundNumber;
  }

  moreRounds(): boolean {
    return this.roundsLeft > 0;
  }

  pointsFor(word: EnteredWord): number {
    switch (word.status) {
    case WordStatus.OK:
      return pointsForWord(word.word);
    case WordStatus.DUPLICATE:
      return 0;
    case WordStatus.SELF_DUPLICATE:
    case WordStatus.WRONG_LENGTH:
    case WordStatus.WRONG_LETTERS:
    case WordStatus.NOT_IN_WORDLIST:
      return -1;
    }
  }

  endRound(words: PlayerWords) {
    if (!this.letters) {
      throw "You didn't even start a round";
    }
    if (this.roundTimeout) {
      clearTimeout(this.roundTimeout);
      this.roundTimeout = null;
    }
    
    // make sure arrays are short enough and clean up words
    const playerWords: PlayerEnteredWords = {};
    Object.keys(words).forEach((player: string) => {
      playerWords[player] = words[player].slice(0, MAXIMUM_WORDS).map(
        word => ({ word: word.toUpperCase(), status: WordStatus.OK, points: 0 }));
    });

    // too short or too long
    flagWords(playerWords, WordStatus.WRONG_LENGTH,
      word => word.length < this.options.minimumWordLength || word.length > this.letters!.length);
    
    // remove duplicates for each player
    const globalWordCounts: {[word: string]: number} = {};
    Object.keys(playerWords).forEach((player: string) => {
      const wordCounts: {[word: string]: number} = {};
      playerWords[player].forEach(entry => {
        wordCounts[entry.word] = (wordCounts[entry.word] || 0) + 1
        globalWordCounts[entry.word] = (globalWordCounts[entry.word] || 0) + 1
      });
      flagWordsForPlayer(playerWords, player, WordStatus.SELF_DUPLICATE,
        word => wordCounts[word] !== 1);
    });

    // remove duplicates between players, no penalty even if enabled
    flagWords(playerWords, WordStatus.DUPLICATE, word => globalWordCounts[word] !== 1);

    // remove words that cannot be formed
    const wordLetterValidator = new WordLetterValidator(this.letters);
    flagWords(playerWords, WordStatus.WRONG_LETTERS, word => !wordLetterValidator.validate(word));

    // remove words not on list
    flagWords(playerWords, WordStatus.NOT_IN_WORDLIST, word => !this.wordListValidator.validate(word));

    // points for remaining words
    Object.keys(playerWords).forEach((player: string) => {
      playerWords[player] = playerWords[player].map(word => ({ ...word, points: this.pointsFor(word) }));
    });

    for (const player of Object.keys(playerWords)) {
      this.scores[player] += playerWords[player].reduce((score: number, word: EnteredWord) => score + word.points, 0);
    }

    this.letters = null;
    this.medium.roundResults(playerWords, this.scores);
  }
}
