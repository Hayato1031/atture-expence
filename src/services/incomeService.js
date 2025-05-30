import storage from './storage';
import userService from './userService';
import categoryService from './categoryService';

/**
 * Income Service - Handles all income-related operations
 */

// Create a new income
export const createIncome = async (incomeData) => {
  try {
    // Validate required fields
    if (!incomeData.date || !incomeData.categoryId || !incomeData.amount || (!incomeData.source && !incomeData.description)) {
      return { 
        success: false, 
        error: '日付、カテゴリ、金額、説明は必須です。' 
      };
    }

    // Validate amount
    if (incomeData.amount <= 0) {
      return { 
        success: false, 
        error: '金額は0より大きい値を入力してください。' 
      };
    }

    // Create income
    const newIncome = storage.addItem('income', {
      ...incomeData,
      status: incomeData.status || 'confirmed',
      tags: incomeData.tags || [],
      fileIds: incomeData.fileIds || []
    });

    return { success: true, data: newIncome };
  } catch (error) {
    console.error('Error creating income:', error);
    return { success: false, error: error.message };
  }
};

// Get income by ID
export const getIncomeById = async (id) => {
  try {
    const income = storage.findById('income', id);
    return { success: true, data: income };
  } catch (error) {
    console.error('Error getting income:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to populate income with related data
const populateIncomeData = async (income) => {
  const [userResult, categoryResult] = await Promise.all([
    income.userId ? userService.getUserById(income.userId) : null,
    income.categoryId ? categoryService.getCategoryById(income.categoryId) : null
  ]);

  return {
    ...income,
    user: userResult?.success ? userResult.data : null,
    category: categoryResult?.success ? categoryResult.data : null
  };
};

// Get all income
export const getAllIncome = async () => {
  try {
    const income = storage.get('income') || [];
    
    // Populate each income with user and category data
    const populatedIncome = await Promise.all(
      income.map(inc => populateIncomeData(inc))
    );
    
    return { success: true, data: populatedIncome };
  } catch (error) {
    console.error('Error getting income:', error);
    return { success: false, error: error.message };
  }
};

// Get income by criteria
export const getIncomeByCriteria = async (criteria) => {
  try {
    const income = storage.findWhere('income', criteria);
    return { success: true, data: income };
  } catch (error) {
    console.error('Error getting income by criteria:', error);
    return { success: false, error: error.message };
  }
};

// Get income by date range
export const getIncomeByDateRange = async (startDate, endDate) => {
  try {
    const income = storage.get('income') || [];
    const filtered = income.filter(item => {
      const incomeDate = new Date(item.date);
      return incomeDate >= new Date(startDate) && incomeDate <= new Date(endDate);
    });
    
    // Populate each income with user and category data
    const populatedIncome = await Promise.all(
      filtered.map(inc => populateIncomeData(inc))
    );
    
    return { success: true, data: populatedIncome };
  } catch (error) {
    console.error('Error getting income by date range:', error);
    return { success: false, error: error.message };
  }
};

// Update income
export const updateIncome = async (id, updates) => {
  try {
    // Validate amount if updating
    if (updates.amount !== undefined && updates.amount <= 0) {
      return { 
        success: false, 
        error: '金額は0より大きい値を入力してください。' 
      };
    }

    const updatedIncome = storage.updateItem('income', id, updates);
    return { success: true, data: updatedIncome };
  } catch (error) {
    console.error('Error updating income:', error);
    return { success: false, error: error.message };
  }
};

// Delete income
export const deleteIncome = async (id) => {
  try {
    storage.deleteItem('income', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting income:', error);
    return { success: false, error: error.message };
  }
};

// Get income statistics
export const getIncomeStats = async (startDate, endDate) => {
  try {
    const result = await getIncomeByDateRange(startDate, endDate);
    if (!result.success) return result;

    const income = result.data;
    const total = income.reduce((sum, item) => sum + item.amount, 0);
    
    // Group by category
    const byCategory = income.reduce((acc, item) => {
      if (!acc[item.categoryId]) {
        acc[item.categoryId] = {
          count: 0,
          total: 0
        };
      }
      acc[item.categoryId].count++;
      acc[item.categoryId].total += item.amount;
      return acc;
    }, {});

    // Group by source
    const bySource = income.reduce((acc, item) => {
      if (!acc[item.source]) {
        acc[item.source] = {
          count: 0,
          total: 0
        };
      }
      acc[item.source].count++;
      acc[item.source].total += item.amount;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        count: income.length,
        total,
        average: income.length > 0 ? total / income.length : 0,
        byCategory,
        bySource
      }
    };
  } catch (error) {
    console.error('Error getting income stats:', error);
    return { success: false, error: error.message };
  }
};

const incomeService = {
  createIncome,
  getIncomeById,
  getAllIncome,
  getIncomeByCriteria,
  getIncomeByDateRange,
  updateIncome,
  deleteIncome,
  getIncomeStats
};

export default incomeService;