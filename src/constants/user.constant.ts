export interface IUserConstants{
    _id?:string;
    type?: 'user' | 'admin';
    fullName?: string;
    email?: string;
    password?: string;
    phone?:string;
    avatar?: string;
}