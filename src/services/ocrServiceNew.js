import Tesseract from 'tesseract.js';
import { preprocessImage, needsPreprocessing } from '../utils/imagePreprocessing';
import storage from './storage';

/**
 * OCR Service - Alternative implementation for Tesseract.js v5 with GPT enhancement
 */

// Perform OCR on an image file - simplified version
export const performOCR = async (imageFile, onProgress) => {
  try {
    
    // Update progress
    if (onProgress) {
      onProgress({
        status: 'initializing',
        progress: 0
      });
    }

    // Check if preprocessing is needed
    let processedImage = imageFile;
    const shouldPreprocess = await needsPreprocessing(imageFile);
    
    if (shouldPreprocess) {
      if (onProgress) {
        onProgress({
          status: 'preprocessing',
          progress: 20
        });
      }
      processedImage = await preprocessImage(imageFile);
    }

    // Create a worker for better control over parameters
    const worker = await Tesseract.createWorker('jpn+eng');
    
    // Set parameters for better Japanese recognition
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Automatic page segmentation
      preserve_interword_spaces: '1',
      // Remove whitelist to allow all characters
    });
    
    // Since we can't get progress updates without logger, simulate progress
    if (onProgress) {
      onProgress({
        status: 'processing',
        progress: 50
      });
    }
    
    // Perform recognition
    const result = await worker.recognize(processedImage);
    
    
    // Terminate worker
    await worker.terminate();
    
    // Complete progress
    if (onProgress) {
      onProgress({
        status: 'completed',
        progress: 100
      });
    }

    // Extract and return data
    const ocrData = {
      text: result.data?.text || '',
      confidence: result.data?.confidence || 0,
      lines: []
    };

    // Process lines if available
    if (result.data?.lines && Array.isArray(result.data.lines)) {
      ocrData.lines = result.data.lines.map(line => ({
        text: line.text || '',
        confidence: line.confidence || 0,
        bbox: line.bbox || null
      }));
    }

    return {
      success: true,
      data: ocrData
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      error: `OCR処理中にエラーが発生しました: ${error.message}`
    };
  }
};

