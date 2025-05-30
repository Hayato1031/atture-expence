import storage from './storage';

/**
 * AI Service for expense management with category suggestions
 * Provides AI-powered features like category recommendation and expense analysis
 */
class AIService {
  constructor() {
    this.apiKey = this.getApiKey();
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.requestTimeout = 30000;
    this.maxRetries = 3;
  }

  /**
   * Get API key from settings
   */
  getApiKey() {
    try {
      const settings = storage.get('settings') || {};
      return settings.openaiApiKey || '';
    } catch (error) {
      console.error('Failed to get API key from settings:', error);
      return '';
    }
  }

  /**
   * Update API settings
   */
  updateSettings(apiKey, endpoint = null) {
    this.apiKey = apiKey;
    if (endpoint) {
      this.apiEndpoint = endpoint;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    if (!this.apiKey) {
      return { success: false, error: 'APIキーが設定されていません' };
    }

    try {
      const response = await fetch(`${this.apiEndpoint.replace('/chat/completions', '')}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.requestTimeout)
      });

      if (response.ok) {
        return { success: true, message: 'API接続に成功しました' };
      } else {
        return { success: false, error: `API接続に失敗しました: ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: `API接続エラー: ${error.message}` };
    }
  }

  /**
   * Make API request with retry logic
   */
  async makeApiRequest(messages, retryCount = 0) {
    if (!this.apiKey) {
      throw new Error('APIキーが設定されていません');
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 150,
          temperature: 0.3
        }),
        signal: AbortSignal.timeout(this.requestTimeout)
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < this.maxRetries) {
          // Rate limit exceeded, retry with exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeApiRequest(messages, retryCount + 1);
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      if (retryCount < this.maxRetries && error.name !== 'AbortError') {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeApiRequest(messages, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Suggest category based on description
   */
  async suggestCategory(description, type = 'expense') {
    try {
      // Get existing categories for context
      const categories = storage.get('categories') || [];
      const relevantCategories = categories
        .filter(cat => cat.type === type && cat.isActive !== false)
        .map(cat => cat.name)
        .slice(0, 10); // Limit to avoid token limits

      const messages = [
        {
          role: 'system',
          content: `あなたは日本の経費管理システムのAIアシスタントです。ユーザーが入力した${type === 'expense' ? '支出' : '収入'}の説明に基づいて、最適なカテゴリを提案してください。
          
現在利用可能なカテゴリ: ${relevantCategories.length > 0 ? relevantCategories.join(', ') : 'なし'}

回答は以下の形式で行ってください：
- 推奨カテゴリ: [カテゴリ名]
- 理由: [簡潔な説明]
- 税務上の注意点: [該当する場合のみ]

既存のカテゴリから選択することを優先しますが、適切なものがない場合は新しいカテゴリを提案してください。`
        },
        {
          role: 'user',
          content: `${type === 'expense' ? '支出' : '収入'}の説明: "${description}"`
        }
      ];

      const response = await this.makeApiRequest(messages);
      return {
        success: true,
        suggestion: response,
        availableCategories: relevantCategories
      };

    } catch (error) {
      console.error('Category suggestion failed:', error);
      return {
        success: false,
        error: error.message,
        suggestion: null
      };
    }
  }

  /**
   * Analyze expense for tax deduction eligibility
   */
  async analyzeExpenseDeduction(description, amount, category) {
    try {
      const messages = [
        {
          role: 'system',
          content: `あなたは日本の税務に詳しいAIアシスタントです。入力された経費について、税務上の扱いや経費として計上できるかどうかを分析してください。

回答は以下の形式で行ってください：
- 経費計上の可否: [可能/不可能/条件付き可能]
- 勘定科目: [推奨される勘定科目]
- 注意点: [税務上の注意点]
- 必要書類: [保管すべき書類]

一般的な税務知識に基づいて回答し、具体的な税務相談は税理士に確認するよう促してください。`
        },
        {
          role: 'user',
          content: `経費の詳細:
- 説明: ${description}
- 金額: ${amount}円
- カテゴリ: ${category}

この経費の税務上の扱いについて分析してください。`
        }
      ];

      const response = await this.makeApiRequest(messages);
      return {
        success: true,
        analysis: response
      };

    } catch (error) {
      console.error('Expense analysis failed:', error);
      return {
        success: false,
        error: error.message,
        analysis: null
      };
    }
  }

  /**
   * Generate monthly expense insights
   */
  async generateMonthlyInsights(expenseData, incomeData) {
    try {
      // Summarize data for AI analysis
      const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = incomeData.reduce((sum, inc) => sum + inc.amount, 0);
      
      const expensesByCategory = {};
      expenseData.forEach(exp => {
        const category = exp.categoryName || 'その他';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + exp.amount;
      });

      const topCategories = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const messages = [
        {
          role: 'system',
          content: `あなたは財務分析の専門家です。提供された月次の収支データを分析し、実用的なアドバイスを提供してください。

回答は以下の形式で行ってください：
- 収支の概要: [総収入、総支出、純利益/損失]
- 支出の傾向: [主要な支出カテゴリの分析]
- 改善提案: [具体的な節約や効率化の提案]
- 注意点: [注意すべき支出パターンや異常値]

日本の税務や会計基準を考慮したアドバイスを提供してください。`
        },
        {
          role: 'user',
          content: `今月の収支データ:
- 総収入: ${totalIncome.toLocaleString()}円
- 総支出: ${totalExpenses.toLocaleString()}円
- 純利益: ${(totalIncome - totalExpenses).toLocaleString()}円

主要支出カテゴリ:
${topCategories.map(([category, amount]) => `- ${category}: ${amount.toLocaleString()}円`).join('\n')}

取引件数: 支出${expenseData.length}件、収入${incomeData.length}件

この収支状況について分析とアドバイスをお願いします。`
        }
      ];

      const response = await this.makeApiRequest(messages);
      return {
        success: true,
        insights: response
      };

    } catch (error) {
      console.error('Monthly insights generation failed:', error);
      return {
        success: false,
        error: error.message,
        insights: null
      };
    }
  }

  /**
   * Learn from user's category selection (for future improvements)
   */
  learnFromSelection(description, selectedCategory, type) {
    try {
      // Store learning data for future improvements
      const learningData = storage.get('ai_learning') || [];
      const newEntry = {
        description: description.toLowerCase(),
        category: selectedCategory,
        type,
        timestamp: new Date().toISOString()
      };

      // Keep only recent 1000 entries to manage storage
      learningData.push(newEntry);
      if (learningData.length > 1000) {
        learningData.splice(0, learningData.length - 1000);
      }

      storage.set('ai_learning', learningData);
      return { success: true };

    } catch (error) {
      console.error('Failed to store learning data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get category suggestions based on learned patterns
   */
  getLocalCategorySuggestion(description, type = 'expense') {
    try {
      const learningData = storage.get('ai_learning') || [];
      const categories = storage.get('categories') || [];
      
      // Find similar descriptions
      const descLower = description.toLowerCase();
      const matches = learningData
        .filter(entry => entry.type === type)
        .filter(entry => {
          const entryDesc = entry.description;
          return entryDesc.includes(descLower) || descLower.includes(entryDesc);
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (matches.length > 0) {
        // Return most recent matching category
        const suggestedCategoryName = matches[0].category;
        const category = categories.find(cat => cat.name === suggestedCategoryName);
        
        if (category) {
          return {
            success: true,
            category: category,
            confidence: matches.length > 1 ? 'high' : 'medium',
            source: 'local_learning'
          };
        }
      }

      return { success: false, message: '学習データから適切なカテゴリが見つかりませんでした' };

    } catch (error) {
      console.error('Local category suggestion failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const aiService = new AIService();

// Export individual functions for backward compatibility
export const suggestCategory = (description, type) => aiService.suggestCategory(description, type);
export const analyzeExpenseDeduction = (description, amount, category) => aiService.analyzeExpenseDeduction(description, amount, category);
export const generateMonthlyInsights = (expenseData, incomeData) => aiService.generateMonthlyInsights(expenseData, incomeData);
export const learnFromSelection = (description, selectedCategory, type) => aiService.learnFromSelection(description, selectedCategory, type);
export const getLocalCategorySuggestion = (description, type) => aiService.getLocalCategorySuggestion(description, type);
export const testApiConnection = () => aiService.testConnection();
export const updateApiSettings = (apiKey, endpoint) => aiService.updateSettings(apiKey, endpoint);

export default aiService;