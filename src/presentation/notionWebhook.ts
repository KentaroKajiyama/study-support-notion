import { 
  CheckboxPropertyResponse,
  FormulaPropertyResponse,
  NotionDateTimeString, 
  NotionMentionString, 
  NotionUUID, 
  PeoplePropertyResponse, 
  StatusPropertyResponse,
  StudentProblemsAnswerStatusEnum,
  TitlePropertyResponse,
  URLString
} from "@domain/types/index.js"
import { propertyResponseToDomain } from "@infrastructure/notionProperty.js";

export type NotionWebhookProblem = {
  source: {
    type: 'automation'
    automation_id: NotionUUID
    action_id: NotionUUID
    event_id: NotionUUID
    attempt: number
  },
  data: {
    object: 'page',
    id: NotionUUID,
    created_time: NotionDateTimeString,
    updated_time: NotionDateTimeString,
    created_by: {
      object: 'user',
      id: NotionUUID
    },
    last_edited_by: {
      object: 'user',
      id: NotionUUID
    },
    cover: null,
    icon: null,
    parent: {
      type: 'database_id',
      database_id: NotionUUID
    },
    archived: false,
    in_trash: false,
    properties: {
      '回答'?: StatusPropertyResponse,
      '理解できない'?: CheckboxPropertyResponse,
      'Student Problem ID': FormulaPropertyResponse,
      '回答者': PeoplePropertyResponse
    },
    url: URLString,
    public_url: URLString | null,
    request_id: NotionUUID
  }
};

export type PresentationAnswerStatus = {
  answerStatus: StudentProblemsAnswerStatusEnum,
  studentProblemPageId: NotionUUID,
  studentUserId: NotionUUID,
};

export type PresentationIsDifficult = {
  isDifficult: boolean,
  studentProblemPageId: NotionUUID,
  studentUserId: NotionUUID,
};

export type PresentationStudentInteraction = PresentationAnswerStatus | PresentationIsDifficult

export function parseProblemStatusWebhook(webhookBody: NotionWebhookProblem): PresentationStudentInteraction {
  const answerProperty = webhookBody.data.properties['回答'] !== undefined ? webhookBody.data.properties['回答'] : undefined;
  const isDifficultProperty = webhookBody.data.properties['理解できない'] !== undefined ? webhookBody.data.properties['理解できない']: undefined;
  const studentProblemPageIdProperty = webhookBody.data.properties['Student Problem ID'];
  if (studentProblemPageIdProperty == null) {
    throw new Error('Notion webhook problem does not contain Student Problem ID property');
  } 
  const answererProperty = webhookBody.data.properties['回答者'];
  if (answererProperty == null) {
    throw new Error('Notion webhook problem does not contain answerer property');
  }
  if (answerProperty === undefined && isDifficultProperty === undefined) {
    throw new Error('Notion webhook problem does not contain answer or difficult properties');
  } else if (answerProperty !== undefined && isDifficultProperty !== undefined) {
    throw new Error('Notion webhook problem contains both answer and difficult properties');
  } else if (answerProperty !== undefined && isDifficultProperty === undefined) {
    return {
      answerStatus: propertyResponseToDomain(answerProperty, 'an answer status') as StudentProblemsAnswerStatusEnum,
      studentProblemPageId: propertyResponseToDomain(studentProblemPageIdProperty, 'a page id') as NotionUUID,
      studentUserId: propertyResponseToDomain(answererProperty, 'a user id') as NotionUUID,
    }
  } else {
    return {
      isDifficult: propertyResponseToDomain(isDifficultProperty as CheckboxPropertyResponse, '') as boolean,
      studentProblemPageId: propertyResponseToDomain(studentProblemPageIdProperty, 'a page id') as NotionUUID,
      studentUserId: propertyResponseToDomain(answererProperty, 'a user id') as NotionUUID,
    }
  }
}

export type NotionWebhookCoachPlanSchedule = {
  source: {
    type: 'automation'
    automation_id: NotionUUID
    action_id: NotionUUID
    event_id: NotionUUID
    attempt: number
  },
  data: {
    object: 'page',
    id: NotionUUID,
    created_time: NotionDateTimeString,
    updated_time: NotionDateTimeString,
    created_by: {
      object: 'user',
      id: NotionUUID
    },
    last_edited_by: {
      object: 'user',
      id: NotionUUID
    },
    cover: null,
    icon: null,
    parent: {
      type: 'database_id',
      database_id: NotionUUID
    },
    archived: false,
    in_trash: false,
    properties: {
      'Student Account': PeoplePropertyResponse
    },
    url: URLString,
    public_url: URLString | null,
    request_id: NotionUUID
  }
};

export type PresentationCoachPlanSchedule = {
  studentUserId: NotionUUID
};

export function parseCoachPlanScheduleWebhook(webhookBody: NotionWebhookCoachPlanSchedule): PresentationCoachPlanSchedule {
  const peopleProperty = webhookBody.data.properties['Student Account'];
  if (peopleProperty == null) {
    throw new Error('Notion webhook coach plan scheduler does not contain Person property');
  }
  return {
    studentUserId: propertyResponseToDomain(peopleProperty, 'a user id') as NotionUUID,
  }
};

export type NotionWebhookStudentDetailInformation = NotionWebhookCoachPlanSchedule;

export type PresentationStudentDetailInformation =  PresentationCoachPlanSchedule;

export function parseStudentDetailInformationWebhook(webhookBody: NotionWebhookStudentDetailInformation): PresentationStudentDetailInformation {
  return parseCoachPlanScheduleWebhook(webhookBody);
};

export type NotionWebhookCoachPlanIrregularCheck = {
  source: {
    type: 'automation'
    automation_id: NotionUUID
    action_id: NotionUUID
    event_id: NotionUUID
    attempt: number
  },
  data: {
    object: 'page',
    id: NotionUUID,
    created_time: NotionDateTimeString,
    updated_time: NotionDateTimeString,
    created_by: {
      object: 'user',
      id: NotionUUID
    },
    last_edited_by: {
      object: 'user',
      id: NotionUUID
    },
    cover: null,
    icon: null,
    parent: {
      type: 'database_id',
      database_id: NotionUUID
    },
    archived: false,
    in_trash: false,
    properties: {
      'ブロック名': TitlePropertyResponse,
      '例外': CheckboxPropertyResponse,
      '生徒アカウント': PeoplePropertyResponse
    },
    url: URLString,
    public_url: URLString | null,
    request_id: NotionUUID
  }
};

export type PresentationCoachPlanIrregularCheck = {
  blockName: NotionMentionString,
  isChecked: boolean,
  studentUserId: NotionUUID
};

export function parseCoachPlanIrregularCheckWebhook(webhookBody: NotionWebhookCoachPlanIrregularCheck): PresentationCoachPlanIrregularCheck {
  const titleProperty = webhookBody.data.properties['ブロック名'] as TitlePropertyResponse;
  const checkboxProperty = webhookBody.data.properties['例外'] as CheckboxPropertyResponse;
  const peopleProperty = webhookBody.data.properties['生徒アカウント'];
  if (titleProperty == null || checkboxProperty == null || peopleProperty == null) {
    throw new Error('Notion webhook coach plan irregular check does not contain required properties');
  }
  return {
    blockName: propertyResponseToDomain(titleProperty, 'a mention string') as NotionMentionString,
    isChecked: propertyResponseToDomain(checkboxProperty, '') as boolean,
    studentUserId: propertyResponseToDomain(peopleProperty, 'a user id') as NotionUUID,
  }
};