import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
  Grid,
  Avatar,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Savings as SavingsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Line } from 'react-chartjs-2';
import GlassCard, { GlassCardContent } from '../common/GlassCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const IncomeChart = ({ data, period = 'monthly' }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState('bar');

  const {
    sourceData = {
      labels: ['基本給', 'ボーナス', '手当', '副業', 'その他'],
      amounts: [800000, 200000, 150000, 80000, 20000],
      trends: [2.5, 15.0, -3.2, 25.8, 10.0]
    },
    monthlyTrends = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      data: [1250000, 1100000, 1350000, 1200000, 1250000, 1400000]
    },
    comparisonData = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      currentYear: [1250000, 1100000, 1350000, 1200000, 1250000, 1400000],
      previousYear: [1200000, 1050000, 1300000, 1150000, 1200000, 1350000]
    },
    growthMetrics = {
      monthlyGrowth: 12.5,
      yearOverYear: 8.3,
      quarterlyGrowth: 15.2
    }
  } = data || {};

  const colors = [
    'rgba(17, 153, 142, 0.8)',
    'rgba(102, 126, 234, 0.8)',
    'rgba(79, 172, 254, 0.8)',
    'rgba(168, 237, 234, 0.8)',
    'rgba(255, 193, 7, 0.8)',
  ];

  const borderColors = [
    'rgba(17, 153, 142, 1)',
    'rgba(102, 126, 234, 1)',
    'rgba(79, 172, 254, 1)',
    'rgba(168, 237, 234, 1)',
    'rgba(255, 193, 7, 1)',
  ];

  const sourceIcons = [
    AccountBalanceIcon,
    SavingsIcon,
    WorkIcon,
    BusinessIcon,
    AccountBalanceIcon,
  ];

  const barData = {
    labels: monthlyTrends.labels,
    datasets: [{
      label: `${period === 'quarterly' ? '四半期' : '月間'}収入`,
      data: monthlyTrends.data,
      backgroundColor: colors[0],
      borderColor: borderColors[0],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const lineData = {
    labels: comparisonData.labels,
    datasets: [
      {
        label: '今年',
        data: comparisonData.currentYear,
        borderColor: borderColors[0],
        backgroundColor: colors[0],
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: borderColors[0],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: '前年',
        data: comparisonData.previousYear,
        borderColor: borderColors[1],
        backgroundColor: colors[1],
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: borderColors[1],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || context.parsed;
            return `${context.dataset.label}: ${formatCurrency(value, true)}`;
          },
        },
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
            return formatCurrency(value, true);
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
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
      },
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={barData} options={chartOptions} />;
      case 'line':
        return <Line data={lineData} options={chartOptions} />;
      default:
        return <Bar data={barData} options={chartOptions} />;
    }
  };

  const getTotalIncome = () => {
    if (!sourceData.amounts || sourceData.amounts.length === 0) return 0;
    return sourceData.amounts.reduce((sum, amount) => sum + (amount || 0), 0);
  };

  const getTopSource = () => {
    if (!sourceData.amounts || sourceData.amounts.length === 0) {
      return { name: 'データなし', amount: 0, trend: 0 };
    }
    const maxIndex = sourceData.amounts.indexOf(Math.max(...sourceData.amounts));
    return {
      name: sourceData.labels[maxIndex] || 'データなし',
      amount: sourceData.amounts[maxIndex] || 0,
      trend: sourceData.trends[maxIndex] || 0
    };
  };

  const topSource = getTopSource();

  return (
    <Box>
      {/* Growth Indicators */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <GlassCard>
            <GlassCardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: 'success.main',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    +{formatPercentage(growthMetrics.monthlyGrowth)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    月間成長率
                  </Typography>
                </Box>
              </Stack>
            </GlassCardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <GlassCard>
            <GlassCardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    +{formatPercentage(growthMetrics.yearOverYear)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    前年同期比
                  </Typography>
                </Box>
              </Stack>
            </GlassCardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <GlassCard>
            <GlassCardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: 'info.main',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    +{formatPercentage(growthMetrics.quarterlyGrowth)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    四半期成長率
                  </Typography>
                </Box>
              </Stack>
            </GlassCardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Main Income Chart */}
      <GlassCard sx={{ mb: 3 }}>
        <GlassCardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              収入分析
            </Typography>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newChartType) => newChartType && setChartType(newChartType)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  },
                },
              }}
            >
              <ToggleButton value="bar">
                <BarChartIcon />
              </ToggleButton>
              <ToggleButton value="line">
                <LineChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Summary Stats */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Chip
              label={`総収入: ${formatCurrency(getTotalIncome(), true)}`}
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(17, 153, 142, 0.2)',
              }}
            />
            <Chip
              label={`主要: ${topSource.name} ${formatCurrency(topSource.amount, true)}`}
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
              }}
            />
            <Chip
              icon={topSource.trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${topSource.trend > 0 ? '+' : ''}${formatPercentage(topSource.trend)}`}
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: topSource.trend > 0 
                  ? 'rgba(76, 175, 80, 0.2)' 
                  : 'rgba(244, 67, 54, 0.2)',
              }}
            />
          </Stack>

          <Box sx={{ height: 350 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={chartType}
                variants={chartVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ height: '100%' }}
              >
                {renderChart()}
              </motion.div>
            </AnimatePresence>
          </Box>
        </GlassCardContent>
      </GlassCard>

      {/* Income Source Breakdown */}
      <GlassCard>
        <GlassCardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            収入源別詳細
          </Typography>
          <Grid container spacing={2}>
            {sourceData.labels && sourceData.labels.length > 0 ? sourceData.labels.map((label, index) => {
              const amount = sourceData.amounts[index] || 0;
              const trend = sourceData.trends[index] || 0;
              const totalIncome = getTotalIncome();
              const percentage = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : '0.0';
              const IconComponent = sourceIcons[index] || sourceIcons[0];
              
              return (
                <Grid item xs={12} sm={6} lg={4} key={label}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${colors[index]}, rgba(255, 255, 255, 0.1))`,
                        border: `1px solid ${borderColors[index]}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 180,
                      }}
                    >
                      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent />
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color="white"
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.125rem' },
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {label}
                          </Typography>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                            {percentage}% of total
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Box>
                        <Typography 
                          variant="h5" 
                          fontWeight="bold" 
                          color="white" 
                          sx={{ 
                            mb: 1,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          }}
                        >
                          {formatCurrency(amount, true)}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                          <Chip
                            size="small"
                            icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                            label={`${trend > 0 ? '+' : ''}${formatPercentage(trend)}`}
                            sx={{
                              bgcolor: trend > 0 
                                ? 'rgba(76, 175, 80, 0.3)' 
                                : 'rgba(244, 67, 54, 0.3)',
                              color: 'white',
                              '& .MuiChip-icon': {
                                color: 'white',
                              },
                            }}
                          />
                          <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                            前期比
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              );
            }) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography color="text.secondary">収入データがありません</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </GlassCardContent>
      </GlassCard>
    </Box>
  );
};

export default IncomeChart;