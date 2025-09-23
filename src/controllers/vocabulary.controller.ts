import { vocabularyService } from "../services/vocabulary.service";
import { Vocabulary } from "../models/vocabulary.model";
import asynchandler from 'express-async-handler'
import {Request, Response} from 'express'
import { HttpStatus } from "../constants/http.constant"; 
import { get } from "mongoose";
import { validationFilterOptions } from "../validations/filterOptions.validation";
export const vocabularyController = {

    findByTopic: asynchandler(async(req: Request, res: Response) =>{
        const topic = req.params.topic;

        const options = {
            level: req.query.level as string,
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10,
            sortBy: req.query.sortBy as string || 'word',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
        };
        if (!topic || topic.trim() === '') {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Topic is required!");
        }

        const validationError = validationFilterOptions.filterOptions(options);

        if (validationError) {
            res.status(validationError.status);
            throw new Error(validationError.message);
        }

        const vocab_with_topic = await vocabularyService.findByTopic(topic, options);
        
        
        if (!vocab_with_topic || vocab_with_topic.data.length === 0) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error(`No vocabulary found for topic: ${topic}`);
        }
        
        if(options.page > vocab_with_topic.pagination.pages){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(`Max current page is: ${vocab_with_topic.pagination.pages}`);
        }
        
        res.status(HttpStatus.OK).json({
            success: true,
            message: `Found ${vocab_with_topic.data.length} words for topic: ${topic}`,
            data: vocab_with_topic.data,
            pagination: vocab_with_topic.pagination
        });
    }),

    getRandomWords: asynchandler( async(req: Request, res: Response) => {
        const options = {
            topic: req.query.topic as string,
            level: req.query.level as string,
            sortBy: req.query.sortBy as string || 'word',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
        };
        const randomwords = await vocabularyService.getRandomWords(10,options);
        if(!randomwords){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Not get Random Word with the topic!");
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: `Generate Random word with topic`,
            data: randomwords,
        })
    }),

    findWordsWithMultipleMeanings: asynchandler(async(req: Request, res: Response) => {
        const options = {
            topic: req.query.topic as string,
            level: req.query.level as string,
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10,
            sortBy: req.query.sortBy as string || 'word',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
        }
        if (!options.topic || options.topic.trim() === '') {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Topic is required!");
        }
        const validationError = validationFilterOptions.filterOptions(options);

        if (validationError) {
            res.status(validationError.status);
            throw new Error(validationError.message);
        }

        const findWordswithMeanings = await vocabularyService.findWordsWithMultipleMeanings(options);
        
        
        if (!findWordswithMeanings || findWordswithMeanings.data.length === 0) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error(`No vocabulary found for topic: ${options.topic}`);
        }
        
        if(options.page > findWordswithMeanings.pagination.pages){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(`Max current page is: ${findWordswithMeanings.pagination.pages}`);
        }
        
        res.status(HttpStatus.OK).json({
            success: true,
            message: `Found ${findWordswithMeanings.data.length} words for topic: ${options.topic}`,
            data: findWordswithMeanings.data,
            pagination: findWordswithMeanings.pagination
        });
    }),

    getAllVocabulary: asynchandler(async(req: Request, res: Response) => {
        const options = {
            level: req.query.level as string,
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10,
            sortBy: req.query.sortBy as string || 'word',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
        };
        const validationError = validationFilterOptions.filterOptions(options);

        if (validationError) {
            res.status(validationError.status);
            throw new Error(validationError.message);
        }

        const allVocabulary = await vocabularyService.getAllVocabulary(options);
        if(!allVocabulary){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("No vocabulary found!");
        }
        if(options.page > allVocabulary.pagination.pages){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(`Max current page is: ${allVocabulary.pagination.pages}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: `Found ${allVocabulary.data.length} words`,
            data: allVocabulary.data,
            pagination: allVocabulary.pagination
        });
    }),
    
    getFlashCards: asynchandler(async(req: Request, res: Response) => {
        const topic = req.params.topic;

        const options = {
            level: req.query.level as string,
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10,
            sortBy: req.query.sortBy as string || 'word',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
        };
        const validationError = validationFilterOptions.filterOptions(options);

        if (validationError) {
            res.status(validationError.status);
            throw new Error(validationError.message);
        }
        const flashcards = await vocabularyService.getFlashcards(options);
        if(!flashcards || flashcards.data.length === 0){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error(`No flashcards found for topic: ${topic}`);
        }
        if(options.page > flashcards.pagination.pages){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(`Max current page is: ${flashcards.pagination.pages}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: `Found ${flashcards.data.length} flashcards for topic: ${topic}`,
            data: flashcards.data,
            pagination: flashcards.pagination
        });
    }),
    getFlashCardsByTopic: asynchandler(async(req: Request, res: Response) => {
        const topic = req.params.topic;

        const options = {
            level: req.query.level as string,
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10,
            sortBy: req.query.sortBy as string || 'word',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
        };
        const validationError = validationFilterOptions.filterOptions(options);

        if (validationError) {
            res.status(validationError.status);
            throw new Error(validationError.message);
        }
        const flashcards = await vocabularyService.getFlashcardsByTopic(topic,options);
        if(!flashcards || flashcards.data.length === 0){
            res.status(HttpStatus.NOT_FOUND);
            throw new Error(`No flashcards found for topic: ${topic}`);
        }
        if(options.page > flashcards.pagination.pages){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(`Max current page is: ${flashcards.pagination.pages}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: `Found ${flashcards.data.length} flashcards for topic: ${topic}`,
            data: flashcards.data,
            pagination: flashcards.pagination
        });
    }),
}