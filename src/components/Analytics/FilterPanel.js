import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  TextField,
  Autocomplete,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';

const FilterPanel = ({ filters, onFiltersChange, data }) => {
  const [expanded, setExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState({
    dateRange: {
      startDate: filters?.dateRange?.startDate || new Date(2024, 0, 1),
      endDate: filters?.dateRange?.endDate || new Date(),
    },
    period: filters?.period || 'monthly',
    categories: filters?.categories || [],
    users: filters?.users || [],
    departments: filters?.departments || [],
    amountRange: {
      min: filters?.amountRange?.min || '',
      max: filters?.amountRange?.max || '',
    },
    transactionType: filters?.transactionType || 'all',
  });

  // Sample data for filters
  const {
    categories = [
      '家賃', '交通費', '消耗品費', '接待費', '通信費', '設備費', 
      '研修費', '広告宣伝費', '水道光熱費', 'その他'
    ],
    users = [
      '田中太郎', '佐藤花子', '山田次郎', '鈴木一郎', '高橋美咲',
      '松本健一', '木村美紀', '伊藤正男', '渡辺由美', '中村孝'
    ],
    departments = [
      '営業部', 'マーケティング部', '開発部', '管理部', '人事部',
      '経理部', '総務部', '企画部'
    ]
  } = data || {};

  const periodOptions = [
    { value: 'daily', label: '日別' },
    { value: 'weekly', label: '週別' },
    { value: 'monthly', label: '月別' },
    { value: 'quarterly', label: '四半期別' },
    { value: 'yearly', label: '年別' },
  ];

  const transactionTypeOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'expense', label: '支出のみ' },
    { value: 'income', label: '収入のみ' },
  ];

  const handleLocalFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
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
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.categories.length > 0) count++;
    if (localFilters.users.length > 0) count++;
    if (localFilters.departments.length > 0) count++;
    if (localFilters.amountRange.min || localFilters.amountRange.max) count++;
    if (localFilters.transactionType !== 'all') count++;
    return count;
  };

  const filterVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <GlassCard>
      <GlassCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterIcon />
            <Typography variant="h6" fontWeight="bold">
              フィルター設定
            </Typography>
            {getActiveFiltersCount() > 0 && (
              <Chip
                label={`${getActiveFiltersCount()}個のフィルター`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleApplyFilters}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              適用
            </Button>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              クリア
            </Button>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
        </Box>

        <AnimatePresence>
          {expanded && (
            <motion.div
              variants={filterVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Grid container spacing={3}>
                {/* Date Range */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <DateRangeIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        期間設定
                      </Typography>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>表示期間</InputLabel>
                          <Select
                            value={localFilters.period}
                            onChange={(e) => handleLocalFilterChange('period', e.target.value)}
                            label="表示期間"
                          >
                            {periodOptions.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <DatePicker
                          label="開始日"
                          value={localFilters.dateRange.startDate}
                          onChange={(newDate) => 
                            handleLocalFilterChange('dateRange', {
                              ...localFilters.dateRange,
                              startDate: newDate
                            })
                          }
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <DatePicker
                          label="終了日"
                          value={localFilters.dateRange.endDate}
                          onChange={(newDate) => 
                            handleLocalFilterChange('dateRange', {
                              ...localFilters.dateRange,
                              endDate: newDate
                            })
                          }
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Amount Range */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <CategoryIcon sx={{ color: 'warning.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        金額範囲
                      </Typography>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>取引種別</InputLabel>
                          <Select
                            value={localFilters.transactionType}
                            onChange={(e) => handleLocalFilterChange('transactionType', e.target.value)}
                            label="取引種別"
                          >
                            {transactionTypeOptions.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="最小金額"
                          type="number"
                          size="small"
                          fullWidth
                          value={localFilters.amountRange.min}
                          onChange={(e) => 
                            handleLocalFilterChange('amountRange', {
                              ...localFilters.amountRange,
                              min: e.target.value
                            })
                          }
                          InputProps={{
                            startAdornment: '¥',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="最大金額"
                          type="number"
                          size="small"
                          fullWidth
                          value={localFilters.amountRange.max}
                          onChange={(e) => 
                            handleLocalFilterChange('amountRange', {
                              ...localFilters.amountRange,
                              max: e.target.value
                            })
                          }
                          InputProps={{
                            startAdornment: '¥',
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                </Grid>

                {/* Categories */}
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <CategoryIcon sx={{ color: 'info.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      カテゴリ
                    </Typography>
                  </Stack>
                  <Autocomplete
                    multiple
                    size="small"
                    options={categories}
                    value={localFilters.categories}
                    onChange={(event, newValue) => handleLocalFilterChange('categories', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          size="small"
                          {...getTagProps({ index })}
                          key={option}
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            backgroundColor: 'rgba(33, 150, 243, 0.2)',
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="カテゴリを選択"
                      />
                    )}
                  />
                </Grid>

                {/* Users */}
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <PersonIcon sx={{ color: 'success.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      ユーザー
                    </Typography>
                  </Stack>
                  <Autocomplete
                    multiple
                    size="small"
                    options={users}
                    value={localFilters.users}
                    onChange={(event, newValue) => handleLocalFilterChange('users', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          size="small"
                          {...getTagProps({ index })}
                          key={option}
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            backgroundColor: 'rgba(76, 175, 80, 0.2)',
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="ユーザーを選択"
                      />
                    )}
                  />
                </Grid>

                {/* Departments */}
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <BusinessIcon sx={{ color: 'purple' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      部門
                    </Typography>
                  </Stack>
                  <Autocomplete
                    multiple
                    size="small"
                    options={departments}
                    value={localFilters.departments}
                    onChange={(event, newValue) => handleLocalFilterChange('departments', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          size="small"
                          {...getTagProps({ index })}
                          key={option}
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            backgroundColor: 'rgba(156, 39, 176, 0.2)',
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="部門を選択"
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Active Filters Display */}
              {getActiveFiltersCount() > 0 && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    アクティブなフィルター:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {localFilters.categories.map(category => (
                      <Chip
                        key={`category-${category}`}
                        label={`カテゴリ: ${category}`}
                        size="small"
                        variant="outlined"
                        onDelete={() => 
                          handleLocalFilterChange('categories', 
                            localFilters.categories.filter(c => c !== category)
                          )
                        }
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(33, 150, 243, 0.5)',
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        }}
                      />
                    ))}
                    {localFilters.users.map(user => (
                      <Chip
                        key={`user-${user}`}
                        label={`ユーザー: ${user}`}
                        size="small"
                        variant="outlined"
                        onDelete={() => 
                          handleLocalFilterChange('users', 
                            localFilters.users.filter(u => u !== user)
                          )
                        }
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(76, 175, 80, 0.5)',
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        }}
                      />
                    ))}
                    {localFilters.departments.map(dept => (
                      <Chip
                        key={`dept-${dept}`}
                        label={`部門: ${dept}`}
                        size="small"
                        variant="outlined"
                        onDelete={() => 
                          handleLocalFilterChange('departments', 
                            localFilters.departments.filter(d => d !== dept)
                          )
                        }
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(156, 39, 176, 0.5)',
                          backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        }}
                      />
                    ))}
                    {(localFilters.amountRange.min || localFilters.amountRange.max) && (
                      <Chip
                        label={`金額: ${localFilters.amountRange.min ? `¥${localFilters.amountRange.min}以上` : ''}${
                          localFilters.amountRange.min && localFilters.amountRange.max ? ' - ' : ''
                        }${localFilters.amountRange.max ? `¥${localFilters.amountRange.max}以下` : ''}`}
                        size="small"
                        variant="outlined"
                        onDelete={() => 
                          handleLocalFilterChange('amountRange', { min: '', max: '' })
                        }
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(255, 193, 7, 0.5)',
                          backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        }}
                      />
                    )}
                    {localFilters.transactionType !== 'all' && (
                      <Chip
                        label={`種別: ${transactionTypeOptions.find(t => t.value === localFilters.transactionType)?.label}`}
                        size="small"
                        variant="outlined"
                        onDelete={() => 
                          handleLocalFilterChange('transactionType', 'all')
                        }
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(255, 152, 0, 0.5)',
                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCardContent>
    </GlassCard>
  );
};

export default FilterPanel;