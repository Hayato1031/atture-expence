import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Savings as SavingsIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const FinancialSummary = ({ data, period = 'monthly' }) => {
  const {
    totalIncome = 5500000,
    totalExpense = 3800000,
    monthlyIncome = 1250000,
    monthlyExpense = 850000,
    quarterlyIncome = 3600000,
    quarterlyExpense = 2400000,
    incomeGrowth = 12.5,
    expenseGrowth = -5.2,
    profitMargin = 30.9,
    averageTransaction = 12450
  } = data || {};

  const profit = totalIncome - totalExpense;
  const monthlyProfit = monthlyIncome - monthlyExpense;
  const quarterlyProfit = quarterlyIncome - quarterlyExpense;

  const currentIncome = period === 'quarterly' ? quarterlyIncome : monthlyIncome;
  const currentExpense = period === 'quarterly' ? quarterlyExpense : monthlyExpense;
  const currentProfit = period === 'quarterly' ? quarterlyProfit : monthlyProfit;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const getSummaryCards = () => {
    return [
      {
        title: `${period === 'quarterly' ? '四半期' : '月間'}収入`,
        value: formatCurrency(currentIncome, true),
        icon: TrendingUpIcon,
        color: 'success.main',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        trend: incomeGrowth,
        comparison: '前期比',
      },
      {
        title: `${period === 'quarterly' ? '四半期' : '月間'}支出`,
        value: formatCurrency(currentExpense, true),
        icon: TrendingDownIcon,
        color: 'error.main',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        trend: expenseGrowth,
        comparison: '前期比',
      },
      {
        title: `${period === 'quarterly' ? '四半期' : '月間'}利益`,
        value: formatCurrency(currentProfit, true),
        icon: AssessmentIcon,
        color: 'primary.main',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        trend: incomeGrowth - expenseGrowth,
        comparison: '前期比',
      },
      {
        title: '利益率',
        value: formatPercentage(profitMargin),
        icon: AccountBalanceIcon,
        color: 'info.main',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        trend: 2.3,
        comparison: '前期比',
      },
    ];
  };

  const getDetailCards = () => {
    return [
      {
        title: '年間総収入',
        value: formatCurrency(totalIncome, true),
        icon: SavingsIcon,
        color: 'success.light',
        progress: 75,
        target: '目標達成率',
      },
      {
        title: '年間総支出',
        value: formatCurrency(totalExpense, true),
        icon: CompareArrowsIcon,
        color: 'warning.main',
        progress: 63,
        target: '予算消化率',
      },
      {
        title: '年間純利益',
        value: formatCurrency(profit, true),
        icon: AssessmentIcon,
        color: 'primary.main',
        progress: 85,
        target: '目標達成率',
      },
      {
        title: '平均取引額',
        value: formatCurrency(averageTransaction, true),
        icon: AccountBalanceIcon,
        color: 'info.main',
        progress: 45,
        target: '効率指標',
      },
    ];
  };

  return (
    <Box>
      {/* Main Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getSummaryCards().map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                sx={{
                  height: '100%',
                  minHeight: '160px',
                  background: card.gradient,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'inherit',
                  },
                }}
              >
                <GlassCardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <card.icon fontSize="large" />
                    </Avatar>
                    <Box flex={1} sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="white"
                        sx={{ 
                          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {card.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="rgba(255, 255, 255, 0.8)"
                        sx={{ 
                          lineHeight: 1.2,
                          minHeight: '2.4em',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          label={`${card.trend > 0 ? '+' : ''}${formatPercentage(card.trend)}`}
                          size="small"
                          sx={{
                            bgcolor: card.trend > 0 
                              ? 'rgba(76, 175, 80, 0.3)' 
                              : 'rgba(244, 67, 54, 0.3)',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                          {card.comparison}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Financial Overview */}
      <Grid container spacing={3}>
        {getDetailCards().map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: (index + 4) * 0.1 }}
            >
              <GlassCard sx={{ height: '100%', minHeight: '180px' }}>
                <GlassCardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: card.color, width: 48, height: 48 }}>
                        <card.icon />
                      </Avatar>
                      <Box flex={1} sx={{ minWidth: 0 }}>
                        <Typography 
                          variant="h5" 
                          fontWeight="bold"
                          sx={{ 
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {card.value}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            lineHeight: 1.2,
                            minHeight: '2.4em',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {card.title}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {card.target}
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {card.progress}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={card.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${card.color} 0%, rgba(255, 255, 255, 0.8) 100%)`,
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Income vs Expense Comparison */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <GlassCard>
              <GlassCardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  収支バランス分析
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h3" fontWeight="bold" color="success.main">
                        {formatPercentage((currentIncome / (currentIncome + currentExpense)) * 100)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        収入比率
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(currentIncome / (currentIncome + currentExpense)) * 100}
                        sx={{
                          mt: 2,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'success.main',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h3" fontWeight="bold" color="error.main">
                        {formatPercentage((currentExpense / (currentIncome + currentExpense)) * 100)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        支出比率
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(currentExpense / (currentIncome + currentExpense)) * 100}
                        sx={{
                          mt: 2,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(244, 67, 54, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'error.main',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h3" fontWeight="bold" color="primary.main">
                        {formatPercentage((currentProfit / currentIncome) * 100)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        利益率
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(currentProfit / currentIncome) * 100}
                        sx={{
                          mt: 2,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'primary.main',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialSummary;