import React, { useState } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import GlassCard, { GlassCardContent } from '../common/GlassCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ExpenseChart = ({ data, period = 'monthly' }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState('doughnut');

  const {
    categoryData = {
      labels: ['家賃', '交通費', '消耗品費', '接待費', '通信費', 'その他'],
      amounts: [120000, 45000, 32000, 28000, 22000, 25000],
      trends: [0, 12, -5, 25, 8, -3]
    },
    monthlyTrends = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      data: [850000, 780000, 920000, 800000, 850000, 890000]
    },
    comparisonData = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      currentYear: [850000, 780000, 920000, 800000, 850000, 890000],
      previousYear: [800000, 750000, 880000, 780000, 820000, 850000]
    }
  } = data || {};

  const colors = [
    'rgba(102, 126, 234, 0.8)',
    'rgba(250, 112, 154, 0.8)',
    'rgba(79, 172, 254, 0.8)',
    'rgba(168, 237, 234, 0.8)',
    'rgba(255, 236, 210, 0.8)',
    'rgba(240, 147, 251, 0.8)',
  ];

  const borderColors = [
    'rgba(102, 126, 234, 1)',
    'rgba(250, 112, 154, 1)',
    'rgba(79, 172, 254, 1)',
    'rgba(168, 237, 234, 1)',
    'rgba(255, 236, 210, 1)',
    'rgba(240, 147, 251, 1)',
  ];

  const doughnutData = {
    labels: categoryData.labels,
    datasets: [{
      data: categoryData.amounts,
      backgroundColor: colors,
      borderColor: borderColors,
      borderWidth: 2,
      hoverOffset: 15,
    }],
  };

  const barData = {
    labels: monthlyTrends.labels,
    datasets: [{
      label: `${period === 'quarterly' ? '四半期' : '月間'}支出`,
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
            return `${context.dataset.label || context.label}: ${formatCurrency(value, true)}`;
          },
        },
      },
    },
    scales: chartType !== 'doughnut' ? {
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
    } : {},
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right',
        labels: {
          color: theme.palette.text.primary,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, index) => {
                const value = data.datasets[0].data[index];
                const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ¥${value.toLocaleString()} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  strokeStyle: data.datasets[0].borderColor[index],
                  lineWidth: 2,
                  index: index,
                };
              });
            }
            return [];
          },
        },
      },
    },
    cutout: '60%',
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
      case 'doughnut':
        return <Doughnut data={doughnutData} options={doughnutOptions} />;
      case 'bar':
        return <Bar data={barData} options={chartOptions} />;
      case 'line':
        return <Line data={lineData} options={chartOptions} />;
      default:
        return <Doughnut data={doughnutData} options={doughnutOptions} />;
    }
  };

  const getTotalExpense = () => {
    if (!categoryData.amounts || categoryData.amounts.length === 0) return 0;
    return categoryData.amounts.reduce((sum, amount) => sum + (amount || 0), 0);
  };

  const getTopCategory = () => {
    if (!categoryData.amounts || categoryData.amounts.length === 0) {
      return { name: 'データなし', amount: 0, trend: 0 };
    }
    const maxIndex = categoryData.amounts.indexOf(Math.max(...categoryData.amounts));
    return {
      name: categoryData.labels[maxIndex] || 'データなし',
      amount: categoryData.amounts[maxIndex] || 0,
      trend: categoryData.trends[maxIndex] || 0
    };
  };

  const topCategory = getTopCategory();

  return (
    <GlassCard>
      <GlassCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            支出分析
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
            <ToggleButton value="doughnut">
              <PieChartIcon />
            </ToggleButton>
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
            label={`総支出: ${formatCurrency(getTotalExpense(), true)}`}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(250, 112, 154, 0.2)',
            }}
          />
          <Chip
            label={`最大: ${topCategory.name} ${formatCurrency(topCategory.amount, true)}`}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
            }}
          />
          <Chip
            icon={topCategory.trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${topCategory.trend > 0 ? '+' : ''}${formatPercentage(topCategory.trend)}`}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backgroundColor: topCategory.trend > 0 
                ? 'rgba(76, 175, 80, 0.2)' 
                : 'rgba(244, 67, 54, 0.2)',
            }}
          />
        </Stack>

        <Box sx={{ height: chartType === 'doughnut' ? 400 : 350 }}>
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

        {/* Category Breakdown for Doughnut Chart */}
        {chartType === 'doughnut' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              カテゴリ別詳細
            </Typography>
            <Stack spacing={1}>
              {categoryData.labels && categoryData.labels.length > 0 ? categoryData.labels.map((label, index) => {
                const amount = categoryData.amounts[index] || 0;
                const trend = categoryData.trends[index] || 0;
                const totalExpense = getTotalExpense();
                const percentage = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0.0';
                return (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: colors[index],
                          border: `2px solid ${borderColors[index]}`,
                        }}
                      />
                      <Typography variant="body1" fontWeight="medium">
                        {label}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(amount, true)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({percentage}%)
                      </Typography>
                      <Chip
                        size="small"
                        label={`${trend > 0 ? '+' : ''}${formatPercentage(trend)}`}
                        color={trend > 0 ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                );
              }) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography color="text.secondary">カテゴリデータがありません</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};

export default ExpenseChart;