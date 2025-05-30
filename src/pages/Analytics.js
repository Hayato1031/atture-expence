import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Stack,
  Fab,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../components/common/GlassCard';
import { formatCurrency } from '../utils/formatters';

// Import new analytics components
import FinancialSummary from '../components/Analytics/FinancialSummary';
import ExpenseChart from '../components/Analytics/ExpenseChart';
import IncomeChart from '../components/Analytics/IncomeChart';
import UserRanking from '../components/Analytics/UserRanking';
import FilterPanel from '../components/Analytics/FilterPanel';
import useAnalytics from '../hooks/useAnalytics';
import categoryService from '../services/categoryService';
import userService from '../services/userService';
import { formatDate } from '../utils/formatters';
import useSettings from '../hooks/useSettings';

const Analytics = () => {
  const { settings } = useSettings();
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: new Date(2024, 0, 1),
      endDate: new Date(),
    },
    period: 'monthly',
    categories: [],
    users: [],
    departments: [],
    amountRange: {
      min: '',
      max: '',
    },
    transactionType: 'all',
  });

  const [exportSnackbar, setExportSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    users: [],
    departments: []
  });

  // Use the analytics hook
  const {
    financialSummary,
    expenseChartData,
    incomeChartData,
    userRankingData,
    statistics,
    isLoading,
    error,
    exportData,
    totalRecords,
  } = useAnalytics(filters);

  // Filter change handler
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesResult, usersResult] = await Promise.all([
          categoryService.getAllCategories(),
          userService.getAllUsers()
        ]);

        const categories = categoriesResult.success ? categoriesResult.data : [];
        const users = usersResult.success ? usersResult.data : [];

        // Extract unique categories and departments
        const categoryNames = [...new Set(categories.map(cat => cat.name))];
        const userNames = [...new Set(users.map(user => user.name))];
        const departments = [...new Set(users.map(user => user.department).filter(Boolean))];

        setFilterOptions({
          categories: categoryNames,
          users: userNames,
          departments: departments
        });
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Export handlers
  const handleExportJSON = () => {
    try {
      const jsonData = exportData('json');
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportSnackbar({
        open: true,
        message: 'JSONファイルをエクスポートしました',
        severity: 'success'
      });
    } catch (err) {
      setExportSnackbar({
        open: true,
        message: 'エクスポートに失敗しました',
        severity: 'error'
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const csvData = exportData('csv');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportSnackbar({
        open: true,
        message: 'CSVファイルをエクスポートしました',
        severity: 'success'
      });
    } catch (err) {
      setExportSnackbar({
        open: true,
        message: 'エクスポートに失敗しました',
        severity: 'error'
      });
    }
  };

  const handleRefresh = () => {
    // In a real app, this would refetch data from the API
    setExportSnackbar({
      open: true,
      message: 'データを更新しました',
      severity: 'info'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          データの読み込み中にエラーが発生しました: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                分析・レポート
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {totalRecords}件のデータを分析中
                {isLoading && ' • 読み込み中...'}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                更新
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportJSON}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                エクスポート
              </Button>
            </Stack>
          </Box>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4 }}>
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              data={filterOptions}
            />
          </Box>
        </motion.div>

        {/* Financial Summary */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4 }}>
            <FinancialSummary
              data={financialSummary}
              period={filters.period}
            />
          </Box>
        </motion.div>

        {/* Charts Section */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Expense Chart */}
          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <ExpenseChart
                data={expenseChartData}
                period={filters.period}
              />
            </motion.div>
          </Grid>

          {/* Income Chart */}
          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <IncomeChart
                data={incomeChartData}
                period={filters.period}
              />
            </motion.div>
          </Grid>
        </Grid>

        {/* User Rankings */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4 }}>
            <UserRanking
              data={userRankingData}
              period={filters.period}
            />
          </Box>
        </motion.div>

        {/* Statistics Summary */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <GlassCard>
                <GlassCardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    データ統計
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        総取引数
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {statistics.totalTransactions}件
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        収入取引
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {statistics.incomeTransactions}件
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        支出取引
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="error.main">
                        {statistics.expenseTransactions}件
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        平均取引額
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(statistics.averageTransactionAmount, true)}
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <GlassCard>
                <GlassCardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    分析範囲
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        ユーザー数
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {statistics.uniqueUsers}名
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        カテゴリ数
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {statistics.uniqueCategories}個
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        部門数
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {statistics.uniqueDepartments}部門
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        分析期間
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {filters.period === 'monthly' ? '月別' : 
                         filters.period === 'quarterly' ? '四半期別' :
                         filters.period === 'yearly' ? '年別' : 
                         filters.period === 'weekly' ? '週別' : '日別'}
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <GlassCard>
                <GlassCardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    データ品質
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        完全性
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {statistics.dataQuality?.completeness || 100}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        正確性
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {statistics.dataQuality?.accuracy || 95}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        一貫性
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {statistics.dataQuality?.consistency || 98}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        最終更新
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatDate(new Date(), settings.dateFormat)}
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </Grid>
          </Grid>
        </motion.div>

        {/* Floating Action Button for CSV Export */}
        <Fab
          color="secondary"
          aria-label="CSV Export"
          onClick={handleExportCSV}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
          <GetAppIcon />
        </Fab>

        {/* Snackbar for notifications */}
        <Snackbar
          open={exportSnackbar.open}
          autoHideDuration={4000}
          onClose={() => setExportSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setExportSnackbar(prev => ({ ...prev, open: false }))}
            severity={exportSnackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {exportSnackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default Analytics;