// NotionWebhookParsers.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseProblemStatusWebhook,
  parseCoachPlanScheduleWebhook,
  parseStudentDetailInformationWebhook,
  parseCoachPlanIrregularCheckWebhook,
  PresentationCoachPlanSchedule,
  PresentationCoachPlanIrregularCheck,
  PresentationStudentInteraction
} from '@presentation/notionWebhook.js'; // Adjust the path to where your code is located

import type {
  StatusPropertyResponse,
  CheckboxPropertyResponse,
  PeoplePropertyResponse,
  TitlePropertyResponse,
  NotionUUID,
  NotionDate,
  URLString,
  NotionDateTimeString,
  FormulaPropertyResponse
} from '@domain/types/index.js';

// Define sample property responses using real UUIDs

const dummyStatusProperty: StatusPropertyResponse = {
  type: "status",
  // Assuming PartialSelectResponse contains a name field.
  status: { name: "正解", id: 'mock', color: 'green' },
  id: "550e8400-e29b-41d4-a716-446655440001"
};

const dummyCheckboxProperty: CheckboxPropertyResponse = {
  type: "checkbox",
  checkbox: true,
  id: "550e8400-e29b-41d4-a716-446655440002"
};

const dummyPeopleProperty: PeoplePropertyResponse = {
  type: "people",
  // Provide a minimal user object; adjust fields as needed.
  people: [
    { id: "550e8400-e29b-41d4-a716-446655440003", object: "user", name: "Test User" }
  ],
  id: "550e8400-e29b-41d4-a716-446655440004"
};

const dummyTitleProperty: TitlePropertyResponse = {
  type: "title",
  // Minimal rich text item with plain_text.
  title: [{
    "type": "mention",
    "mention": {
      "type": "database",
      "database": {
        "id": "a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822b"
      }
    },
    "annotations": {
      "bold": false,
      "italic": false,
      "strikethrough": false,
      "underline": false,
      "code": false,
      "color": "default"
    },
    "plain_text": "Database with test things",
    "href": "https://www.notion.so/a1d8501e1ac143e9a6bdea9fe6c8822b"
  }],
  id: "550e8400-e29b-41d4-a716-446655440005"
};

const dummyFormulaProperty: FormulaPropertyResponse = { id: 'dummy', type: "formula", formula: {type: "string", string: "550e8400-e29b-41d4-a716-446655440006"}};

