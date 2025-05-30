import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Doughnut, Line } from 'react-chartjs-2';
import GlassCard, { GlassCardContent, GlassCardPresets } from '../components/common/GlassCard';
import expenseService from '../services/expenseService';
import incomeService from '../services/incomeService';
import categoryService from '../services/categoryService';
import { formatDate } from '../utils/formatters';
import useSettings from '../hooks/useSettings';

const Dashboard = () => {
  const theme = useTheme();
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalTransactions: 0,
    previousIncome: 0,
    previousExpenses: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 2,
    }],
  });

  const [trendData, setTrendData] = useState({
    labels: [],
    datasets: [],
  });

  const [loading, setLoading] = useState(true);

  // Load data from storage
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get current month data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      
      // Get previous month for comparison
      const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfPrevMonth = new Date(currentYear, currentMonth, 0);

      // Get expenses and income for current month
      const currentExpenses = await expenseService.getExpensesByDateRange(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      const currentIncome = await incomeService.getIncomeByDateRange(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );

      // Get previous month data
      const prevExpenses = await expenseService.getExpensesByDateRange(
        startOfPrevMonth.toISOString(),
        endOfPrevMonth.toISOString()
      );
      const prevIncome = await incomeService.getIncomeByDateRange(
        startOfPrevMonth.toISOString(),
        endOfPrevMonth.toISOString()
      );

      // Calculate totals
      const totalExpenses = currentExpenses.success ? 
        currentExpenses.data.reduce((sum, exp) => sum + exp.amount, 0) : 0;
      const totalIncome = currentIncome.success ? 
        currentIncome.data.reduce((sum, inc) => sum + inc.amount, 0) : 0;
      const previousExpenses = prevExpenses.success ? 
        prevExpenses.data.reduce((sum, exp) => sum + exp.amount, 0) : 0;
      const previousIncome = prevIncome.success ? 
        prevIncome.data.reduce((sum, inc) => sum + inc.amount, 0) : 0;

      setStats({
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        totalTransactions: 
          (currentExpenses.success ? currentExpenses.data.length : 0) + 
          (currentIncome.success ? currentIncome.data.length : 0),
        previousIncome,
        previousExpenses,
      });

      // Get recent transactions (last 5)
      const allTransactions = [
        ...(currentExpenses.success ? currentExpenses.data.map(e => ({
          ...e,
          type: 'expense',
          amount: -e.amount
        })) : []),
        ...(currentIncome.success ? currentIncome.data.map(i => ({
          ...i,
          type: 'income'
        })) : [])
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      // Get category names
      const categories = await categoryService.getAllCategories();
      const categoryMap = {};
      if (categories.success) {
        categories.data.forEach(cat => {
          categoryMap[cat.id] = cat;
        });
      }

      // Map transactions with category names
      const transactionsWithCategories = allTransactions.map(t => ({
        ...t,
        category: categoryMap[t.categoryId]?.name || 'その他'
      }));

      setRecentTransactions(transactionsWithCategories);

      // Prepare category chart data for expenses
      if (currentExpenses.success && categories.success) {
        const expensesByCategory = {};
        currentExpenses.data.forEach(exp => {
          const categoryName = categoryMap[exp.categoryId]?.name || 'その他';
          expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + exp.amount;
        });

        const sortedCategories = Object.entries(expensesByCategory)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        setCategoryData({
          labels: sortedCategories.map(([name]) => name),
          datasets: [{
            data: sortedCategories.map(([, amount]) => amount),
            backgroundColor: [
              'rgba(102, 126, 234, 0.8)',
              'rgba(250, 112, 154, 0.8)',
              'rgba(79, 172, 254, 0.8)',
              'rgba(168, 237, 234, 0.8)',
              'rgba(255, 236, 210, 0.8)',
            ],
            borderColor: [
              'rgba(102, 126, 234, 1)',
              'rgba(250, 112, 154, 1)',
              'rgba(79, 172, 254, 1)',
              'rgba(168, 237, 234, 1)',
              'rgba(255, 236, 210, 1)',
            ],
            borderWidth: 2,
          }],
        });
      }

      // Prepare trend data (last 5 months)
      const monthLabels = [];
      const incomeData = [];
      const expenseData = [];

      for (let i = 4; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const monthEnd = new Date(currentYear, currentMonth - i + 1, 0);
        
        monthLabels.push(month.toLocaleDateString('ja-JP', { month: 'short' }));
        
        const monthExpenses = await expenseService.getExpensesByDateRange(
          month.toISOString(),
          monthEnd.toISOString()
        );
        const monthIncome = await incomeService.getIncomeByDateRange(
          month.toISOString(),
          monthEnd.toISOString()
        );

        expenseData.push(monthExpenses.success ? 
          monthExpenses.data.reduce((sum, exp) => sum + exp.amount, 0) : 0);
        incomeData.push(monthIncome.success ? 
          monthIncome.data.reduce((sum, inc) => sum + inc.amount, 0) : 0);
      }

      setTrendData({
        labels: monthLabels,
        datasets: [
          {
            label: '収入',
            data: incomeData,
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: '支出',
            data: expenseData,
            borderColor: 'rgba(250, 112, 154, 1)',
            backgroundColor: 'rgba(250, 112, 154, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value) {
            return '¥' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme.palette.text.secondary,
          padding: 20,
        },
      },
    },
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) return { value: '0.0', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  };

  const incomeChange = calculateChange(stats.totalIncome, stats.previousIncome);
  const expenseChange = calculateChange(stats.totalExpenses, stats.previousExpenses);
  const profitMargin = stats.totalIncome > 0 ? 
    ((stats.netProfit / stats.totalIncome) * 100).toFixed(1) : '0.0';

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

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>読み込み中...</Typography>
        </Box>
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
        <motion.div variants={itemVariants}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 4,
            }}
          >
            ダッシュボード
          </Typography>
        </motion.div>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={itemVariants}>
              <GlassCard {...GlassCardPresets.success}>
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        今月の収入
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ¥{stats.totalIncome.toLocaleString()}
                      </Typography>
                      <Chip
                        icon={incomeChange.isPositive ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                        label={`${incomeChange.isPositive ? '+' : '-'}${incomeChange.value}%`}
                        color={incomeChange.isPositive ? "success" : "error"}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <IconButton
                      sx={{
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.contrastText,
                        '&:hover': { opacity: 0.9 },
                      }}
                    >
                      <TrendingUpIcon />
                    </IconButton>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={itemVariants}>
              <GlassCard {...GlassCardPresets.warning}>
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        今月の支出
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ¥{stats.totalExpenses.toLocaleString()}
                      </Typography>
                      <Chip
                        icon={expenseChange.isPositive ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                        label={`${expenseChange.isPositive ? '+' : '-'}${expenseChange.value}%`}
                        color={expenseChange.isPositive ? "error" : "success"}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <IconButton
                      sx={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.contrastText,
                        '&:hover': { opacity: 0.9 },
                      }}
                    >
                      <TrendingDownIcon />
                    </IconButton>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={itemVariants}>
              <GlassCard {...GlassCardPresets.primary}>
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        純利益
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ¥{stats.netProfit.toLocaleString()}
                      </Typography>
                      <Chip
                        icon={<AccountBalanceIcon />}
                        label={`${profitMargin}%`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <IconButton
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.contrastText,
                        '&:hover': { opacity: 0.9 },
                      }}
                    >
                      <AccountBalanceIcon />
                    </IconButton>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={itemVariants}>
              <GlassCard {...GlassCardPresets.info}>
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        今月の取引
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalTransactions}
                      </Typography>
                      <Chip
                        icon={<TimelineIcon />}
                        label="件"
                        color="info"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <IconButton
                      sx={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.contrastText,
                        '&:hover': { opacity: 0.9 },
                      }}
                    >
                      <TimelineIcon />
                    </IconButton>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <GlassCardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    収支推移
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    {trendData.labels.length > 0 ? (
                      <Line data={trendData} options={chartOptions} />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography color="text.secondary">データがありません</Typography>
                      </Box>
                    )}
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <GlassCardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    支出カテゴリ
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {categoryData.labels.length > 0 ? (
                      <Doughnut data={categoryData} options={doughnutOptions} />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography color="text.secondary">データがありません</Typography>
                      </Box>
                    )}
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Recent Transactions */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <GlassCardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    最近の取引
                  </Typography>
                  {recentTransactions.length > 0 ? (
                    <List>
                      {recentTransactions.map((transaction, index) => (
                        <React.Fragment key={transaction.id}>
                          <ListItem
                            sx={{
                              borderRadius: 2,
                              mb: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              },
                            }}
                          >
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  bgcolor: transaction.type === 'income' ? 'success.main' : 'error.main',
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                {transaction.type === 'income' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <React.Fragment>
                                  <Typography variant="body1" fontWeight="medium" component="span">
                                    {transaction.description}
                                  </Typography>
                                </React.Fragment>
                              }
                              secondary={
                                <React.Fragment>
                                  <Typography variant="caption" color="text.secondary" component="span">
                                    {transaction.category} • {formatDate(transaction.date, settings.dateFormat)}
                                  </Typography>
                                </React.Fragment>
                              }
                            />
                            <Typography
                              variant="h6"
                              color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                              sx={{ ml: 2 }}
                            >
                              ¥{Math.abs(transaction.amount).toLocaleString()}
                            </Typography>
                          </ListItem>
                          {index < recentTransactions.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">取引データがありません</Typography>
                    </Box>
                  )}
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Dashboard;