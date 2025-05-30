import { db } from '../database.js';

/**
 * Category Service - Handles all category-related database operations
 */

// Validation helpers
const validateCategoryType = (type) => {
  return ['expense', 'income'].includes(type);
};

const validateColor = (color) => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colorRegex.test(color);
};

const validateCategory = (categoryData) => {
  const errors = [];
  
  if (!categoryData.name || categoryData.name.trim().length < 2) {
    errors.push('Category name must be at least 2 characters long');
  }
  
  if (!categoryData.type || !validateCategoryType(categoryData.type)) {
    errors.push('Category type must be either "expense" or "income"');
  }
  
  if (!categoryData.color || !validateColor(categoryData.color)) {
    errors.push('Valid color in hex format is required (e.g., #FF0000)');
  }
  
  if (!categoryData.icon || categoryData.icon.trim().length < 1) {
    errors.push('Icon is required');
  }
  
  return errors;
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data object
 * @returns {Promise<Object>} Created category with ID
 */
export const createCategory = async (categoryData) => {
  try {
    // Validate input
    const validationErrors = validateCategory(categoryData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if category name already exists for the same type
    const existingCategory = await db.categories
      .where('name').equals(categoryData.name.trim())
      .and(category => category.type === categoryData.type)
      .first();
    
    if (existingCategory) {
      throw new Error(`Category with name "${categoryData.name}" already exists for ${categoryData.type} type`);
    }

    // Verify parent category if provided
    if (categoryData.parentId) {
      const parentCategory = await db.categories.get(Number(categoryData.parentId));
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
      if (parentCategory.type !== categoryData.type) {
        throw new Error('Parent category must be of the same type');
      }
    }

    const now = new Date().toISOString();
    const newCategory = {
      name: categoryData.name.trim(),
      type: categoryData.type,
      color: categoryData.color,
      icon: categoryData.icon.trim(),
      parentId: categoryData.parentId ? Number(categoryData.parentId) : null,
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      createdAt: now,
      updatedAt: now
    };

    const id = await db.categories.add(newCategory);
    return { ...newCategory, id };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Get category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export const getCategoryById = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid category ID is required');
    }

    const category = await db.categories.get(Number(id));
    return category || null;
  } catch (error) {
    console.error('Error getting category by ID:', error);
    throw error;
  }
};

/**
 * Get all categories with optional filtering
 * @param {Object} filters - Optional filters (type, isActive, parentId)
 * @returns {Promise<Array>} Array of categories
 */
export const getAllCategories = async (filters = {}) => {
  try {
    let query = db.categories.orderBy('name');

    if (filters.type) {
      query = query.filter(category => category.type === filters.type);
    }

    if (filters.isActive !== undefined) {
      query = query.filter(category => category.isActive === filters.isActive);
    }

    if (filters.parentId !== undefined) {
      if (filters.parentId === null) {
        query = query.filter(category => category.parentId === null);
      } else {
        query = query.filter(category => category.parentId === Number(filters.parentId));
      }
    }

    const categories = await query.toArray();
    return categories;
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
};

/**
 * Get categories by type (expense or income)
 * @param {string} type - Category type ('expense' or 'income')
 * @param {boolean} activeOnly - Whether to return only active categories
 * @returns {Promise<Array>} Array of categories
 */
export const getCategoriesByType = async (type, activeOnly = true) => {
  try {
    if (!validateCategoryType(type)) {
      throw new Error('Category type must be either "expense" or "income"');
    }

    let query = db.categories.where('type').equals(type);

    if (activeOnly) {
      query = query.filter(category => category.isActive === true);
    }

    const categories = await query.toArray();
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting categories by type:', error);
    throw error;
  }
};

/**
 * Get category hierarchy (parent categories with their children)
 * @param {string} type - Category type ('expense' or 'income')
 * @param {boolean} activeOnly - Whether to return only active categories
 * @returns {Promise<Array>} Array of parent categories with children property
 */
export const getCategoryHierarchy = async (type, activeOnly = true) => {
  try {
    if (!validateCategoryType(type)) {
      throw new Error('Category type must be either "expense" or "income"');
    }

    const categories = await getCategoriesByType(type, activeOnly);
    
    const parentCategories = categories.filter(cat => cat.parentId === null);
    const childCategories = categories.filter(cat => cat.parentId !== null);

    const hierarchy = parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parentId === parent.id)
    }));

    return hierarchy;
  } catch (error) {
    console.error('Error getting category hierarchy:', error);
    throw error;
  }
};

