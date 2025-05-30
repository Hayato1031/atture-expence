import storage from './storage';

/**
 * Settings Service - Handles all settings-related operations
 */

// Get all settings
export const getAllSettings = async () => {
  try {
    const settings = storage.get('settings') || {};
    return { success: true, data: settings };
  } catch (error) {
    console.error('Error getting settings:', error);
    return { success: false, error: error.message };
  }
};

// Get specific setting
export const getSetting = async (key) => {
  try {
    const settings = storage.get('settings') || {};
    return { success: true, data: settings[key] };
  } catch (error) {
    console.error('Error getting setting:', error);
    return { success: false, error: error.message };
  }
};

// Update setting
export const updateSetting = async (key, value) => {
  try {
    const settings = storage.get('settings') || {};
    settings[key] = value;
    settings.updatedAt = new Date().toISOString();
    storage.set('settings', settings);
    return { success: true, data: settings };
  } catch (error) {
    console.error('Error updating setting:', error);
    return { success: false, error: error.message };
  }
};

// Update multiple settings
export const updateSettings = async (updates) => {
  try {
    const settings = storage.get('settings') || {};
    Object.keys(updates).forEach(key => {
      settings[key] = updates[key];
    });
    settings.updatedAt = new Date().toISOString();
    storage.set('settings', settings);
    return { success: true, data: settings };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }
};

// Reset settings to defaults
export const resetSettings = async () => {
  try {
    const defaultSettings = {
      currency: 'JPY',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      theme: 'light',
      language: 'ja',
      autoBackup: true,
      maxFileSize: 10485760, // 10MB
      updatedAt: new Date().toISOString()
    };
    storage.set('settings', defaultSettings);
    return { success: true, data: defaultSettings };
  } catch (error) {
    console.error('Error resetting settings:', error);
    return { success: false, error: error.message };
  }
};

// Export settings
export const exportSettings = async () => {
  try {
    const settings = storage.get('settings') || {};
    return { 
      success: true, 
      data: {
        settings,
        exportedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error exporting settings:', error);
    return { success: false, error: error.message };
  }
};

// Import settings
export const importSettings = async (importData) => {
  try {
    if (!importData || !importData.settings) {
      return { 
        success: false, 
        error: '無効なインポートデータです。' 
      };
    }
    
    const settings = {
      ...importData.settings,
      updatedAt: new Date().toISOString()
    };
    storage.set('settings', settings);
    return { success: true, data: settings };
  } catch (error) {
    console.error('Error importing settings:', error);
    return { success: false, error: error.message };
  }
};

const settingsService = {
  getAllSettings,
  getSetting,
  updateSetting,
  updateSettings,
  resetSettings,
  exportSettings,
  importSettings
};

export default settingsService;