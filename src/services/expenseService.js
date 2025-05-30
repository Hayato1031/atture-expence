import storage from './storage';
import userService from './userService';
import categoryService from './categoryService';

/**
 * Expense Service - Handles all expense-related operations
 */

// Create a new expense
export const createExpense = async (expenseData) => {
  try {
    // Validate required fields
    if (!expenseData.date || !expenseData.categoryId || !expenseData.amount) {
      return { 
        success: false, 
        error: '日付、カテゴリ、金額は必須です。' 
      };
    }

    // Validate amount
    if (expenseData.amount <= 0) {
      return { 
        success: false, 
        error: '金額は0より大きい値を入力してください。' 
      };
    }

    // Create expense
    const newExpense = storage.addItem('expenses', {
      ...expenseData,
      status: expenseData.status || 'pending',
      tags: expenseData.tags || [],
      receiptIds: expenseData.receiptIds || []
    });

    return { success: true, data: newExpense };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { success: false, error: error.message };
  }
};

// Get expense by ID
export const getExpenseById = async (id) => {
  try {
    const expense = storage.findById('expenses', id);
    return { success: true, data: expense };
  } catch (error) {
    console.error('Error getting expense:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to populate expense with related data
const populateExpenseData = async (expense) => {
  const [userResult, categoryResult] = await Promise.all([
    expense.userId ? userService.getUserById(expense.userId) : null,
    expense.categoryId ? categoryService.getCategoryById(expense.categoryId) : null
  ]);

  return {
    ...expense,
    user: userResult?.success ? userResult.data : null,
    category: categoryResult?.success ? categoryResult.data : null
  };
};

// Get all expenses
export const getAllExpenses = async () => {
  try {
    const expenses = storage.get('expenses') || [];
    
    // Populate each expense with user and category data
    const populatedExpenses = await Promise.all(
      expenses.map(expense => populateExpenseData(expense))
    );
    
    return { success: true, data: populatedExpenses };
  } catch (error) {
    console.error('Error getting expenses:', error);
    return { success: false, error: error.message };
  }
};

// Get expenses by criteria
export const getExpensesByCriteria = async (criteria) => {
  try {
    const expenses = storage.findWhere('expenses', criteria);
    return { success: true, data: expenses };
  } catch (error) {
    console.error('Error getting expenses by criteria:', error);
    return { success: false, error: error.message };
  }
};

// Get expenses by date range
export const getExpensesByDateRange = async (startDate, endDate) => {
  try {
    const expenses = storage.get('expenses') || [];
    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
    });
    
    // Populate each expense with user and category data
    const populatedExpenses = await Promise.all(
      filtered.map(expense => populateExpenseData(expense))
    );
    
    return { success: true, data: populatedExpenses };
  } catch (error) {
    console.error('Error getting expenses by date range:', error);
    return { success: false, error: error.message };
  }
};

// Update expense
export const updateExpense = async (id, updates) => {
  try {
    // Validate amount if updating
    if (updates.amount !== undefined && updates.amount <= 0) {
      return { 
        success: false, 
        error: '金額は0より大きい値を入力してください。' 
      };
    }

    const updatedExpense = storage.updateItem('expenses', id, updates);
    return { success: true, data: updatedExpense };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error: error.message };
  }
};

// Delete expense
export const deleteExpense = async (id) => {
  try {
    storage.deleteItem('expenses', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: error.message };
  }
};

// Approve expense
export const approveExpense = async (id, approvedBy) => {
  try {
    const updatedExpense = storage.updateItem('expenses', id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString()
    });
    return { success: true, data: updatedExpense };
  } catch (error) {
    console.error('Error approving expense:', error);
    return { success: false, error: error.message };
  }
};

// Reject expense
export const rejectExpense = async (id, rejectedReason) => {
  try {
    const updatedExpense = storage.updateItem('expenses', id, {
      status: 'rejected',
      rejectedReason
    });
    return { success: true, data: updatedExpense };
  } catch (error) {
    console.error('Error rejecting expense:', error);
    return { success: false, error: error.message };
  }
};

// Get expense statistics
export const getExpenseStats = async (startDate, endDate) => {
  try {
    const result = await getExpensesByDateRange(startDate, endDate);
    if (!result.success) return result;

    const expenses = result.data;
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Group by category
    const byCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.categoryId]) {
        acc[expense.categoryId] = {
          count: 0,
          total: 0
        };
      }
      acc[expense.categoryId].count++;
      acc[expense.categoryId].total += expense.amount;
      return acc;
    }, {});

    // Group by status
    const byStatus = expenses.reduce((acc, expense) => {
      if (!acc[expense.status]) {
        acc[expense.status] = {
          count: 0,
          total: 0
        };
      }
      acc[expense.status].count++;
      acc[expense.status].total += expense.amount;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        count: expenses.length,
        total,
        average: expenses.length > 0 ? total / expenses.length : 0,
        byCategory,
        byStatus
      }
    };
  } catch (error) {
    console.error('Error getting expense stats:', error);
    return { success: false, error: error.message };
  }
};

const expenseService = {
  createExpense,
  getExpenseById,
  getAllExpenses,
  getExpensesByCriteria,
  getExpensesByDateRange,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  getExpenseStats
};

export default expenseService;