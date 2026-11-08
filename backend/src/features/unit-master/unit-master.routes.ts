import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import { unitMasterController } from './unit-master.controller';
import { createUnitMasterSchema, updateUnitMasterSchema } from './unit-master.validation';

const router = Router();

router.post('/', validate(createUnitMasterSchema), unitMasterController.createUnit);
router.get('/', unitMasterController.getUnits);
router.get('/:id', unitMasterController.getUnitById);
router.patch('/:id', validate(updateUnitMasterSchema), unitMasterController.updateUnit);
router.delete('/:id', unitMasterController.deleteUnit);

export const unitMasterRoutes = router;
