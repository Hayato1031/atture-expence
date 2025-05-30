/**
 * Update Service - Handles version checking and updates
 */

import { getCurrentVersion, compareVersions } from '../utils/version';
import storage from './storage';

class UpdateService {
  constructor() {
    this.checkInterval = null;
    this.updateCheckUrl = 'https://api.github.com/repos/your-username/AttureExpence/releases/latest'; // GitHub APIの例
  }

  /**
   * Check for updates manually
   */
  async checkForUpdates() {
    try {
      // ローカル開発環境では更新チェックをスキップ
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          hasUpdate: false,
          message: '開発環境では更新チェックはスキップされます'
        };
      }

      const currentVersion = getCurrentVersion();
      
      // GitHub Releases APIを使用（実際のリポジトリに変更してください）
      const response = await fetch(this.updateCheckUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const releaseData = await response.json();
      const latestVersion = releaseData.tag_name.replace('v', ''); // "v1.2.0" -> "1.2.0"
      
      const hasUpdate = compareVersions(currentVersion, latestVersion) < 0;
      
      // 更新チェック結果を保存
      this.saveUpdateCheckResult({
        currentVersion,
        latestVersion,
        hasUpdate,
        checkDate: new Date().toISOString(),
        releaseNotes: releaseData.body,
        downloadUrl: releaseData.html_url
      });
      
      return {
        success: true,
        hasUpdate,
        currentVersion,
        latestVersion,
        releaseNotes: releaseData.body,
        downloadUrl: releaseData.html_url
      };
      
    } catch (error) {
      console.error('Update check failed:', error);
      return {
        success: false,
        error: `更新チェックに失敗しました: ${error.message}`,
        hasUpdate: false
      };
    }
  }

  /**
   * Start automatic update checking
   */
  startAutoUpdateCheck(intervalHours = 24) {
    this.stopAutoUpdateCheck(); // 既存のインターバルをクリア
    
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    this.checkInterval = setInterval(async () => {
      const result = await this.checkForUpdates();
      if (result.success && result.hasUpdate) {
        this.notifyUpdateAvailable(result);
      }
    }, intervalMs);
    
    // 初回チェックも実行
    setTimeout(() => this.checkForUpdates(), 5000); // 5秒後に初回チェック
  }

  /**
   * Stop automatic update checking
   */
  stopAutoUpdateCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Notify user about available update
   */
  notifyUpdateAvailable(updateInfo) {
    // ブラウザ通知を表示
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('アップデートが利用可能です', {
        body: `新しいバージョン ${updateInfo.latestVersion} が利用可能です`,
        icon: '/favicon.ico',
        requireInteraction: true
      });
    }
    
    // アプリ内通知も記録
    this.saveNotification({
      type: 'update',
      title: 'アップデートが利用可能です',
      message: `新しいバージョン ${updateInfo.latestVersion} が利用可能です`,
      updateInfo,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Save update check result
   */
  saveUpdateCheckResult(result) {
    storage.set('lastUpdateCheck', result);
  }

  /**
   * Get last update check result
   */
  getLastUpdateCheckResult() {
    return storage.get('lastUpdateCheck');
  }

  /**
   * Save notification
   */
  saveNotification(notification) {
    const notifications = storage.get('updateNotifications') || [];
    notifications.unshift(notification);
    
    // 最新の10件のみ保持
    if (notifications.length > 10) {
      notifications.splice(10);
    }
    
    storage.set('updateNotifications', notifications);
  }

  /**
   * Get update notifications
   */
  getUpdateNotifications() {
    return storage.get('updateNotifications') || [];
  }

  /**
   * Clear update notifications
   */
  clearUpdateNotifications() {
    storage.remove('updateNotifications');
  }

  /**
   * Get update settings
   */
  getUpdateSettings() {
    return storage.get('updateSettings') || {
      autoCheck: true,
      checkInterval: 24, // hours
      showNotifications: true,
      autoDownload: false
    };
  }

  /**
   * Update settings
   */
  updateSettings(settings) {
    const currentSettings = this.getUpdateSettings();
    const newSettings = { ...currentSettings, ...settings };
    storage.set('updateSettings', newSettings);
    
    // 自動チェック設定の変更に応じて調整
    if (newSettings.autoCheck) {
      this.startAutoUpdateCheck(newSettings.checkInterval);
    } else {
      this.stopAutoUpdateCheck();
    }
    
    return newSettings;
  }

  /**
   * Manually download update (opens browser)
   */
  downloadUpdate(downloadUrl) {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  }
}

// Export singleton instance
const updateService = new UpdateService();

export default updateService;