// TODO: Modify this to apply to the automatical generation.
import { SubfieldName } from "./problemDatabase.js";
export const returnSubfieldDelayKeyName = (subfieldName: SubfieldName) => {
  switch (subfieldName) {
    case '現代文':
      return 'modernJapaneseDelay';
    case '古文':
      return 'ancientJapaneseDelay';
    case '漢文':
      return 'ancientChineseDelay';
    case '数学':
      return 'mathDelay';
    case 'Reading':
      return 'readingDelay';
    case 'Listening&Speaking':
      return 'listeningAndSpeakingDelay';
    case 'Writing':
      return 'writingDelay';
    case '物理':
      return 'physicsDelay';
    case '化学':
      return 'chemistryDelay';
    case '生物':
      return 'biologyDelay';
    case '日本史':
      return 'japaneseHistoryDelay';
    case '世界史':
      return 'worldHistoryDelay';
    case '地理':
      return 'geographyDelay';
    default:
      throw new Error(`Invalid subfield: ${subfieldName}`);
  };
}