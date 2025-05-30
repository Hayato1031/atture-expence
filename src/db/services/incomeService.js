import { db } from '../database.js';

/**
 * Income Service - Handles all income-related database operations
 */

// Validation helpers
const validateAmount = (amount) => {
  return !isNaN(amount) && parseFloat(amount) >= 0;
};

const validateDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

const validateIncome = (incomeData) => {
  const errors = [];
  
  if (!validateDate(incomeData.date)) {
    errors.push('Valid date is required');
  }
  
  if (!incomeData.categoryId || !Number.isInteger(Number(incomeData.categoryId))) {
    errors.push('Valid category ID is required');
  }
  
  if (!incomeData.source || incomeData.source.trim().length < 2) {
    errors.push('Source must be at least 2 characters long');
  }
  
  if (!validateAmount(incomeData.amount)) {
    errors.push('Valid amount is required (must be 0 or positive)');
  }
  
  if (!incomeData.description || incomeData.description.trim().length < 3) {
    errors.push('Description must be at least 3 characters long');
  }
  
  if (!incomeData.userId || !Number.isInteger(Number(incomeData.userId))) {
    errors.push('Valid user ID is required');
  }
  
  return errors;
};

/**
 * Create a new income record
 * @param {Object} incomeData - Income data object
 * @returns {Promise<Object>} Created income with ID
 */
export const createIncome = async (incomeData) => {
  try {
    // Validate input
    const validationErrors = validateIncome(incomeData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Verify user exists
    const user = await db.users.get(Number(incomeData.userId));
    if (!user) {
      throw new Error('User not found');
    }

    // Verify category exists and is an income category
    const category = await db.categories.get(Number(incomeData.categoryId));
    if (!category) {
      throw new Error('Category not found');
    }
    if (category.type !== 'income') {
      throw new Error('Selected category is not an income category');
    }

    const now = new Date().toISOString();
    const newIncome = {
      date: new Date(incomeData.date).toISOString().split('T')[0], // Store as YYYY-MM-DD
      categoryId: Number(incomeData.categoryId),
      source: incomeData.source.trim(),
      amount: parseFloat(incomeData.amount),
      description: incomeData.description.trim(),
      userId: Number(incomeData.userId),
      tags: Array.isArray(incomeData.tags) ? incomeData.tags : [],
      fileIds: Array.isArray(incomeData.fileIds) ? incomeData.fileIds : [],
      status: incomeData.status || 'confirmed',
      createdAt: now,
      updatedAt: now
    };

    const id = await db.income.add(newIncome);
    return { ...newIncome, id };
  } catch (error) {
    console.error('Error creating income:', error);
    throw error;
  }
};

/**
 * Get income by ID with related data
 * @param {number} id - Income ID
 * @returns {Promise<Object|null>} Income object with user and category data
 */
export const getIncomeById = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid income ID is required');
    }

    const income = await db.income.get(Number(id));
    if (!income) {
      return null;
    }

    // Get related data
    const [user, category, files] = await Promise.all([
      db.users.get(income.userId),
      db.categories.get(income.categoryId),
      income.fileIds?.length > 0 
        ? db.files.where('id').anyOf(income.fileIds).toArray()
        : []
    ]);

    return {
      ...income,
      user,
      category,
      files
    };
  } catch (error) {
    console.error('Error getting income by ID:', error);
    throw error;
  }
};

/**
 * Get income records with filtering and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object containing income array and metadata
 */
