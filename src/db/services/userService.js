import { db } from '../database.js';

/**
 * User Service - Handles all user-related database operations
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

const validateUser = (userData) => {
  const errors = [];
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!userData.email || !validateEmail(userData.email)) {
    errors.push('Valid email is required');
  }
  
  if (!userData.department || userData.department.trim().length < 2) {
    errors.push('Department is required');
  }
  
  if (!userData.role || userData.role.trim().length < 2) {
    errors.push('Role is required');
  }
  
  if (userData.phone && !validatePhone(userData.phone)) {
    errors.push('Invalid phone number format');
  }
  
  return errors;
};

/**
 * Create a new user
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Created user with ID
 */
export const createUser = async (userData) => {
  try {
    // Validate input
    const validationErrors = validateUser(userData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if email already exists
    const existingUser = await db.users.where('email').equals(userData.email).first();
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const now = new Date().toISOString();
    const newUser = {
      ...userData,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      department: userData.department.trim(),
      role: userData.role.trim(),
      phone: userData.phone?.trim() || null,
      avatar: userData.avatar || null,
      status: userData.status || 'active',
      createdAt: now,
      updatedAt: now
    };

    const id = await db.users.add(newUser);
    return { ...newUser, id };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const getUserById = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid user ID is required');
    }

    const user = await db.users.get(Number(id));
    return user || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const getUserByEmail = async (email) => {
  try {
    if (!email || !validateEmail(email)) {
      throw new Error('Valid email is required');
    }

    const user = await db.users.where('email').equals(email.toLowerCase().trim()).first();
    return user || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

/**
 * Get all users with optional filtering
 * @param {Object} filters - Optional filters (status, department, role)
 * @returns {Promise<Array>} Array of users
 */
export const getAllUsers = async (filters = {}) => {
  try {
    let query = db.users.orderBy('name');

    if (filters.status) {
      query = query.filter(user => user.status === filters.status);
    }

    if (filters.department) {
      query = query.filter(user => user.department === filters.department);
    }

    if (filters.role) {
      query = query.filter(user => user.role === filters.role);
    }

    const users = await query.toArray();
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Update user
 * @param {number} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user object
 */
export const updateUser = async (id, updateData) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid user ID is required');
    }

    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await getUserByEmail(updateData.email);
      if (emailExists) {
        throw new Error('User with this email already exists');
      }
    }

    // Validate update data
    const mergedData = { ...existingUser, ...updateData };
    const validationErrors = validateUser(mergedData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const updatedFields = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Clean up fields
    if (updatedFields.name) updatedFields.name = updatedFields.name.trim();
    if (updatedFields.email) updatedFields.email = updatedFields.email.toLowerCase().trim();
    if (updatedFields.department) updatedFields.department = updatedFields.department.trim();
    if (updatedFields.role) updatedFields.role = updatedFields.role.trim();
    if (updatedFields.phone) updatedFields.phone = updatedFields.phone.trim();

    await db.users.update(Number(id), updatedFields);
    
    const updatedUser = await getUserById(id);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Soft delete user (set status to inactive)
 * @param {number} id - User ID
 * @returns {Promise<boolean>} Success status
 */
export const deactivateUser = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid user ID is required');
    }

    const user = await getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await db.users.update(Number(id), {
      status: 'inactive',
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

/**
 * Reactivate user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} Success status
 */
export const reactivateUser = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid user ID is required');
    }

    const user = await getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await db.users.update(Number(id), {
      status: 'active',
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw error;
  }
};

/**
 * Permanently delete user (use with caution)
 * @param {number} id - User ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteUser = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid user ID is required');
    }

    const user = await getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has associated data
    const hasExpenses = await db.expenses.where('userId').equals(Number(id)).count();
    const hasIncome = await db.income.where('userId').equals(Number(id)).count();
    
    if (hasExpenses > 0 || hasIncome > 0) {
      throw new Error('Cannot delete user with associated expenses or income records. Deactivate instead.');
    }

    await db.users.delete(Number(id));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Search users by name or email
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching users
 */
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    const term = searchTerm.toLowerCase().trim();
    
    const users = await db.users
      .filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term)
      )
      .toArray();

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
export const getUserStats = async () => {
  try {
    const totalUsers = await db.users.count();
    const activeUsers = await db.users.where('status').equals('active').count();
    const inactiveUsers = await db.users.where('status').equals('inactive').count();
    
    const departments = await db.users.orderBy('department').uniqueKeys();
    const roles = await db.users.orderBy('role').uniqueKeys();

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      departments: departments.length,
      roles: roles.length,
      departmentList: departments,
      roleList: roles
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

/**
 * Get transaction summary for a specific user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User transaction summary
 */
export const getUserTransactionSummary = async (userId) => {
  try {
    if (!userId || !Number.isInteger(Number(userId))) {
      throw new Error('Valid user ID is required');
    }

    // Get all expenses for the user
    const expenses = await db.expenses.where('userId').equals(Number(userId)).toArray();
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get all income for the user
    const income = await db.income.where('userId').equals(Number(userId)).toArray();
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
      totalExpenses,
      totalIncome,
      transactionCount,
      lastActivity,
      netAmount: totalIncome - totalExpenses
    };
  } catch (error) {
    console.error('Error getting user transaction summary:', error);
    throw error;
  }
};

/**
 * Get all users with transaction summaries
 * @param {Object} filters - Optional filters (status, department, role)
 * @returns {Promise<Array>} Array of users with transaction data
 */
export const getAllUsersWithTransactionData = async (filters = {}) => {
  try {
    // Get all users
    const users = await getAllUsers(filters);

    // Get transaction summaries for all users
    const usersWithTransactionData = await Promise.all(
      users.map(async (user) => {
        const transactionSummary = await getUserTransactionSummary(user.id);
        return {
          ...user,
          ...transactionSummary,
          isActive: user.status === 'active'
        };
      })
    );

    return usersWithTransactionData;
  } catch (error) {
    console.error('Error getting users with transaction data:', error);
    throw error;
  }
};

const userService = {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deactivateUser,
  reactivateUser,
  deleteUser,
  searchUsers,
  getUserStats,
  getUserTransactionSummary,
  getAllUsersWithTransactionData
};

export default userService;