import { DomainStudentDetailInformation } from "@domain/coach/StudentDetailInformation.js";
import { 
  DatePropertyRequest, 
  DatePropertyResponse, 
  Email, 
  EmailPropertyRequest, 
  EmailPropertyResponse, 
  MultiSelectPropertyRequest, 
  MultiSelectPropertyResponse, 
  NotionDate, 
  NotionPagePropertyType, 
  PhoneNumber, 
  PhoneNumberPropertyRequest, 
  PhoneNumberPropertyResponse, 
  RichTextPropertyRequest, 
  RichTextPropertyResponse, 
  SelectPropertyRequest, 
  SelectPropertyResponse, 
  StudentDetailInformationSubjectChangeEnum, 
  StudentSubjectInformationSubjectGoalLevelEnum, 
  StudentSubjectInformationSubjectLevelEnum, 
  SubjectsSubjectNameEnum, 
  TitlePropertyRequest, 
  TitlePropertyResponse 
} from "@domain/types/index.js";
import { propertyDomainToRequest, propertyResponseToDomain } from "@infrastructure/notionProperty.js";
import { logger } from '@utils/index.js';
import { NotionRepository } from "./NotionRepository.js";

export interface NotionStudentDetailInformationResponse extends Record<string, any> {
  '氏名'?: TitlePropertyResponse;
  '保護者氏名'?: RichTextPropertyResponse;
  '保護者メール'?: EmailPropertyResponse;
  '保護者電話番号'?: PhoneNumberPropertyResponse;
  '最終目標'?: RichTextPropertyResponse;
  '登録科目'?: MultiSelectPropertyResponse;
  'レベル変更科目'?: MultiSelectPropertyResponse;
  '国語レベル'?: SelectPropertyResponse;
  '国語目標'?: RichTextPropertyResponse;
  '国語目標レベル'?: SelectPropertyResponse;
  '数学レベル'?: SelectPropertyResponse;
  '数学目標'?: RichTextPropertyResponse;
  '数学目標レベル'?: SelectPropertyResponse;
  '英語レベル'?: SelectPropertyResponse;
  '英語目標'?: RichTextPropertyResponse;
  '英語目標レベル'?: SelectPropertyResponse;
  '物理レベル'?: SelectPropertyResponse;
  '物理目標'?: RichTextPropertyResponse;
  '物理目標レベル'?: SelectPropertyResponse;
  '化学レベル'?: SelectPropertyResponse;
  '化学目標'?: RichTextPropertyResponse;
  '化学目標レベル'?: SelectPropertyResponse;
  '生物レベル'?: SelectPropertyResponse;
  '生物目標'?: RichTextPropertyResponse;
  '生物目標レベル'?: SelectPropertyResponse;
  '日本史レベル'?: SelectPropertyResponse;
  '日本史目標'?: RichTextPropertyResponse;
  '日本史目標レベル'?: SelectPropertyResponse;
  '世界史レベル'?: SelectPropertyResponse;
  '世界史目標'?: RichTextPropertyResponse;
  '世界史目標レベル'?: SelectPropertyResponse;
  '地理レベル'?: SelectPropertyResponse;
  '地理目標'?: RichTextPropertyResponse;
  '地理目標レベル'?: SelectPropertyResponse;
  '試験日'?: DatePropertyResponse;
};

