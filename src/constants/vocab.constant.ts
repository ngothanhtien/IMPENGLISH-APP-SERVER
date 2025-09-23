
export interface IVocabularyFlashCard {
    id: string,
    word: string,
    pronunciation?: string,
    audio?: string,
    definition?: string,
    example?: string,
    level?: string,
    topic?: string,
    partOfSpeech?: string
}