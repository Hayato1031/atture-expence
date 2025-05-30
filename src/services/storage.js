/**
 * Simple storage service using localStorage
 * This provides a reliable, synchronous storage solution
 */

class StorageService {
  constructor() {
    this.prefix = 'attureExpence_';
    this.initializeDefaultData();
  }

  // Helper method to get full key with prefix
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  // Get data from storage
  get(key) {
    try {
      const data = localStorage.getItem(this.getKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  // Set data to storage
  set(key, value) {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  // Remove data from storage
  remove(key) {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  // Clear all data
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Initialize with default data if empty
  initializeDefaultData() {
    // Check if already initialized
    if (this.get('initialized')) {
      return;
    }

    const now = new Date().toISOString();

    // Default categories with proper Japanese tax accounting structure
    const defaultCategories = [
      // Income categories (収益勘定)
      { id: 1, name: '売上高', type: 'income', color: '#4CAF50', icon: 'salary', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 2, name: '受取手数料', type: 'income', color: '#2196F3', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 3, name: '受取利息', type: 'income', color: '#00BCD4', icon: 'investment', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 4, name: '受取配当金', type: 'income', color: '#009688', icon: 'investment', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 5, name: '雑収入', type: 'income', color: '#795548', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 6, name: '有価証券売却益', type: 'income', color: '#607D8B', icon: 'investment', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 7, name: '固定資産売却益', type: 'income', color: '#455A64', icon: 'investment', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 8, name: '為替差益', type: 'income', color: '#37474F', icon: 'investment', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 9, name: '保険差益', type: 'income', color: '#263238', icon: 'health', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 10, name: '補助金収入', type: 'income', color: '#4CAF50', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 11, name: '助成金収入', type: 'income', color: '#43A047', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 12, name: '受取家賃', type: 'income', color: '#388E3C', icon: 'home', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 13, name: '受託収益', type: 'income', color: '#2E7D32', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 14, name: '工事収益', type: 'income', color: '#1B5E20', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 15, name: '役務収益', type: 'income', color: '#33691E', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 16, name: '保守料収入', type: 'income', color: '#827717', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 17, name: '会費収入', type: 'income', color: '#F57F17', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 18, name: 'ロイヤリティ収入', type: 'income', color: '#F57C00', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 19, name: '広告収入', type: 'income', color: '#EF6C00', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 20, name: 'サブスクリプション収入', type: 'income', color: '#E65100', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 21, name: 'ライセンス収入', type: 'income', color: '#BF360C', icon: 'work', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 22, name: 'キャンセル料収入', type: 'income', color: '#3E2723', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 23, name: '返品減額収入', type: 'income', color: '#5D4037', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },

      // Expense categories with groups (費用勘定)
      // 人件費 (Personnel Expenses) - Parent Category
      { id: 24, name: '人件費', type: 'expense', color: '#F44336', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 25, name: '給与手当', type: 'expense', color: '#F44336', icon: 'salary', parentId: 24, isActive: true, createdAt: now, updatedAt: now },
      { id: 26, name: '法定福利費', type: 'expense', color: '#F44336', icon: 'health', parentId: 24, isActive: true, createdAt: now, updatedAt: now },
      { id: 27, name: '福利厚生費', type: 'expense', color: '#F44336', icon: 'health', parentId: 24, isActive: true, createdAt: now, updatedAt: now },
      { id: 28, name: '役員報酬', type: 'expense', color: '#F44336', icon: 'salary', parentId: 24, isActive: true, createdAt: now, updatedAt: now },
      { id: 29, name: '教育研修費', type: 'expense', color: '#F44336', icon: 'education', parentId: 24, isActive: true, createdAt: now, updatedAt: now },
      { id: 30, name: '採用費', type: 'expense', color: '#F44336', icon: 'work', parentId: 24, isActive: true, createdAt: now, updatedAt: now },

      // 売上原価 (Cost of Sales) - Parent Category
      { id: 31, name: '売上原価', type: 'expense', color: '#E91E63', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 32, name: '仕入高', type: 'expense', color: '#E91E63', icon: 'shopping', parentId: 31, isActive: true, createdAt: now, updatedAt: now },
      { id: 33, name: '外注費', type: 'expense', color: '#E91E63', icon: 'work', parentId: 31, isActive: true, createdAt: now, updatedAt: now },
      { id: 34, name: '材料費', type: 'expense', color: '#E91E63', icon: 'shopping', parentId: 31, isActive: true, createdAt: now, updatedAt: now },
      { id: 35, name: '加工費', type: 'expense', color: '#E91E63', icon: 'work', parentId: 31, isActive: true, createdAt: now, updatedAt: now },

      // 販売費 (Selling Expenses) - Parent Category
      { id: 36, name: '販売費', type: 'expense', color: '#9C27B0', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 37, name: '広告宣伝費', type: 'expense', color: '#9C27B0', icon: 'entertainment', parentId: 36, isActive: true, createdAt: now, updatedAt: now },
      { id: 38, name: '販売促進費', type: 'expense', color: '#9C27B0', icon: 'entertainment', parentId: 36, isActive: true, createdAt: now, updatedAt: now },
      { id: 39, name: '営業費', type: 'expense', color: '#9C27B0', icon: 'work', parentId: 36, isActive: true, createdAt: now, updatedAt: now },
      { id: 40, name: '展示会費', type: 'expense', color: '#9C27B0', icon: 'entertainment', parentId: 36, isActive: true, createdAt: now, updatedAt: now },

      // 一般管理費 (General Administrative Expenses) - Parent Category
      { id: 41, name: '一般管理費', type: 'expense', color: '#3F51B5', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 42, name: '通信費', type: 'expense', color: '#3F51B5', icon: 'utilities', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 43, name: '旅費交通費', type: 'expense', color: '#3F51B5', icon: 'transport', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 44, name: '会議費', type: 'expense', color: '#3F51B5', icon: 'work', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 45, name: '交際費', type: 'expense', color: '#3F51B5', icon: 'food', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 46, name: '接待費', type: 'expense', color: '#3F51B5', icon: 'food', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 47, name: '水道光熱費', type: 'expense', color: '#3F51B5', icon: 'utilities', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 48, name: '家賃支払', type: 'expense', color: '#3F51B5', icon: 'home', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 49, name: '消耗品費', type: 'expense', color: '#3F51B5', icon: 'shopping', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 50, name: '事務用品費', type: 'expense', color: '#3F51B5', icon: 'shopping', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 51, name: '新聞図書費', type: 'expense', color: '#3F51B5', icon: 'education', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 52, name: '租税公課', type: 'expense', color: '#3F51B5', icon: 'category', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 53, name: '支払手数料', type: 'expense', color: '#3F51B5', icon: 'category', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 54, name: '保険料', type: 'expense', color: '#3F51B5', icon: 'health', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 55, name: '修繕費', type: 'expense', color: '#3F51B5', icon: 'work', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 56, name: '車両費', type: 'expense', color: '#3F51B5', icon: 'transport', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 57, name: '運搬費', type: 'expense', color: '#3F51B5', icon: 'transport', parentId: 41, isActive: true, createdAt: now, updatedAt: now },
      { id: 58, name: '雑費', type: 'expense', color: '#3F51B5', icon: 'category', parentId: 41, isActive: true, createdAt: now, updatedAt: now },

      // 減価償却・金融費用 (Depreciation & Financial Expenses) - Parent Category
      { id: 59, name: '減価償却・金融費用', type: 'expense', color: '#FF9800', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 60, name: '減価償却費', type: 'expense', color: '#FF9800', icon: 'investment', parentId: 59, isActive: true, createdAt: now, updatedAt: now },
      { id: 61, name: '支払利息', type: 'expense', color: '#FF9800', icon: 'investment', parentId: 59, isActive: true, createdAt: now, updatedAt: now },
      { id: 62, name: '貸倒損失', type: 'expense', color: '#FF9800', icon: 'investment', parentId: 59, isActive: true, createdAt: now, updatedAt: now },
      { id: 63, name: '為替差損', type: 'expense', color: '#FF9800', icon: 'investment', parentId: 59, isActive: true, createdAt: now, updatedAt: now },

      // その他費用 (Other Expenses) - Parent Category
      { id: 64, name: 'その他費用', type: 'expense', color: '#795548', icon: 'category', parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 65, name: '寄付金', type: 'expense', color: '#795548', icon: 'gift', parentId: 64, isActive: true, createdAt: now, updatedAt: now },
      { id: 66, name: '顧問料', type: 'expense', color: '#795548', icon: 'work', parentId: 64, isActive: true, createdAt: now, updatedAt: now },
      { id: 67, name: 'システム利用料', type: 'expense', color: '#795548', icon: 'freelance', parentId: 64, isActive: true, createdAt: now, updatedAt: now },
      { id: 68, name: 'クラウドサービス費', type: 'expense', color: '#795548', icon: 'freelance', parentId: 64, isActive: true, createdAt: now, updatedAt: now },
      { id: 69, name: '会費', type: 'expense', color: '#795548', icon: 'category', parentId: 64, isActive: true, createdAt: now, updatedAt: now }
    ];

    // Default settings
    const defaultSettings = {
      currency: 'JPY',
      dateFormat: 'YYYY-MM-DD',
      theme: 'light',
      language: 'ja',
      autoBackup: true,
      maxFileSize: 10485760, // 10MB
      updatedAt: now
    };

    // Initialize storage
    this.set('categories', defaultCategories);
    this.set('settings', defaultSettings);
    this.set('users', []);
    this.set('expenses', []);
    this.set('income', []);
    this.set('tags', []);
    this.set('files', []);
    this.set('initialized', true);

    console.log('Storage initialized with default data');
  }

  // Get next ID for a collection
  getNextId(collection) {
    const items = this.get(collection) || [];
    if (items.length === 0) return 1;
    const maxId = Math.max(...items.map(item => item.id || 0));
    return maxId + 1;
  }

  // Add item to a collection
  addItem(collection, item) {
    const items = this.get(collection) || [];
    const newItem = {
      ...item,
      id: item.id || this.getNextId(collection),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.set(collection, items);
    return newItem;
  }

  // Update item in a collection
  updateItem(collection, id, updates) {
    const items = this.get(collection) || [];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      id: items[index].id, // Preserve ID
      createdAt: items[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    this.set(collection, items);
    return items[index];
  }

  // Delete item from a collection
  deleteItem(collection, id) {
    const items = this.get(collection) || [];
    const filtered = items.filter(item => item.id !== id);
    this.set(collection, filtered);
    return true;
  }

  // Find item by ID
  findById(collection, id) {
    const items = this.get(collection) || [];
    return items.find(item => item.id === id) || null;
  }

  // Find items by criteria
  findWhere(collection, criteria) {
    const items = this.get(collection) || [];
    return items.filter(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  // Export all data
  exportData() {
    const data = {};
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const cleanKey = key.replace(this.prefix, '');
        data[cleanKey] = this.get(cleanKey);
      }
    });
    return data;
  }

  // Import data
  importData(data) {
    try {
      Object.keys(data).forEach(key => {
        this.set(key, data[key]);
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Create singleton instance
const storage = new StorageService();

export default storage;