import React, { useState, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Backdrop,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Category as CategoryIcon,
  VpnKey as ApiKeyIcon,
  Tune as GeneralIcon,
  Storage as StorageIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import all settings components
import ThemeSettings from '../components/Settings/ThemeSettings';
import CategorySettings from '../components/Settings/CategorySettings';
import GeneralSettings from '../components/Settings/GeneralSettings';
import DataManagement from '../components/Settings/DataManagement';
import ApiSettings from '../components/Settings/ApiSettings';
import UpdateSettings from '../components/Settings/UpdateSettings';

// Import the settings hook
import useSettings from '../hooks/useSettings';

// Tab configuration
const settingsTabs = [
  {
    id: 'general',
    label: '一般',
    icon: <GeneralIcon />,
    description: '基本的なアプリケーション設定'
  },
  {
    id: 'theme',
    label: 'テーマ',
    icon: <PaletteIcon />,
    description: 'テーマとUI設定'
  },
  {
    id: 'categories',
    label: 'カテゴリ',
    icon: <CategoryIcon />,
    description: 'カテゴリ管理と設定'
  },
  {
    id: 'api',
    label: 'AI設定',
    icon: <ApiKeyIcon />,
    description: 'AI機能とAPI設定'
  },
  {
    id: 'data',
    label: 'データ',
    icon: <StorageIcon />,
    description: 'データ管理とバックアップ'
  },
  {
    id: 'update',
    label: 'アップデート',
    icon: <RefreshIcon />,
    description: 'バージョン管理と更新'
  }
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Use the settings hook
  const {
    settings,
    loading,
    error,
    hasChanges,
    pendingChanges,
    updateSetting,
    updateSettings,
    saveSettings,
    discardChanges,
    resetAllSettingsToDefaults,
    exportSettingsData,
    importSettingsData,
    isModified,
    testApiConnection
  } = useSettings();

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    if (hasChanges && newValue !== activeTab) {
      setShowSaveDialog(true);
      return;
    }
    setActiveTab(newValue);
  }, [hasChanges, activeTab]);

  // Handle save settings
  const handleSaveSettings = useCallback(async () => {
    try {
      const result = await saveSettings();
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || '保存に失敗しました',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: '保存中にエラーが発生しました',
        severity: 'error'
      });
    }
  }, [saveSettings]);

  // Handle discard changes
  const handleDiscardChanges = useCallback(() => {
    discardChanges();
    setSnackbar({
      open: true,
      message: '変更を破棄しました',
      severity: 'info'
    });
  }, [discardChanges]);

  // Handle reset all settings
  const handleResetAllSettings = useCallback(async () => {
    try {
      const result = await resetAllSettingsToDefaults();
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'リセットに失敗しました',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'リセット中にエラーが発生しました',
        severity: 'error'
      });
    }
  }, [resetAllSettingsToDefaults]);

  // Filter tabs based on search
  const filteredTabs = settingsTabs.filter(tab =>
    !searchQuery || 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current tab info
  const currentTab = settingsTabs.find(tab => tab.id === activeTab);

  // Render settings content based on active tab
  const renderSettingsContent = useCallback(() => {
    const commonProps = {
      settings,
      updateSetting,
      updateSettings,
      hasChanges,
      isModified,
      exportSettingsData,
      importSettingsData,
      saveSettings,
      testApiConnection
    };

    switch (activeTab) {
      case 'general':
        return <GeneralSettings {...commonProps} />;
      case 'theme':
        return <ThemeSettings {...commonProps} />;
      case 'categories':
        return <CategorySettings {...commonProps} />;
      case 'api':
        return <ApiSettings {...commonProps} />;
      case 'data':
        return <DataManagement {...commonProps} />;
      case 'update':
        return <UpdateSettings />;
      default:
        return <GeneralSettings {...commonProps} />;
    }
  }, [activeTab, settings, updateSetting, updateSettings, hasChanges, isModified, exportSettingsData, importSettingsData, saveSettings, testApiConnection]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  mb: 1
                }}
              >
                設定
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {currentTab?.description || 'アプリケーションの設定を管理'}
              </Typography>
            </Box>

            {/* Search */}
            <TextField
              placeholder="設定を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div variants={itemVariants}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Changes Indicator */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              variants={itemVariants}
            >
              <Alert
                severity="info"
                sx={{ mb: 3 }}
                action={
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      onClick={handleDiscardChanges}
                      startIcon={<UndoIcon />}
                    >
                      破棄
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSaveSettings}
                      startIcon={<SaveIcon />}
                    >
                      保存
                    </Button>
                  </Stack>
                }
              >
                設定に未保存の変更があります
                {Object.keys(pendingChanges).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {Object.keys(pendingChanges).map(key => (
                      <Chip key={key} label={key} size="small" sx={{ mr: 1 }} />
                    ))}
                  </Box>
                )}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Grid container spacing={3}>
          {/* Sidebar Navigation */}
          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <Box
                sx={{
                  position: 'sticky',
                  top: 24,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden'
                }}
              >
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      minHeight: 64,
                      px: 3,
                      py: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    '& .MuiTab-selected': {
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      borderRight: '3px solid',
                      borderRightColor: 'primary.main'
                    }
                  }}
                >
                  {filteredTabs.map((tab) => (
                    <Tab
                      key={tab.id}
                      value={tab.id}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          {tab.icon}
                          <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="body1" fontWeight="bold">
                              {tab.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tab.description}
                            </Typography>
                          </Box>
                          {isModified(tab.id) && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                ml: 'auto'
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  ))}
                </Tabs>

                {/* Quick Actions */}
                <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<ResetIcon />}
                    onClick={handleResetAllSettings}
                    color="warning"
                  >
                    すべてリセット
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {renderSettingsContent()}
              </motion.div>
            </AnimatePresence>
          </Grid>
        </Grid>

        {/* Floating Action Button for Save */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1000
              }}
            >
              <Fab
                color="primary"
                onClick={handleSaveSettings}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                <SaveIcon />
              </Fab>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" sx={{ mb: 2 }} />
            <Typography>設定を処理中...</Typography>
          </Box>
        </Backdrop>

        {/* Save Confirmation Dialog */}
        <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
          <DialogTitle>未保存の変更があります</DialogTitle>
          <DialogContent>
            <Typography>
              現在のタブには未保存の変更があります。どうしますか？
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowSaveDialog(false);
              discardChanges();
              setActiveTab(settingsTabs.find(tab => tab.id !== activeTab)?.id || 'general');
            }}>
              変更を破棄
            </Button>
            <Button onClick={handleSaveSettings} variant="contained">
              保存してから移動
            </Button>
            <Button onClick={() => setShowSaveDialog(false)}>
              キャンセル
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default Settings;