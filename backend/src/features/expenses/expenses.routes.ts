import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { expensesController } from './expenses.controller';
import { parseCreateExpense, parseUpdateExpense } from './expenses.validation';

const router = Router();

router.post('/', validate(parseCreateExpense), expensesController.createExpense);
router.get('/', expensesController.getExpenses);
router.get('/:id', expensesController.getExpenseById);
router.patch('/:id', validate(parseUpdateExpense), expensesController.updateExpense);
router.delete('/:id', expensesController.deleteExpense);

export const expenseRoutes = router;
