// TODO: Auto generation

export const subfieldsList = ['現代文', '古文', '漢文', '数学', 'Reading', 'Listening&Speaking', 'Writing', '物理', '化学', '生物', '日本史', '世界史', '地理'];

export type SubfieldName = '現代文' | '古文' | '漢文' | '数学' | 'Reading' | 'Listening&Speaking' | 'Writing' | '物理' | '化学' | '生物' | '日本史' | '世界史' | '地理';

export const modernJapaneseProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const ancientJapaneseProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const ancientChineseProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const mathProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const readingProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const listeningAndSpeakingProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const writingProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const physicsProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const chemistryProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const biologyProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const japaneseHistoryProperties = {
  problemName: { name: 'チェック項目', type: 'title'},
  area: { name: '時代区分', type: 'rich_text'},
  answer: { name: '解答', type: 'rich_text'},
  section: { name: 'テーマ', type: 'rich_text'},
  subsection: { name: 'サブテーマ', type: 'rich_text'},
  optionLength: 1,
  option1: { name: '年代', type: 'rich_text'},
  option2: null,
  option3: null,
  option4: null,
};
export const worldHistoryProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};
export const geographyProperties = {
  problemName: { name: '', type: 'title'},
  area: { name: '', type: 'rich_text'},
  answer: { name: '', type: 'rich_text'},
  section: { name: '', type: ''},
  subsection: { name: '', type: ''},
  optionLength: 0,
  option1: null,
  option2: null,
  option3: null,
  option4: null,
};

export const returnSubfieldProperties = (subfieldName: SubfieldName) => {
  switch (subfieldName) {
    case '現代文':
      return modernJapaneseProperties;
    case '古文':
      return ancientJapaneseProperties;
    case '漢文':
      return ancientChineseProperties;
    case '数学':
      return mathProperties;
    case 'Reading':
      return readingProperties;
    case 'Listening&Speaking':
      return listeningAndSpeakingProperties;
    case 'Writing':
      return writingProperties;
    case '物理':
      return physicsProperties;
    case '化学':
      return chemistryProperties;
    case '生物':
      return biologyProperties;
    case '日本史':
      return japaneseHistoryProperties;
    case '世界史':
      return worldHistoryProperties;
    case '地理':
      return geographyProperties;
    default:
      throw new Error(`Invalid subfield: ${subfieldName}`);
  };
}