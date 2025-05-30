import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard, { GlassCardContent, GlassCardPresets } from '../components/common/GlassCard';
import ExpenseForm from '../components/Registration/ExpenseForm';
import IncomeForm from '../components/Registration/IncomeForm';
import expenseService from '../services/expenseService';
import incomeService from '../services/incomeService';
import { formatDate } from '../utils/formatters';
import useSettings from '../hooks/useSettings';

const Registration = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    transactionCount: 0,
    netIncome: 0
  });

  // Load recent transactions and stats
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current month data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      // Get recent expenses and income
      const expensesResult = await expenseService.getExpensesByDateRange(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      const incomeResult = await incomeService.getIncomeByDateRange(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );

      const expenses = expensesResult.success ? expensesResult.data : [];
      const income = incomeResult.success ? incomeResult.data : [];

      // Combine and sort recent transactions
      const allTransactions = [
        ...expenses.map(e => ({ ...e, type: 'expense' })),
        ...income.map(i => ({ ...i, type: 'income' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      setRecentTransactions(allTransactions);

      // Calculate stats
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      
      setMonthlyStats({
        totalExpenses,
        totalIncome,
        transactionCount: expenses.length + income.length,
        netIncome: totalIncome - totalExpenses
      });

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTransactionSubmit = async (transactionData) => {
    try {
      // Save to database
      if (transactionData.type === 'expense') {
        await expenseService.createExpense(transactionData);
      } else {
        await incomeService.createIncome(transactionData);
      }
      
      // Reload data to show the new transaction
      await loadData();
      
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  // Initialize data on component mount and handle URL parameters
  useEffect(() => {
    loadData();
    
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'income') {
      setActiveTab(1);
    } else if (tabParam === 'expense') {
      setActiveTab(0);
    }
  }, [location.search]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  // Animation variants
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
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 1,
            }}
          >
            収支登録
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            AI機能付きの経費・収入管理システム
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {/* Main Registration Form */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <GlassCardContent>
                  {/* Tab Navigation */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      variant="fullWidth"
                      sx={{
                        '& .MuiTab-root': {
                          color: 'text.secondary',
                          '&.Mui-selected': {
                            color: 'text.primary',
                          },
                        },
                      }}
                    >
                      <Tab
                        icon={<TrendingDownIcon />}
                        label="支出登録"
                        iconPosition="start"
                      />
                      <Tab
                        icon={<TrendingUpIcon />}
                        label="収入登録"
                        iconPosition="start"
                      />
                    </Tabs>
                  </Box>

                  {/* Form Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTab === 0 ? (
                        <ExpenseForm onSubmit={handleTransactionSubmit} />
                      ) : (
                        <IncomeForm onSubmit={handleTransactionSubmit} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Monthly Statistics */}
              <motion.div variants={itemVariants}>
                <GlassCard {...GlassCardPresets.info}>
                  <GlassCardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon />
                      今月の概要
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                              <TrendingDownIcon />
                            </Avatar>
                            <Typography variant="h6" color="error.main" fontWeight="bold">
                              {formatCurrency(monthlyStats.totalExpenses)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              総支出
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                              <TrendingUpIcon />
                            </Avatar>
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              {formatCurrency(monthlyStats.totalIncome)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              総収入
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                              <TimelineIcon />
                            </Avatar>
                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                              {formatCurrency(monthlyStats.netIncome)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              純利益
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                              <ReceiptIcon />
                            </Avatar>
                            <Typography variant="h6" color="info.main" fontWeight="bold">
                              {monthlyStats.transactionCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              取引数
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </GlassCardContent>
                </GlassCard>
              </motion.div>

              {/* Recent Transactions */}
              <motion.div variants={itemVariants}>
                <GlassCard>
                  <GlassCardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptIcon />
                      最近の取引
                    </Typography>
                    {recentTransactions.length > 0 ? (
                      <List dense>
                        {recentTransactions.map((transaction) => (
                          <ListItem key={transaction.id} sx={{ px: 0 }}>
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  bgcolor: transaction.type === 'expense' ? 'error.main' : 'success.main',
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                {transaction.type === 'expense' ? <TrendingDownIcon /> : <TrendingUpIcon />}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={transaction.description}
                              secondary={
                                <React.Fragment>
                                  <Typography variant="caption" color="text.secondary" component="span">
                                    {formatDate(transaction.date, settings.dateFormat)}
                                  </Typography>
                                </React.Fragment>
                              }
                            />
                            <Typography
                              variant="body2"
                              color={transaction.type === 'expense' ? 'error.main' : 'success.main'}
                              fontWeight="bold"
                            >
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary" textAlign="center" py={2}>
                        取引データがありません
                      </Typography>
                    )}
                  </GlassCardContent>
                </GlassCard>
              </motion.div>

            </Stack>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Registration;