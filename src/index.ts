import express from 'express';
import { requestLogger, errorLogger } from './utils/loggerMiddleware.js';
import logger from './utils/logger.js';
import { errorHandler } from './utils/validation.js';
import { regularHandler } from './presentation/students/distribution/regular.js';
import { todoHandler } from './presentation/students/interaction/todo.js';
import { studentProblemHandler } from './presentation/students/interaction/studentProblem.js';
import { detailHandler } from './presentation/coach/student_info/detail.js';
import { wrongHandler } from './presentation/students/interaction/wrong.js';
import { isDifficultHandler } from './presentation/students/interaction/isDifficult.js';
import { simulationHandler } from './presentation/coach/plan/simulationHandler.js';
import { confirmationHandler } from './presentation/coach/plan/confirmationHandler.js';
import { irregularCheckHandler } from './presentation/coach/plan/irregularCheckHandler.js';

const app = express();
app.use(express.json());
app.use(errorHandler);

// 1) Students daily distribution request
app.get('/students/distribution/regular', async (req, res) => {
  await regularHandler(req, res);
});

// 2) Students interaction with top problems
app.post('/students/interaction/todo', async (req, res) => {
  await todoHandler(req, res);
});

app.post('/students/interaction/wrong', async (req, res) => {
  await wrongHandler(req, res);
});

app.post('/students/interaction/is_difficult', async (req, res) => {
  await isDifficultHandler(req, res);
});

// 3) Students interaction with source problems
app.post('/students/interaction/student_problem', async (req, res) => {
  await studentProblemHandler(req, res);
});

// 4) Coach interaction with students overviews
app.post('/coach/student_info/overview', async (req, res) => {
});

// 5) Coach interaction with students detail
app.post('/coach/student_info/detail', async (req, res) => {
  await detailHandler(req, res);
});

// 6) Coach simulates a plan
app.post('/coach/plan/simulation', async (req, res) => {
  await simulationHandler(req, res);
})

// 7) Coach determines a plan
app.post('/coach/plan/confirmation', async (req, res) => {
  await confirmationHandler(req, res);
})

// 8) Irregular interaction
app.post('/coach/plan/irregular_check', async (req, res) => {
  await irregularCheckHandler(req, res);
})

// 9) When Page Added to notion Database.
app.post('/page/add', async (req, res) => {
})

// 10) When Original Problem is Updated.

// 11) Create a student page

// 12) When A Problem's Database Property is Updated.

// 13) When Updateing A Student Page UI related to The Student Information. 

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});