// Enhance OCR text using GPT
async function enhanceOCRWithGPT(ocrText) {
  try {
    const settings = storage.get('settings') || {};
    const apiKey = settings.openaiApiKey;
    
    if (!apiKey) {
      return ocrText;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `あなたは日本のレシートや領収書を解析するAIアシスタントです。
与えられたOCRテキスト（文字認識の生データ）から、以下の情報を正確に抽出してください：

1. 合計金額（税込）
2. 日付（YYYY-MM-DD形式）
3. 店舗名/会社名
4. 商品明細（商品名と価格のリスト）
5. 税額
6. カテゴリ（食費、交通費、消耗品費など）

OCRの誤認識を修正し、日本語として正しい形に整形してください。
情報が不明確な場合は、最も可能性の高い解釈をしてください。

出力は以下のJSON形式で返してください：
{
  "amount": 金額（数値）,
  "date": "YYYY-MM-DD",
  "vendor": "店舗名",
  "items": [{"name": "商品名", "price": 価格}],
  "tax": 税額（数値）,
  "category": "カテゴリ名",
  "originalText": "整形後のテキスト"
}`
          },
          {
            role: 'user',
            content: `以下のOCRテキストからレシート情報を抽出してください：\n\n${ocrText}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      return ocrText;
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return ocrText;
    }
    
    try {
      // Parse JSON response
      const parsed = JSON.parse(content);
      return parsed;
    } catch (jsonError) {
      // Return the enhanced text even if JSON parsing fails
      return content;
    }
  } catch (error) {
    return ocrText;
  }
}

// Extract expense/income data from OCR text
export const extractTransactionData = (ocrText) => {
  try {
    // Validate input
    if (!ocrText || typeof ocrText !== 'string') {
      return {
        success: false,
        error: 'OCRテキストが無効です',
        data: null
      };
    }
    
    const data = {
      amount: null,
      date: null,
      vendor: null,
      items: [],
      category: null,
      tax: null,
      total: null
    };

    // Extract amount (look for patterns like ¥1,234 or 1,234円)
    const amountPatterns = [
      /¥\s*([\d,]+)/g,
      /([\d,]+)\s*円/g,
      /合計[：:]\s*([\d,]+)/g,
      /TOTAL[：:]\s*([\d,]+)/g,
      /計[：:]\s*([\d,]+)/g,
    ];

    for (const pattern of amountPatterns) {
      const matches = ocrText.matchAll(pattern);
      for (const match of matches) {
        const amount = parseInt(match[1].replace(/,/g, ''));
        if (amount && (!data.amount || amount > data.amount)) {
          data.amount = amount;
        }
      }
    }

    // Extract date (various formats)
    const datePatterns = [
      /(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})[日]?/g,
      /(\d{1,2})[月/-](\d{1,2})[日/-](\d{4})/g,
      /令和(\d+)年(\d{1,2})月(\d{1,2})日/g,
      /R(\d+)\.(\d{1,2})\.(\d{1,2})/g,
    ];

    for (const pattern of datePatterns) {
      const match = ocrText.match(pattern);
      if (match) {
        let year, month, day;
        
        if (match[0].includes('令和') || match[0].startsWith('R')) {
          // Convert Japanese era to Western year
          year = 2018 + parseInt(match[1]);
          month = match[2];
          day = match[3];
        } else if (match[1].length === 4) {
          year = match[1];
          month = match[2];
          day = match[3];
        } else {
          year = match[3];
          month = match[1];
          day = match[2];
        }
        
        data.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        break;
      }
    }

    // Extract vendor/store name (usually at the top of receipt)
    const lines = ocrText.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      // First non-empty line is often the store name
      data.vendor = lines[0].trim();
    }

    // Extract tax information
    const taxPatterns = [
      /消費税[：:]\s*([\d,]+)/g,
      /税[：:]\s*([\d,]+)/g,
      /内税[：:]\s*([\d,]+)/g,
    ];

    for (const pattern of taxPatterns) {
      const match = ocrText.match(pattern);
      if (match) {
        data.tax = parseInt(match[1].replace(/,/g, ''));
        break;
      }
    }

    // Try to categorize based on vendor or items
    const categoryKeywords = {
      '交通費': ['JR', '鉄道', 'タクシー', 'バス', '交通', '駅', 'SUICA', 'PASMO'],
      '食費': ['レストラン', '食堂', 'カフェ', 'コーヒー', '弁当', 'ランチ', 'ディナー', '食品'],
      '消耗品費': ['文具', 'オフィス', '事務', 'コピー', '印刷', 'ペン', '紙'],
      '接待費': ['会食', '接待', 'ホテル', 'レストラン', 'バー'],
      '通信費': ['携帯', 'モバイル', '電話', 'インターネット', 'Wi-Fi'],
      '書籍費': ['書店', '本', 'ブック', 'Amazon', '出版'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => ocrText.includes(keyword))) {
        data.category = category;
        break;
      }
    }

    // Extract individual items (lines with prices)
    const itemPattern = /(.+?)\s+([\d,]+)\s*円?/g;
    const itemMatches = ocrText.matchAll(itemPattern);
    for (const match of itemMatches) {
      const itemName = match[1].trim();
      const itemPrice = parseInt(match[2].replace(/,/g, ''));
      if (itemName && itemPrice && itemPrice < (data.amount || Infinity)) {
        data.items.push({
          name: itemName,
          price: itemPrice
        });
      }
    }

    return {
      success: true,
      data,
      confidence: data.amount ? 'high' : 'low'
    };
  } catch (error) {
    console.error('Error extracting transaction data:', error);
    return {
      success: false,
      error: 'データ抽出中にエラーが発生しました。'
    };
  }
};

// Process receipt image and extract structured data
export const processReceipt = async (imageFile, onProgress) => {
  try {
    // First perform OCR
    const ocrResult = await performOCR(imageFile, onProgress);
    
    if (!ocrResult.success) {
      return ocrResult;
    }

    // Update progress for GPT processing
    if (onProgress) {
      onProgress({
        status: 'analyzing',
        progress: 70
      });
    }

    // Try to enhance with GPT if OCR text is available
    let enhancedData = null;
    if (ocrResult.data.text) {
      enhancedData = await enhanceOCRWithGPT(ocrResult.data.text);
    }

    // If GPT returned structured data, use it
    if (enhancedData && typeof enhancedData === 'object' && enhancedData.amount) {
      
      // Complete progress
      if (onProgress) {
        onProgress({
          status: 'completed',
          progress: 100
        });
      }
      
      return {
        success: true,
        data: {
          amount: enhancedData.amount,
          date: enhancedData.date,
          vendor: enhancedData.vendor,
          items: enhancedData.items || [],
          category: enhancedData.category,
          tax: enhancedData.tax,
          ocrText: enhancedData.originalText || ocrResult.data.text,
          confidence: 85, // Higher confidence with GPT enhancement
          enhanced: true
        }
      };
    }

    // Fallback to traditional extraction if GPT enhancement failed
    const extractResult = extractTransactionData(ocrResult.data.text);
    
    if (!extractResult.success) {
      return extractResult;
    }

    // Complete progress
    if (onProgress) {
      onProgress({
        status: 'completed',
        progress: 100
      });
    }

    return {
      success: true,
      data: {
        ...extractResult.data,
        ocrText: ocrResult.data.text,
        confidence: ocrResult.data.confidence,
        enhanced: false
      }
    };
  } catch (error) {
    console.error('Error processing receipt:', error);
    return {
      success: false,
      error: 'レシート処理中にエラーが発生しました。'
    };
  }
};

const ocrService = {
  performOCR,
  extractTransactionData,
  processReceipt,
  cleanupWorker: async () => {} // No cleanup needed for this approach
};

export default ocrService;