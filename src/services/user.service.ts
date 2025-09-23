import { User,IUserRegister } from "../models/user.model";
import { IUserConstants } from "../constants/user.constant";
import  bcrypt from 'bcrypt'
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString(); // random từ 1000 → 9999
}

export const userService = {
    registerUser: async(userData: IUserRegister) => {
        const existingUser = await User.findOne({email: userData.email});
        if(existingUser && existingUser.verify === true) return false;

        let user: any;

        if (existingUser && existingUser.verify === false) {
            const userid = String(existingUser._id);
            const userupdate = await userService.updateUserById(
                userid,
                {
                    fullName: userData.fullName,
                    password: userData.password
                });
            user = userupdate;
        } else {
            // chưa tồn tại → tạo mới
            const newUser = new User({
                ...userData,
                verify: false
            });
            await newUser.save();
            user = newUser;
        }
        const {email, fullName, password} = user;
        return {email,fullName,password};
    },

    getUserbyid: async(userId: string) => {
        const user = await User.findById(userId).select('-password').lean();
        if(!user) return false;
        return user;
    },

    updateUserById: async(userId: string, userData: IUserConstants) => {
        try {
            if(userData.password){
                userData.password = await bcrypt.hash(userData.password, 10);
            }
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $set: userData
                },
                {
                    new: true
                }
            ).select("-password");
            if(!updatedUser) return false;
            return updatedUser;
        } catch (error) {
            console.error("Error updating user:", error);
            return false;
        }
    },

    getAllUser: async () =>{
        return await User.find().select('-password').lean();
    },

    deleteUserById: async (userid: string) => {
        const userDelete = await User.findByIdAndDelete(userid).lean();
        if(!userDelete) return false;

        return userDelete;
    }
}