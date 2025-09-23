import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { HttpStatus } from "../constants/http.constant";
import { authService } from "../services/auth.service";
import { validationUser } from "../validations/user.validation";
import { IUserConstants } from "../constants/user.constant";
import { refreshTokenService } from "../services/refreshtoken.service";
import { hashToken } from "../untils/token";
import crypto from "crypto";
import { RefreshToken } from "../models/refreshtoken.model";
export const authController = {
    login: asyncHandler(async (req: Request, res: Response)=>{
        const {email, password} = req.body;
        const validation =  validationUser.login(email,password);

        if(validation){
            res.status(validation.status);
            throw new Error(validation.message);
        };
        const result = await authService.login(email,password);
        if(!result){
            res.status(HttpStatus.UNAUTHORIZED);
            throw new Error("Invalid email or password");
        };

        const user = await authService.findOne(email);
        if(!user){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("User is not found");
        };
        const dataTokenUser: IUserConstants = {
            _id: user._id as string,
            email: user.email,
            type: user.type,
        }
        const accessToken = authService.generateAccessToken(dataTokenUser);
        const refreshToken = await authService.generateRefreshToken(dataTokenUser);

        res.status(HttpStatus.OK).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                type: user.type,
            }
        });
    }),

    refreshToken: asyncHandler(async (req: Request, res: Response)=>{
        const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;

        if(!refreshToken){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Refresh token is required");
        }  
        const record = await refreshTokenService.findByToken(refreshToken);
        if(!record){
            res.status(HttpStatus.FORBIDDEN);
            throw new Error('Refresh token not recognized');
        }
        if(record.revoked || record.expiresAt < new Date()){
            res.status(HttpStatus.FORBIDDEN);
            throw new Error('Refresh token revoked or expired');
        }
        // rotate: create new refresh token, save, revoke old
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        await refreshTokenService.save(newRefreshToken, record.userId.toString(), record.email, req.ip, req.headers['user-agent'] || '');
        await RefreshToken.updateOne({ _id: record._id }, { revoked: true, revokedAt: new Date(), replacedByHash: hashToken(newRefreshToken) });

        const payload = {
            _id: record.userId.toString(),
            email: record.email,
        };

        const newAccessToken = authService.generateAccessToken(payload);
        const maxAge = parseInt(process.env.EXPIRES_REFRESHTOKEN as string) * 1000; // convert to ms
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge, path: '/',sameSite: 'lax' });
        res.status(HttpStatus.OK).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }),

    logout: asyncHandler(async (req: Request, res: Response) => {
        const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
        if (token) {
        await refreshTokenService.revokeByToken(token);
        }
        res.clearCookie('refreshToken', { path: '/' });
        res.status(HttpStatus.OK).json({ message: 'Logged out successfully' })
    }),

    getRecordRefreshToken: asyncHandler(async (req: Request, res: Response) => {
        const records = await refreshTokenService.getAll();
        res.status(HttpStatus.OK).json({recordRefreshToken: records})
    }),

    deleteAllRefreshToken: asyncHandler(async (req: Request, res: Response) => {
        await refreshTokenService.deleteAll();
        res.status(HttpStatus.OK).json({message: "All refresh tokens have been deleted"})
    }),

    getAllRefreshToken: asyncHandler(async (req: Request, res: Response) => {
        const records = await refreshTokenService.getAll();
        res.status(HttpStatus.OK).json({recordRefreshToken: records})
    }),
}