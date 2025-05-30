import storage from './storage';

/**
 * Trash Service - Handles soft deletion and recovery of transactions
 */

// Move item to trash (soft delete)
export const moveToTrash = async (type, id, reason = '') => {
  try {
    let item;
    if (type === 'expense') {
      const expenses = storage.get('expenses') || [];
      item = expenses.find(e => e.id === id);
      if (item) {
        // Remove from expenses
        storage.set('expenses', expenses.filter(e => e.id !== id));
      }
    } else if (type === 'income') {
      const income = storage.get('income') || [];
      item = income.find(i => i.id === id);
      if (item) {
        // Remove from income
        storage.set('income', income.filter(i => i.id !== id));
      }
    }

    if (!item) {
      return { success: false, error: 'アイテムが見つかりません' };
    }

    // Add to trash
    const trashItem = {
      ...item,
      originalType: type,
      deletedAt: new Date().toISOString(),
      deletedReason: reason,
      trashId: `trash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const trash = storage.get('trash') || [];
    trash.push(trashItem);
    storage.set('trash', trash);

    return { success: true, data: trashItem };
  } catch (error) {
    console.error('Error moving to trash:', error);
    return { success: false, error: error.message };
  }
};

// Get all trash items
export const getAllTrash = async () => {
  try {
    const trash = storage.get('trash') || [];
    // Sort by deletion date (newest first)
    const sortedTrash = trash.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    return { success: true, data: sortedTrash };
  } catch (error) {
    console.error('Error getting trash:', error);
    return { success: false, error: error.message };
  }
};

// Restore item from trash
export const restoreFromTrash = async (trashId) => {
  try {
    const trash = storage.get('trash') || [];
    const itemIndex = trash.findIndex(item => item.trashId === trashId);
    
    if (itemIndex === -1) {
      return { success: false, error: 'ゴミ箱にアイテムが見つかりません' };
    }

    const trashItem = trash[itemIndex];
    const { originalType, deletedAt, deletedReason, trashId: _, ...originalItem } = trashItem;

    // Restore to original collection
    if (originalType === 'expense') {
      const expenses = storage.get('expenses') || [];
      expenses.push(originalItem);
      storage.set('expenses', expenses);
    } else if (originalType === 'income') {
      const income = storage.get('income') || [];
      income.push(originalItem);
      storage.set('income', income);
    }

    // Remove from trash
    trash.splice(itemIndex, 1);
    storage.set('trash', trash);

    return { success: true, data: originalItem };
  } catch (error) {
    console.error('Error restoring from trash:', error);
    return { success: false, error: error.message };
  }
};

// Permanently delete item from trash
export const permanentlyDelete = async (trashId) => {
  try {
    const trash = storage.get('trash') || [];
    const filteredTrash = trash.filter(item => item.trashId !== trashId);
    
    if (filteredTrash.length === trash.length) {
      return { success: false, error: 'ゴミ箱にアイテムが見つかりません' };
    }

    storage.set('trash', filteredTrash);
    return { success: true };
  } catch (error) {
    console.error('Error permanently deleting:', error);
    return { success: false, error: error.message };
  }
};

// Empty trash (delete all)
export const emptyTrash = async () => {
  try {
    storage.set('trash', []);
    return { success: true };
  } catch (error) {
    console.error('Error emptying trash:', error);
    return { success: false, error: error.message };
  }
};

// Auto-cleanup old trash items (older than 30 days)
export const cleanupOldTrash = async (daysOld = 30) => {
  try {
    const trash = storage.get('trash') || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const filteredTrash = trash.filter(item => {
      const deletedDate = new Date(item.deletedAt);
      return deletedDate > cutoffDate;
    });

    storage.set('trash', filteredTrash);
    
    const deletedCount = trash.length - filteredTrash.length;
    return { 
      success: true, 
      data: { 
        deletedCount, 
        remainingCount: filteredTrash.length 
      } 
    };
  } catch (error) {
    console.error('Error cleaning up trash:', error);
    return { success: false, error: error.message };
  }
};

const trashService = {
  moveToTrash,
  getAllTrash,
  restoreFromTrash,
  permanentlyDelete,
  emptyTrash,
  cleanupOldTrash
};

export default trashService;