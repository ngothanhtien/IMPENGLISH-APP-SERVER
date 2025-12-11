export interface IUserConstants {
    _id?: string;
    type?: 'user' | 'admin';
    fullName?: string;
    email?: string;
    password?: string;      // new password
    oldPassword?: string;   // old password
    phone?: string;
    avatar?: string;
}