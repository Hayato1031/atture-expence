import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Storage as StorageIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  DeleteForever as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Publish as PublishIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';
import storage from '../../services/storage';
import settingsService from '../../services/settingsService';

const DataManagement = ({ settings, updateSetting, exportSettingsData, importSettingsData }) => {
  const [exportDialog, setExportDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [clearDataDialog, setClearDataDialog] = useState(false);
  const [integrityDialog, setIntegrityDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    expenses: true,
    income: true,
    users: true,
    categories: true,
    settings: true,
    format: 'json',
    includeFiles: false
  });
  const [importResult, setImportResult] = useState(null);
  const [integrityResult, setIntegrityResult] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Export formats
  const exportFormats = [
    { value: 'json', label: 'JSON', description: '構造化データ（推奨）' },
    { value: 'csv', label: 'CSV', description: 'スプレッドシート用' }
  ];

  // Get storage information
  const getStorageInfo = useCallback(async () => {
    try {
      // Get storage statistics
      const expenses = (storage.get('expenses') || []).length;
      const income = (storage.get('income') || []).length;
      const users = (storage.get('users') || []).length;
      const categories = (storage.get('categories') || []).length;
      const settingsCount = 1; // Settings is a single object
      
      // Estimate storage usage
      const estimatedSize = (expenses + income) * 500 + users * 200 + categories * 100 + settingsCount * 50; // bytes
      
      setStorageInfo({
        expenses,
        income,
        users,
        categories,
        settings: settingsCount,
        estimatedSize
      });
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  }, []);

  // Export all data
  const handleExportData = useCallback(async () => {
    setProcessing(true);
    setProgress(0);
    
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        format: exportOptions.format,
        data: {}
      };

      // Export expenses
      if (exportOptions.expenses) {
        setProgress(20);
        exportData.data.expenses = storage.get('expenses') || [];
      }

      // Export income
      if (exportOptions.income) {
        setProgress(40);
        exportData.data.income = storage.get('income') || [];
      }

      // Export users
      if (exportOptions.users) {
        setProgress(60);
        exportData.data.users = storage.get('users') || [];
      }

      // Export categories
      if (exportOptions.categories) {
        setProgress(80);
        exportData.data.categories = storage.get('categories') || [];
      }

      // Export settings
      if (exportOptions.settings) {
        setProgress(90);
        const result = await settingsService.exportSettings();
        exportData.data.settings = result.success ? result.data : {};
      }

      setProgress(100);

      // Create and download file
      const filename = `atture_export_${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      let content, mimeType;

      switch (exportOptions.format) {
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          break;
        case 'csv':
          // Convert to CSV format (simplified)
          content = convertToCSV(exportData);
          mimeType = 'text/csv';
          break;
        case 'xlsx':
          // Would need a library like SheetJS for Excel export
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportDialog(false);
      alert('データのエクスポートが完了しました');
    } catch (error) {
      console.error('Export failed:', error);
      alert('エクスポートに失敗しました: ' + error.message);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, [exportOptions, exportSettingsData]);

  // Import data
  const handleImportData = useCallback(async (file) => {
    setProcessing(true);
    setProgress(0);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (!importData.data) {
            throw new Error('Invalid import file format');
          }

          const results = {
            expenses: 0,
            income: 0,
            users: 0,
            categories: 0,
            settings: 0,
            errors: []
          };

          // Import expenses
          if (importData.data.expenses) {
            setProgress(20);
            for (const expense of importData.data.expenses) {
              try {
                const { id, createdAt, updatedAt, ...expenseData } = expense;
                storage.addItem('expenses', { ...expenseData, createdAt, updatedAt });
                results.expenses++;
              } catch (error) {
                results.errors.push(`Expense import error: ${error.message}`);
              }
            }
          }

          // Import income
          if (importData.data.income) {
            setProgress(40);
            for (const incomeItem of importData.data.income) {
              try {
                const { id, createdAt, updatedAt, ...incomeData } = incomeItem;
                storage.addItem('income', { ...incomeData, createdAt, updatedAt });
                results.income++;
              } catch (error) {
                results.errors.push(`Income import error: ${error.message}`);
              }
            }
          }

          // Import users
          if (importData.data.users) {
            setProgress(60);
            for (const user of importData.data.users) {
              try {
                const { id, createdAt, updatedAt, ...userData } = user;
                storage.addItem('users', { ...userData, createdAt, updatedAt });
                results.users++;
                // Already added above
              } catch (error) {
                results.errors.push(`User import error: ${error.message}`);
              }
            }
          }

          // Import categories
          if (importData.data.categories) {
            setProgress(80);
            for (const category of importData.data.categories) {
              try {
                const { id, createdAt, updatedAt, ...categoryData } = category;
                storage.addItem('categories', { ...categoryData, createdAt, updatedAt });
                results.categories++;
              } catch (error) {
                results.errors.push(`Category import error: ${error.message}`);
              }
            }
          }

          // Import settings
          if (importData.data.settings) {
            setProgress(90);
            try {
              const settingsResult = await settingsService.importSettings(importData.data);
              results.settings = settingsResult.success ? 1 : 0;
            } catch (error) {
              results.errors.push(`Settings import error: ${error.message}`);
            }
          }

          setProgress(100);
          setImportResult(results);
          setImportDialog(false);
          
        } catch (error) {
          console.error('Import failed:', error);
          alert('インポートに失敗しました: ' + error.message);
        } finally {
          setProcessing(false);
          setProgress(0);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import failed:', error);
      alert('インポートに失敗しました: ' + error.message);
      setProcessing(false);
      setProgress(0);
    }
  }, [importSettingsData]);


  // Clear all data
  const handleClearData = useCallback(async () => {
    try {
      setProcessing(true);
      
      storage.set('expenses', []);
      storage.set('income', []);
      storage.set('users', []);
      storage.set('categories', []);
      // Settings are preserved unless explicitly requested
      
      await getStorageInfo();
      setClearDataDialog(false);
      alert('すべてのデータが削除されました');
    } catch (error) {
      console.error('Clear data failed:', error);
      alert('データの削除に失敗しました: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }, [getStorageInfo]);
  
  // Reset to default data with new tax accounting categories
  const handleResetToDefaults = useCallback(async () => {
    try {
      setProcessing(true);
      
      // Clear all data first
      storage.clear();
      
      // Force reinitialization with new default categories
      storage.set('initialized', false);
      storage.initializeDefaultData();
      
      await getStorageInfo();
      setClearDataDialog(false);
      alert('デフォルトの税務会計カテゴリでデータが初期化されました');
      
      // Reload the page to ensure all components pick up the new data
      window.location.reload();
    } catch (error) {
      console.error('Reset to defaults failed:', error);
      alert('デフォルトへのリセットに失敗しました: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }, [getStorageInfo]);

  // Data integrity check
  const handleIntegrityCheck = useCallback(async () => {
    setProcessing(true);
    
    try {
      const issues = [];
      const stats = {
        expenses: 0,
        income: 0,
        users: 0,
        categories: 0,
        orphanedRecords: 0
      };

      // Check expenses
      const expenses = storage.get('expenses') || [];
      stats.expenses = expenses.length;
      
      for (const expense of expenses) {
        if (!expense.categoryId || !expense.userId) {
          issues.push(`Expense ${expense.id}: Missing required fields`);
        }
        // Check if referenced user exists
        const user = storage.findById('users', expense.userId);
        if (!user) {
          issues.push(`Expense ${expense.id}: Referenced user ${expense.userId} not found`);
          stats.orphanedRecords++;
        }
        // Check if referenced category exists
        const category = storage.findById('categories', expense.categoryId);
        if (!category) {
          issues.push(`Expense ${expense.id}: Referenced category ${expense.categoryId} not found`);
          stats.orphanedRecords++;
        }
      }

      // Check income
      const income = storage.get('income') || [];
      stats.income = income.length;
      
      for (const incomeItem of income) {
        if (!incomeItem.categoryId || !incomeItem.userId) {
          issues.push(`Income ${incomeItem.id}: Missing required fields`);
        }
        // Similar checks for income
        const user = storage.findById('users', incomeItem.userId);
        if (!user) {
          issues.push(`Income ${incomeItem.id}: Referenced user ${incomeItem.userId} not found`);
          stats.orphanedRecords++;
        }
      }

      // Check users and categories
      stats.users = (storage.get('users') || []).length;
      stats.categories = (storage.get('categories') || []).length;

      setIntegrityResult({
        stats,
        issues,
        checkedAt: new Date().toISOString()
      });
      setIntegrityDialog(true);
    } catch (error) {
      console.error('Integrity check failed:', error);
      alert('整合性チェックに失敗しました: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }, []);

  // Convert to CSV format (simplified)
  const convertToCSV = useCallback((data) => {
    let csv = '';
    
    // Export expenses to CSV
    if (data.data.expenses && data.data.expenses.length > 0) {
      csv += 'Expenses\n';
      const headers = Object.keys(data.data.expenses[0]);
      csv += headers.join(',') + '\n';
      
      for (const expense of data.data.expenses) {
        const row = headers.map(header => {
          const value = expense[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csv += row.join(',') + '\n';
      }
      csv += '\n';
    }
    
    return csv;
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Initialize
  React.useEffect(() => {
    getStorageInfo();
  }, [getStorageInfo]);

  return (
    <GlassCard>
      <GlassCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            データ管理
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={handleIntegrityCheck}
            disabled={processing}
          >
            整合性チェック
          </Button>
        </Box>

        {/* Storage Information */}
        {storageInfo && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="error">
                    {storageInfo.expenses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    支出記録
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success">
                    {storageInfo.income}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    収入記録
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {storageInfo.users}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ユーザー
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning">
                    {formatFileSize(storageInfo.estimatedSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    推定サイズ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={3}>
          {/* Export Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <DownloadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              データエクスポート
            </Typography>
            
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                onClick={() => setExportDialog(true)}
                fullWidth
                disabled={processing}
              >
                データをエクスポート
              </Button>
              
              <Alert severity="info">
                データを外部ファイルとして保存できます。他のシステムへの移行やバックアップに使用してください。
              </Alert>
            </Stack>
          </Grid>

          {/* Import Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <UploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              データインポート
            </Typography>
            
            <Stack spacing={2}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json,.csv"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleImportData(e.target.files[0]);
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<PublishIcon />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                disabled={processing}
              >
                ファイルを選択してインポート
              </Button>
              
              <Alert severity="warning">
                インポートは既存のデータに追加されます。重複するデータがある場合は注意してください。
              </Alert>
            </Stack>
          </Grid>


          {/* Clear Data Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <DeleteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              データクリア
            </Typography>
            
            <Stack spacing={2}>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => setClearDataDialog(true)}
                fullWidth
                disabled={processing}
                color="error"
              >
                すべてのデータを削除
              </Button>
              
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleResetToDefaults}
                fullWidth
                disabled={processing}
                color="warning"
              >
                税務会計カテゴリで初期化
              </Button>
              
              <Alert severity="error">
                この操作は元に戻せません。実行前に必ずバックアップを作成してください。
              </Alert>
            </Stack>
          </Grid>
        </Grid>

        {/* Processing Progress */}
        {processing && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              処理中... {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {/* Export Dialog */}
        <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>データエクスポート設定</DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  エクスポートするデータ
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.expenses}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, expenses: e.target.checked }))}
                      />
                    }
                    label="支出データ"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.income}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, income: e.target.checked }))}
                      />
                    }
                    label="収入データ"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.users}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, users: e.target.checked }))}
                      />
                    }
                    label="ユーザーデータ"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.categories}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, categories: e.target.checked }))}
                      />
                    }
                    label="カテゴリデータ"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.settings}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, settings: e.target.checked }))}
                      />
                    }
                    label="設定データ"
                  />
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>エクスポート形式</InputLabel>
                  <Select
                    value={exportOptions.format}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
                    label="エクスポート形式"
                  >
                    {exportFormats.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        <Box>
                          <Typography variant="body2">{format.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.includeFiles}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeFiles: e.target.checked }))}
                      />
                    }
                    label="添付ファイルを含める"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.encrypt}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, encrypt: e.target.checked }))}
                      />
                    }
                    label="ファイルを暗号化"
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleExportData} variant="contained" disabled={processing}>
              エクスポート実行
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clear Data Confirmation Dialog */}
        <Dialog open={clearDataDialog} onClose={() => setClearDataDialog(false)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" />
              データ削除の確認
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              すべてのデータを完全に削除しますか？
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              削除されるデータ:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={`支出データ ${storageInfo?.expenses || 0}件`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={`収入データ ${storageInfo?.income || 0}件`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={`ユーザーデータ ${storageInfo?.users || 0}件`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={`カテゴリデータ ${storageInfo?.categories || 0}件`} />
              </ListItem>
            </List>
            <Alert severity="error" sx={{ mt: 2 }}>
              この操作は元に戻せません。必要に応じて事前にバックアップを作成してください。
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearDataDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleClearData} variant="contained" color="error" disabled={processing}>
              削除実行
            </Button>
          </DialogActions>
        </Dialog>

        {/* Integrity Check Results Dialog */}
        <Dialog open={integrityDialog} onClose={() => setIntegrityDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>データ整合性チェック結果</DialogTitle>
          <DialogContent>
            {integrityResult && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  統計情報
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>データ種別</TableCell>
                        <TableCell align="right">件数</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>支出</TableCell>
                        <TableCell align="right">{integrityResult.stats.expenses}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>収入</TableCell>
                        <TableCell align="right">{integrityResult.stats.income}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ユーザー</TableCell>
                        <TableCell align="right">{integrityResult.stats.users}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>カテゴリ</TableCell>
                        <TableCell align="right">{integrityResult.stats.categories}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>孤立したレコード</TableCell>
                        <TableCell align="right" sx={{ color: integrityResult.stats.orphanedRecords > 0 ? 'error.main' : 'success.main' }}>
                          {integrityResult.stats.orphanedRecords}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {integrityResult.issues.length > 0 ? (
                  <Box>
                    <Typography variant="h6" gutterBottom color="error">
                      発見された問題 ({integrityResult.issues.length}件)
                    </Typography>
                    <List dense>
                      {integrityResult.issues.slice(0, 10).map((issue, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ErrorIcon color="error" />
                          </ListItemIcon>
                          <ListItemText primary={issue} />
                        </ListItem>
                      ))}
                      {integrityResult.issues.length > 10 && (
                        <ListItem>
                          <ListItemText 
                            primary={`その他 ${integrityResult.issues.length - 10}件の問題があります`}
                            sx={{ fontStyle: 'italic' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                ) : (
                  <Alert severity="success">
                    データに問題は見つかりませんでした。
                  </Alert>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  チェック実行日時: {new Date(integrityResult.checkedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIntegrityDialog(false)}>
              閉じる
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Result Dialog */}
        {importResult && (
          <Dialog open={Boolean(importResult)} onClose={() => setImportResult(null)} maxWidth="sm" fullWidth>
            <DialogTitle>インポート結果</DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                インポート完了
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={`支出: ${importResult.expenses}件`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={`収入: ${importResult.income}件`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={`ユーザー: ${importResult.users}件`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={`カテゴリ: ${importResult.categories}件`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={`設定: ${importResult.settings}件`} />
                </ListItem>
              </List>
              
              {importResult.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    エラー ({importResult.errors.length}件)
                  </Typography>
                  <List dense>
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={error}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                    {importResult.errors.length > 5 && (
                      <Typography variant="body2" color="text.secondary">
                        その他 {importResult.errors.length - 5}件のエラー
                      </Typography>
                    )}
                  </List>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setImportResult(null)}>
                閉じる
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};

export default DataManagement;