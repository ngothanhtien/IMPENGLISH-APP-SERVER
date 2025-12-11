
export const validationError = {
    onlyRegularChar: (str: string) =>{
        const regex = /^[\p{L}\s]+$/u;
        return regex.test(str);
    },
    onlyRegularCharAndNumber:(str: string) => {
        const regex = /^[a-zA-Z0-9]+$/;
        return regex.test(str)
    },
    isValidEmail: (str: string) => {
        const regex = /^[\w.-]+@gmail\.com$/i;
        return regex.test(str);
    },
    isValidPassword: (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,25}$/;
        return regex.test(password);
    },
    isPhoneNumber: (phone: string) => {
        const regex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/;
        return regex.test(phone);
    }
}
