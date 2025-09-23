import { Document, model, Schema } from "mongoose";

// Interface cho definition của mỗi nghĩa
export interface IDefinition {
    definition: string;
    definitionVN: string;
    example?: string;
    exampleVN: string;
    synonyms?: string[];
    antonyms?: string[];
}

// Interface cho meaning theo từng part of speech
export interface IMeaning {
    partOfSpeech: string; // noun, verb, adjective, adverb, etc.
    definitions: IDefinition[];
}

// Interface cho phonetics
export interface IPhonetic {
    text?: string; // /həˈloʊ/
    audio?: string; // URL to audio file
    sourceUrl?: string; // Source of the pronunciation
}

// Main Vocabulary interface
export interface IVocabulary extends Document {
    word: string;
    meaningVN: string;
    phonetics: IPhonetic[];
    meanings: IMeaning[];
    topic?: string; // Category/topic (animals, food, business, etc.)
    level: string; // A1, A2, B1, B2, C1, C2 or beginner, intermediate, advanced
}

// Schema cho Definition
const definitionSchema = new Schema<IDefinition>({
    definition: {
        type: String,
        required: [true, "Definition is required"]
    },
    example: {
        type: String
    },
    synonyms: [{
        type: String
    }],
    antonyms: [{
        type: String
    }]
}, { _id: false });

// Schema cho Meaning
const meaningSchema = new Schema<IMeaning>({
    partOfSpeech: {
        type: String,
        required: [true, "Part of speech is required"],
        enum: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'determiner']
    },
    definitions: {
        type: [definitionSchema],
        required: [true, "At least one definition is required"],
        validate: {
            validator: function(arr: IDefinition[]) {
                return arr.length > 0;
            },
            message: "At least one definition is required"
        }
    }
}, { _id: false });

// Schema cho Phonetic
const phoneticSchema = new Schema<IPhonetic>({
    text: {
        type: String
    },
    audio: {
        type: String,
        validate: {
            validator: function(v: string) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: "Audio must be a valid URL"
        }
    },
    sourceUrl: {
        type: String,
        validate: {
            validator: function(v: string) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: "Source URL must be a valid URL"
        }
    }
}, { _id: false });

// Main Vocabulary Schema
const vocabularySchema = new Schema<IVocabulary>({
    word: {
        type: String,
        required: [true, "Word is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    meaningVN: {
        type: String,
        trim: true
    },
    phonetics: {
        type: [phoneticSchema],
        default: []
    },
    meanings: {
        type: [meaningSchema],
        required: [true, "At least one meaning is required"],
        validate: {
            validator: function(arr: IMeaning[]) {
                return arr.length > 0;
            },
            message: "At least one meaning is required"
        }
    },
    topic: {
        type: String,
        enum: [
            'animals', 'food', 'business', 'technology', 'travel', 
            'education', 'health', 'sports', 'entertainment', 'family',
            'weather', 'emotions', 'colors', 'numbers', 'time', 'general'
        ],
        default: 'general'
    },
    level: {
        type: String,
        required: [true, "Level is required"],
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'beginner', 'intermediate', 'advanced'],
        index: true
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'vocabularies'
});

// Indexes for better query performance
vocabularySchema.index({ word: 1, level: 1 });
vocabularySchema.index({ topic: 1, level: 1 });
vocabularySchema.index({ 'meanings.partOfSpeech': 1 });
vocabularySchema.index({ tags: 1 });

// Virtual for getting all definitions across all meanings
/* 
    example: const word = await Vocabulary.findOne({ word: "run" });
    console.log(word.allDefinitions);
    // Output:
    [
        { partOfSpeech: "verb", definition: "Move quickly", example: "I run daily" },
        { partOfSpeech: "verb", definition: "Operate", example: "Run the machine" },
        { partOfSpeech: "noun", definition: "Act of running", example: "Go for a run" }
    ]
*/
vocabularySchema.virtual('allDefinitions').get(function() {
    return this.meanings.flatMap(meaning => 
        meaning.definitions.map(def => ({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example
        }))
    );
});

// Method to add new meaning to existing word
/*
    const word = await Vocabulary.findOne({ word: "run" });
    await word.addMeaning({
        partOfSpeech: "adjective",
        definitions: [{
            definition: "Flowing or moving quickly",
            example: "Running water"
        }]
    });
*/
vocabularySchema.methods.addMeaning = function(meaning: IMeaning) {
    this.meanings.push(meaning);
    return this.save();
};

// Static method to find words by part of speech
/* 
    example:
    // Tìm tất cả động từ
    const verbs = await Vocabulary.findByPartOfSpeech('verb');
    // Tìm động từ cấp độ A1
    const beginnerVerbs = await Vocabulary.findByPartOfSpeech('verb', 'A1');
*/
vocabularySchema.statics.findByPartOfSpeech = function(partOfSpeech: string, level?: string) {
    const query: any = { 'meanings.partOfSpeech': partOfSpeech };
    if (level) query.level = level;
    return this.find(query);
};

// Static method to search words

vocabularySchema.statics.searchWords = function(searchTerm: string, options: any = {}) {
    const { level, topic, partOfSpeech } = options;
    const query: any = {
        $or: [
            { word: new RegExp(searchTerm, 'i') },
            { 'meanings.definitions.definition': new RegExp(searchTerm, 'i') }
        ]
    };
    
    if (level) query.level = level;
    if (topic) query.topic = topic;
    if (partOfSpeech) query['meanings.partOfSpeech'] = partOfSpeech;
    
    return this.find(query);
};

vocabularySchema.methods.getQuickDefinition = function(): string {
    if (this.meanings.length === 0) return '';
    if (this.meanings[0].definitions.length === 0) return '';
    return this.meanings[0].definitions[0].definition;
};
export const Vocabulary = model<IVocabulary>("Vocabulary", vocabularySchema);