export const getIncome = async (options = {}) => {
  try {
    const {
      userId,
      categoryId,
      status,
      source,
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

    let query = db.income;

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

    // Get all matching income records
    let incomeRecords = await query.toArray();

    // Apply additional filters
    if (dateFrom) {
      incomeRecords = incomeRecords.filter(income => income.date >= dateFrom);
    }

    if (dateTo) {
      incomeRecords = incomeRecords.filter(income => income.date <= dateTo);
    }

    if (minAmount !== undefined) {
      incomeRecords = incomeRecords.filter(income => income.amount >= minAmount);
    }

    if (maxAmount !== undefined) {
      incomeRecords = incomeRecords.filter(income => income.amount <= maxAmount);
    }

    if (source) {
      incomeRecords = incomeRecords.filter(income => 
        income.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    if (tags && tags.length > 0) {
      incomeRecords = incomeRecords.filter(income => 
        tags.some(tag => income.tags.includes(tag))
      );
    }

    // Sort income records
    incomeRecords.sort((a, b) => {
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

    const total = incomeRecords.length;
    const paginatedIncome = incomeRecords.slice(offset, offset + limit);

    // Get related data for paginated results
    const incomeWithData = await Promise.all(
      paginatedIncome.map(async (income) => {
        const [user, category] = await Promise.all([
          db.users.get(income.userId),
          db.categories.get(income.categoryId)
        ]);
        
        return {
          ...income,
          user,
          category
        };
      })
    );

    return {
      income: incomeWithData,
      total,
      offset,
      limit,
      hasMore: offset + limit < total
    };
  } catch (error) {
    console.error('Error getting income:', error);
    throw error;
  }
};

/**
 * Update income record
 * @param {number} id - Income ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated income object
 */
export const updateIncome = async (id, updateData) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid income ID is required');
    }

    const existingIncome = await db.income.get(Number(id));
    if (!existingIncome) {
      throw new Error('Income record not found');
    }

    // Validate update data
    const mergedData = { ...existingIncome, ...updateData };
    const validationErrors = validateIncome(mergedData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Verify category if being updated
    if (updateData.categoryId) {
      const category = await db.categories.get(Number(updateData.categoryId));
      if (!category || category.type !== 'income') {
        throw new Error('Invalid income category');
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
    if (updatedFields.source) {
      updatedFields.source = updatedFields.source.trim();
    }
    if (updatedFields.date) {
      updatedFields.date = new Date(updatedFields.date).toISOString().split('T')[0];
    }
    if (updatedFields.amount !== undefined) {
      updatedFields.amount = parseFloat(updatedFields.amount);
    }

    await db.income.update(Number(id), updatedFields);
    
    const updatedIncome = await getIncomeById(id);
    return updatedIncome;
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};

/**
 * Delete income record
 * @param {number} id - Income ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteIncome = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid income ID is required');
    }

    const income = await db.income.get(Number(id));
    if (!income) {
      throw new Error('Income record not found');
    }

    await db.income.delete(Number(id));
    return true;
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};

/**
 * Get income statistics
 * @param {Object} filters - Optional filters (userId, dateFrom, dateTo)
 * @returns {Promise<Object>} Income statistics
 */
export const getIncomeStats = async (filters = {}) => {
  try {
    let query = db.income;

    if (filters.userId) {
      query = query.where('userId').equals(Number(filters.userId));
    }

    let incomeRecords = await query.toArray();

    // Apply date filters
    if (filters.dateFrom) {
      incomeRecords = incomeRecords.filter(income => income.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      incomeRecords = incomeRecords.filter(income => income.date <= filters.dateTo);
    }

    const total = incomeRecords.length;
    const totalAmount = incomeRecords.reduce((sum, income) => sum + income.amount, 0);
    const averageAmount = total > 0 ? totalAmount / total : 0;

    const statusStats = incomeRecords.reduce((stats, income) => {
      stats[income.status] = (stats[income.status] || 0) + 1;
      return stats;
    }, {});

    const categoryStats = incomeRecords.reduce((stats, income) => {
      stats[income.categoryId] = (stats[income.categoryId] || 0) + 1;
      return stats;
    }, {});

    const sourceStats = incomeRecords.reduce((stats, income) => {
      stats[income.source] = (stats[income.source] || 0) + 1;
      return stats;
    }, {});

    const monthlyStats = incomeRecords.reduce((stats, income) => {
      const month = income.date.substring(0, 7); // YYYY-MM
      if (!stats[month]) {
        stats[month] = { count: 0, amount: 0 };
      }
      stats[month].count += 1;
      stats[month].amount += income.amount;
      return stats;
    }, {});

    return {
      total,
      totalAmount,
      averageAmount,
      statusStats,
      categoryStats,
      sourceStats,
      monthlyStats
    };
  } catch (error) {
    console.error('Error getting income stats:', error);
    throw error;
  }
};

/**
 * Search income records by description or source
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Optional additional filters
 * @returns {Promise<Array>} Array of matching income records
 */
export const searchIncome = async (searchTerm, filters = {}) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    const term = searchTerm.toLowerCase().trim();
    
    let incomeRecords = await db.income
      .filter(income => 
        income.description.toLowerCase().includes(term) ||
        income.source.toLowerCase().includes(term) ||
        income.tags.some(tag => tag.toLowerCase().includes(term))
      )
      .toArray();

    // Apply additional filters
    if (filters.userId) {
      incomeRecords = incomeRecords.filter(income => income.userId === Number(filters.userId));
    }

    if (filters.status) {
      incomeRecords = incomeRecords.filter(income => income.status === filters.status);
    }

    // Get related data
    const incomeWithData = await Promise.all(
      incomeRecords.map(async (income) => {
        const [user, category] = await Promise.all([
          db.users.get(income.userId),
          db.categories.get(income.categoryId)
        ]);
        
        return {
          ...income,
          user,
          category
        };
      })
    );

    return incomeWithData;
  } catch (error) {
    console.error('Error searching income:', error);
    throw error;
  }
};

/**
 * Get income by source
 * @param {string} source - Income source
 * @param {Object} options - Additional options (userId, dateFrom, dateTo)
 * @returns {Promise<Array>} Array of income records from the source
 */
export const getIncomeBySource = async (source, options = {}) => {
  try {
    if (!source || source.trim().length < 2) {
      throw new Error('Valid source is required (minimum 2 characters)');
    }

    let query = db.income.where('source').equals(source.trim());
    
    let incomeRecords = await query.toArray();

    // Apply additional filters
    if (options.userId) {
      incomeRecords = incomeRecords.filter(income => income.userId === Number(options.userId));
    }

    if (options.dateFrom) {
      incomeRecords = incomeRecords.filter(income => income.date >= options.dateFrom);
    }

    if (options.dateTo) {
      incomeRecords = incomeRecords.filter(income => income.date <= options.dateTo);
    }

    // Get related data
    const incomeWithData = await Promise.all(
      incomeRecords.map(async (income) => {
        const [user, category] = await Promise.all([
          db.users.get(income.userId),
          db.categories.get(income.categoryId)
        ]);
        
        return {
          ...income,
          user,
          category
        };
      })
    );

    return incomeWithData;
  } catch (error) {
    console.error('Error getting income by source:', error);
    throw error;
  }
};

/**
 * Get unique income sources
 * @param {number} userId - Optional user ID filter
 * @returns {Promise<Array>} Array of unique sources
 */
export const getIncomeSources = async (userId = null) => {
  try {
    let query = db.income;
    
    if (userId) {
      query = query.where('userId').equals(Number(userId));
    }

    const incomeRecords = await query.toArray();
    const sources = [...new Set(incomeRecords.map(income => income.source))];
    
    return sources.sort();
  } catch (error) {
    console.error('Error getting income sources:', error);
    throw error;
  }
};

export default {
  createIncome,
  getIncomeById,
  getIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats,
  searchIncome,
  getIncomeBySource,
  getIncomeSources
};