//
// Tests for parseProblemStatusWebhook
//
describe("parseProblemStatusWebhook", () => {
  it("should parse a webhook payload with an answer property", () => {
    const webhookPayload = {
      source: {
        type: "automation" as const,
        automation_id: "550e8400-e29b-41d4-a716-446655440010" as NotionUUID,
        action_id: "550e8400-e29b-41d4-a716-446655440011" as NotionUUID,
        event_id: "550e8400-e29b-41d4-a716-446655440012" as NotionUUID,
        attempt: 1
      },
      data: {
        object: "page" as const,
        id: "550e8400-e29b-41d4-a716-446655440013" as NotionUUID,
        created_time: "2023-01-01T00:00:00Z" as NotionDateTimeString,
        updated_time: "2023-01-01T01:00:00Z" as NotionDateTimeString,
        created_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440014" as NotionUUID },
        last_edited_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440015" as NotionUUID },
        cover: null,
        icon: null,
        parent: { type: "database_id" as const, database_id: "550e8400-e29b-41d4-a716-446655440016" as NotionUUID },
        archived: false as const,
        in_trash: false as const,
        properties: {
          "回答": dummyStatusProperty,
          "Student Problem ID": dummyFormulaProperty,
          "回答者": dummyPeopleProperty
        },
        url: "https://notion.so/page" as URLString,
        public_url: null,
        request_id: "550e8400-e29b-41d4-a716-446655440017" as NotionUUID
      }
    };

    const result = parseProblemStatusWebhook(webhookPayload) as PresentationStudentInteraction;
    // Expect the parsed presentation to contain the answer status and related IDs.
    expect(result).toEqual({
      answerStatus: "正解",
      studentProblemPageId: "550e8400-e29b-41d4-a716-446655440006",
      studentUserId: "550e8400-e29b-41d4-a716-446655440003"
    });
  });

  it("should parse a webhook payload with an isDifficult property", () => {
    const webhookPayload = {
      source: {
        type: "automation" as const,
        automation_id: "550e8400-e29b-41d4-a716-446655440010" as NotionUUID,
        action_id: "550e8400-e29b-41d4-a716-446655440011" as NotionUUID,
        event_id: "550e8400-e29b-41d4-a716-446655440012" as NotionUUID,
        attempt: 1
      },
      data: {
        object: "page" as const,
        id: "550e8400-e29b-41d4-a716-446655440013" as NotionUUID,
        created_time: "2023-01-01T00:00:00Z" as NotionDateTimeString,
        updated_time: "2023-01-01T01:00:00Z" as NotionDateTimeString,
        created_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440014" as NotionUUID },
        last_edited_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440015" as NotionUUID },
        cover: null,
        icon: null,
        parent: { type: "database_id" as const, database_id: "550e8400-e29b-41d4-a716-446655440016" as NotionUUID },
        archived: false as const,
        in_trash: false as const,
        properties: {
          "理解できない": dummyCheckboxProperty,
          "Student Problem ID": dummyFormulaProperty,
          "回答者": dummyPeopleProperty
        },
        url: "https://notion.so/page" as URLString,
        public_url: null,
        request_id: "550e8400-e29b-41d4-a716-446655440027" as NotionUUID
      }
    };

    const result = parseProblemStatusWebhook(webhookPayload) as PresentationStudentInteraction;
    expect(result).toEqual({
      isDifficult: true,
      studentProblemPageId: "550e8400-e29b-41d4-a716-446655440006",
      studentUserId: "550e8400-e29b-41d4-a716-446655440003"
    });
  });

  it("should throw an error if both answer and isDifficult properties are provided", () => {
    const webhookPayload = {
      source: {
        type: "automation" as const,
        automation_id: "550e8400-e29b-41d4-a716-446655440010" as NotionUUID,
        action_id: "550e8400-e29b-41d4-a716-446655440011" as NotionUUID,
        event_id: "550e8400-e29b-41d4-a716-446655440012" as NotionUUID,
        attempt: 1
      },
      data: {
        object: "page" as const,
        id: "550e8400-e29b-41d4-a716-446655440013" as NotionUUID,
        created_time: "2023-01-01T00:00:00Z" as NotionDateTimeString,
        updated_time: "2023-01-01T01:00:00Z" as NotionDateTimeString,
        created_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440014" as NotionUUID },
        last_edited_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440015" as NotionUUID },
        cover: null,
        icon: null,
        parent: { type: "database_id" as const, database_id: "550e8400-e29b-41d4-a716-446655440016" as NotionUUID },
        archived: false as const,
        in_trash: false as const,
        properties: {
          "回答": dummyStatusProperty,
          "理解できない": dummyCheckboxProperty,
          "Student Problem ID": dummyFormulaProperty,
          "回答者": dummyPeopleProperty
        },
        url: "https://notion.so/page" as URLString,
        public_url: null,
        request_id: "550e8400-e29b-41d4-a716-446655440037" as NotionUUID
      }
    };

    expect(() => parseProblemStatusWebhook(webhookPayload)).toThrowError();
  });
});

//
// Tests for parseCoachPlanScheduleWebhook and parseStudentDetailInformationWebhook
//
describe("parseCoachPlanScheduleWebhook", () => {
  it("should parse a coach plan schedule webhook", () => {
    const webhookPayload = {
      source: {
        type: "automation" as const,
        automation_id: "550e8400-e29b-41d4-a716-446655440010" as NotionUUID,
        action_id: "550e8400-e29b-41d4-a716-446655440011" as NotionUUID,
        event_id: "550e8400-e29b-41d4-a716-446655440012" as NotionUUID,
        attempt: 1
      },
      data: {
        object: "page" as const,
        id: "550e8400-e29b-41d4-a716-446655440013" as NotionUUID,
        created_time: "2023-01-01T00:00:00Z" as NotionDateTimeString,
        updated_time: "2023-01-01T01:00:00Z" as NotionDateTimeString,
        created_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440014" as NotionUUID },
        last_edited_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440015" as NotionUUID },
        cover: null,
        icon: null,
        parent: { type: "database_id" as const, database_id: "550e8400-e29b-41d4-a716-446655440016" as NotionUUID },
        archived: false as const,
        in_trash: false as const,
        properties: {
          "Student Account": dummyPeopleProperty
        },
        url: "https://notion.so/page" as URLString,
        public_url: null,
        request_id: "550e8400-e29b-41d4-a716-446655440047" as NotionUUID
      }
    };

    const result = parseCoachPlanScheduleWebhook(webhookPayload) as PresentationCoachPlanSchedule;
    expect(result).toEqual({
      studentUserId: "550e8400-e29b-41d4-a716-446655440003"
    });
  });
});

