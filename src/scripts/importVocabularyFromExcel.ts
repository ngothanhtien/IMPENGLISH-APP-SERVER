// scripts/importVocabularyFromExcel.ts
// Pipeline: Excel (word, topic, level) -> Free Dictionary API -> Microsoft Translator -> MongoDB upsert

import 'dotenv/config';
import axios from 'axios';
import xlsx from 'xlsx';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// ⚠️ SỬA đường dẫn này theo cấu trúc dự án của bạn
import { Vocabulary, IVocabulary } from '../models/vocabulary.model';

// ========= Cấu hình =========
const DICT_PAUSE_MS = 300;          // tăng thời gian nghỉ để tránh rate limit
const TRANS_PAUSE_MS = 300;         
const TRANSLATE_MAX_CHARS = 3500;   // giảm xuống để an toàn hơn
const MAX_RETRIES = 3;              // số lần retry khi API fail
const BATCH_SIZE = 25;              // giảm batch size translator

// ========= Tiện ích chung =========
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type ExcelRow = {
  word: string;
  topic?: string;
  level: string;
};

// Validation cho level
function validateLevel(level: string): boolean {
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'beginner', 'intermediate', 'advanced'];
  return validLevels.includes(level);
}

// Chuẩn hoá POS khớp enum schema
function normalizePOS(pos?: string): string | undefined {
  if (!pos) return undefined;
  const p = pos.toLowerCase().trim();
  const map: Record<string, string> = {
    adj: 'adjective',
    adv: 'adverb',
    n: 'noun',
    v: 'verb',
    prep: 'preposition',
    conj: 'conjunction',
    det: 'determiner',
    int: 'interjection',
    pron: 'pronoun'
  };
  const allowed = [
    'noun', 'verb', 'adjective', 'adverb',
    'pronoun', 'preposition', 'conjunction', 'interjection', 'determiner'
  ];
  const normalized = map[p] ?? p;
  return allowed.includes(normalized) ? normalized : undefined;
}

// Đọc Excel -> mảng {word, topic, level} với validation
function readExcel(filePath: string): ExcelRow[] {
  // Kiểm tra file tồn tại
  if (!fs.existsSync(filePath)) {
    throw new Error(`File không tồn tại: ${filePath}`);
  }

  console.log(`📖 Đọc file: ${path.resolve(filePath)}`);
  
  const wb = xlsx.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  console.log(`📋 Sheet: ${sheetName}`);
  
  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<ExcelRow>(sheet, { defval: '' });

  console.log(`📊 Raw rows: ${rows.length}`);

  const validRows = rows
    .map((r, index) => {
      const word = String(r.word || '').trim().toLowerCase();
      const topic = String(r.topic || 'general').trim().toLowerCase();
      const level = String(r.level || '').trim();

      // Validation
      if (!word) {
        console.warn(`⚠️  Row ${index + 1}: Missing word`);
        return null;
      }
      if (!level || !validateLevel(level)) {
        console.warn(`⚠️  Row ${index + 1}: Invalid level "${level}" for word "${word}"`);
        return null;
      }

      return { word, topic, level };
    })
    .filter(Boolean) as ExcelRow[];

  console.log(`✅ Valid rows: ${validRows.length}`);
  return validRows;
}

// Gọi Free Dictionary API với retry
async function fetchDictionary(word: string, retries = MAX_RETRIES): Promise<any> {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'English Learning App - Vocabulary Importer'
        }
      });
      return res.data?.[0] ?? null;
    } catch (error: any) {
      if (attempt === retries) {
        console.warn(`\n❌ Dictionary API failed for "${word}" after ${retries} attempts`);
        return null;
      }
      if (error.response?.status === 429) {
        // Rate limited - wait longer
        await sleep(DICT_PAUSE_MS * 2);
      } else {
        await sleep(DICT_PAUSE_MS);
      }
    }
  }
  return null;
}

