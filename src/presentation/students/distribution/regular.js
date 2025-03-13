import logger from "../../../utils/logger";
import { allStudentsDataUpdateAtMidnight } from "../../../usecase/allStudentsDataUpdateAtMidnight";

export const regularHandler = async (req, res) => {
  try {
    await allStudentsDataUpdateAtMidnight();
    return res.status(200).json({ message: 'Succeeded in handling all students distributions!'});
  } catch (error) {
    logger.error(`Error in regularHandler: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}