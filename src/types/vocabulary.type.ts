// Types cho vocabulary service
export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface FilterOptions {
    level?: string;
    sortBy?: string;
    topic?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface QuizOptions {
    level?: string;
    topic?: string;
    count?: number;
    questionType?: 'multiple-choice' | 'fill-blank' | 'definition-match';
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface QuizQuestion {
    word: string;
    question: string;
    correctAnswer: string;
    options?: string[];
    questionType: 'multiple-choice' | 'fill-blank' | 'definition-match';
}

export interface WordLengthFilter {
    minLength?: number;
    maxLength?: number;
}