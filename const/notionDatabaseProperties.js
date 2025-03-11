export const remainingDayProperties = {
  subfieldName: {
    name: '科目', type: 'title'
  },
  subjectName: {
    name: '教科', type: 'rich_text'
  },
  remainingDay: {
    name: '入試までの日数', type: 'number'
  },
  targetDay: {
    name: '目標日', type: 'date'
  }
};

export const studentOnlyScheduleProperties = {
  title: {
    name: '項目', type: 'title'
  },
  subfieldName: {
    name: '科目', type: 'select'
  },
  period: {
    name: '期間', type: 'date'
  }
};

export const studentActualBlocksProperties = {
  blockName: {
    name: 'ブロック名', type: 'title'
  },
  outputPeriod: {
    name: '開始日/終了日', type: 'date'
  },
  problemRelations: {
    name: '問題参照', type: 'relation'
  },
  speed: {
    name: '配信数/回', type: 'number'
  },
  lap: {
    name: '周回数', type: 'number'
  },
  space: {
    name: '配信間隔', type: 'number'
  },
  blockOrder: {
    name: 'Order', type: 'number'
  },
}

export const coachPlanProperties = {
  blockName: {
    name: 'ブロック名', type: 'title'
  },
  outputPeriod: {
    name: '開始日/終了日', type: 'date'
  },
  speed: {
    name: '配信数/回', type: 'number'
  },
  lap: {
    name: '周回数', type: 'number'
  },
  space: {
    name: '配信間隔', type: 'number'
  },
  isIrregular: {
    name: '例外', type: 'checkbox'
  },
  subfieldName: {
    name: '科目', type:'select'
  },
  blockOrder: {
    name: 'Order', type: 'number'
  },
  inputStartDate: {
    name: '（入力）開始日', type: 'date'
  },
  inputEndDate: {
    name: '（入力）終了日', type: 'date'
  },
  planDBPageId: {
    name: 'page id', type: 'formulation'
  }
};

export const coachIrregularProperties = {
  title: {
    name: '問題', type: 'title'
  },
  isModified: {
    name: '変更', type: 'status'
  },
  insertNumber: {
    name: '挿入先番号', type: 'number'
  }, 
  subfield: {
    name: '科目', type: 'select'
  },
  irregularProbOrder: {
    name: 'Order', type: 'number'
  },
  formerBlock: {
    name: '元ブロック', type: 'rich_text'
  },
  insertBlock: {
    name: '挿入先ブロック', type: 'rich_text'
  },
  irregularPageId: {
    name: 'irregular Page ID', type: 'formula'
  },
  actualBlockAWSId: {
    name: 'Actual Block AWS ID', type: 'rich_text'
  }
};

export const coachRestProperties = {
  title: {
    name: 'Name', type: 'title'
  },
  period: {
    name: '開始日/終了日', type: 'date'
  },
  subfieldName: {
    name: '科目', type:'select'
  },
  restPageId: {
    name: 'Page ID', type: 'formula'
  }
};

export const studentsOverviewsProperties = {
  studentName: {
    name: '氏名', type: 'title'
  },
  lineName: {
    name: 'LINE名前', type: 'rich_text'
  },
  alertSubfields: {
    name: 'アラート科目', type:'multi_select'
  },
  chatStatus: {
    name: 'チャット', type:'status'
  },
  distStatus: {
    name: '配信状況', type:'status'
  },
  studentPage: {
    name: '生徒ページ', type: 'rich_text'
  },
  planStatus: {
    name: '計画状況', type: 'status', notStarted: 'Not started', uncompleted: 'シミュレーション中', completed: '確定'
  },
  planModifiedSubfieldNames: {
    name: '計画変更科目', type:'multi_select'
  },
  modernJapaneseDelay: {
    name: '現代文遅れ日数', type: 'number'
  },
  ancientJapaneseDelay: {
    name: '古文遅れ日数', type: 'number'
  },
  ancientChineseDelay: {
    name: '漢文遅れ日数', type: 'number' 
  },
  mathDelay: {
    name: '数学遅れ日数', type: 'number'
  },
  readingDelay: {
    name: 'Reading 遅れ日数', type: 'number'
  },
  listeningAndSpeakingDelay: {
    name: 'Listening&Speaking 遅れ日数', type: 'number'
  },
  writingDelay: {
    name: 'Writing 遅れ日数', type: 'number'
  },
  physicsDelay: {
    name: '物理遅れ日数', type: 'number'
  },
  chemistryDelay: {
    name: '化学遅れ日数', type: 'number'
  },
  biologyDelay: {
    name: '生物遅れ日数', type: 'number'
  },
  jHistroyDelay: {
    name: '日本史遅れ日数', type: 'number'
  },
  wHistoryDelay: {
    name: '世界史遅れ日数', type: 'number'
  },
  geographyDelay: {
    name: '地理遅れ日数', type: 'number'
  }
};

export const returnSubfieldDelayKeyName = (subfieldName) => {
  switch (subfieldName) {
    case '国語':
      return 'modernJapaneseDelay';
    case '現代文':
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

export const todoRemainingCountersProperties = {
  subfieldId: {
    name: 'Subfield ID', type: 'rich_text'
  },
  subfieldName: {
    name: 'Subfield Name', type: 'title'
  },
  remainingProbNum: {
    name: '残り問題数', type: 'number'
  },
  delay: {
    name: '目標日との差', type: 'number'
  }
};

export const studentInfoDetail = {
  studentName: {
    name: '氏名', type: 'title'
  },
  parentName: {
    name: '保護者氏名', type: 'rich_text'
  },
  parentEmail: {
    name: '保護者メール', type: 'email'
  },
  parentPhone: {
    name: '保護者電話番号', type: 'phone_number'
  },
  goal: {
    name: '最終目標', type: 'rich_text'
  },
  subfieldLevel: {
    name: 'レベル', type: 'select'
  },
  subfieldGoal: {
    name: '目標', type: 'rich_text'
  },
  subfieldGoalLevel: {
    name: '目標レベル', type:'select'
  },
  subfieldModification: {
    name: '変更', type: 'status'
  }
};