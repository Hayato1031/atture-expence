import { db } from '../database.js';

/**
 * Expense Service - Handles all expense-related database operations
 */

// Validation helpers
const validateAmount = (amount) => {
  return !isNaN(amount) && parseFloat(amount) >= 0;
};

const validateDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

const validateExpense = (expenseData) => {
  const errors = [];
  
  if (!validateDate(expenseData.date)) {
    errors.push('Valid date is required');
  }
  
  if (!expenseData.categoryId || !Number.isInteger(Number(expenseData.categoryId))) {
    errors.push('Valid category ID is required');
  }
  
  if (!validateAmount(expenseData.amount)) {
    errors.push('Valid amount is required (must be 0 or positive)');
  }
  
  if (!expenseData.description || expenseData.description.trim().length < 3) {
    errors.push('Description must be at least 3 characters long');
  }
  
  if (!expenseData.userId || !Number.isInteger(Number(expenseData.userId))) {
    errors.push('Valid user ID is required');
  }
  
  return errors;
};

/**
 * Create a new expense
 * @param {Object} expenseData - Expense data object
 * @returns {Promise<Object>} Created expense with ID
 */
export const createExpense = async (expenseData) => {
  try {
    // Validate input
    const validationErrors = validateExpense(expenseData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Verify user exists
    const user = await db.users.get(Number(expenseData.userId));
    if (!user) {
      throw new Error('User not found');
    }

    // Verify category exists and is an expense category
    const category = await db.categories.get(Number(expenseData.categoryId));
    if (!category) {
      throw new Error('Category not found');
    }
    if (category.type !== 'expense') {
      throw new Error('Selected category is not an expense category');
    }

    const now = new Date().toISOString();
    const newExpense = {
      date: new Date(expenseData.date).toISOString().split('T')[0], // Store as YYYY-MM-DD
      categoryId: Number(expenseData.categoryId),
      amount: parseFloat(expenseData.amount),
      description: expenseData.description.trim(),
      userId: Number(expenseData.userId),
      tags: Array.isArray(expenseData.tags) ? expenseData.tags : [],
      receiptIds: Array.isArray(expenseData.receiptIds) ? expenseData.receiptIds : [],
      status: expenseData.status || 'pending',
      approvedBy: expenseData.approvedBy || null,
      approvedAt: expenseData.approvedAt || null,
      rejectedReason: expenseData.rejectedReason || null,
      createdAt: now,
      updatedAt: now
    };

    const id = await db.expenses.add(newExpense);
    return { ...newExpense, id };
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

/**
 * Get expense by ID with related data
 * @param {number} id - Expense ID
 * @returns {Promise<Object|null>} Expense object with user and category data
 */
export const getExpenseById = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid expense ID is required');
    }

    const expense = await db.expenses.get(Number(id));
    if (!expense) {
      return null;
    }

    // Get related data
    const [user, category, receipts] = await Promise.all([
      db.users.get(expense.userId),
      db.categories.get(expense.categoryId),
      expense.receiptIds?.length > 0 
        ? db.files.where('id').anyOf(expense.receiptIds).toArray()
        : []
    ]);

    return {
      ...expense,
      user,
      category,
      receipts
    };
  } catch (error) {
    console.error('Error getting expense by ID:', error);
    throw error;
  }
};

/**
 * Get expenses with filtering and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object containing expenses array and metadata
 */
export const getExpenses = async (options = {}) => {
  try {
    const {
      userId,
      categoryId,
      status,
      dateFrom,
      dateTo,
      tags,
      minAmount,
      maxAmount,
      limit = 50,
      offset = 0,
      sortBy = 'date',
      sortOrder = 'desc'
    } = options;

    let query = db.expenses;

    // Apply filters
    if (userId) {
      query = query.where('userId').equals(Number(userId));
    }

    if (categoryId) {
      query = query.where('categoryId').equals(Number(categoryId));
    }

    if (status) {
      query = query.where('status').equals(status);
    }

    // Get all matching expenses
    let expenses = await query.toArray();

    // Apply additional filters
    if (dateFrom) {
      expenses = expenses.filter(expense => expense.date >= dateFrom);
    }

    if (dateTo) {
      expenses = expenses.filter(expense => expense.date <= dateTo);
    }

    if (minAmount !== undefined) {
      expenses = expenses.filter(expense => expense.amount >= minAmount);
    }

    if (maxAmount !== undefined) {
      expenses = expenses.filter(expense => expense.amount <= maxAmount);
    }

    if (tags && tags.length > 0) {
      expenses = expenses.filter(expense => 
        tags.some(tag => expense.tags.includes(tag))
      );
    }

    // Sort expenses
    expenses.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    const total = expenses.length;
    const paginatedExpenses = expenses.slice(offset, offset + limit);

    // Get related data for paginated results
    const expensesWithData = await Promise.all(
      paginatedExpenses.map(async (expense) => {
        const [user, category] = await Promise.all([
          db.users.get(expense.userId),
          db.categories.get(expense.categoryId)
        ]);
        
        return {
          ...expense,
          user,
          category
        };
      })
    );

    return {
      expenses: expensesWithData,
      total,
      offset,
      limit,
      hasMore: offset + limit < total
    };
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

/**
 * Update expense
 * @param {number} id - Expense ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated expense object
 */
export const updateExpense = async (id, updateData) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid expense ID is required');
    }

    const existingExpense = await db.expenses.get(Number(id));
    if (!existingExpense) {
      throw new Error('Expense not found');
    }

    // Validate update data
    const mergedData = { ...existingExpense, ...updateData };
    const validationErrors = validateExpense(mergedData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Verify category if being updated
    if (updateData.categoryId) {
      const category = await db.categories.get(Number(updateData.categoryId));
      if (!category || category.type !== 'expense') {
        throw new Error('Invalid expense category');
      }
    }

    const updatedFields = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Clean up fields
    if (updatedFields.description) {
      updatedFields.description = updatedFields.description.trim();
    }
    if (updatedFields.date) {
      updatedFields.date = new Date(updatedFields.date).toISOString().split('T')[0];
    }
    if (updatedFields.amount !== undefined) {
      updatedFields.amount = parseFloat(updatedFields.amount);
    }

    await db.expenses.update(Number(id), updatedFields);
    
    const updatedExpense = await getExpenseById(id);
    return updatedExpense;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete expense
 * @param {number} id - Expense ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteExpense = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid expense ID is required');
    }

    const expense = await db.expenses.get(Number(id));
    if (!expense) {
      throw new Error('Expense not found');
    }

    await db.expenses.delete(Number(id));
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Approve expense
 * @param {number} id - Expense ID
 * @param {number} approvedById - ID of user approving
 * @returns {Promise<Object>} Updated expense object
 */
export const approveExpense = async (id, approvedById) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid expense ID is required');
    }

    if (!approvedById || !Number.isInteger(Number(approvedById))) {
      throw new Error('Valid approver ID is required');
    }

    const expense = await db.expenses.get(Number(id));
    if (!expense) {
      throw new Error('Expense not found');
    }

    const approver = await db.users.get(Number(approvedById));
    if (!approver) {
      throw new Error('Approver not found');
    }

    await db.expenses.update(Number(id), {
      status: 'approved',
      approvedBy: Number(approvedById),
      approvedAt: new Date().toISOString(),
      rejectedReason: null,
      updatedAt: new Date().toISOString()
    });

    return await getExpenseById(id);
  } catch (error) {
    console.error('Error approving expense:', error);
    throw error;
  }
};

