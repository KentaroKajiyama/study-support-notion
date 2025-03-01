export const modernJapaneseColumns = {
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
export const ancientJapaneseColumns = {
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
export const ancientChineseColumns = {
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
export const mathColumns = {
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
export const readingColumns = {
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
export const listeningAndSpeakingColumns = {
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
export const writingColumns = {
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
export const physicsColumns = {
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
export const chemistryColumns = {
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
export const biologyColumns = {
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
export const japaneseHistoryColumns = {
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
export const worldHistoryColumns = {
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
export const geographyColumns = {
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

export const returnSubfieldColumns = (subfieldName) => {
  switch (subfieldName) {
    case '国語':
      return modernJapaneseColumns;
    case '現代文':
      return ancientJapaneseColumns;
    case '漢文':
      return ancientChineseColumns;
    case '数学':
      return mathColumns;
    case 'Reading':
      return readingColumns;
    case 'Listening&Speaking':
      return listeningAndSpeakingColumns;
    case 'Writing':
      return writingColumns;
    case '物理':
      return physicsColumns;
    case '化学':
      return chemistryColumns;
    case '生物':
      return biologyColumns;
    case '日本史':
      return japaneseHistoryColumns;
    case '世界史':
      return worldHistoryColumns;
    case '地理':
      return geographyColumns;
    default:
      throw new Error(`Invalid subfield: ${subfieldName}`);
  };
}