// Dedupe phonetics theo (text,audio) - optimized
function dedupePhonetics(phonetics: any[] = []) {
  if (!phonetics.length) return [];
  
  const seen = new Set<string>();
  const out: any[] = [];
  
  for (const p of phonetics) {
    if (!p) continue;
    const text = p?.text?.trim() || '';
    const audio = p?.audio?.trim() || '';
    const key = `${text}__${audio}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      out.push({
        text: text || undefined,
        audio: audio || undefined,
        sourceUrl: p?.sourceUrl || p?.source || undefined
      });
    }
  }
  return out;
}

// Tạo summary EN ngắn để dịch -> meaningVN (optimized)
function buildMeaningSummaryEN(meanings: any[]): string {
  if (!meanings?.length) return '';
  
  const chunks: string[] = [];
  for (const m of meanings.slice(0, 3)) { // Chỉ lấy 3 meanings đầu
    const pos = m?.partOfSpeech ? `${m.partOfSpeech}: ` : '';
    const defs = (m?.definitions || [])
      .slice(0, 2) // Chỉ lấy 2 definitions đầu mỗi meaning
      .map((d: any) => d?.definition?.trim())
      .filter(Boolean)
      .join('; ');
    if (defs) chunks.push(`${pos}${defs}`);
  }
  
  const text = chunks.join(' | ');
  return text.length > TRANSLATE_MAX_CHARS ? 
    text.slice(0, TRANSLATE_MAX_CHARS) + '...' : text;
}

// Microsoft Translator với error handling tốt hơn
async function translateToVI(text: string): Promise<string> {
  if (!text?.trim()) return '';
  
  const key = process.env.MS_TRANSLATOR_KEY;
  const region = process.env.MS_TRANSLATOR_REGION;
  
  if (!key || !region) {
    console.warn('⚠️ Thiếu MS_TRANSLATOR_KEY hoặc MS_TRANSLATOR_REGION');
    return '';
  }

  try {
    const res = await axios.post(
      'https://api.cognitive.microsofttranslator.com/translate',
      [{ Text: text.trim() }],
      {
        params: { 'api-version': '3.0', from: 'en', to: 'vi' },
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
          'Content-type': 'application/json',
          'X-ClientTraceId': `import-${Date.now()}`
        },
        timeout: 20000
      }
    );
    return res.data?.[0]?.translations?.[0]?.text?.trim() || '';
  } catch (e: any) {
    console.error(`❌ Translate error for "${text.slice(0, 50)}...":`, e?.message || e);
    return '';
  }
}

// Microsoft Translator batch với better error handling
async function translateArrayToVI(texts: string[]): Promise<string[]> {
  if (!texts.length) return [];
  
  const key = process.env.MS_TRANSLATOR_KEY;
  const region = process.env.MS_TRANSLATOR_REGION;
  
  if (!key || !region) {
    return new Array(texts.length).fill('');
  }

  const results: string[] = [];
  
  // Process in smaller batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchFiltered = batch.filter(t => t?.trim());
    
    if (!batchFiltered.length) {
      results.push(...new Array(batch.length).fill(''));
      continue;
    }

    try {
      const body = batchFiltered.map(t => ({ Text: t.trim() }));
      const res = await axios.post(
        'https://api.cognitive.microsofttranslator.com/translate',
        body,
        {
          params: { 'api-version': '3.0', from: 'en', to: 'vi' },
          headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Ocp-Apim-Subscription-Region': region,
            'Content-type': 'application/json',
            'X-ClientTraceId': `batch-${Date.now()}-${i}`
          },
          timeout: 30000
        }
      );

      const translations = (res.data || []).map((item: any) => 
        item?.translations?.[0]?.text?.trim() || ''
      );

      // Map back to original positions (including empty texts)
      let translationIndex = 0;
      for (const originalText of batch) {
        if (originalText?.trim()) {
          results.push(translations[translationIndex++] || '');
        } else {
          results.push('');
        }
      }

      await sleep(TRANS_PAUSE_MS);
    } catch (e: any) {
      console.error(`❌ Batch translation error:`, e?.message || e);
      results.push(...new Array(batch.length).fill(''));
    }
  }

  return results;
}

// Map dữ liệu API -> document với better structure
async function mapToVocabularyDocWithTranslations(input: {
  word: string;
  topic: string;
  level: string;
  dict: any;
}): Promise<Partial<IVocabulary>> {
  const { word, topic, level, dict } = input;

  // Phonetics
  const phonetics = dedupePhonetics(dict?.phonetics || []);

  // Meanings (filter valid POS)
  const rawMeanings = (dict?.meanings || [])
    .map((m: any) => {
      const pos = normalizePOS(m?.partOfSpeech);
      if (!pos) return null;
      
      const defs = (m?.definitions || [])
        .slice(0, 5) // Limit definitions per meaning
        .map((d: any) => ({
          definition: d?.definition?.trim() || '',
          example: d?.example?.trim() || '',
          synonyms: Array.isArray(d?.synonyms) ? d.synonyms.slice(0, 5) : [],
          antonyms: Array.isArray(d?.antonyms) ? d.antonyms.slice(0, 5) : []
        }))
        .filter((d: any) => d.definition);
      
      return defs.length > 0 ? { partOfSpeech: pos, definitions: defs } : null;
    })
    .filter(Boolean);

  if (!rawMeanings.length) {
    throw new Error(`No valid meanings found for word: ${word}`);
  }

  // meaningVN (translate summary)
  const meaningSummaryEN = buildMeaningSummaryEN(rawMeanings);
  const meaningVN = await translateToVI(meaningSummaryEN || word);

  // Collect all definitions & examples for batch translation
  const defENs: string[] = [];
  const exENs: string[] = [];
  
  for (const m of rawMeanings) {
    for (const d of m.definitions) {
      defENs.push(d.definition || '');
      exENs.push(d.example || '');
    }
  }

  // Batch translate
  const [defVNs, exVNs] = await Promise.all([
    translateArrayToVI(defENs),
    translateArrayToVI(exENs),
  ]);

  // Map translations back
  let idx = 0;
  for (const m of rawMeanings) {
    for (const d of m.definitions) {
      (d as any).definitionVN = defVNs[idx] || '';
      (d as any).exampleVN = exVNs[idx] || '';
      idx++;
    }
  }

  const doc: Partial<IVocabulary> = {
    word,
    meaningVN: meaningVN || '',
    phonetics,
    meanings: rawMeanings as any,
    topic: topic || 'general',
    level,
  };

  return doc;
}

// Upsert với better logging
async function upsertVocabulary(doc: Partial<IVocabulary>): Promise<boolean> {
  if (!doc.word) return false;
  
  try {
    const result = await Vocabulary.updateOne(
      { word: doc.word }, 
      { $set: doc }, 
      { upsert: true }
    );
    return true;
  } catch (error: any) {
    console.error(`\n❌ Upsert failed for "${doc.word}":`, error?.message || error);
    return false;
  }
}

// Progress tracking
function showProgress(current: number, total: number, word: string) {
  const percent = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
  process.stdout.write(`\r🔎 [${current}/${total}] ${percent}% [${bar}] ${word.padEnd(20)} `);
}

// ========= Main =========
async function main() {
  console.log('🚀 Starting vocabulary import process...\n');
  
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('❌ Vui lòng truyền đường dẫn Excel.');
    console.log('Usage: npm run import:vocab -- ./data/words.xlsx');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_CONNECTION;
  if (!mongoUri) {
    console.error('❌ Thiếu MONGODB_URI trong .env');
    process.exit(1);
  }

  // Connect to MongoDB
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }

  const startTime = Date.now();
  let stats = {
    total: 0,
    success: 0,
    skipped: 0,
    errors: 0
  };

  try {
    const rows = readExcel(filePath);
    stats.total = rows.length;
    
    console.log(`📄 Processing ${rows.length} words...\n`);

    for (const [i, row] of rows.entries()) {
      const { word, topic = 'general', level } = row;
      showProgress(i + 1, rows.length, word);

      try {
        // Check if word already exists (optional skip)
        const existing = await Vocabulary.findOne({ word });
        if (existing) {
          console.log(`\n⏭️  Word "${word}" already exists, updating...`);
        }

        const dict = await fetchDictionary(word);
        await sleep(DICT_PAUSE_MS);

        if (!dict || !Array.isArray(dict?.meanings) || dict.meanings.length === 0) {
          console.log(`\n⚠️  Skipping "${word}" (no meanings from dictionary)`);
          stats.skipped++;
          continue;
        }

        const doc = await mapToVocabularyDocWithTranslations({ word, topic, level, dict });
        const success = await upsertVocabulary(doc);
        
        if (success) {
          stats.success++;
        } else {
          stats.errors++;
        }

      } catch (error: any) {
        console.log(`\n❌ Error processing "${word}":`, error?.message || error);
        stats.errors++;
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n\n🎉 Import completed!');
    console.log(`📊 Statistics:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   ✅ Success: ${stats.success}`);
    console.log(`   ⚠️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   📈 Success rate: ${Math.round((stats.success / stats.total) * 100)}%`);
    
  } catch (err: any) {
    console.error('\n❌ Fatal error:', err?.message || err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

main().catch(e => {
  console.error('❌ Main process error:', e);
  process.exit(1);
});