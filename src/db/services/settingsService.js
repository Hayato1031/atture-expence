import { db } from '../database.js';

/**
 * Settings Service - Handles all settings-related database operations
 */

// Valid setting types
const SETTING_TYPES = ['string', 'number', 'boolean', 'json', 'array'];

// Default settings configuration
const DEFAULT_SETTINGS = {
  currency: { type: 'string', defaultValue: 'JPY', description: 'Default currency' },
  dateFormat: { type: 'string', defaultValue: 'YYYY-MM-DD', description: 'Date format preference' },
  theme: { type: 'string', defaultValue: 'light', description: 'UI theme preference' },
  language: { type: 'string', defaultValue: 'ja', description: 'Language preference' },
  autoBackup: { type: 'boolean', defaultValue: true, description: 'Enable automatic backup' },
  maxFileSize: { type: 'number', defaultValue: 10485760, description: 'Maximum file size in bytes (10MB)' },
  expenseApprovalRequired: { type: 'boolean', defaultValue: false, description: 'Require approval for expenses' },
  defaultExpenseStatus: { type: 'string', defaultValue: 'pending', description: 'Default status for new expenses' },
  expenseCategories: { type: 'array', defaultValue: [], description: 'Favorite expense categories' },
  incomeCategories: { type: 'array', defaultValue: [], description: 'Favorite income categories' },
  recentTags: { type: 'array', defaultValue: [], description: 'Recently used tags' },
  emailNotifications: { type: 'boolean', defaultValue: true, description: 'Enable email notifications' },
  pushNotifications: { type: 'boolean', defaultValue: false, description: 'Enable push notifications' },
  dataRetentionDays: { type: 'number', defaultValue: 365, description: 'Data retention period in days' },
  exportFormat: { type: 'string', defaultValue: 'csv', description: 'Default export format' }
};

// Validation helpers
const validateSettingType = (type) => {
  return SETTING_TYPES.includes(type);
};

const validateSettingValue = (value, type) => {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'json':
      try {
        JSON.parse(JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    case 'array':
      return Array.isArray(value);
    default:
      return false;
  }
};

const parseSettingValue = (value, type) => {
  switch (type) {
    case 'string':
      return String(value);
    case 'number':
      return Number(value);
    case 'boolean':
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return Boolean(value);
    case 'json':
      return typeof value === 'string' ? JSON.parse(value) : value;
    case 'array':
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
      return Array.isArray(value) ? value : [];
    default:
      return value;
  }
};

const serializeSettingValue = (value, type) => {
  switch (type) {
    case 'json':
    case 'array':
      return JSON.stringify(value);
    default:
      return String(value);
  }
};

/**
 * Get setting by key
 * @param {string} key - Setting key
 * @returns {Promise<any>} Setting value or default value
 */
export const getSetting = async (key) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Valid setting key is required');
    }

    const setting = await db.settings.where('key').equals(key).first();
    
    if (!setting) {
      // Return default value if available
      const defaultSetting = DEFAULT_SETTINGS[key];
      return defaultSetting ? defaultSetting.defaultValue : null;
    }

    return parseSettingValue(setting.value, setting.type);
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
};

/**
 * Set setting value
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @param {string} type - Setting type (optional, will be inferred from default settings)
 * @param {string} description - Setting description (optional)
 * @returns {Promise<Object>} Updated setting object
 */
