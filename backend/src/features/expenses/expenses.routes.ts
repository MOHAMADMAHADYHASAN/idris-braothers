import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { expensesController } from './expenses.controller';
import { createExpenseSchema, updateExpenseSchema } from './expenses.validation';

const router = Router();

router.post('/', validate(createExpenseSchema), expensesController.createExpense);
router.get('/', expensesController.getExpenses);
router.get('/:id', expensesController.getExpenseById);
router.patch('/:id', validate(updateExpenseSchema), expensesController.updateExpense);
router.delete('/:id', expensesController.deleteExpense);

export const expenseRoutes = router;
