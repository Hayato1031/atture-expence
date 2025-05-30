import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Stack,
  Grid,
  Card,
  CardContent,
  Slider,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  DisplaySettings as DisplayIcon,
  Accessibility as AccessibilityIcon,
  VolumeUp as VolumeIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import GlassCard, { GlassCardContent } from '../common/GlassCard';

const GeneralSettings = ({ settings, updateSetting, hasChanges, isModified }) => {
  const [notificationTestOpen, setNotificationTestOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);


  // Date format options
  const dateFormatOptions = [
    { value: 'YYYY-MM-DD', label: '2024-01-15 (ISO)', example: '2024-01-15' },
    { value: 'MM/DD/YYYY', label: '01/15/2024 (US)', example: '01/15/2024' },
    { value: 'DD/MM/YYYY', label: '15/01/2024 (EU)', example: '15/01/2024' },
    { value: 'YYYY年MM月DD日', label: '2024年01月15日 (JP)', example: '2024年01月15日' },
    { value: 'MM月DD日, YYYY年', label: '01月15日, 2024年 (JP)', example: '01月15日, 2024年' }
  ];


  // Default view options
  const defaultViewOptions = [
    { value: 'dashboard', label: 'ダッシュボード', icon: '📊' },
    { value: 'registration', label: '登録', icon: '📝' },
    { value: 'analytics', label: '分析', icon: '📈' },
    { value: 'users', label: 'ユーザー', icon: '👥' }
  ];

  // Items per page options
  const itemsPerPageOptions = [
    { value: 10, label: '10件' },
    { value: 25, label: '25件' },
    { value: 50, label: '50件' },
    { value: 100, label: '100件' }
  ];

  // Handle notification test
  const handleNotificationTest = useCallback(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('AttureExpense', {
          body: 'テスト通知です。通知が正常に動作しています。',
          icon: '/favicon.ico'
        });
        setNotificationTestOpen(false);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('AttureExpense', {
              body: 'テスト通知です。通知が正常に動作しています。',
              icon: '/favicon.ico'
            });
          }
          setNotificationTestOpen(false);
        });
      } else {
        alert('通知が無効になっています。ブラウザの設定で通知を有効にしてください。');
        setNotificationTestOpen(false);
      }
    } else {
      alert('このブラウザは通知をサポートしていません。');
      setNotificationTestOpen(false);
    }
  }, []);

  // Handle reset to defaults
  const handleResetToDefaults = useCallback(() => {
    updateSetting('dateFormat', 'YYYY-MM-DD');
    updateSetting('notifications', true);
    updateSetting('soundEnabled', true);
    updateSetting('notificationVolume', 50);
    updateSetting('autoSave', true);
    updateSetting('autoSaveInterval', 30);
    updateSetting('defaultView', 'dashboard');
    updateSetting('itemsPerPage', 25);
    updateSetting('showAnimations', true);
    updateSetting('compactMode', false);
    setResetDialogOpen(false);
  }, [updateSetting]);

  // Get current date example
  const getCurrentExample = useCallback(() => {
    const now = new Date();
    const dateFormat = settings.dateFormat || 'YYYY-MM-DD';
    
    let dateExample = '';
    
    switch (dateFormat) {
      case 'YYYY-MM-DD':
        dateExample = now.toISOString().split('T')[0];
        break;
      case 'MM/DD/YYYY':
        dateExample = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
        break;
      case 'DD/MM/YYYY':
        dateExample = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        break;
      case 'YYYY年MM月DD日':
        dateExample = `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`;
        break;
      case 'MM月DD日, YYYY年':
        dateExample = `${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日, ${now.getFullYear()}年`;
        break;
      default:
        dateExample = now.toLocaleDateString();
    }
    
    return { dateExample };
  }, [settings.dateFormat]);

  const { dateExample } = getCurrentExample();

  return (
    <GlassCard>
      <GlassCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            <DisplayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            一般設定
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => setResetDialogOpen(true)}
            color="warning"
          >
            デフォルトに戻す
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Date Format Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              日付表示設定
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>日付形式</InputLabel>
                  <Select
                    value={settings.dateFormat || 'YYYY-MM-DD'}
                    onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    label="日付形式"
                  >
                    {dateFormatOptions.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        <Box>
                          <Typography variant="body2">{format.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            例: {format.example}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Alert severity="info">
                  <Typography variant="body2">
                    現在の設定での表示例: <strong>{dateExample}</strong>
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              通知設定
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications !== false}
                        onChange={(e) => updateSetting('notifications', e.target.checked)}
                      />
                    }
                    label="デスクトップ通知"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.soundEnabled !== false}
                        onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                      />
                    }
                    label="音声通知"
                  />
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setNotificationTestOpen(true)}
                    disabled={!settings.notifications}
                  >
                    通知テスト
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <VolumeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    通知音量: {settings.notificationVolume || 50}%
                  </Typography>
                  <Slider
                    value={settings.notificationVolume || 50}
                    onChange={(e, value) => updateSetting('notificationVolume', value)}
                    min={0}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    disabled={!settings.soundEnabled}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 50, label: '50%' },
                      { value: 100, label: '100%' }
                    ]}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Auto-save Settings */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              データ管理
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoSave !== false}
                      onChange={(e) => updateSetting('autoSave', e.target.checked)}
                    />
                  }
                  label="自動保存を有効にする"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    自動保存間隔: {settings.autoSaveInterval || 30}秒
                  </Typography>
                  <Slider
                    value={settings.autoSaveInterval || 30}
                    onChange={(e, value) => updateSetting('autoSaveInterval', value)}
                    min={10}
                    max={300}
                    step={10}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}s`}
                    disabled={!settings.autoSave}
                    marks={[
                      { value: 10, label: '10s' },
                      { value: 30, label: '30s' },
                      { value: 60, label: '60s' },
                      { value: 300, label: '5m' }
                    ]}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* UI Preferences */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <AccessibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              UI設定
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>デフォルトページ</InputLabel>
                  <Select
                    value={settings.defaultView || 'dashboard'}
                    onChange={(e) => updateSetting('defaultView', e.target.value)}
                    label="デフォルトページ"
                    renderValue={(value) => {
                      const view = defaultViewOptions.find(v => v.value === value);
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{view?.icon}</span>
                          {view?.label}
                        </Box>
                      );
                    }}
                  >
                    {defaultViewOptions.map((view) => (
                      <MenuItem key={view.value} value={view.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{view.icon}</span>
                          {view.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>表示件数</InputLabel>
                  <Select
                    value={settings.itemsPerPage || 25}
                    onChange={(e) => updateSetting('itemsPerPage', e.target.value)}
                    label="表示件数"
                  >
                    {itemsPerPageOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showAnimations !== false}
                        onChange={(e) => updateSetting('showAnimations', e.target.checked)}
                      />
                    }
                    label="アニメーションを有効にする"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.compactMode || false}
                        onChange={(e) => updateSetting('compactMode', e.target.checked)}
                      />
                    }
                    label="コンパクトモード"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showTutorials !== false}
                        onChange={(e) => updateSetting('showTutorials', e.target.checked)}
                      />
                    }
                    label="チュートリアルを表示"
                  />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Modified indicator */}
        {hasChanges && (
          <Alert severity="info" sx={{ mt: 2 }}>
            一般設定が変更されています。保存してください。
          </Alert>
        )}

        {/* Notification Test Dialog */}
        <Dialog open={notificationTestOpen} onClose={() => setNotificationTestOpen(false)}>
          <DialogTitle>通知テスト</DialogTitle>
          <DialogContent>
            <Typography>
              テスト通知を送信します。ブラウザの通知許可が必要な場合があります。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotificationTestOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleNotificationTest} variant="contained">
              テスト実行
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
          <DialogTitle>設定をリセット</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              すべての一般設定をデフォルト値に戻しますか？
            </Typography>
            <Typography variant="body2" color="text.secondary">
              この操作は元に戻せません。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialogOpen(false)} startIcon={<CancelIcon />}>
              キャンセル
            </Button>
            <Button onClick={handleResetToDefaults} variant="contained" color="warning" startIcon={<RefreshIcon />}>
              リセット実行
            </Button>
          </DialogActions>
        </Dialog>
      </GlassCardContent>
    </GlassCard>
  );
};

export default GeneralSettings;