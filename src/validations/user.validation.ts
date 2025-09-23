import { HttpStatus } from "../constants/http.constant";
import { validationError } from "../errors/allError";

export const validationUser = {
    register: (fullName?: string, email?: string, password?: string) => {
        if (!fullName || !email || !password) {
            return { status: HttpStatus.BAD_REQUEST, message: "Please enter complete information!" };
        }

        if (!validationError.onlyRegularChar(fullName)) {
            return { status: HttpStatus.BAD_REQUEST, message: "FullName is INVALID!" };
        }

        if (!validationError.isValidEmail(email)) {
            return { status: HttpStatus.BAD_REQUEST, message: "Email is INVALID!" };
        }

        if (!validationError.isValidPassword(password)) {
            return { status: HttpStatus.BAD_REQUEST, message: "Password is INVALID!" };
        }
        return null
    },
    login: (email?: string, password?: string) => {
        if (!email || !password) {
            return { status: HttpStatus.BAD_REQUEST, message: "Please enter complete information!" };
        }
        if (!validationError.isValidEmail(email)) {
            return { status: HttpStatus.BAD_REQUEST, message: "Email is INVALID!" };
        }

        if (!validationError.isValidPassword(password)) {
            return { status: HttpStatus.BAD_REQUEST, message: "Password is INVALID!" };
        }   
        return null
    }
};