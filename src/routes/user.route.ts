import express from 'express'
import { userController } from '../controllers/user.controller'
import {requireAuth} from '../middlewares/auth.middleware'

const router = express.Router();

router.post('/register',userController.register);
router.post('/verify-otp',userController.verifyOTP);
router.put('/:id',userController.updateUserById);
router.delete('/:id',userController.deleteUserById);

router.get('/profile',requireAuth,userController.getProfile);
router.get('/',userController.getAllUser);
router.get('/record-otp',userController.getRecordOTP);
router.get('/:id',userController.getUserById);

export const userRouter = router;