describe("parseStudentDetailInformationWebhook", () => {
  it("should parse a student detail information webhook", () => {
    // Reuse the same payload as for coach plan schedule.
    const webhookPayload = {
      source: {
        type: "automation" as const,
        automation_id: "550e8400-e29b-41d4-a716-446655440010" as NotionUUID,
        action_id: "550e8400-e29b-41d4-a716-446655440011" as NotionUUID,
        event_id: "550e8400-e29b-41d4-a716-446655440012" as NotionUUID,
        attempt: 1
      },
      data: {
        object: "page" as const,
        id: "550e8400-e29b-41d4-a716-446655440013" as NotionUUID,
        created_time: "2023-01-01T00:00:00Z" as NotionDateTimeString,
        updated_time: "2023-01-01T01:00:00Z" as NotionDateTimeString,
        created_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440014" as NotionUUID },
        last_edited_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440015" as NotionUUID },
        cover: null,
        icon: null,
        parent: { type: "database_id" as const, database_id: "550e8400-e29b-41d4-a716-446655440016" as NotionUUID },
        archived: false as const,
        in_trash: false as const,
        properties: {
          "Student Account": dummyPeopleProperty
        },
        url: "https://notion.so/page" as URLString,
        public_url: null,
        request_id: "550e8400-e29b-41d4-a716-446655440047" as NotionUUID
      }
    };

    const result = parseStudentDetailInformationWebhook(webhookPayload);
    expect(result).toEqual({
      studentUserId: "550e8400-e29b-41d4-a716-446655440003"
    });
  });
});

//
// Tests for parseCoachPlanIrregularCheckWebhook
//
describe("parseCoachPlanIrregularCheckWebhook", () => {
  it("should parse a coach plan irregular check webhook", () => {
    const webhookPayload = {
      source: {
        type: "automation" as const,
        automation_id: "550e8400-e29b-41d4-a716-446655440010" as NotionUUID,
        action_id: "550e8400-e29b-41d4-a716-446655440011" as NotionUUID,
        event_id: "550e8400-e29b-41d4-a716-446655440012" as NotionUUID,
        attempt: 1
      },
      data: {
        object: "page" as const,
        id: "550e8400-e29b-41d4-a716-446655440013" as NotionUUID,
        created_time: "2023-01-01T00:00:00Z" as NotionDateTimeString,
        updated_time: "2023-01-01T01:00:00Z" as NotionDateTimeString,
        created_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440014" as NotionUUID },
        last_edited_by: { object: "user" as const, id: "550e8400-e29b-41d4-a716-446655440015" as NotionUUID },
        cover: null,
        icon: null,
        parent: { type: "database_id" as const, database_id: "550e8400-e29b-41d4-a716-446655440016" as NotionUUID },
        archived: false as const,
        in_trash: false as const,
        properties: {
          "ブロック名": dummyTitleProperty,
          "例外": dummyCheckboxProperty,
          "生徒アカウント": dummyPeopleProperty
        },
        url: "https://notion.so/page" as URLString,
        public_url: null,
        request_id: "550e8400-e29b-41d4-a716-446655440057" as NotionUUID
      }
    };

    const result = parseCoachPlanIrregularCheckWebhook(webhookPayload) as PresentationCoachPlanIrregularCheck;
    expect(result).toEqual({
      blockName: "@[Database with test things (database: a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822b)]",
      isChecked: true,
      studentUserId: "550e8400-e29b-41d4-a716-446655440003"
    });
  });
});
