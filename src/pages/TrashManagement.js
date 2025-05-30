import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Stack,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  DeleteForever as PermanentDeleteIcon,
  CleaningServices as CleanIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../components/common/GlassCard';
import trashService from '../services/trashService';
import categoryService from '../services/categoryService';
import userService from '../services/userService';
import { formatDate as formatDateUtil } from '../utils/formatters';
import useSettings from '../hooks/useSettings';

const TrashManagement = () => {
  const { settings } = useSettings();
  const [trashItems, setTrashItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', item: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trashResult, categoriesResult, usersResult] = await Promise.all([
        trashService.getAllTrash(),
        categoryService.getAllCategories(),
        userService.getAllUsers()
      ]);

      setTrashItems(trashResult.success ? trashResult.data : []);
      setCategories(categoriesResult.success ? categoriesResult.data : []);
      setUsers(usersResult.success ? usersResult.data : []);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleRestore = async (trashId) => {
    try {
      const result = await trashService.restoreFromTrash(trashId);
      if (result.success) {
        setSnackbar({ open: true, message: '取引を復元しました', severity: 'success' });
        loadData();
      } else {
        setSnackbar({ open: true, message: result.error || '復元に失敗しました', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: '復元中にエラーが発生しました', severity: 'error' });
    }
  };

  const handlePermanentDelete = async (trashId) => {
    try {
      const result = await trashService.permanentlyDelete(trashId);
      if (result.success) {
        setSnackbar({ open: true, message: '取引を完全削除しました', severity: 'success' });
        loadData();
      } else {
        setSnackbar({ open: true, message: result.error || '削除に失敗しました', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: '削除中にエラーが発生しました', severity: 'error' });
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const result = await trashService.emptyTrash();
      if (result.success) {
        setSnackbar({ open: true, message: 'ゴミ箱を空にしました', severity: 'success' });
        loadData();
      } else {
        setSnackbar({ open: true, message: 'ゴミ箱の削除に失敗しました', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: '削除中にエラーが発生しました', severity: 'error' });
    }
  };

  const handleCleanupOld = async () => {
    try {
      const result = await trashService.cleanupOldTrash(30);
      if (result.success) {
        setSnackbar({ 
          open: true, 
          message: `${result.data.deletedCount}件の古いアイテムを削除しました`, 
          severity: 'success' 
        });
        loadData();
      } else {
        setSnackbar({ open: true, message: 'クリーンアップに失敗しました', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'クリーンアップ中にエラーが発生しました', severity: 'error' });
    }
  };

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

  const formatDate = (dateString) => {
    return formatDateUtil(dateString, settings.dateFormat);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const paginatedTrashItems = trashItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              ゴミ箱
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              削除した取引の管理と復元
            </Typography>
          </Box>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<CleanIcon />}
                onClick={() => setConfirmDialog({ open: true, type: 'cleanup', item: null })}
                disabled={trashItems.length === 0}
              >
                30日以上前を削除
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDialog({ open: true, type: 'empty', item: null })}
                disabled={trashItems.length === 0}
              >
                ゴミ箱を空にする
              </Button>
            </Stack>
          </Box>
        </motion.div>

        {/* Trash Items */}
        <motion.div variants={itemVariants}>
          <GlassCard>
            {trashItems.length === 0 ? (
              <GlassCardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <DeleteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    ゴミ箱は空です
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    削除した取引はここに表示されます
                  </Typography>
                </Box>
              </GlassCardContent>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>削除日時</TableCell>
                        <TableCell>取引日</TableCell>
                        <TableCell>種類</TableCell>
                        <TableCell>説明</TableCell>
                        <TableCell>カテゴリ</TableCell>
                        <TableCell>ユーザー</TableCell>
                        <TableCell align="right">金額</TableCell>
                        <TableCell>削除理由</TableCell>
                        <TableCell align="center">操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTrashItems.map((item) => (
                        <TableRow key={item.trashId} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(item.deletedAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatDate(item.date)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={item.originalType === 'expense' ? <ExpenseIcon /> : <IncomeIcon />}
                              label={item.originalType === 'expense' ? '支出' : '収入'}
                              color={item.originalType === 'expense' ? 'error' : 'success'}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={getCategoryName(item.categoryId)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getUserName(item.userId)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color={item.originalType === 'expense' ? 'error.main' : 'success.main'}
                            >
                              {formatCurrency(item.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {item.deletedReason && (
                              <Tooltip title={item.deletedReason}>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                  {item.deletedReason}
                                </Typography>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleRestore(item.trashId)}
                                title="復元"
                              >
                                <RestoreIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setConfirmDialog({ 
                                  open: true, 
                                  type: 'permanent', 
                                  item: item 
                                })}
                                title="完全削除"
                              >
                                <PermanentDeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={trashItems.length}
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
              </>
            )}
          </GlassCard>
        </motion.div>

        {/* Confirmation Dialog */}
        <Dialog 
          open={confirmDialog.open} 
          onClose={() => setConfirmDialog({ open: false, type: '', item: null })}
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            {confirmDialog.type === 'permanent' && '完全削除の確認'}
            {confirmDialog.type === 'empty' && 'ゴミ箱を空にする'}
            {confirmDialog.type === 'cleanup' && '古いアイテムの削除'}
          </DialogTitle>
          <DialogContent>
            {confirmDialog.type === 'permanent' && (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  この操作は元に戻せません。取引は完全に削除されます。
                </Alert>
                {confirmDialog.item && (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(confirmDialog.item.date)} - {confirmDialog.item.description}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(confirmDialog.item.amount)}
                    </Typography>
                  </Box>
                )}
              </>
            )}
            {confirmDialog.type === 'empty' && (
              <Alert severity="warning">
                ゴミ箱のすべてのアイテムが完全に削除されます。この操作は元に戻せません。
              </Alert>
            )}
            {confirmDialog.type === 'cleanup' && (
              <Typography>
                30日以上前に削除されたアイテムを完全削除します。この操作は元に戻せません。
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, type: '', item: null })}>
              キャンセル
            </Button>
            <Button 
              onClick={() => {
                if (confirmDialog.type === 'permanent') {
                  handlePermanentDelete(confirmDialog.item.trashId);
                } else if (confirmDialog.type === 'empty') {
                  handleEmptyTrash();
                } else if (confirmDialog.type === 'cleanup') {
                  handleCleanupOld();
                }
                setConfirmDialog({ open: false, type: '', item: null });
              }}
              variant="contained" 
              color="error"
            >
              削除実行
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
      </motion.div>
    </Container>
  );
};

export default TrashManagement;