export interface NotionStudentDetailInformationRequest extends Record<string, any> {
  '氏名'?: TitlePropertyRequest;
  '保護者氏名'?: RichTextPropertyRequest;
  '保護者メール'?: EmailPropertyRequest;
  '保護者電話番号'?: PhoneNumberPropertyRequest;
  '最終目標'?: RichTextPropertyRequest;
  '登録科目'?: MultiSelectPropertyRequest;
  'レベル変更科目'?: MultiSelectPropertyRequest;
  '国語レベル'?: SelectPropertyRequest;
  '国語目標'?: RichTextPropertyRequest;
  '国語目標レベル'?: SelectPropertyRequest;
  '数学レベル'?: SelectPropertyRequest;
  '数学目標'?: RichTextPropertyRequest;
  '数学目標レベル'?: SelectPropertyRequest;
  '英語レベル'?: SelectPropertyRequest;
  '英語目標'?: RichTextPropertyRequest;
  '英語目標レベル'?: SelectPropertyRequest;
  '物理レベル'?: SelectPropertyRequest;
  '物理目標'?: RichTextPropertyRequest;
  '物理目標レベル'?: SelectPropertyRequest;
  '化学レベル'?: SelectPropertyRequest;
  '化学目標'?: RichTextPropertyRequest;
  '化学目標レベル'?: SelectPropertyRequest;
  '生物レベル'?: SelectPropertyRequest;
  '生物目標'?: RichTextPropertyRequest;
  '生物目標レベル'?: SelectPropertyRequest;
  '日本史レベル'?: SelectPropertyRequest;
  '日本史目標'?: RichTextPropertyRequest;
  '日本史目標レベル'?: SelectPropertyRequest;
  '世界史レベル'?: SelectPropertyRequest;
  '世界史目標'?: RichTextPropertyRequest;
  '世界史目標レベル'?: SelectPropertyRequest;
  '地理レベル'?: SelectPropertyRequest;
  '地理目標'?: RichTextPropertyRequest;
  '地理目標レベル'?: SelectPropertyRequest;
  '国語変更'?: SelectPropertyRequest;
  '数学変更'?: SelectPropertyRequest;
  '英語変更'?: SelectPropertyRequest;
  '物理変更'?: SelectPropertyRequest;
  '化学変更'?: SelectPropertyRequest;
  '生物変更'?: SelectPropertyRequest;
  '日本史変更'?: SelectPropertyRequest;
  '世界史変更'?: SelectPropertyRequest;
  '地理変更'?: SelectPropertyRequest;
  '試験日'?: DatePropertyRequest;
};

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string }> = {
  studentName: { type: 'title', name: '氏名' },
  parentName: { type: 'rich_text', name: '保護者氏名' },
  parentEmail: { type: 'email', name: '保護者メール' },
  parentPhoneNumber: { type: 'phone_number', name: '保護者電話番号' },
  goal: { type: 'rich_text', name: '最終目標' },
  registeredSubjectNames: { type: 'multi_select', name: '登録科目' },
  levelModifiedSubjectNames: { type: 'multi_select', name: 'レベル変更科目' },
  japaneseLevel: { type:'select', name: '国語レベル' },
  japaneseGoal: { type: 'rich_text', name: '国語目標' },
  japaneseGoalLevel: { type:'select', name: '国語目標レベル' },
  mathLevel: { type:'select', name: '数学レベル' },
  mathGoal: { type: 'rich_text', name: '数学目標' },
  mathGoalLevel: { type:'select', name: '数学目標レベル' },
  englishLevel: { type:'select', name: '英語レベル' },
  englishGoal: { type: 'rich_text', name: '英語目標' },
  englishGoalLevel: { type:'select', name: '英語目標レベル' },
  physicsLevel: { type:'select', name: '物理レベル' },
  physicsGoal: { type: 'rich_text', name: '物理目標' },
  physicsGoalLevel: { type:'select', name: '物理目標レベル' },
  chemistryLevel: { type:'select', name: '化学レベル' },
  chemistryGoal: { type: 'rich_text', name: '化学目標' },
  chemistryGoalLevel: { type:'select', name: '化学目標レベル' },
  biologyLevel: { type:'select', name: '生物レベル' },
  biologyGoal: { type: 'rich_text', name: '生物目標' },
  biologyGoalLevel: { type:'select', name: '生物目標レベル' },
  japaneseHistoryLevel: { type:'select', name: '日本史レベル' },
  japaneseHistoryGoal: { type: 'rich_text', name: '日本史目標' },
  japaneseHistoryGoalLevel: { type:'select', name: '日本史目標レベル' },
  worldHistoryLevel: { type:'select', name: '世界史レベル' },
  worldHistoryGoal: { type: 'rich_text', name: '世界史目標' },
  worldHistoryGoalLevel: { type:'select', name: '世界史目標レベル' },
  geographyLevel: { type:'select', name: '地理レベル' },
  geographyGoal: { type: 'rich_text', name: '地理目標' },
  geographyGoalLevel: { type:'select', name: '地理目標レベル' },
  japaneseChange: { type:'select', name: '国語変更' },
  mathChange: { type:'select', name: '数学変更' },
  englishChange: { type:'select', name: '英語変更' },
  physicsChange: { type:'select', name: '物理変更' },
  chemistryChange: { type:'select', name: '化学変更' },
  biologyChange: { type:'select', name: '生物変更' },
  japaneseHistoryChange: { type:'select', name: '日本史変更' },
  worldHistoryChange: { type:'select', name: '世界史変更' },
  geographyChange: { type:'select', name: '地理変更' },
  examDate: { type: 'date', name: '試験日' },
}

