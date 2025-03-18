import { SubfieldsSubfieldNameEnum, Uint } from "@domain/types/index.js";

export interface DomainNecessaryStudyTime {
  pattern?: string;
  modernJapanese?: Uint;
  ancientJapanese?: Uint;
  ancientChinese?: Uint;
  math?: Uint;
  reading?: Uint;
  listeningAndSpeaking?: Uint;
  writing?: Uint;
  physics?: Uint;
  chemistry?: Uint;
  biology?: Uint;
  japaneseHistory?: Uint;
  worldHistory?: Uint;
  geography?: Uint;
  howManyTimes?: Uint;
  totalOpportunity?: Uint;
  order?: Uint;
}