export const setSetting = async (key, value, type = null, description = null) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Valid setting key is required');
    }

    // Get type and description from defaults if not provided
    const defaultSetting = DEFAULT_SETTINGS[key];
    const settingType = type || (defaultSetting ? defaultSetting.type : 'string');
    const settingDescription = description || (defaultSetting ? defaultSetting.description : '');

    if (!validateSettingType(settingType)) {
      throw new Error(`Invalid setting type: ${settingType}. Must be one of: ${SETTING_TYPES.join(', ')}`);
    }

    if (!validateSettingValue(value, settingType)) {
      throw new Error(`Invalid value for type ${settingType}`);
    }

    const serializedValue = serializeSettingValue(value, settingType);
    const now = new Date().toISOString();

    const existingSetting = await db.settings.where('key').equals(key).first();

    if (existingSetting) {
      // Update existing setting
      await db.settings.update(existingSetting.id, {
        value: serializedValue,
        type: settingType,
        description: settingDescription,
        updatedAt: now
      });

      return {
        ...existingSetting,
        value: serializedValue,
        type: settingType,
        description: settingDescription,
        updatedAt: now
      };
    } else {
      // Create new setting
      const newSetting = {
        key,
        value: serializedValue,
        type: settingType,
        description: settingDescription,
        createdAt: now,
        updatedAt: now
      };

      const id = await db.settings.add(newSetting);
      return { ...newSetting, id };
    }
  } catch (error) {
    console.error('Error setting value:', error);
    throw error;
  }
};

/**
 * Get multiple settings by keys
 * @param {Array<string>} keys - Array of setting keys
 * @returns {Promise<Object>} Object with key-value pairs
 */
export const getSettings = async (keys) => {
  try {
    if (!Array.isArray(keys)) {
      throw new Error('Keys must be an array');
    }

    const settings = {};
    
    for (const key of keys) {
      settings[key] = await getSetting(key);
    }

    return settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

/**
 * Get all settings
 * @returns {Promise<Object>} Object with all settings as key-value pairs
 */
export const getAllSettings = async () => {
  try {
    const settingsRecords = await db.settings.toArray();
    const settings = {};

    settingsRecords.forEach(setting => {
      settings[setting.key] = parseSettingValue(setting.value, setting.type);
    });

    // Add default values for missing settings
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      if (!(key in settings)) {
        settings[key] = DEFAULT_SETTINGS[key].defaultValue;
      }
    });

    return settings;
  } catch (error) {
    console.error('Error getting all settings:', error);
    throw error;
  }
};

/**
 * Set multiple settings at once
 * @param {Object} settingsObject - Object with key-value pairs
 * @returns {Promise<Array>} Array of updated setting objects
 */
export const setSettings = async (settingsObject) => {
  try {
    if (!settingsObject || typeof settingsObject !== 'object') {
      throw new Error('Settings object is required');
    }

    const results = [];

    for (const [key, value] of Object.entries(settingsObject)) {
      const result = await setSetting(key, value);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Error setting multiple settings:', error);
    throw error;
  }
};

/**
 * Delete setting
 * @param {string} key - Setting key
 * @returns {Promise<boolean>} Success status
 */
export const deleteSetting = async (key) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Valid setting key is required');
    }

    const setting = await db.settings.where('key').equals(key).first();
    
    if (!setting) {
      throw new Error('Setting not found');
    }

    await db.settings.delete(setting.id);
    return true;
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw error;
  }
};

/**
 * Reset setting to default value
 * @param {string} key - Setting key
 * @returns {Promise<any>} Default value or null if no default exists
 */
export const resetSetting = async (key) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Valid setting key is required');
    }

    const defaultSetting = DEFAULT_SETTINGS[key];
    
    if (!defaultSetting) {
      throw new Error(`No default value available for setting: ${key}`);
    }

    await setSetting(key, defaultSetting.defaultValue, defaultSetting.type, defaultSetting.description);
    return defaultSetting.defaultValue;
  } catch (error) {
    console.error('Error resetting setting:', error);
    throw error;
  }
};

/**
 * Reset all settings to default values
 * @returns {Promise<Object>} Object with all default settings
 */
export const resetAllSettings = async () => {
  try {
    // Delete all existing settings
    await db.settings.clear();

    // Set all default settings
    const defaultSettings = {};
    
    for (const [key, config] of Object.entries(DEFAULT_SETTINGS)) {
      await setSetting(key, config.defaultValue, config.type, config.description);
      defaultSettings[key] = config.defaultValue;
    }

    return defaultSettings;
  } catch (error) {
    console.error('Error resetting all settings:', error);
    throw error;
  }
};

