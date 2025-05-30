import storage from './storage';
import invoiceService from './invoiceService';

/**
 * Notification Service - Handles all notification-related operations
 */

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    const newNotification = storage.addItem('notifications', {
      ...notificationData,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, data: newNotification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

// Get all notifications
export const getAllNotifications = async () => {
  try {
    const notifications = storage.get('notifications') || [];
    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.message };
  }
};

// Get unread notifications
export const getUnreadNotifications = async () => {
  try {
    const notifications = storage.findWhere('notifications', { isRead: false });
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const updatedNotification = storage.updateItem('notifications', notificationId, {
      isRead: true,
      readAt: new Date().toISOString()
    });
    return { success: true, data: updatedNotification };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const notifications = storage.get('notifications') || [];
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    for (const notification of unreadNotifications) {
      storage.updateItem('notifications', notification.id, {
        isRead: true,
        readAt: new Date().toISOString()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    storage.deleteItem('notifications', notificationId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    storage.set('notifications', []);
    return { success: true };
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return { success: false, error: error.message };
  }
};

// Check for invoice due date notifications
export const checkInvoiceDueDates = async () => {
  try {
    const [upcomingResult, overdueResult] = await Promise.all([
      invoiceService.getUpcomingInvoices(3), // 3 days ahead
      invoiceService.getOverdueInvoices()
    ]);

    const notifications = [];

    // Create notifications for upcoming invoices
    if (upcomingResult.success) {
      for (const invoice of upcomingResult.data) {
        const daysUntilDue = Math.ceil(
          (new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        );

        const existingNotifications = storage.findWhere('notifications', {
          type: 'invoice_due_soon',
          relatedId: invoice.id
        });

        // Don't create duplicate notifications
        if (existingNotifications.length === 0) {
          await createNotification({
            type: 'invoice_due_soon',
            title: '請求書期日間近',
            message: `請求書「${invoice.title}」の期日まで${daysUntilDue}日です。`,
            priority: 'medium',
            relatedId: invoice.id,
            relatedType: 'invoice'
          });
        }
      }
    }

    // Create notifications for overdue invoices
    if (overdueResult.success) {
      for (const invoice of overdueResult.data) {
        const daysOverdue = Math.floor(
          (new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
        );

        const existingNotifications = storage.findWhere('notifications', {
          type: 'invoice_overdue',
          relatedId: invoice.id
        });

        // Don't create duplicate notifications
        if (existingNotifications.length === 0) {
          await createNotification({
            type: 'invoice_overdue',
            title: '請求書期日超過',
            message: `請求書「${invoice.title}」が${daysOverdue}日遅れています。`,
            priority: 'high',
            relatedId: invoice.id,
            relatedType: 'invoice'
          });
        }
      }
    }

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error checking invoice due dates:', error);
    return { success: false, error: error.message };
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try {
    const notifications = storage.get('notifications') || [];
    
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const high = notifications.filter(n => n.priority === 'high').length;
    const medium = notifications.filter(n => n.priority === 'medium').length;
    const low = notifications.filter(n => n.priority === 'low').length;

    // Group by type
    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        total,
        unread,
        high,
        medium,
        low,
        byType
      }
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return { success: false, error: error.message };
  }
};

// Auto-check for notifications (can be called periodically)
export const autoCheckNotifications = async () => {
  try {
    await checkInvoiceDueDates();
    return { success: true };
  } catch (error) {
    console.error('Error in auto-check notifications:', error);
    return { success: false, error: error.message };
  }
};

const notificationService = {
  createNotification,
  getAllNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  checkInvoiceDueDates,
  getNotificationStats,
  autoCheckNotifications
};

export default notificationService;