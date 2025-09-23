import { HttpStatus } from "../constants/http.constant";
import { validationError } from "../errors/allError";

export const validationFilterOptions = {
    filterOptions: (options: any) => {
        const { level,page,limit, sortBy, sortOrder,topic } = options;

        const validSortByFields = ['word', 'level', 'topic'];
        const validSortOrders = ['asc', 'desc'];
        const levelSort = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        if (level && typeof level !== 'string') {
            return { status: HttpStatus.BAD_REQUEST, message: "Level must be a string!" };
        }
        if (level && !levelSort.includes(level)) {
            return { status: HttpStatus.BAD_REQUEST, message: `Level must be one of: ${levelSort.join(', ')}`};
        }
        if (page && (isNaN(page) || page < 1)) {
            return { status: HttpStatus.BAD_REQUEST, message: "Page must be a number greater than 0!" };
        }
        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            return { status: HttpStatus.BAD_REQUEST, message: "Limit must be a number between 1 and 100!" };
        }
        if (sortBy && !validSortByFields.includes(sortBy)) {
            return { status: HttpStatus.BAD_REQUEST, message: `sortBy must be one of: ${validSortByFields.join(', ')}` };
        }
        if (sortOrder && !validSortOrders.includes(sortOrder)) {
            return { status: HttpStatus.BAD_REQUEST, message: `sortOrder must be either 'asc' or 'desc'` };
        }
        if (topic && typeof topic !== 'string') {
            return { status: HttpStatus.BAD_REQUEST, message: "Topic must be a string!" };
        }
        return null;
    }
};