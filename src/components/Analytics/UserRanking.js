import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Bar, Radar } from 'react-chartjs-2';
import GlassCard, { GlassCardContent } from '../common/GlassCard';

const UserRanking = ({ data, period = 'monthly' }) => {
  const [viewType, setViewType] = useState('users');

  const {
    userRankings = [
      { 
        id: 1, 
        name: '田中太郎', 
        avatar: '', 
        department: '営業部',
        amount: 320000, 
        transactions: 45, 
        trend: 12.5,
        efficiency: 85,
        rank: 1,
        badge: 'gold'
      },
      { 
        id: 2, 
        name: '佐藤花子', 
        avatar: '', 
        department: 'マーケティング部',
        amount: 280000, 
        transactions: 38, 
        trend: -5.2,
        efficiency: 92,
        rank: 2,
        badge: 'silver'
      },
      { 
        id: 3, 
        name: '山田次郎', 
        avatar: '', 
        department: '開発部',
        amount: 210000, 
        transactions: 31, 
        trend: 8.7,
        efficiency: 78,
        rank: 3,
        badge: 'bronze'
      },
      { 
        id: 4, 
        name: '鈴木一郎', 
        avatar: '', 
        department: '管理部',
        amount: 180000, 
        transactions: 25, 
        trend: 15.3,
        efficiency: 88,
        rank: 4,
        badge: null
      },
      { 
        id: 5, 
        name: '高橋美咲', 
        avatar: '', 
        department: '営業部',
        amount: 150000, 
        transactions: 22, 
        trend: -2.1,
        efficiency: 95,
        rank: 5,
        badge: null
      },
    ],
    departmentData = [
      { 
        name: '営業部', 
        totalAmount: 470000, 
        userCount: 8, 
        avgAmount: 58750,
        trend: 8.5,
        efficiency: 87
      },
      { 
        name: 'マーケティング部', 
        totalAmount: 380000, 
        userCount: 6, 
        avgAmount: 63333,
        trend: -2.3,
        efficiency: 91
      },
      { 
        name: '開発部', 
        totalAmount: 350000, 
        userCount: 12, 
        avgAmount: 29167,
        trend: 12.1,
        efficiency: 83
      },
      { 
        name: '管理部', 
        totalAmount: 250000, 
        userCount: 4, 
        avgAmount: 62500,
        trend: 5.7,
        efficiency: 89
      },
    ]
  } = data || {};

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'gold':
        return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 'silver':
        return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)';
      case 'bronze':
        return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'gold':
      case 'silver':
      case 'bronze':
        return <TrophyIcon />;
      default:
        return <StarIcon />;
    }
  };

  // Chart data for user spending patterns
  const userChartData = {
    labels: userRankings.slice(0, 5).map(user => user.name),
    datasets: [{
      label: `${period === 'quarterly' ? '四半期' : '月間'}支出額`,
      data: userRankings.slice(0, 5).map(user => user.amount),
      backgroundColor: [
        'rgba(255, 215, 0, 0.8)',
        'rgba(192, 192, 192, 0.8)',
        'rgba(205, 127, 50, 0.8)',
        'rgba(102, 126, 234, 0.8)',
        'rgba(250, 112, 154, 0.8)',
      ],
      borderColor: [
        'rgba(255, 215, 0, 1)',
        'rgba(192, 192, 192, 1)',
        'rgba(205, 127, 50, 1)',
        'rgba(102, 126, 234, 1)',
        'rgba(250, 112, 154, 1)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  // Radar chart for department comparison
  const departmentRadarData = {
    labels: ['支出額', '効率性', 'ユーザー数', '平均額', '成長率'],
    datasets: departmentData.slice(0, 4).map((dept, index) => ({
      label: dept.name,
      data: [
        (dept.totalAmount / 500000) * 100,
        dept.efficiency,
        (dept.userCount / 15) * 100,
        (dept.avgAmount / 70000) * 100,
        Math.max(0, dept.trend + 50), // Normalize to positive scale
      ],
      backgroundColor: `rgba(${102 + index * 50}, ${126 + index * 30}, ${234 - index * 40}, 0.2)`,
      borderColor: `rgba(${102 + index * 50}, ${126 + index * 30}, ${234 - index * 40}, 1)`,
      pointBackgroundColor: `rgba(${102 + index * 50}, ${126 + index * 30}, ${234 - index * 40}, 1)`,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || context.parsed;
            return `${context.dataset.label}: ¥${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: viewType === 'users' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value) {
            return '¥' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    } : {
      r: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          backdropColor: 'transparent',
        },
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

  return (
    <Box>
      {/* View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          ユーザー・部門分析
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(e, newViewType) => newViewType && setViewType(newViewType)}
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
          <ToggleButton value="users">
            <PersonIcon sx={{ mr: 1 }} />
            ユーザー
          </ToggleButton>
          <ToggleButton value="departments">
            <BusinessIcon sx={{ mr: 1 }} />
            部門
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Rankings/Department List */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <GlassCardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {viewType === 'users' ? 'ユーザーランキング' : '部門別支出'}
              </Typography>
              
              {viewType === 'users' ? (
                <Stack spacing={2}>
                  {userRankings.map((user, index) => (
                    <motion.div
                      key={user.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: user.badge 
                            ? getBadgeColor(user.badge)
                            : 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              sx={{
                                bgcolor: user.badge ? 'rgba(255, 255, 255, 0.2)' : 'primary.main',
                                color: 'white',
                                width: 48,
                                height: 48,
                              }}
                            >
                              {user.name.charAt(0)}
                            </Avatar>
                            {user.badge && (
                              <Avatar
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  width: 24,
                                  height: 24,
                                  bgcolor: getBadgeColor(user.badge),
                                  color: 'white',
                                }}
                              >
                                {getBadgeIcon(user.badge)}
                              </Avatar>
                            )}
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color="white">
                              {user.rank}. {user.name}
                            </Typography>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                              {user.department} • {user.transactions}件
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Stack alignItems="flex-end" spacing={1}>
                          <Typography variant="h6" fontWeight="bold" color="white">
                            ¥{user.amount.toLocaleString()}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip
                              size="small"
                              icon={user.trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              label={`${user.trend > 0 ? '+' : ''}${user.trend}%`}
                              sx={{
                                bgcolor: user.trend > 0 
                                  ? 'rgba(76, 175, 80, 0.3)' 
                                  : 'rgba(244, 67, 54, 0.3)',
                                color: 'white',
                                '& .MuiChip-icon': {
                                  color: 'white',
                                },
                              }}
                            />
                            <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                              効率: {user.efficiency}%
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {departmentData.map((dept, index) => (
                    <motion.div
                      key={dept.name}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {dept.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {dept.userCount}名 • 平均¥{dept.avgAmount.toLocaleString()}
                              </Typography>
                            </Box>
                          </Stack>
                          
                          <Stack alignItems="flex-end" spacing={1}>
                            <Typography variant="h6" fontWeight="bold">
                              ¥{dept.totalAmount.toLocaleString()}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Chip
                                size="small"
                                icon={dept.trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                label={`${dept.trend > 0 ? '+' : ''}${dept.trend}%`}
                                color={dept.trend > 0 ? 'success' : 'error'}
                                variant="outlined"
                              />
                            </Stack>
                          </Stack>
                        </Stack>
                        
                        <Box sx={{ mt: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              効率スコア
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {dept.efficiency}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={dept.efficiency}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: dept.efficiency > 85 ? 'success.main' : 'warning.main',
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </GlassCardContent>
          </GlassCard>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <GlassCardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {viewType === 'users' ? 'ユーザー別支出グラフ' : '部門比較レーダーチャート'}
              </Typography>
              <Box sx={{ height: 350 }}>
                {viewType === 'users' ? (
                  <Bar data={userChartData} options={chartOptions} />
                ) : (
                  <Radar data={departmentRadarData} options={chartOptions} />
                )}
              </Box>
            </GlassCardContent>
          </GlassCard>
        </Grid>

        {/* Detailed Table */}
        <Grid item xs={12}>
          <GlassCard>
            <GlassCardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {viewType === 'users' ? '詳細ユーザー分析' : '詳細部門分析'}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {viewType === 'users' ? (
                        <>
                          <TableCell>ランク</TableCell>
                          <TableCell>ユーザー</TableCell>
                          <TableCell>部門</TableCell>
                          <TableCell align="right">支出額</TableCell>
                          <TableCell align="right">取引数</TableCell>
                          <TableCell align="right">効率</TableCell>
                          <TableCell align="right">前期比</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>部門</TableCell>
                          <TableCell align="right">総支出</TableCell>
                          <TableCell align="right">ユーザー数</TableCell>
                          <TableCell align="right">平均支出</TableCell>
                          <TableCell align="right">効率</TableCell>
                          <TableCell align="right">成長率</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewType === 'users' ? (
                      userRankings.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography fontWeight="bold">#{user.rank}</Typography>
                              {user.badge && getBadgeIcon(user.badge)}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {user.name.charAt(0)}
                              </Avatar>
                              <Typography>{user.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell align="right">¥{user.amount.toLocaleString()}</TableCell>
                          <TableCell align="right">{user.transactions}</TableCell>
                          <TableCell align="right">{user.efficiency}%</TableCell>
                          <TableCell align="right">
                            <Chip
                              size="small"
                              label={`${user.trend > 0 ? '+' : ''}${user.trend}%`}
                              color={user.trend > 0 ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      departmentData.map((dept) => (
                        <TableRow key={dept.name}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                <BusinessIcon />
                              </Avatar>
                              <Typography>{dept.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">¥{dept.totalAmount.toLocaleString()}</TableCell>
                          <TableCell align="right">{dept.userCount}名</TableCell>
                          <TableCell align="right">¥{dept.avgAmount.toLocaleString()}</TableCell>
                          <TableCell align="right">{dept.efficiency}%</TableCell>
                          <TableCell align="right">
                            <Chip
                              size="small"
                              label={`${dept.trend > 0 ? '+' : ''}${dept.trend}%`}
                              color={dept.trend > 0 ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </GlassCardContent>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserRanking;