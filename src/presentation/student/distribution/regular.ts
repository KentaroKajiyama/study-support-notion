import{
  logger
} from '@utils/index.js';
import{
  dealWithTodosForAllStudents,
  dealWithWrongsForAllStudents,
  dealWithIsDifficultsForAllStudents,
  dealWithStudentProblemsForAllStudents,
  sendTodoCountersForAllStudents,
  sendReviewsForAllStudents,
} from '@usecase/index.js';
import { 
  Request ,
  Response
} from 'express';

export const regularHandler = async (req: Request, res: Response) => {
  try {
    await dealWithTodosForAllStudents();
    await dealWithWrongsForAllStudents();
    await dealWithIsDifficultsForAllStudents();
    await dealWithStudentProblemsForAllStudents();
    await sendTodoCountersForAllStudents();
    await sendReviewsForAllStudents();
    res.status(200).json({ message: 'Succeeded in handling all students distributions!'});
  } catch (error) {
    logger.error(`Error in regularHandler: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}