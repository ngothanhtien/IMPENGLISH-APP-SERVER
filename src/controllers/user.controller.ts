import { User } from "../models/user.model";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { IUserRegister } from "../models/user.model";
import { validationError } from "../errors/allError";
import { HttpStatus } from "../constants/http.constant";
import { userService } from "../services/user.service";
import bcrypt from 'bcrypt'
import { validationUser } from "../validations/user.validation";
import mongoose, { get } from "mongoose";
import { IUserConstants } from "../constants/user.constant";
import { verificationOTP } from "../services/verifyotp.service";

interface RequestWithUser extends Request {
    user?: { _id?: string; id?: string; [key: string]: any }
}
export const userController = {
    register: asyncHandler(async (req: Request, res: Response)=>{
        const data: IUserRegister = req.body;
        const {fullName, email, password} = data;

        const validateUser = validationUser.register(fullName, email, password);

        if(validateUser){
            res.status(validateUser.status);
            throw new Error(validateUser.message);
        }

        const hashPassword = await bcrypt.hash(password,10);

        const newUser = await userService.registerUser({
            fullName,
            email,
            password: hashPassword
        });
        if(!newUser){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("User is already exists")
        }
        await verificationOTP.sendOTP(email);
        res.status(HttpStatus.OK).json({
            status: "success",
            message: "Registration successful! Please check your email to verify your account.",
            otpSent: true
        });
    }),

    verifyOTP: asyncHandler(async(req: Request, res: Response) => {
        const {email,otp} = req.body;
        const result = await verificationOTP.verifyUserOTP(email,otp);

        const user = await User.findOne({email: email});
        
        if (!user) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("Account with email need verify is not found");
        }

        if(!result.success){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error(result.message);
        }
        user.verify = true;
        await user.save();
        
        res.status(HttpStatus.OK).json({
            title: "Account Verified",
            message: result.message
        });
    }),

    getRecordOTP: asyncHandler(async(req: Request, res: Response) => {
        const records = await verificationOTP.getRecordOTP();
        res.status(HttpStatus.OK).json({recordOTP: records})
    }),

    getAllUser: asyncHandler(async(req: Request, res: Response) => {
        const allUser = await userService.getAllUser();
        const countUser = await User.countDocuments();
        res.status(HttpStatus.OK).json({
            total_users: countUser,
            users: allUser
        })
    }),
    getProfile: asyncHandler(async(req: RequestWithUser, res: Response)=>{
        const userId = req.user?._id || req.user?.id;
        if(!userId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("User ID is missing");
        }
        const user = await userService.getUserbyid(userId as string);
        if(!user){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("User not found");
        }

        delete user['password'];

        res.status(HttpStatus.OK).json({
            message: "User profile retrieved successfully",
            user: user
        });
    }),

    getUserById: asyncHandler(async(req: Request, res: Response) => {
        const userid = req.params.id;
        
        if(!mongoose.Types.ObjectId.isValid(userid)){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("Invalid user ID");
        }

        const userInfor = await userService.getUserbyid(userid);

        if(!userInfor){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("Not found user with id");
        }
        res.status(HttpStatus.OK).json(userInfor);
    }),

    updateUserById: asyncHandler(async(req: Request, res: Response) => {
        const userid = req.params.id;
        const data:IUserConstants = req.body;
        
        const userUpdate = await userService.updateUserById(userid,data);
        
        if(!userUpdate){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("Update is not successfully ");
        }
        res.status(HttpStatus.OK).json({message: "Update successfully",infor: userUpdate})
    }),
    
    deleteUserById: asyncHandler(async(req: Request, res: Response)=>{
        const userid = req.params.id;

        const deleteUser = await userService.deleteUserById(userid);
        if(!deleteUser){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("User deletion failed. Please check the user ID again!");
        }
        res.status(HttpStatus.OK).json({
            message: "User deleted successfully"
        })
    }),

    resendOTP: asyncHandler(async(req: Request, res: Response) => {
        const {email} = req.body;
        const user = await User.findOne({email: email});

        if(!user){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("Account with email need verify is not found");
        }

        if(user.verify){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Account is already verified");
        }
        const result = await verificationOTP.resenOTP(email);
        if(!result.success){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(result.message);
        }

        res.status(HttpStatus.OK).json({title: result.title, message: result.message});
    }),
}