
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
    }
}