/**
 * Reject expense
 * @param {number} id - Expense ID
 * @param {number} rejectedById - ID of user rejecting
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated expense object
 */
export const rejectExpense = async (id, rejectedById, reason) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid expense ID is required');
    }

    if (!rejectedById || !Number.isInteger(Number(rejectedById))) {
      throw new Error('Valid rejector ID is required');
    }

    if (!reason || reason.trim().length < 3) {
      throw new Error('Rejection reason is required (minimum 3 characters)');
    }

    const expense = await db.expenses.get(Number(id));
    if (!expense) {
      throw new Error('Expense not found');
    }

    const rejector = await db.users.get(Number(rejectedById));
    if (!rejector) {
      throw new Error('Rejector not found');
    }

    await db.expenses.update(Number(id), {
      status: 'rejected',
      approvedBy: Number(rejectedById),
      approvedAt: new Date().toISOString(),
      rejectedReason: reason.trim(),
      updatedAt: new Date().toISOString()
    });

    return await getExpenseById(id);
  } catch (error) {
    console.error('Error rejecting expense:', error);
    throw error;
  }
};

/**
 * Get expense statistics
 * @param {Object} filters - Optional filters (userId, dateFrom, dateTo)
 * @returns {Promise<Object>} Expense statistics
 */
export const getExpenseStats = async (filters = {}) => {
  try {
    let query = db.expenses;

    if (filters.userId) {
      query = query.where('userId').equals(Number(filters.userId));
    }

    let expenses = await query.toArray();

    // Apply date filters
    if (filters.dateFrom) {
      expenses = expenses.filter(expense => expense.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      expenses = expenses.filter(expense => expense.date <= filters.dateTo);
    }

    const total = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageAmount = total > 0 ? totalAmount / total : 0;

    const statusStats = expenses.reduce((stats, expense) => {
      stats[expense.status] = (stats[expense.status] || 0) + 1;
      return stats;
    }, {});

    const categoryStats = expenses.reduce((stats, expense) => {
      stats[expense.categoryId] = (stats[expense.categoryId] || 0) + 1;
      return stats;
    }, {});

    const monthlyStats = expenses.reduce((stats, expense) => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      if (!stats[month]) {
        stats[month] = { count: 0, amount: 0 };
      }
      stats[month].count += 1;
      stats[month].amount += expense.amount;
      return stats;
    }, {});

    return {
      total,
      totalAmount,
      averageAmount,
      statusStats,
      categoryStats,
      monthlyStats
    };
  } catch (error) {
    console.error('Error getting expense stats:', error);
    throw error;
  }
};

/**
 * Search expenses by description
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Optional additional filters
 * @returns {Promise<Array>} Array of matching expenses
 */
export const searchExpenses = async (searchTerm, filters = {}) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    const term = searchTerm.toLowerCase().trim();
    
    let expenses = await db.expenses
      .filter(expense => 
        expense.description.toLowerCase().includes(term) ||
        expense.tags.some(tag => tag.toLowerCase().includes(term))
      )
      .toArray();

    // Apply additional filters
    if (filters.userId) {
      expenses = expenses.filter(expense => expense.userId === Number(filters.userId));
    }

    if (filters.status) {
      expenses = expenses.filter(expense => expense.status === filters.status);
    }

    // Get related data
    const expensesWithData = await Promise.all(
      expenses.map(async (expense) => {
        const [user, category] = await Promise.all([
          db.users.get(expense.userId),
          db.categories.get(expense.categoryId)
        ]);
        
        return {
          ...expense,
          user,
          category
        };
      })
    );

    return expensesWithData;
  } catch (error) {
    console.error('Error searching expenses:', error);
    throw error;
  }
};

export default {
  createExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  getExpenseStats,
  searchExpenses
};