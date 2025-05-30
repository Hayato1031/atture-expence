import Dexie from 'dexie';

// Create database instance
const db = new Dexie('AttureExpenceDB');

// Define database schema
db.version(1).stores({
  users: '++id, name, department, role, email, phone, avatar, status, createdAt, updatedAt',
  expenses: '++id, date, categoryId, amount, description, userId, tags, receiptIds, status, approvedBy, approvedAt, rejectedReason, createdAt, updatedAt',
  income: '++id, date, categoryId, source, amount, description, userId, tags, fileIds, status, createdAt, updatedAt',
  categories: '++id, name, type, color, icon, parentId, isActive, createdAt, updatedAt',
  tags: '++id, name, color, description, isActive, createdAt, updatedAt',
  settings: '++id, key, value, type, description, createdAt, updatedAt',
  files: '++id, name, originalName, type, size, path, blob, entityType, entityId, userId, createdAt'
});

// Initialize default data after database is opened
const initializeDefaultData = async () => {
  try {
    // Initialize default categories
    const categoryCount = await db.categories.count();
    if (categoryCount === 0) {
      const now = new Date().toISOString();
      await db.categories.bulkAdd([
        // Expense categories
        { name: '交通費', type: 'expense', color: '#2196F3', icon: 'directions_car', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: '宿泊費', type: 'expense', color: '#4CAF50', icon: 'hotel', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: '会議費', type: 'expense', color: '#FF9800', icon: 'meeting_room', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: '接待交際費', type: 'expense', color: '#9C27B0', icon: 'restaurant', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: '消耗品費', type: 'expense', color: '#00BCD4', icon: 'shopping_cart', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: '通信費', type: 'expense', color: '#795548', icon: 'phone', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: '水道光熱費', type: 'expense', color: '#607D8B', icon: 'power', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: '家賃', type: 'expense', color: '#F44336', icon: 'home', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: 'その他', type: 'expense', color: '#9E9E9E', icon: 'more_horiz', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        
        // Income categories
        { name: '売上', type: 'income', color: '#4CAF50', icon: 'attach_money', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: 'コンサルティング', type: 'income', color: '#2196F3', icon: 'business_center', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: '受託開発', type: 'income', color: '#FF9800', icon: 'code', parentId: null, isActive: true, createdAt: now, updatedAt: now },
        { name: 'その他収入', type: 'income', color: '#9C27B0', icon: 'account_balance_wallet', parentId: null, isActive: true, createdAt: now, updatedAt: now }
      ]);
    }

    // Initialize default settings
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      const now = new Date().toISOString();
      await db.settings.bulkAdd([
        { key: 'currency', value: 'JPY', type: 'string', description: 'Default currency', createdAt: now, updatedAt: now },
        { key: 'dateFormat', value: 'YYYY-MM-DD', type: 'string', description: 'Date format preference', createdAt: now, updatedAt: now },
        { key: 'theme', value: 'light', type: 'string', description: 'UI theme preference', createdAt: now, updatedAt: now },
        { key: 'language', value: 'ja', type: 'string', description: 'Language preference', createdAt: now, updatedAt: now },
        { key: 'autoBackup', value: 'true', type: 'boolean', description: 'Enable automatic backup', createdAt: now, updatedAt: now },
        { key: 'maxFileSize', value: '10485760', type: 'number', description: 'Maximum file size in bytes (10MB)', createdAt: now, updatedAt: now }
      ]);
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Open database and initialize
const openDatabase = async () => {
  try {
    await db.open();
    console.log('Database opened successfully');
    await initializeDefaultData();
    return db;
  } catch (error) {
    console.error('Failed to open database:', error);
    throw error;
  }
};

// Export the database instance and helper function
export { db, openDatabase };
export default db;