/**
 * Update category
 * @param {number} id - Category ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated category object
 */
export const updateCategory = async (id, updateData) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid category ID is required');
    }

    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Validate update data
    const mergedData = { ...existingCategory, ...updateData };
    const validationErrors = validateCategory(mergedData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check for name conflicts if name is being updated
    if (updateData.name && updateData.name !== existingCategory.name) {
      const nameExists = await db.categories
        .where('name').equals(updateData.name.trim())
        .and(category => category.type === (updateData.type || existingCategory.type))
        .and(category => category.id !== Number(id))
        .first();
      
      if (nameExists) {
        throw new Error(`Category with name "${updateData.name}" already exists for this type`);
      }
    }

    // Verify parent category if being updated
    if (updateData.parentId !== undefined) {
      if (updateData.parentId !== null) {
        if (Number(updateData.parentId) === Number(id)) {
          throw new Error('Category cannot be its own parent');
        }
        
        const parentCategory = await getCategoryById(updateData.parentId);
        if (!parentCategory) {
          throw new Error('Parent category not found');
        }
        
        if (parentCategory.type !== (updateData.type || existingCategory.type)) {
          throw new Error('Parent category must be of the same type');
        }
        
        // Check for circular references
        const wouldCreateCircularReference = await checkCircularReference(
          Number(id), 
          Number(updateData.parentId)
        );
        if (wouldCreateCircularReference) {
          throw new Error('This would create a circular reference');
        }
      }
    }

    const updatedFields = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Clean up fields
    if (updatedFields.name) updatedFields.name = updatedFields.name.trim();
    if (updatedFields.icon) updatedFields.icon = updatedFields.icon.trim();

    await db.categories.update(Number(id), updatedFields);
    
    const updatedCategory = await getCategoryById(id);
    return updatedCategory;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Check if setting a parent would create a circular reference
 * @param {number} categoryId - Category ID
 * @param {number} parentId - Proposed parent ID
 * @returns {Promise<boolean>} True if circular reference would be created
 */
const checkCircularReference = async (categoryId, parentId) => {
  try {
    let currentParentId = parentId;
    const visited = new Set();

    while (currentParentId && !visited.has(currentParentId)) {
      if (currentParentId === categoryId) {
        return true; // Circular reference found
      }
      
      visited.add(currentParentId);
      const parentCategory = await getCategoryById(currentParentId);
      currentParentId = parentCategory?.parentId;
    }

    return false;
  } catch (error) {
    console.error('Error checking circular reference:', error);
    return true; // Err on the side of caution
  }
};

/**
 * Soft delete category (set isActive to false)
 * @param {number} id - Category ID
 * @returns {Promise<boolean>} Success status
 */
export const deactivateCategory = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid category ID is required');
    }

    const category = await getCategoryById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category is being used in expenses or income
    const isUsedInExpenses = await db.expenses.where('categoryId').equals(Number(id)).count();
    const isUsedInIncome = await db.income.where('categoryId').equals(Number(id)).count();

    if (isUsedInExpenses > 0 || isUsedInIncome > 0) {
      throw new Error('Cannot deactivate category that is being used in expense or income records');
    }

    // Deactivate all child categories
    const childCategories = await db.categories.where('parentId').equals(Number(id)).toArray();
    for (const child of childCategories) {
      await db.categories.update(child.id, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    }

    await db.categories.update(Number(id), {
      isActive: false,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error deactivating category:', error);
    throw error;
  }
};

/**
 * Reactivate category
 * @param {number} id - Category ID
 * @returns {Promise<boolean>} Success status
 */
export const reactivateCategory = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid category ID is required');
    }

    const category = await getCategoryById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // If category has a parent, ensure parent is active
    if (category.parentId) {
      const parentCategory = await getCategoryById(category.parentId);
      if (!parentCategory || !parentCategory.isActive) {
        throw new Error('Cannot reactivate category with inactive parent');
      }
    }

    await db.categories.update(Number(id), {
      isActive: true,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error reactivating category:', error);
    throw error;
  }
};

