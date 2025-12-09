export interface IQuizzResultConstant {
    userId?: string,
    level?: "Easy" | "Medium" | "Hard",
    category?: string,
    totalQuestions?: number,
    correctAnswers?: number,
    incorrectAnswers?: number,
    questions?: Array<{
        questionId: string,
        questionText: string,
        selectedAnswer: string,
        correctAnswer: string,
        isCorrect: boolean
    }>,
    statusFinish?: boolean,
    completeAt?: Date
}