export function toDomain(res: NotionStudentDetailInformationResponse): DomainStudentDetailInformation {
  try {
    const transformed: DomainStudentDetailInformation = {
      studentName:
        res['氏名']!== undefined? propertyResponseToDomain(res['氏名'], 'string') as string: undefined,
      parentName:
        res['保護者氏名']!== undefined? propertyResponseToDomain(res['保護者氏名'], 'string') as string : undefined,
      parentEmail:
        res['保護者メール']!== undefined? propertyResponseToDomain(res['保護者メール'], 'email') as Email : undefined,
      parentPhoneNumber:
        res['保護者電話番号']!== undefined? propertyResponseToDomain(res['保護者電話番号'], 'phone number') as PhoneNumber : undefined,
      examDate:
        res['試験日']!== undefined? propertyResponseToDomain(res['試験日'], 'start date') as NotionDate : undefined,
      goal:
        res['最終目標']!== undefined? propertyResponseToDomain(res['最終目標'], 'string') as string: undefined,
      registeredSubjectNames:
        res['登録科目']!== undefined? propertyResponseToDomain(res['登録科目'],'subject names') as SubjectsSubjectNameEnum[] : undefined,
      levelModifiedSubjectNames:
        res['レベル変更科目']!== undefined? propertyResponseToDomain(res['レベル変更科目'],'subject names') as SubjectsSubjectNameEnum[] : undefined,
      japaneseLevel:
        res['国語レベル']!== undefined? propertyResponseToDomain(res['国語レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum : undefined,
      japaneseGoalDescription:
        res['国語目標']!== undefined? propertyResponseToDomain(res['国語目標'], 'string') as string : undefined,
      japaneseGoalLevel:
        res['国語目標レベル']!== undefined? propertyResponseToDomain(res['国語目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum : undefined,
      mathLevel:
        res['数学レベル']!== undefined? propertyResponseToDomain(res['数学レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum : undefined,
      mathGoalDescription:
        res['数学目標']!== undefined? propertyResponseToDomain(res['数学目標'], 'string') as string : undefined,
      mathGoalLevel:
        res['数学目標レベル']!== undefined? propertyResponseToDomain(res['数学目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum : undefined,
      englishLevel:
        res['英語レベル']!== undefined? propertyResponseToDomain(res['英語レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum : undefined,
      englishGoalDescription:
        res['英語目標']!== undefined? propertyResponseToDomain(res['英語目標'], 'string') as string : undefined,
      englishGoalLevel:
        res['英語目標レベル']!== undefined? propertyResponseToDomain(res['英語目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum : undefined,
      physicsLevel:
        res['物理レベル']!== undefined? propertyResponseToDomain(res['物理レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum : undefined,
      physicsGoalDescription:
        res['物理目標']!== undefined? propertyResponseToDomain(res['物理目標'], 'string') as string : undefined,
      physicsGoalLevel:
        res['物理目標レベル']!== undefined? propertyResponseToDomain(res['物理目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum : undefined,
      chemistryLevel:
        res['化学レベル']!== undefined? propertyResponseToDomain(res['化学レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum : undefined,
      chemistryGoalDescription:
        res['化学目標']!== undefined? propertyResponseToDomain(res['化学目標'], 'string') as string : undefined,
      chemistryGoalLevel:
        res['化学目標レベル']!== undefined? propertyResponseToDomain(res['化学目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum : undefined,
      biologyLevel:
        res['生物レベル']!== undefined? propertyResponseToDomain(res['生物レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum : undefined,
      biologyGoalDescription:
        res['生物目標']!== undefined? propertyResponseToDomain(res['生物目標'], 'string') as string: undefined,
      biologyGoalLevel:
        res['生物目標レベル']!== undefined? propertyResponseToDomain(res['生物目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum: undefined,
      japaneseHistoryLevel:
        res['日本史レベル']!== undefined? propertyResponseToDomain(res['日本史レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum: undefined,
      japaneseHistoryGoalDescription:
        res['日本史目標']!== undefined? propertyResponseToDomain(res['日本史目標'], 'string') as string: undefined,
      japaneseHistoryGoalLevel:
        res['日本史目標レベル']!== undefined? propertyResponseToDomain(res['日本史目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum: undefined,
      worldHistoryLevel:
        res['世界史レベル']!== undefined? propertyResponseToDomain(res['世界史レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum: undefined,
      worldHistoryGoalDescription:
        res['世界史目標']!== undefined? propertyResponseToDomain(res['世界史目標'], 'string') as string: undefined,
      worldHistoryGoalLevel:
        res['世界史目標レベル']!== undefined? propertyResponseToDomain(res['世界史目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum: undefined,
      geographyLevel:
        res['地理レベル']!== undefined? propertyResponseToDomain(res['地理レベル'], 'a subject level') as StudentSubjectInformationSubjectLevelEnum : undefined,
      geographyGoalDescription:
        res['地理目標']!== undefined? propertyResponseToDomain(res['地理目標'], 'string') as string : undefined,
      geographyGoalLevel:
        res['地理目標レベル']!== undefined? propertyResponseToDomain(res['地理目標レベル'], 'a goal level') as StudentSubjectInformationSubjectGoalLevelEnum : undefined,
      japaneseChange:
        res['国語変更']!== undefined? propertyResponseToDomain(res['国語変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
      mathChange:
        res['数学変更']!== undefined? propertyResponseToDomain(res['数学変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
      englishChange:
        res['英語変更']!== undefined? propertyResponseToDomain(res['英語変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
      physicsChange:
        res['物理変更']!== undefined? propertyResponseToDomain(res['物理変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
      chemistryChange:
        res['化学変更']!== undefined? propertyResponseToDomain(res['化学変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
      biologyChange:
        res['生物変更']!== undefined? propertyResponseToDomain(res['生物変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
      japaneseHistoryChange:
        res['日本史変更']!== undefined? propertyResponseToDomain(res['日本史変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
      worldHistoryChange:
        res['世界史変更']!== undefined? propertyResponseToDomain(res['世界史変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
      geographyChange:
        res['地理変更']!== undefined? propertyResponseToDomain(res['地理変更'], 'a subject change') as StudentDetailInformationSubjectChangeEnum: undefined,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error transforming student detail information:', error);
    throw error;
  }
}

export function toNotion(data: DomainStudentDetailInformation): NotionStudentDetailInformationRequest {
  try {
    const transformed: NotionStudentDetailInformationRequest = {
      [propertyInfo.studentName.name]:
        data.studentName !== undefined ? propertyDomainToRequest(data.studentName, propertyInfo.studentName.type, 'string') : undefined,
      [propertyInfo.parentName.name]:
        data.parentName !== undefined ? propertyDomainToRequest(data.parentName, propertyInfo.parentName.type, 'string') : undefined,
      [propertyInfo.parentEmail.name]:
        data.parentEmail !== undefined ? propertyDomainToRequest(data.parentEmail, propertyInfo.parentEmail.type, 'email') : undefined,
      [propertyInfo.parentPhoneNumber.name]:
        data.parentPhoneNumber !== undefined ? propertyDomainToRequest(data.parentPhoneNumber, propertyInfo.parentPhoneNumber.type, 'phone number') : undefined,
      [propertyInfo.examDate.name]:
        data.examDate !== undefined ? propertyDomainToRequest({start: data.examDate, end: null}, propertyInfo.examDate.type, 'date') : undefined,
      [propertyInfo.goal.name]:
        data.goal !== undefined ? propertyDomainToRequest(data.goal, propertyInfo.goal.type, 'string') : undefined,
      [propertyInfo.registeredSubjectNames.name]:
        data.registeredSubjectNames !== undefined ? propertyDomainToRequest(data.registeredSubjectNames, propertyInfo.registeredSubjectNames.type, 'subject names'): undefined,
      [propertyInfo.levelModifiedSubjectNames.name]:
        data.levelModifiedSubjectNames!== undefined ? propertyDomainToRequest(data.levelModifiedSubjectNames, propertyInfo.levelModifiedSubjectNames.type, 'subject names'): undefined,
      
      [propertyInfo.japaneseLevel.name]:
        data.japaneseLevel !== undefined ? propertyDomainToRequest(data.japaneseLevel, propertyInfo.japaneseLevel.type, 'a subject level') : undefined,
      [propertyInfo.japaneseGoal.name]:
        data.japaneseGoalDescription !== undefined ? propertyDomainToRequest(data.japaneseGoalDescription, propertyInfo.japaneseGoal.type, 'string') : undefined,
      [propertyInfo.japaneseGoalLevel.name]:
        data.japaneseGoalLevel !== undefined ? propertyDomainToRequest(data.japaneseGoalLevel, propertyInfo.japaneseGoalLevel.type, 'a goal level') : undefined,
      
      [propertyInfo.mathLevel.name]:
        data.mathLevel !== undefined ? propertyDomainToRequest(data.mathLevel, propertyInfo.mathLevel.type, 'a subject level') : undefined,
      [propertyInfo.mathGoal.name]:
        data.mathGoalDescription !== undefined ? propertyDomainToRequest(data.mathGoalDescription, propertyInfo.mathGoal.type, 'string') : undefined,
      [propertyInfo.mathGoalLevel.name]:
        data.mathGoalLevel !== undefined ? propertyDomainToRequest(data.mathGoalLevel, propertyInfo.mathGoalLevel.type, 'a goal level') : undefined,
      
      [propertyInfo.englishLevel.name]:
        data.englishLevel !== undefined ? propertyDomainToRequest(data.englishLevel, propertyInfo.englishLevel.type, 'a subject level') : undefined,
      [propertyInfo.englishGoal.name]:
        data.englishGoalDescription !== undefined ? propertyDomainToRequest(data.englishGoalDescription, propertyInfo.englishGoal.type, 'string') : undefined,
      [propertyInfo.englishGoalLevel.name]:
        data.englishGoalLevel !== undefined ? propertyDomainToRequest(data.englishGoalLevel, propertyInfo.englishGoalLevel.type, 'a goal level') : undefined,
      
      [propertyInfo.physicsLevel.name]:
        data.physicsLevel !== undefined ? propertyDomainToRequest(data.physicsLevel, propertyInfo.physicsLevel.type, 'a subject level') : undefined,
      [propertyInfo.physicsGoal.name]:
        data.physicsGoalDescription !== undefined ? propertyDomainToRequest(data.physicsGoalDescription, propertyInfo.physicsGoal.type, 'string') : undefined,
      [propertyInfo.physicsGoalLevel.name]:
        data.physicsGoalLevel !== undefined ? propertyDomainToRequest(data.physicsGoalLevel, propertyInfo.physicsGoalLevel.type, 'a goal level') : undefined,
      
      [propertyInfo.chemistryLevel.name]:
        data.chemistryLevel !== undefined ? propertyDomainToRequest(data.chemistryLevel, propertyInfo.chemistryLevel.type, 'a subject level') : undefined,
      [propertyInfo.chemistryGoal.name]:
        data.chemistryGoalDescription !== undefined ? propertyDomainToRequest(data.chemistryGoalDescription, propertyInfo.chemistryGoal.type, 'string') : undefined,
      [propertyInfo.chemistryGoalLevel.name]:
        data.chemistryGoalLevel !== undefined ? propertyDomainToRequest(data.chemistryGoalLevel, propertyInfo.chemistryGoalLevel.type, 'a goal level') : undefined,
      
      [propertyInfo.biologyLevel.name]:
        data.biologyLevel !== undefined ? propertyDomainToRequest(data.biologyLevel, propertyInfo.biologyLevel.type, 'a subject level') : undefined,
      [propertyInfo.biologyGoal.name]:
        data.biologyGoalDescription !== undefined ? propertyDomainToRequest(data.biologyGoalDescription, propertyInfo.biologyGoal.type, 'string') : undefined,
      [propertyInfo.biologyGoalLevel.name]:
        data.biologyGoalLevel !== undefined ? propertyDomainToRequest(data.biologyGoalLevel, propertyInfo.biologyGoalLevel.type, 'a goal level') : undefined,
      
      [propertyInfo.japaneseHistoryLevel.name]:
        data.japaneseHistoryLevel !== undefined ? propertyDomainToRequest(data.japaneseHistoryLevel, propertyInfo.japaneseHistoryLevel.type, 'a subject level') : undefined,
      [propertyInfo.japaneseHistoryGoal.name]:
        data.japaneseHistoryGoalDescription !== undefined ? propertyDomainToRequest(data.japaneseHistoryGoalDescription, propertyInfo.japaneseHistoryGoal.type, 'string') : undefined,
      [propertyInfo.japaneseHistoryGoalLevel.name]:
        data.japaneseHistoryGoalLevel !== undefined ? propertyDomainToRequest(data.japaneseHistoryGoalLevel, propertyInfo.japaneseHistoryGoalLevel.type, 'a goal level') : undefined,
        
      [propertyInfo.worldHistoryLevel.name]:
        data.worldHistoryLevel !== undefined ? propertyDomainToRequest(data.worldHistoryLevel, propertyInfo.worldHistoryLevel.type, 'a subject level') : undefined,
      [propertyInfo.worldHistoryGoal.name]:
        data.worldHistoryGoalDescription !== undefined ? propertyDomainToRequest(data.worldHistoryGoalDescription, propertyInfo.worldHistoryGoal.type, 'string') : undefined,
      [propertyInfo.worldHistoryGoalLevel.name]:
        data.worldHistoryGoalLevel !== undefined ? propertyDomainToRequest(data.worldHistoryGoalLevel, propertyInfo.worldHistoryGoalLevel.type, 'a goal level') : undefined,
        
      [propertyInfo.geographyLevel.name]:
        data.geographyLevel !== undefined ? propertyDomainToRequest(data.geographyLevel, propertyInfo.geographyLevel.type, 'a subject level') : undefined,
      [propertyInfo.geographyGoal.name]:
        data.geographyGoalDescription !== undefined ? propertyDomainToRequest(data.geographyGoalDescription, propertyInfo.geographyGoal.type, 'string') : undefined,
      [propertyInfo.geographyGoalLevel.name]:
        data.geographyGoalLevel !== undefined ? propertyDomainToRequest(data.geographyGoalLevel, propertyInfo.geographyGoalLevel.type, 'a goal level') : undefined,
        
      [propertyInfo.japaneseChange.name]:
        data.japaneseChange !== undefined ? propertyDomainToRequest(data.japaneseChange, propertyInfo.japaneseChange.type, 'a subject change') : undefined,
      [propertyInfo.mathChange.name]:
        data.mathChange !== undefined ? propertyDomainToRequest(data.mathChange, propertyInfo.mathChange.type, 'a subject change') : undefined,
      [propertyInfo.englishChange.name]:
        data.englishChange !== undefined ? propertyDomainToRequest(data.englishChange, propertyInfo.englishChange.type, 'a subject change') : undefined,
      [propertyInfo.physicsChange.name]:
        data.physicsChange !== undefined ? propertyDomainToRequest(data.physicsChange, propertyInfo.physicsChange.type, 'a subject change') : undefined,
      [propertyInfo.chemistryChange.name]:
        data.chemistryChange !== undefined ? propertyDomainToRequest(data.chemistryChange, propertyInfo.chemistryChange.type, 'a subject change') : undefined,
      [propertyInfo.biologyChange.name]:
        data.biologyChange !== undefined ? propertyDomainToRequest(data.biologyChange, propertyInfo.biologyChange.type, 'a subject change') : undefined,
      [propertyInfo.japaneseHistoryChange.name]:
        data.japaneseHistoryChange !== undefined ? propertyDomainToRequest(data.japaneseHistoryChange, propertyInfo.japaneseHistoryChange.type, 'a subject change') : undefined,
      [propertyInfo.worldHistoryChange.name]:
        data.worldHistoryChange !== undefined ? propertyDomainToRequest(data.worldHistoryChange, propertyInfo.worldHistoryChange.type, 'a subject change') : undefined,
      [propertyInfo.geographyChange.name]:
        data.geographyChange !== undefined ? propertyDomainToRequest(data.geographyChange, propertyInfo.geographyChange.type, 'a subject change') : undefined,
    };

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error("Error transforming student detail information from domain to notion request", error);
    throw error;
  }
};

export class NotionStudentDetailInformation extends NotionRepository<
  DomainStudentDetailInformation,
  NotionStudentDetailInformationResponse,
  NotionStudentDetailInformationRequest
> {
    protected toDomain(response: NotionStudentDetailInformationResponse): DomainStudentDetailInformation {
      return toDomain(response);
    };
    protected toNotion(domain: DomainStudentDetailInformation): NotionStudentDetailInformationRequest {
      return toNotion(domain);
    }
  }