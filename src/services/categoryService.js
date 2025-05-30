import storage from './storage';

/**
 * Category Service - Handles all category-related operations
 */

// Create a new category
export const createCategory = async (categoryData) => {
  try {
    const newCategory = storage.addItem('categories', categoryData);
    return { success: true, data: newCategory };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message };
  }
};

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const category = storage.findById('categories', id);
    return { success: true, data: category };
  } catch (error) {
    console.error('Error getting category:', error);
    return { success: false, error: error.message };
  }
};

// Get all categories
export const getAllCategories = async () => {
  try {
    const categories = storage.get('categories') || [];
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error getting categories:', error);
    return { success: false, error: error.message };
  }
};

// Get categories by type
export const getCategoriesByType = async (type) => {
  try {
    const categories = storage.findWhere('categories', { type, isActive: true });
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error getting categories by type:', error);
    return { success: false, error: error.message };
  }
};

// Update category
export const updateCategory = async (id, updates) => {
  try {
    const updatedCategory = storage.updateItem('categories', id, updates);
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message };
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    // Check if category is in use
    const expenses = storage.findWhere('expenses', { categoryId: id });
    const income = storage.findWhere('income', { categoryId: id });
    
    if (expenses.length > 0 || income.length > 0) {
      return { 
        success: false, 
        error: 'カテゴリは使用中のため削除できません。' 
      };
    }
    
    storage.deleteItem('categories', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }
};

// Get category statistics
export const getCategoryStats = async (categoryId) => {
  try {
    const expenses = storage.findWhere('expenses', { categoryId });
    const income = storage.findWhere('income', { categoryId });
    
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
    console.error('Error getting category stats:', error);
    return { success: false, error: error.message };
  }
};

const categoryService = {
  createCategory,
  getCategoryById,
  getAllCategories,
  getCategoriesByType,
  updateCategory,
  deleteCategory,
  getCategoryStats
};

export default categoryService;