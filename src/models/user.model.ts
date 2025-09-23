import { Schema, model, Document } from "mongoose";

const userSchema = new Schema<IUser>({
    email:{
        type: String,
        required: [true,"Please enter your email"],
        unique: true
    },
    password:{
        type: String,   
    },
    fullName:{
        type: String,
    },
    phone:{
        type: String,
        maxLength: 12,
        default: ""
    },
    provider:{
        type: String,
        default: 'app'
    },
    googleId:{
        type: String,
        default: ""
    },
    avatar:{
        type: String,
        default: ""
    },
    streakDay:{
        type: Number,
        default: 0
    },
    level:{
        type: String,
        default: "newbie"
    },
    verify:{
        type: Boolean,
        default: false
    },
    status:{
        type: Boolean,
        default: true
    },
    type:{
        type: String,
        default: 'user'
    }
},
{
    timestamps: true
}
)
export const User = model<IUser>("User",userSchema);
userSchema.index({ email: 1, });

export interface IUser extends Document {
  email: string;
  password?: string;
  fullName?: string;
  phone?: string;
  provider: "app" | "google";
  googleId?: string;
  avatar?: string;
  streakDay?: number;
  level?: string;
  verify?: boolean;
  status?: boolean;
  type: "user"|"admin";
}

export interface IUserRegister{
    fullName: string;
    email: string;
    password: string;
    verify?: boolean;
}