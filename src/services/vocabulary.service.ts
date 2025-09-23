import { IVocabularyFlashCard } from '../constants/vocab.constant';
import { Vocabulary, IVocabulary } from '../models/vocabulary.model';
import { 
    PaginationOptions, 
    FilterOptions, 
    QuizOptions, 
    PaginationResult, 
    QuizQuestion,
    WordLengthFilter 
} from '../types/vocabulary.type';

export const vocabularyService = {

    // lấy từ vựng theo chủ đề
    findByTopic: async(
        topic: string,
        options: PaginationOptions & FilterOptions = {}
    ):Promise<PaginationResult<IVocabulary> | false> => {
        try {
            const {level, limit = 10, page = 1, sortBy = 'word', sortOrder = 'asc'} = options;
            
            if(page < 1){
                throw new Error("Page must be greater than 0");
            }

            const query: any = {topic: topic.toLowerCase()};
            
            // kiem tra topic co ton tai khong
            const isCheckTopic = await Vocabulary.findOne({topic: topic.toLowerCase()}).lean();
            if(!isCheckTopic) return false;
            
            if(level) query.level = level;
            const skip =(page - 1)*limit;

            // tao sort object
            const sortObj: any = {};
            sortObj[sortBy] = sortOrder == 'desc' ? -1 : 1;
            
            const [data,total] = await Promise.all([
                Vocabulary.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
                Vocabulary.countDocuments(query)
            ]);

            return {   
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total/limit)
                }
            };
        } catch (error) {
            console.error('Error in findByTopic:', error);
            throw error;
        }
    },

    // tu co nhieu nghia
    findWordsWithMultipleMeanings: async(
        options: PaginationOptions & FilterOptions = {}
    ): Promise<PaginationResult<IVocabulary> | false> => {
        try {
            const { level, limit = 10, page = 1, sortBy = 'word', sortOrder = 'asc' } = options;
            const query: any = {
                $expr: {$gt: [{$size : "$meanings"},1]}
            };
            if (level) query.level = level;
            const skip = (page - 1) * limit;
            const sortObj: any = {};
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
            const [data, total] = await Promise.all([
                Vocabulary.find(query)
                    .sort(sortObj)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Vocabulary.countDocuments(query)
            ]);
            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error in findWordsWithMultipleMeanings:', error);
            throw error;
        }
    },

    getRandomWords: async (
        count: number = 10,
        options: FilterOptions  = {}
    ): Promise<IVocabulary[]> => {
        try {
            const {level,topic} = options;
            const query: any ={};
            if(level) query.level = level;
            if(topic) query.topic = topic.toLowerCase();
            const data = await Vocabulary.aggregate([
                {$match: query},
                {$sample: {size: count}}
            ]);
            return data;
        } catch (error) {
            console.error('Error in findWordsWithMultipleMeanings:', error);
            throw error;
        }
    },

    getAllVocabulary: async( options: PaginationOptions & FilterOptions = {}):
     Promise<PaginationResult<IVocabulary> | false>=>{
        try {
            const {level, limit = 10, page = 1, sortBy = 'word', sortOrder = 'asc'} = options;
            
            if(page < 1){
                throw new Error("Page must be greater than 0");
            }
            const query: any = {};

            if(level) query.level = level;

            const skip =(page - 1)*limit;

            // tao sort object
            const sortObj: any = {};
            sortObj[sortBy] = sortOrder == 'desc' ? -1 : 1;
            
            const [data,total] = await Promise.all([
                Vocabulary.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
                Vocabulary.countDocuments(query)
            ]);

            return {   
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total/limit)
                }
            };
        } catch (error) {
            console.error('Error in getAllVocabulary:', error);
            throw error;
        }
    },

    getFlashcardsByTopic: async(
        topic?: string,
        options: PaginationOptions & FilterOptions = {}
    ):Promise<PaginationResult<IVocabularyFlashCard> | false> => {
        try {
            const {level, limit = 10, page = 1, sortBy = 'word', sortOrder = 'asc'} = options;
            if(page < 1){
                throw new Error("Page must be greater than 0");
            }
            const query: any = {};
            if(topic) query.topic = topic.toLowerCase();
            if(level) query.level = level;
            const skip =(page - 1)*limit;
            // tao sort object
            const sortObj: any = {};
            sortObj[sortBy] = sortOrder == 'desc' ? -1 : 1;
            const [data,total] = await Promise.all([
                Vocabulary.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
                Vocabulary.countDocuments(query)
            ]);
            const dataFlashCards = data.map((def: any): IVocabularyFlashCard => ({
                    id: def._id as string,
                    word: def.word as string,
                    pronunciation: def.phonetics[0]?.text || '',
                    audio: def.phonetics.length && def.phonetics[0]?.audio ||def.phonetics[1]?.audio || '',
                    definition: def.meanings.length && def.meanings[0].definitions.length ? def.meanings[0].definitions[0].definition : '',
                    example: def.meanings.length && def.meanings[0].definitions.length ? def.meanings[0].definitions[0].example : '',
                    level: def.level || '',
                    topic: def.topic || '',
                    partOfSpeech: def.meanings.length ? def.meanings[0].partOfSpeech : ''
                }));
            return {   
                data: dataFlashCards,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total/limit)
                }
            };
        } catch (error) {
            console.error('Error in getFlashcardsByTopic:', error);
            throw error;
        }
    },

    getFlashcards: async(
        options: PaginationOptions & FilterOptions = {}
    ):Promise<PaginationResult<IVocabularyFlashCard> | false> => {
        try {
            const {level, limit = 10, page = 1, sortBy = 'word', sortOrder = 'asc'} = options;
            if(page < 1){
                throw new Error("Page must be greater than 0");
            }
            const query: any = {};
            if(level) query.level = level;
            const skip =(page - 1)*limit;
            // tao sort object
            const sortObj: any = {};
            sortObj[sortBy] = sortOrder == 'desc' ? -1 : 1;
            const [data,total] = await Promise.all([
                Vocabulary.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
                Vocabulary.countDocuments(query)
            ]);
            const dataFlashCards = data.map((def: any): IVocabularyFlashCard => ({
                    id: def._id as string,
                    word: def.word as string,
                    pronunciation: def.phonetics[0]?.text || '',
                    audio: def.phonetics.length && def.phonetics[0]?.audio ||def.phonetics[1]?.audio || '',
                    definition: def.meanings.length && def.meanings[0].definitions.length ? def.meanings[0].definitions[0].definition : '',
                    example: def.meanings.length && def.meanings[0].definitions.length ? def.meanings[0].definitions[0].example : '',
                    level: def.level || '',
                    topic: def.topic || '',
                    partOfSpeech: def.meanings.length ? def.meanings[0].partOfSpeech : ''
                }));
            return {   
                data: dataFlashCards,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total/limit)
                }
            };
        } catch (error) {
            console.error('Error in getFlashcardsByTopic:', error);
            throw error;
        }
    }
}