/**
 * Permanently delete category (use with caution)
 * @param {number} id - Category ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteCategory = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid category ID is required');
    }

    const category = await getCategoryById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category is being used
    const isUsedInExpenses = await db.expenses.where('categoryId').equals(Number(id)).count();
    const isUsedInIncome = await db.income.where('categoryId').equals(Number(id)).count();
    const hasChildren = await db.categories.where('parentId').equals(Number(id)).count();

    if (isUsedInExpenses > 0 || isUsedInIncome > 0) {
      throw new Error('Cannot delete category that is being used in expense or income records');
    }

    if (hasChildren > 0) {
      throw new Error('Cannot delete category that has child categories');
    }

    await db.categories.delete(Number(id));
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Search categories by name
 * @param {string} searchTerm - Search term
 * @param {string} type - Optional category type filter
 * @returns {Promise<Array>} Array of matching categories
 */
export const searchCategories = async (searchTerm, type = null) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    const term = searchTerm.toLowerCase().trim();
    
    let categories = await db.categories
      .filter(category => category.name.toLowerCase().includes(term))
      .toArray();

    if (type) {
      categories = categories.filter(category => category.type === type);
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
};

/**
 * Get category statistics
 * @param {string} type - Optional category type filter
 * @returns {Promise<Object>} Category statistics
 */
export const getCategoryStats = async (type = null) => {
  try {
    let query = db.categories;
    
    if (type) {
      query = query.where('type').equals(type);
    }

    const categories = await query.toArray();
    
    const total = categories.length;
    const active = categories.filter(cat => cat.isActive).length;
    const inactive = categories.filter(cat => !cat.isActive).length;
    const parents = categories.filter(cat => cat.parentId === null).length;
    const children = categories.filter(cat => cat.parentId !== null).length;

    const typeStats = categories.reduce((stats, category) => {
      stats[category.type] = (stats[category.type] || 0) + 1;
      return stats;
    }, {});

    // Get usage statistics
    const expenseUsage = {};
    const incomeUsage = {};
    
    const expenses = await db.expenses.toArray();
    const incomes = await db.income.toArray();
    
    expenses.forEach(expense => {
      expenseUsage[expense.categoryId] = (expenseUsage[expense.categoryId] || 0) + 1;
    });
    
    incomes.forEach(income => {
      incomeUsage[income.categoryId] = (incomeUsage[income.categoryId] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      parents,
      children,
      typeStats,
      expenseUsage,
      incomeUsage
    };
  } catch (error) {
    console.error('Error getting category stats:', error);
    throw error;
  }
};

/**
 * Get category usage count
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Usage statistics for the category
 */
export const getCategoryUsage = async (id) => {
  try {
    if (!id || !Number.isInteger(Number(id))) {
      throw new Error('Valid category ID is required');
    }

    const category = await getCategoryById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    const expenseCount = await db.expenses.where('categoryId').equals(Number(id)).count();
    const incomeCount = await db.income.where('categoryId').equals(Number(id)).count();

    return {
      categoryId: Number(id),
      categoryName: category.name,
      categoryType: category.type,
      expenseCount,
      incomeCount,
      totalUsage: expenseCount + incomeCount
    };
  } catch (error) {
    console.error('Error getting category usage:', error);
    throw error;
  }
};

const categoryService = {
  createCategory,
  getCategoryById,
  getAllCategories,
  getCategoriesByType,
  getCategoryHierarchy,
  updateCategory,
  deactivateCategory,
  reactivateCategory,
  deleteCategory,
  searchCategories,
  getCategoryStats,
  getCategoryUsage
};

export default categoryService;