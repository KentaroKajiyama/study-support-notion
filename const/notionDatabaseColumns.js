export const remainingsColumns = {
  subfield: {
    name: '科目', type: 'title'
  },
  subject: {
    name: '教科', type: 'rich_text'
  },
  remaining: {
    name: '入試までの日数', type: 'number'
  },
  targetDay: {
    name: '目標日', type: 'date'
  }
};

export const studentOnlyPlanColumns = {
  title: {
    name: '項目', type: 'title'
  },
  subfield: {
    name: '科目', type: 'select'
  },
  period: {
    name: '期間', type: 'date'
  }
};

export const coachPlanColumns = {
  blockName: {
    name: 'ブロック名', type: 'title'
  },
  period: {
    name: '開始日/終了日', type: 'date'
  },
  speed: {
    name: '配信数/回', type: 'number'
  },
  space: {
    name: '配信間隔', type: 'number'
  },
  isIrregular: {
    name: '例外', type: 'checkbox'
  },
  subfield: {
    name: '科目', type:'select'
  },
  order: {
    name: 'Order', type: 'number'
  }
};

export const coachIrregularColumns = {
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
  order: {
    name: 'Order', type: 'number'
  }
};

export const coachRestColumns = {
  title: {
    name: 'Name', type: 'title'
  },
  period: {
    name: '開始日/終了日', type: 'date'
  },
  subject: {
    name: '科目', type:'select'
  }
};

export const studentsOverviewsColumns = {
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
  }
};

export const todoCounters = {
  subfieldId: {
    name: 'Subfield ID', type: 'rich_text'
  },
  subfieldName: {
    name: 'Subfield Name', type: 'title'
  },
  remainingProbNum: {
    name: '残り問題数', type: 'number'
  },
  diffFromTarget: {
    name: '目標日との差', type: 'number'
  }
}