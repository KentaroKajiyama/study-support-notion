export const probAnalysis = {
  ansStatus: {
    name: '回答', type: 'status', 
  },
  isDifficult: {
    name: '理解できない', type: 'checkbox'
  },
  understandingLevel: {
    name: '理解度', type: 'number'
  },
  tryNumber: {
    name: '挑戦回数', type: 'number'
  },
  difficultNumber: {
    name: '理解できなかった回数', type: 'number'
  },
  wrongNumber: {
    name: '不正解回数', type: 'number'
  },
  reviewLevel: {
    name: '復習レベル', type: 'status', level0: '初学', level1: 'レベル１', level2: 'レベル２', level3: 'レベル３', level4: 'レベル４'
  },
  lastAnswerDate: {
    name: '最終回答日', type: 'date'
  },
  blockName: {
    name: 'ブロック', type: 'select'
  },
  probId: {
    name: 'AWS Problem ID', type: 'number'
  }
}