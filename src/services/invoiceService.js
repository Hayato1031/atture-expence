import storage from './storage';

/**
 * Invoice Service - Handles all invoice-related operations
 */

// Create a new invoice
export const createInvoice = async (invoiceData) => {
  try {
    // Validate required fields
    if (!invoiceData.title || !invoiceData.amount || !invoiceData.dueDate) {
      return { 
        success: false, 
        error: 'タイトル、金額、期日は必須です。' 
      };
    }

    // Validate amount
    if (invoiceData.amount <= 0) {
      return { 
        success: false, 
        error: '金額は0より大きい値を入力してください。' 
      };
    }

    // Validate due date
    const dueDate = new Date(invoiceData.dueDate);
    if (isNaN(dueDate.getTime())) {
      return { 
        success: false, 
        error: '有効な期日を入力してください。' 
      };
    }

    // Create invoice
    const newInvoice = storage.addItem('invoices', {
      ...invoiceData,
      status: invoiceData.status || 'pending',
      isRecurring: invoiceData.isRecurring || false,
      recurringType: invoiceData.recurringType || 'monthly',
      nextDueDate: invoiceData.isRecurring ? calculateNextDueDate(dueDate, invoiceData.recurringType) : null,
      notificationSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { success: true, data: newInvoice };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { success: false, error: error.message };
  }
};

// Calculate next due date for recurring invoices
const calculateNextDueDate = (currentDueDate, recurringType) => {
  const nextDate = new Date(currentDueDate);
  
  switch (recurringType) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate.toISOString();
};

// Get invoice by ID
export const getInvoiceById = async (id) => {
  try {
    const invoice = storage.findById('invoices', id);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error getting invoice:', error);
    return { success: false, error: error.message };
  }
};

// Get all invoices
export const getAllInvoices = async () => {
  try {
    const invoices = storage.get('invoices') || [];
    return { success: true, data: invoices };
  } catch (error) {
    console.error('Error getting invoices:', error);
    return { success: false, error: error.message };
  }
};

// Get invoices by status
export const getInvoicesByStatus = async (status) => {
  try {
    const invoices = storage.findWhere('invoices', { status });
    return { success: true, data: invoices };
  } catch (error) {
    console.error('Error getting invoices by status:', error);
    return { success: false, error: error.message };
  }
};

// Get upcoming invoices (due within specified days)
export const getUpcomingInvoices = async (daysAhead = 7) => {
  try {
    const invoices = storage.get('invoices') || [];
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    const upcoming = invoices.filter(invoice => {
      const dueDate = new Date(invoice.dueDate);
      return dueDate >= now && dueDate <= futureDate && invoice.status === 'pending';
    });

    return { success: true, data: upcoming };
  } catch (error) {
    console.error('Error getting upcoming invoices:', error);
    return { success: false, error: error.message };
  }
};

// Get overdue invoices
export const getOverdueInvoices = async () => {
  try {
    const invoices = storage.get('invoices') || [];
    const now = new Date();

    const overdue = invoices.filter(invoice => {
      const dueDate = new Date(invoice.dueDate);
      return dueDate < now && invoice.status === 'pending';
    });

    return { success: true, data: overdue };
  } catch (error) {
    console.error('Error getting overdue invoices:', error);
    return { success: false, error: error.message };
  }
};

// Update invoice
export const updateInvoice = async (id, updates) => {
  try {
    // Validate amount if updating
    if (updates.amount !== undefined && updates.amount <= 0) {
      return { 
        success: false, 
        error: '金額は0より大きい値を入力してください。' 
      };
    }

    const updatedInvoice = storage.updateItem('invoices', id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return { success: true, data: updatedInvoice };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, error: error.message };
  }
};

// Mark invoice as paid
export const markInvoiceAsPaid = async (id) => {
  try {
    const invoice = storage.findById('invoices', id);
    if (!invoice) {
      return { success: false, error: '請求書が見つかりません。' };
    }

    const updatedInvoice = storage.updateItem('invoices', id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // If it's a recurring invoice, create the next invoice
    if (invoice.isRecurring && invoice.nextDueDate) {
      const nextInvoice = {
        ...invoice,
        id: undefined, // Let storage assign new ID
        dueDate: invoice.nextDueDate,
        nextDueDate: calculateNextDueDate(new Date(invoice.nextDueDate), invoice.recurringType),
        status: 'pending',
        paidAt: null,
        notificationSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await createInvoice(nextInvoice);
    }

    return { success: true, data: updatedInvoice };
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return { success: false, error: error.message };
  }
};

// Delete invoice
export const deleteInvoice = async (id) => {
  try {
    storage.deleteItem('invoices', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { success: false, error: error.message };
  }
};

// Get invoice statistics
export const getInvoiceStats = async () => {
  try {
    const invoices = storage.get('invoices') || [];
    const now = new Date();

    const total = invoices.length;
    const pending = invoices.filter(i => i.status === 'pending').length;
    const paid = invoices.filter(i => i.status === 'paid').length;
    const overdue = invoices.filter(i => {
      const dueDate = new Date(i.dueDate);
      return dueDate < now && i.status === 'pending';
    }).length;

    const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
    const pendingAmount = invoices
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + i.amount, 0);
    const paidAmount = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      success: true,
      data: {
        total,
        pending,
        paid,
        overdue,
        totalAmount,
        pendingAmount,
        paidAmount
      }
    };
  } catch (error) {
    console.error('Error getting invoice stats:', error);
    return { success: false, error: error.message };
  }
};

const invoiceService = {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  getInvoicesByStatus,
  getUpcomingInvoices,
  getOverdueInvoices,
  updateInvoice,
  markInvoiceAsPaid,
  deleteInvoice,
  getInvoiceStats
};

export default invoiceService;