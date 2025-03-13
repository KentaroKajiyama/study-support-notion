// 🚀 Auto-generated file. DO NOT EDIT manually.

export type PropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "date"
  | "select"
  | "multi_select"
  | "status"
  | "checkbox"
  | "relation"
  | "formula"
  | "phone_number"
  | "email";

export type RemainingDayPropertyName = "subfieldName" | "subjectName" | "remainingDay" | "targetDay";
export type StudentOnlySchedulePropertyName = "title" | "subfieldName" | "period";
export type StudentActualBlocksPropertyName = "blockName" | "outputPeriod" | "problemRelations" | "speed" | "lap" | "space" | "blockOrder";
export type CoachPlanPropertyName = "blockName" | "outputPeriod" | "speed" | "lap" | "space" | "isIrregular" | "subfieldName" | "blockOrder" | "inputStartDate" | "inputEndDate" | "planDBPageId";
export type CoachIrregularPropertyName = "title" | "isModified" | "insertNumber" | "subfield" | "irregularProbOrder" | "formerBlock" | "insertBlock" | "irregularPageId" | "actualBlockAWSId";
export type CoachRestPropertyName = "title" | "period" | "subfieldName" | "restPageId";
export type StudentsOverviewsPropertyName = "studentName" | "lineName" | "alertSubfields" | "chatStatus" | "distStatus" | "studentPage" | "planStatus" | "planModifiedSubfieldNames" | "modernJapaneseDelay" | "ancientJapaneseDelay" | "ancientChineseDelay" | "mathDelay" | "readingDelay" | "listeningAndSpeakingDelay" | "writingDelay" | "physicsDelay" | "chemistryDelay" | "biologyDelay" | "japaneseHistoryDelay" | "worldHistoryDelay" | "geographyDelay";
export type TodoRemainingCountersPropertyName = "subfieldId" | "subfieldName" | "remainingProbNum" | "delay";
export type StudentInfoDetailPropertyName = "studentName" | "parentName" | "parentEmail" | "parentPhone" | "goal" | "subfieldLevel" | "subfieldGoal" | "subfieldGoalLevel" | "subfieldModification";

export type PropertyName =
  | RemainingDayPropertyName
  | StudentOnlySchedulePropertyName
  | StudentActualBlocksPropertyName
  | CoachPlanPropertyName
  | CoachIrregularPropertyName
  | CoachRestPropertyName
  | StudentsOverviewsPropertyName
  | TodoRemainingCountersPropertyName
  | StudentInfoDetailPropertyName;

export const notionProperties = {
  remainingDay: {
    subfieldName: { name: "科目", type: "title" },
    subjectName: { name: "教科", type: "rich_text" },
    remainingDay: { name: "入試までの日数", type: "number" },
    targetDay: { name: "目標日", type: "date" }
  },
  studentOnlySchedule: {
    title: { name: "項目", type: "title" },
    subfieldName: { name: "科目", type: "select" },
    period: { name: "期間", type: "date" }
  },
  studentActualBlocks: {
    blockName: { name: "ブロック名", type: "title" },
    outputPeriod: { name: "開始日/終了日", type: "date" },
    problemRelations: { name: "問題参照", type: "relation" },
    speed: { name: "配信数/回", type: "number" },
    lap: { name: "周回数", type: "number" },
    space: { name: "配信間隔", type: "number" },
    blockOrder: { name: "Order", type: "number" }
  },
  coachPlan: {
    blockName: { name: "ブロック名", type: "title" },
    outputPeriod: { name: "開始日/終了日", type: "date" },
    speed: { name: "配信数/回", type: "number" },
    lap: { name: "周回数", type: "number" },
    space: { name: "配信間隔", type: "number" },
    isIrregular: { name: "例外", type: "checkbox" },
    subfieldName: { name: "科目", type: "select" },
    blockOrder: { name: "Order", type: "number" },
    inputStartDate: { name: "（入力）開始日", type: "date" },
    inputEndDate: { name: "（入力）終了日", type: "date" },
    planDBPageId: { name: "page id", type: "formula" }
  },
  coachIrregular: {
    title: { name: "問題", type: "title" },
    isModified: { name: "変更", type: "status" },
    insertNumber: { name: "挿入先番号", type: "number" },
    subfield: { name: "科目", type: "select" },
    irregularProbOrder: { name: "Order", type: "number" },
    formerBlock: { name: "元ブロック", type: "rich_text" },
    insertBlock: { name: "挿入先ブロック", type: "rich_text" },
    irregularPageId: { name: "irregular Page ID", type: "formula" },
    actualBlockAWSId: { name: "Actual Block AWS ID", type: "rich_text" }
  },
  coachRest: {
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
    },
  },
  studentsOverviews: {
    studentName: { name: "氏名", type: "title" },
    lineName: { name: "LINE名前", type: "rich_text" },
    alertSubfields: { name: "アラート科目", type: "multi_select" },
    chatStatus: { name: "チャット", type: "status" },
    distStatus: { name: "配信状況", type: "status" },
    studentPage: { name: "生徒ページ", type: "rich_text" },
    planStatus: {
      name: "計画状況",
      type: "status",
      options: {
        notStarted: "Not started",
        uncompleted: "シミュレーション中",
        completed: "確定"
      }
    },
    modernJapaneseDelay: { name: "現代文遅れ日数", type: "number" },
    ancientJapaneseDelay: { name: "古文遅れ日数", type: "number" },
    ancientChineseDelay: { name: "漢文遅れ日数", type: "number" },
    mathDelay: { name: "数学遅れ日数", type: "number" },
    readingDelay: { name: "Reading 遅れ日数", type: "number" },
    listeningAndSpeakingDelay: { name: "Listening&Speaking 遅れ日数", type: "number" },
    writingDelay: { name: "Writing 遅れ日数", type: "number" },
    physicsDelay: { name: "物理遅れ日数", type: "number" },
    chemistryDelay: { name: "化学遅れ日数", type: "number" },
    biologyDelay: { name: "生物遅れ日数", type: "number" },
    japaneseHistoryDelay: { name: "日本史遅れ日数", type: "number" },
    worldHistoryDelay: { name: "世界史遅れ日数", type: "number" },
    geographyDelay: { name: "地理遅れ日数", type: "number" }
  },
  todoRemainingCounters:{
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
  },
  studentInfoDetail: {
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
  }
} as const;