import { User } from "../models/user.model";
import bcrypt  from 'bcrypt'
import { IUserConstants } from "../constants/user.constant";
import jwt from 'jsonwebtoken'
import { refreshTokenService } from "./refreshtoken.service";
import crypto from 'crypto';

export const authService = {
    login: async (email: string, password: string) => {
        const user = await User.findOne({ email: email }).lean();
        
        if (!user) return false;

        const isPasswordValid = await bcrypt.compare(password,user.password as string);
        if (!isPasswordValid) return false; 

        return user;
    },

    findOne: async (email: string) => {
        const user = await User.findOne({ email: email }).lean();
        if (!user) return false;
        return user;
    },

    refreshToken: async (refreshToken: string) => {
        const user = await User.findOne({ refreshToken: refreshToken }).lean();
        if (!user) return false;
        return user;
    },

    generateAccessToken: (user: IUserConstants) => {
        const token = jwt.sign(
            user,
            process.env.SECRET_KEY_ACCESSTOKEN as string,
            {expiresIn: parseInt(process.env.EXPIRES_ACCESSTOKEN as string)}
        );
        return token;
    },

    generateRefreshToken: async (user: IUserConstants) => {
        const token = crypto.randomBytes(64).toString('hex');
        await refreshTokenService.save(token,user._id as string,user.email as string,user.type as string);
        return token;
    }
}