/**
 * Get setting metadata (type, description, etc.)
 * @param {string} key - Setting key
 * @returns {Promise<Object|null>} Setting metadata or null if not found
 */
export const getSettingMetadata = async (key) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Valid setting key is required');
    }

    const setting = await db.settings.where('key').equals(key).first();
    
    if (!setting) {
      const defaultSetting = DEFAULT_SETTINGS[key];
      return defaultSetting ? {
        key,
        type: defaultSetting.type,
        description: defaultSetting.description,
        isDefault: true,
        defaultValue: defaultSetting.defaultValue
      } : null;
    }

    return {
      key: setting.key,
      type: setting.type,
      description: setting.description,
      isDefault: false,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt
    };
  } catch (error) {
    console.error('Error getting setting metadata:', error);
    throw error;
  }
};

/**
 * Get all settings with metadata
 * @returns {Promise<Array>} Array of setting objects with metadata
 */
export const getAllSettingsWithMetadata = async () => {
  try {
    const settingsRecords = await db.settings.toArray();
    const allSettings = [];

    // Add existing settings
    settingsRecords.forEach(setting => {
      allSettings.push({
        ...setting,
        value: parseSettingValue(setting.value, setting.type),
        isDefault: false
      });
    });

    // Add default settings that don't exist yet
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      const exists = settingsRecords.some(setting => setting.key === key);
      if (!exists) {
        const defaultSetting = DEFAULT_SETTINGS[key];
        allSettings.push({
          key,
          value: defaultSetting.defaultValue,
          type: defaultSetting.type,
          description: defaultSetting.description,
          isDefault: true
        });
      }
    });

    return allSettings.sort((a, b) => a.key.localeCompare(b.key));
  } catch (error) {
    console.error('Error getting all settings with metadata:', error);
    throw error;
  }
};

/**
 * Search settings by key or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching settings
 */
export const searchSettings = async (searchTerm) => {
  try {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    const term = searchTerm.toLowerCase().trim();
    const allSettings = await getAllSettingsWithMetadata();

    return allSettings.filter(setting =>
      setting.key.toLowerCase().includes(term) ||
      setting.description.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching settings:', error);
    throw error;
  }
};

/**
 * Export all settings
 * @returns {Promise<Object>} Settings export object
 */
export const exportSettings = async () => {
  try {
    const settings = await getAllSettings();
    
    return {
      exported_at: new Date().toISOString(),
      version: '1.0',
      settings
    };
  } catch (error) {
    console.error('Error exporting settings:', error);
    throw error;
  }
};

/**
 * Import settings from export object
 * @param {Object} exportData - Settings export object
 * @param {boolean} overwrite - Whether to overwrite existing settings
 * @returns {Promise<Object>} Import result summary
 */
export const importSettings = async (exportData, overwrite = false) => {
  try {
    if (!exportData || !exportData.settings) {
      throw new Error('Invalid export data');
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
      errorDetails: []
    };

    for (const [key, value] of Object.entries(exportData.settings)) {
      try {
        const existingSetting = await db.settings.where('key').equals(key).first();
        
        if (existingSetting && !overwrite) {
          results.skipped++;
          continue;
        }

        await setSetting(key, value);
        results.imported++;
      } catch (error) {
        results.errors++;
        results.errorDetails.push({
          key,
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error importing settings:', error);
    throw error;
  }
};

const settingsService = {
  getSetting,
  setSetting,
  getSettings,
  getAllSettings,
  setSettings,
  deleteSetting,
  resetSetting,
  resetAllSettings,
  getSettingMetadata,
  getAllSettingsWithMetadata,
  searchSettings,
  exportSettings,
  importSettings
};

export default settingsService;