import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Tooltip,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Receipt as ReceiptIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import GlassCard, { GlassCardContent } from '../components/common/GlassCard';
import FilePreviewDialog from '../components/common/FilePreviewDialog';
import expenseService from '../services/expenseService';
import incomeService from '../services/incomeService';
import categoryService from '../services/categoryService';
import userService from '../services/userService';
import trashService from '../services/trashService';
import { formatDate } from '../utils/formatters';
import useSettings from '../hooks/useSettings';

const TransactionList = () => {
  const { settings } = useSettings();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  
  // Edit/Delete functionality
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [previewFileIds, setPreviewFileIds] = useState([]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesResult, incomeResult, categoriesResult, usersResult] = await Promise.all([
        expenseService.getAllExpenses(),
        incomeService.getAllIncome(),
        categoryService.getAllCategories(),
        userService.getAllUsers()
      ]);

      const expenses = (expensesResult.success ? expensesResult.data : [])
        .map(item => ({ ...item, type: 'expense' }));
      const income = (incomeResult.success ? incomeResult.data : [])
        .map(item => ({ ...item, type: 'income' }));

      const allTransactions = [...expenses, ...income]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
      setCategories(categoriesResult.success ? categoriesResult.data : []);
      setUsers(usersResult.success ? usersResult.data : []);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Date filters
      if (dateFrom && new Date(transaction.date) < dateFrom) {
        return false;
      }
      if (dateTo && new Date(transaction.date) > dateTo) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && transaction.categoryId !== categoryFilter) {
        return false;
      }

      // User filter
      if (userFilter !== 'all' && transaction.userId !== userFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, dateFrom, dateTo, typeFilter, categoryFilter, userFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      expenses: totalExpenses,
      income: totalIncome,
      net: totalIncome - totalExpenses,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '不明';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : '不明';
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDateFrom(null);
    setDateTo(null);
    setTypeFilter('all');
    setCategoryFilter('all');
    setUserFilter('all');
    setPage(0);
  };

  const exportData = () => {
    const csvData = filteredTransactions.map(t => ({
      日付: formatDate(t.date, settings.dateFormat),
      種類: t.type === 'expense' ? '支出' : '収入',
      金額: t.amount,
      説明: t.description,
      カテゴリ: getCategoryName(t.categoryId),
      ユーザー: getUserName(t.userId),
      メモ: t.memo || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Menu handlers
  const handleMenuOpen = (event, transaction) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTransaction(null);
  };

  // Edit handlers
  const handleEditClick = () => {
    setEditFormData({
      ...selectedTransaction,
      date: selectedTransaction.date.split('T')[0] // Format for date input
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSave = async () => {
    try {
      const { type, id, ...updateData } = editFormData;
      
      let result;
      if (type === 'expense') {
        result = await expenseService.updateExpense(id, updateData);
      } else {
        result = await incomeService.updateIncome(id, updateData);
      }

      if (result.success) {
        setSnackbar({ open: true, message: '取引を更新しました', severity: 'success' });
        loadData(); // Reload data
        setEditDialogOpen(false);
      } else {
        setSnackbar({ open: true, message: result.error || '更新に失敗しました', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: '更新中にエラーが発生しました', severity: 'error' });
    }
  };

  // Delete handlers
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await trashService.moveToTrash(
        selectedTransaction.type, 
        selectedTransaction.id, 
        deleteReason
      );

      if (result.success) {
        setSnackbar({ open: true, message: 'ゴミ箱に移動しました', severity: 'success' });
        loadData(); // Reload data
        setDeleteDialogOpen(false);
        setDeleteReason('');
      } else {
        setSnackbar({ open: true, message: result.error || '削除に失敗しました', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: '削除中にエラーが発生しました', severity: 'error' });
    }
  };

  const handleFilePreview = (fileIds) => {
    setPreviewFileIds(fileIds);
    setFilePreviewOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 4 }}>
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
                取引履歴
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                期間とカテゴリで絞り込んで収支を一覧表示
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            {/* Filters */}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <GlassCard>
                  <GlassCardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterIcon />
                      フィルター
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {/* Search */}
                      <Grid item xs={12} md={3}>
                        <TextField
                          placeholder="説明で検索..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {/* Date From */}
                      <Grid item xs={12} md={2}>
                        <DatePicker
                          label="開始日"
                          value={dateFrom}
                          onChange={setDateFrom}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true
                            }
                          }}
                        />
                      </Grid>

                      {/* Date To */}
                      <Grid item xs={12} md={2}>
                        <DatePicker
                          label="終了日"
                          value={dateTo}
                          onChange={setDateTo}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true
                            }
                          }}
                        />
                      </Grid>

                      {/* Type Filter */}
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>種類</InputLabel>
                          <Select
                            value={typeFilter}
                            label="種類"
                            onChange={(e) => setTypeFilter(e.target.value)}
                          >
                            <MenuItem value="all">すべて</MenuItem>
                            <MenuItem value="expense">支出</MenuItem>
                            <MenuItem value="income">収入</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Category Filter */}
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>カテゴリ</InputLabel>
                          <Select
                            value={categoryFilter}
                            label="カテゴリ"
                            onChange={(e) => setCategoryFilter(e.target.value)}
                          >
                            <MenuItem value="all">すべて</MenuItem>
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* User Filter */}
                      <Grid item xs={12} md={1}>
                        <FormControl fullWidth size="small">
                          <InputLabel>ユーザー</InputLabel>
                          <Select
                            value={userFilter}
                            label="ユーザー"
                            onChange={(e) => setUserFilter(e.target.value)}
                          >
                            <MenuItem value="all">すべて</MenuItem>
                            {users.map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={resetFilters}
                      >
                        リセット
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ExportIcon />}
                        onClick={exportData}
                        disabled={filteredTransactions.length === 0}
                      >
                        エクスポート
                      </Button>
                    </Stack>
                  </GlassCardContent>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                          <ExpenseIcon />
                        </Avatar>
                        <Typography variant="h6" color="error.main">
                          {formatCurrency(totals.expenses)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          総支出
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                          <IncomeIcon />
                        </Avatar>
                        <Typography variant="h6" color="success.main">
                          {formatCurrency(totals.income)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          総収入
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: totals.net >= 0 ? 'success.main' : 'error.main', mx: 'auto', mb: 1 }}>
                          <ReceiptIcon />
                        </Avatar>
                        <Typography variant="h6" color={totals.net >= 0 ? 'success.main' : 'error.main'}>
                          {formatCurrency(totals.net)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          純利益
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                          <ReceiptIcon />
                        </Avatar>
                        <Typography variant="h6" color="info.main">
                          {totals.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          取引数
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>

            {/* Transaction Table */}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <GlassCard>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>日付</TableCell>
                          <TableCell>種類</TableCell>
                          <TableCell>説明</TableCell>
                          <TableCell>カテゴリ</TableCell>
                          <TableCell>ユーザー</TableCell>
                          <TableCell align="right">金額</TableCell>
                          <TableCell>メモ</TableCell>
                          <TableCell align="center">ファイル</TableCell>
                          <TableCell align="center">操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedTransactions.map((transaction) => (
                          <TableRow key={`${transaction.type}-${transaction.id}`} hover>
                            <TableCell>
                              {formatDate(transaction.date, settings.dateFormat)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={transaction.type === 'expense' ? <ExpenseIcon /> : <IncomeIcon />}
                                label={transaction.type === 'expense' ? '支出' : '収入'}
                                color={transaction.type === 'expense' ? 'error' : 'success'}
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <Chip
                                icon={<CategoryIcon />}
                                label={getCategoryName(transaction.categoryId)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<PersonIcon />}
                                label={getUserName(transaction.userId)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={transaction.type === 'expense' ? 'error.main' : 'success.main'}
                              >
                                {formatCurrency(transaction.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {transaction.memo && (
                                <Tooltip title={transaction.memo}>
                                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                    {transaction.memo}
                                  </Typography>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {transaction.fileIds && transaction.fileIds.length > 0 && (
                                <Tooltip title={`${transaction.fileIds.length}個のファイル`}>
                                  <Chip
                                    icon={<AttachFileIcon />}
                                    label={transaction.fileIds.length}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleFilePreview(transaction.fileIds)}
                                    sx={{ cursor: 'pointer' }}
                                  />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, transaction)}
                              >
                                <MoreIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {filteredTransactions.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        条件に一致する取引がありません
                      </Typography>
                    </Box>
                  )}

                  {filteredTransactions.length > 0 && (
                    <TablePagination
                      component="div"
                      count={filteredTransactions.length}
                      page={page}
                      onPageChange={(e, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                      rowsPerPageOptions={[10, 25, 50, 100]}
                      labelRowsPerPage="表示件数："
                      labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} / ${count}`
                      }
                    />
                  )}
                </GlassCard>
              </motion.div>
            </Grid>
          </Grid>

          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditClick}>
              <EditIcon sx={{ mr: 1 }} />
              編集
            </MenuItem>
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              削除
            </MenuItem>
          </Menu>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>取引の編集</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="日付"
                  type="date"
                  value={editFormData.date || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="金額"
                  type="number"
                  value={editFormData.amount || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  fullWidth
                />
                <TextField
                  label="説明"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={2}
                />
                <FormControl fullWidth>
                  <InputLabel>カテゴリ</InputLabel>
                  <Select
                    value={editFormData.categoryId || ''}
                    label="カテゴリ"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  >
                    {categories
                      .filter(cat => cat.type === editFormData.type)
                      .map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>ユーザー</InputLabel>
                  <Select
                    value={editFormData.userId || ''}
                    label="ユーザー"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, userId: e.target.value }))}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="メモ"
                  value={editFormData.memo || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, memo: e.target.value }))}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>キャンセル</Button>
              <Button onClick={handleEditSave} variant="contained">保存</Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>取引の削除</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                この取引をゴミ箱に移動しますか？後で復元することも可能です。
              </Typography>
              {selectedTransaction && (
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedTransaction.date, settings.dateFormat)} - {selectedTransaction.description}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(selectedTransaction.amount)}
                  </Typography>
                </Box>
              )}
              <TextField
                label="削除理由（任意）"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
                placeholder="例：重複登録、誤入力など"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
              <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                ゴミ箱に移動
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            message={snackbar.message}
          />

          {/* File Preview Dialog */}
          <FilePreviewDialog
            open={filePreviewOpen}
            onClose={() => setFilePreviewOpen(false)}
            fileIds={previewFileIds}
          />
        </motion.div>
      </Container>
    </LocalizationProvider>
  );
};

export default TransactionList;