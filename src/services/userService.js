import storage from './storage';

/**
 * User Service - Handles all user-related operations
 */

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\-+()\\s]+$/;
  return phoneRegex.test(phone);
};

// Create a new user
export const createUser = async (userData) => {
  try {
    // Validate required fields
    if (!userData.name || !userData.email || !userData.department) {
      return { 
        success: false, 
        error: '名前、メールアドレス、部署は必須です。' 
      };
    }

    // Validate email
    if (!validateEmail(userData.email)) {
      return { 
        success: false, 
        error: '有効なメールアドレスを入力してください。' 
      };
    }

    // Validate phone if provided
    if (userData.phone && !validatePhone(userData.phone)) {
      return { 
        success: false, 
        error: '有効な電話番号を入力してください。' 
      };
    }

    // Check if email already exists
    const existingUser = storage.findWhere('users', { email: userData.email });
    if (existingUser.length > 0) {
      return { 
        success: false, 
        error: 'このメールアドレスは既に使用されています。' 
      };
    }

    // Create user
    const newUser = storage.addItem('users', {
      ...userData,
      status: userData.status || 'active',
      avatar: userData.avatar || null
    });

    // New users have no transactions
    const userWithTransactionData = {
      ...newUser,
      totalExpenses: 0,
      totalIncome: 0,
      transactionCount: 0,
      lastActivity: null,
      isActive: newUser.status === 'active'
    };

    return { success: true, data: userWithTransactionData };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const user = storage.findById('users', id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Get user's expenses
    const expenses = storage.findWhere('expenses', { userId: user.id });
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Get user's income
    const income = storage.findWhere('income', { userId: user.id });
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    
    // Calculate transaction count
    const transactionCount = expenses.length + income.length;
    
    // Get last activity date
    const allTransactions = [...expenses, ...income];
    let lastActivity = null;
    if (allTransactions.length > 0) {
      const sortedTransactions = allTransactions.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      lastActivity = sortedTransactions[0].updatedAt || sortedTransactions[0].createdAt;
    }
    
    const userWithTransactionData = {
      ...user,
      totalExpenses,
      totalIncome,
      transactionCount,
      lastActivity,
      isActive: user.status === 'active'
    };
    
    return { success: true, data: userWithTransactionData };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const users = storage.get('users') || [];
    
    // Calculate transaction data for each user
    const usersWithTransactionData = users.map(user => {
      // Get user's expenses
      const expenses = storage.findWhere('expenses', { userId: user.id });
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Get user's income
      const income = storage.findWhere('income', { userId: user.id });
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      
      // Calculate transaction count
      const transactionCount = expenses.length + income.length;
      
      // Get last activity date
      const allTransactions = [...expenses, ...income];
      let lastActivity = null;
      if (allTransactions.length > 0) {
        const sortedTransactions = allTransactions.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        lastActivity = sortedTransactions[0].updatedAt || sortedTransactions[0].createdAt;
      }
      
      return {
        ...user,
        totalExpenses,
        totalIncome,
        transactionCount,
        lastActivity,
        isActive: user.status === 'active'
      };
    });
    
    return { success: true, data: usersWithTransactionData };
  } catch (error) {
    console.error('Error getting users:', error);
    return { success: false, error: error.message };
  }
};

// Update user
export const updateUser = async (id, updates) => {
  try {
    // Validate email if updating
    if (updates.email && !validateEmail(updates.email)) {
      return { 
        success: false, 
        error: '有効なメールアドレスを入力してください。' 
      };
    }

    // Validate phone if updating
    if (updates.phone && !validatePhone(updates.phone)) {
      return { 
        success: false, 
        error: '有効な電話番号を入力してください。' 
      };
    }

    // Check if email already exists (excluding current user)
    if (updates.email) {
      const existingUser = storage.findWhere('users', { email: updates.email });
      if (existingUser.length > 0 && existingUser[0].id !== id) {
        return { 
          success: false, 
          error: 'このメールアドレスは既に使用されています。' 
        };
      }
    }

    const updatedUser = storage.updateItem('users', id, updates);
    
    // Get transaction data for the updated user
    const expenses = storage.findWhere('expenses', { userId: updatedUser.id });
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const income = storage.findWhere('income', { userId: updatedUser.id });
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    
    const transactionCount = expenses.length + income.length;
    
    const allTransactions = [...expenses, ...income];
    let lastActivity = null;
    if (allTransactions.length > 0) {
      const sortedTransactions = allTransactions.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      lastActivity = sortedTransactions[0].updatedAt || sortedTransactions[0].createdAt;
    }
    
    const userWithTransactionData = {
      ...updatedUser,
      totalExpenses,
      totalIncome,
      transactionCount,
      lastActivity,
      isActive: updatedUser.status === 'active'
    };
    
    return { success: true, data: userWithTransactionData };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    // Check if user has any transactions
    const expenses = storage.findWhere('expenses', { userId: id });
    const income = storage.findWhere('income', { userId: id });
    
    if (expenses.length > 0 || income.length > 0) {
      return { 
        success: false, 
        error: 'このユーザーには取引記録があるため削除できません。' 
      };
    }
    
    storage.deleteItem('users', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// Toggle user active status
export const toggleUserActive = async (id) => {
  try {
    const user = storage.findById('users', id);
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません。' };
    }
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updatedUser = storage.updateItem('users', id, { status: newStatus });
    
    // Get transaction data for the updated user
    const expenses = storage.findWhere('expenses', { userId: updatedUser.id });
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const income = storage.findWhere('income', { userId: updatedUser.id });
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    
    const transactionCount = expenses.length + income.length;
    
    const allTransactions = [...expenses, ...income];
    let lastActivity = null;
    if (allTransactions.length > 0) {
      const sortedTransactions = allTransactions.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      lastActivity = sortedTransactions[0].updatedAt || sortedTransactions[0].createdAt;
    }
    
    const userWithTransactionData = {
      ...updatedUser,
      totalExpenses,
      totalIncome,
      transactionCount,
      lastActivity,
      isActive: updatedUser.status === 'active'
    };
    
    return { success: true, data: userWithTransactionData };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { success: false, error: error.message };
  }
};

// Get user statistics
export const getUserStats = async (userId) => {
  try {
    const expenses = storage.findWhere('expenses', { userId });
    const income = storage.findWhere('income', { userId });
    
    const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
    const incomeTotal = income.reduce((sum, item) => sum + item.amount, 0);
    
    return {
      success: true,
      data: {
        expenseCount: expenses.length,
        expenseTotal,
        incomeCount: income.length,
        incomeTotal,
        totalTransactions: expenses.length + income.length,
        netAmount: incomeTotal - expenseTotal
      }
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { success: false, error: error.message };
  }
};

const userService = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  toggleUserActive,
  getUserStats
};

export default userService;