import { useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';
import aiService from '../services/aiService';

/**
 * Custom hook for managing application settings
 * Provides validation, persistence, and error handling
 */
export const useSettings = () => {
  const [settings, setSettingsState] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // Default settings configuration with validation
  const defaultSettings = {
    // Theme settings
    theme: 'light',
    colorScheme: 'default',
    fontSize: 14,
    glassIntensity: 0.25,
    customColors: {
      primary: '#6366f1',
      secondary: '#ec4899',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    
    // General settings
    dateFormat: 'YYYY-MM-DD',
    
    // Notifications
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    notificationVolume: 50,
    
    // Data management
    dataRetentionDays: 365,
    autoSave: true,
    autoSaveInterval: 30, // seconds
    
    // AI settings
    openaiApiKey: '',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    aiSuggestions: true,
    maxRetries: 3,
    requestTimeout: 30000,
    
    // Security
    sessionTimeout: 60, // minutes
    lockOnInactivity: false,
    requirePasswordConfirmation: false,
    encryptExports: false,
    
    // UI preferences
    compactMode: false,
    showAnimations: true,
    showTutorials: true,
    defaultView: 'dashboard',
    itemsPerPage: 25
  };

  // Validation rules for settings
  const validationRules = {
    theme: (value) => ['light', 'dark', 'auto'].includes(value),
    colorScheme: (value) => ['default', 'blue', 'purple', 'green', 'custom'].includes(value),
    fontSize: (value) => value >= 10 && value <= 24,
    glassIntensity: (value) => value >= 0 && value <= 1,
    dateFormat: (value) => ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY年MM月DD日', 'MM月DD日, YYYY年'].includes(value),
    notificationVolume: (value) => value >= 0 && value <= 100,
    dataRetentionDays: (value) => value >= 30 && value <= 2555, // 30 days to 7 years
    autoSaveInterval: (value) => value >= 10 && value <= 300, // 10 seconds to 5 minutes
    sessionTimeout: (value) => value >= 5 && value <= 480, // 5 minutes to 8 hours
    maxRetries: (value) => value >= 1 && value <= 10,
    requestTimeout: (value) => value >= 5000 && value <= 120000, // 5 seconds to 2 minutes
    itemsPerPage: (value) => [10, 25, 50, 100].includes(value),
    openaiApiKey: (value) => !value || value.startsWith('sk-'),
    apiEndpoint: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
  };

  // Load settings from database
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await settingsService.getAllSettings();
      const loadedSettings = result.success ? result.data : {};
      const mergedSettings = { ...defaultSettings, ...loadedSettings };
      
      setSettingsState(mergedSettings);
      setPendingChanges({});
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('設定の読み込みに失敗しました');
      setSettingsState(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate a single setting value
  const validateSetting = useCallback((key, value) => {
    const rule = validationRules[key];
    if (!rule) return { isValid: true };
    
    try {
      const isValid = rule(value);
      return {
        isValid,
        error: isValid ? null : `Invalid value for ${key}`
      };
    } catch (err) {
      return {
        isValid: false,
        error: `Validation error for ${key}: ${err.message}`
      };
    }
  }, []);

  // Update a single setting (in memory only until saved)
  const updateSetting = useCallback((key, value) => {
    const validation = validateSetting(key, value);
    
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
    
    setSettingsState(prev => ({
      ...prev,
      [key]: value
    }));
    
    setHasChanges(true);

    // Update AI service settings if they changed
    if (key === 'openaiApiKey' || key === 'apiEndpoint') {
      aiService.updateSettings(
        key === 'openaiApiKey' ? value : settings.openaiApiKey,
        key === 'apiEndpoint' ? value : settings.apiEndpoint
      );
    }
  }, [validateSetting, settings]);

  // Update multiple settings
  const updateSettings = useCallback((settingsUpdate) => {
    const errors = [];
    const validUpdates = {};

    // Validate all updates first
    Object.entries(settingsUpdate).forEach(([key, value]) => {
      const validation = validateSetting(key, value);
      if (validation.isValid) {
        validUpdates[key] = value;
      } else {
        errors.push({ key, error: validation.error });
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.error).join(', ')}`);
    }

    setPendingChanges(prev => ({
      ...prev,
      ...validUpdates
    }));
    
    setSettingsState(prev => ({
      ...prev,
      ...validUpdates
    }));
    
    setHasChanges(true);

    // Update AI service settings if they changed
    if (validUpdates.openaiApiKey || validUpdates.apiEndpoint) {
      aiService.updateSettings(
        validUpdates.openaiApiKey || settings.openaiApiKey,
        validUpdates.apiEndpoint || settings.apiEndpoint
      );
    }
  }, [validateSetting, settings]);

  // Save pending changes to database
  const saveSettings = useCallback(async () => {
    if (!hasChanges || Object.keys(pendingChanges).length === 0) {
      return { success: true, message: '保存する変更がありません' };
    }

    try {
      setLoading(true);
      setError(null);

      await settingsService.updateSettings(pendingChanges);
      
      setPendingChanges({});
      setHasChanges(false);
      
      return { success: true, message: '設定を保存しました' };
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('設定の保存に失敗しました');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [hasChanges, pendingChanges]);

  // Discard pending changes
  const discardChanges = useCallback(() => {
    // Revert to saved settings
    Object.keys(pendingChanges).forEach(key => {
      setSettingsState(prev => ({
        ...prev,
        [key]: settings[key] || defaultSettings[key]
      }));
    });
    
    setPendingChanges({});
    setHasChanges(false);
  }, [pendingChanges, settings]);

  // Reset a single setting to default
  const resetSettingToDefault = useCallback(async (key) => {
    try {
      const defaultValue = defaultSettings[key];
      if (defaultValue === undefined) {
        throw new Error(`No default value for setting: ${key}`);
      }

      await settingsService.updateSetting(key, defaultValue);
      await loadSettings(); // Reload all settings
      
      return { success: true, message: '設定をリセットしました' };
    } catch (err) {
      console.error('Failed to reset setting:', err);
      setError('設定のリセットに失敗しました');
      return { success: false, error: err.message };
    }
  }, [loadSettings]);

  // Reset all settings to defaults
  const resetAllSettingsToDefaults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await settingsService.resetSettings();
      await loadSettings(); // Reload all settings
      
      return { success: true, message: 'すべての設定をリセットしました' };
    } catch (err) {
      console.error('Failed to reset all settings:', err);
      setError('設定のリセットに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadSettings]);

  // Export settings
  const exportSettingsData = useCallback(async () => {
    try {
      const result = await settingsService.exportSettings();
      return result;
    } catch (err) {
      console.error('Failed to export settings:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Import settings
  const importSettingsData = useCallback(async (data, overwrite = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await settingsService.importSettings(data);
      if (result.success) {
        await loadSettings(); // Reload settings after import
      }
      return result;
    } catch (err) {
      console.error('Failed to import settings:', err);
      setError('設定のインポートに失敗しました');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadSettings]);

  // Test API connection
  const testApiConnection = useCallback(async () => {
    return await aiService.testConnection();
  }, []);

  // Get setting value with fallback to default
  const getSetting = useCallback((key) => {
    return settings[key] !== undefined ? settings[key] : defaultSettings[key];
  }, [settings]);

  // Check if setting has been modified
  const isModified = useCallback((key) => {
    return key in pendingChanges;
  }, [pendingChanges]);

  // Initialize settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update AI service when settings change
  useEffect(() => {
    if (settings.openaiApiKey || settings.apiEndpoint) {
      aiService.updateSettings(settings.openaiApiKey, settings.apiEndpoint);
    }
  }, [settings.openaiApiKey, settings.apiEndpoint]);

  return {
    // State
    settings,
    loading,
    error,
    hasChanges,
    pendingChanges,
    
    // Settings management
    getSetting,
    updateSetting,
    updateSettings,
    saveSettings,
    discardChanges,
    loadSettings,
    
    // Reset functionality
    resetSettingToDefault,
    resetAllSettingsToDefaults,
    
    // Import/Export
    exportSettingsData,
    importSettingsData,
    
    // Utilities
    validateSetting,
    isModified,
    testApiConnection,
    
    // Default values
    defaultSettings
  };
};

export default useSettings;