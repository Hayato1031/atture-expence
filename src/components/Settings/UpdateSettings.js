import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Update as UpdateIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Launch as LaunchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';
import updateService from '../../services/updateService';
import { formatVersion, getVersionInfo } from '../../utils/version';

const UpdateSettings = () => {
  const [settings, setSettings] = useState(updateService.getUpdateSettings());
  const [checking, setChecking] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);
  const [lastCheck, setLastCheck] = useState(updateService.getLastUpdateCheckResult());
  const [notifications, setNotifications] = useState(updateService.getUpdateNotifications());
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [versionInfo] = useState(getVersionInfo());

  // Update settings
  const handleSettingChange = useCallback((key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateService.updateSettings(newSettings);
  }, [settings]);

  // Manual update check
  const handleCheckForUpdates = useCallback(async () => {
    setChecking(true);
    setUpdateResult(null);
    
    try {
      const result = await updateService.checkForUpdates();
      setUpdateResult(result);
      setLastCheck(updateService.getLastUpdateCheckResult());
      setNotifications(updateService.getUpdateNotifications());
    } catch (error) {
      setUpdateResult({
        success: false,
        error: error.message
      });
    } finally {
      setChecking(false);
    }
  }, []);

  // Download update
  const handleDownloadUpdate = useCallback((downloadUrl) => {
    updateService.downloadUpdate(downloadUrl);
  }, []);

  // Clear notifications
  const handleClearNotifications = useCallback(() => {
    updateService.clearUpdateNotifications();
    setNotifications([]);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '未確認';
    return new Date(dateString).toLocaleString('ja-JP');
  };

  // Format interval options
  const intervalOptions = [
    { value: 1, label: '1時間' },
    { value: 6, label: '6時間' },
    { value: 12, label: '12時間' },
    { value: 24, label: '24時間' },
    { value: 72, label: '3日' },
    { value: 168, label: '1週間' }
  ];

  return (
    <GlassCard>
      <GlassCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            <UpdateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            アップデート設定
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Current Version Info */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                現在のバージョン情報
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip 
                  label={formatVersion(versionInfo.version)} 
                  color="primary" 
                  variant="outlined" 
                />
                <Typography variant="body2" color="text.secondary">
                  {versionInfo.name}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                ビルド日: {formatDate(versionInfo.buildDate)}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                環境: {versionInfo.environment}
              </Typography>
            </CardContent>
          </Card>

          {/* Update Check Settings */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              自動更新チェック
            </Typography>
            
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoCheck}
                    onChange={(e) => handleSettingChange('autoCheck', e.target.checked)}
                  />
                }
                label="自動的に更新をチェックする"
              />
              
              {settings.autoCheck && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>チェック間隔</InputLabel>
                  <Select
                    value={settings.checkInterval}
                    onChange={(e) => handleSettingChange('checkInterval', e.target.value)}
                    label="チェック間隔"
                  >
                    {intervalOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showNotifications}
                    onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
                  />
                }
                label="更新通知を表示する"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Manual Update Check */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              手動更新チェック
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={checking ? <RefreshIcon /> : <UpdateIcon />}
                onClick={handleCheckForUpdates}
                disabled={checking}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {checking ? '確認中...' : '更新をチェック'}
              </Button>
              
              {lastCheck && (
                <Typography variant="body2" color="text.secondary">
                  最終チェック: {formatDate(lastCheck.checkDate)}
                </Typography>
              )}
            </Stack>

            {checking && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  更新情報を確認しています...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Update Result */}
          {updateResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {updateResult.success ? (
                updateResult.hasUpdate ? (
                  <Alert 
                    severity="info" 
                    action={
                      <Stack direction="row" spacing={1}>
                        <Button 
                          size="small" 
                          onClick={() => setReleaseNotesOpen(true)}
                          startIcon={<InfoIcon />}
                        >
                          詳細
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleDownloadUpdate(updateResult.downloadUrl)}
                          startIcon={<DownloadIcon />}
                        >
                          ダウンロード
                        </Button>
                      </Stack>
                    }
                  >
                    <Typography variant="body2">
                      新しいバージョン {formatVersion(updateResult.latestVersion)} が利用可能です！
                    </Typography>
                  </Alert>
                ) : (
                  <Alert severity="success" icon={<CheckCircleIcon />}>
                    最新バージョンを使用しています ({formatVersion(updateResult.currentVersion)})
                  </Alert>
                )
              ) : (
                <Alert severity="error" icon={<WarningIcon />}>
                  {updateResult.error}
                </Alert>
              )}
            </motion.div>
          )}

          {/* Update Notifications */}
          {notifications.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  更新通知履歴
                </Typography>
                <Button
                  size="small"
                  onClick={handleClearNotifications}
                  startIcon={<CloseIcon />}
                >
                  クリア
                </Button>
              </Box>
              
              <List>
                {notifications.slice(0, 5).map((notification, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <UpdateIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>

        {/* Release Notes Dialog */}
        <Dialog 
          open={releaseNotesOpen} 
          onClose={() => setReleaseNotesOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            リリースノート - {updateResult?.latestVersion && formatVersion(updateResult.latestVersion)}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {updateResult?.releaseNotes || 'リリースノートは利用できません。'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReleaseNotesOpen(false)}>
              閉じる
            </Button>
            <Button
              variant="contained"
              onClick={() => handleDownloadUpdate(updateResult?.downloadUrl)}
              startIcon={<LaunchIcon />}
            >
              ダウンロードページを開く
            </Button>
          </DialogActions>
        </Dialog>
      </GlassCardContent>
    </GlassCard>
  );
};

export default UpdateSettings;