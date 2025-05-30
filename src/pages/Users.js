import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Stack,
  Avatar,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../components/common/GlassCard';
import UserList from '../components/UserManagement/UserList';
import UserDialog from '../components/UserManagement/UserDialog';
import useUsers from '../hooks/useUsers';

const Users = () => {
  // Custom hook for user management
  const {
    users,
    loading,
    error,
    stats,
    starredUsers,
    usersByDepartment,
    usersByRole,
    addUser,
    updateUser,
    removeUser,
    toggleUserActive,
    toggleUserStarred,
    performBulkAction,
    exportUsers,
    refreshData,
    clearError,
  } = useUsers();

  // Local state for UI
  const [dialogState, setDialogState] = useState({
    open: false,
    mode: 'view', // 'view', 'create', 'edit', 'delete'
    user: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle dialog operations
  const openDialog = (mode, user = null) => {
    setDialogState({ open: true, mode, user });
  };

  const closeDialog = () => {
    setDialogState({ open: false, mode: 'view', user: null });
  };

  // Handle user operations
  const handleAddUser = () => {
    openDialog('create');
  };

  const handleEditUser = (user) => {
    openDialog('edit', user);
  };

  const handleViewUser = (user) => {
    openDialog('view', user);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    openDialog('delete', user);
  };

  // Handle dialog save operations
  const handleDialogSave = async (formData) => {
    try {
      if (dialogState.mode === 'create') {
        await addUser(formData);
        showSnackbar('ユーザーが正常に追加されました', 'success');
      } else if (dialogState.mode === 'edit') {
        await updateUser(dialogState.user.id, formData);
        showSnackbar('ユーザー情報が正常に更新されました', 'success');
      }
      closeDialog();
    } catch (error) {
      showSnackbar(error.message || '操作に失敗しました', 'error');
    }
  };

  // Handle dialog delete operation
  const handleDialogDelete = async (userId) => {
    try {
      await removeUser(userId);
      showSnackbar('ユーザーが正常に削除されました', 'success');
      closeDialog();
    } catch (error) {
      showSnackbar(error.message || '削除に失敗しました', 'error');
    }
  };

  // Handle toggle operations
  const handleToggleStarred = async (userId) => {
    try {
      await toggleUserStarred(userId);
      const user = users.find(u => u.id === userId);
      const message = user?.isStarred 
        ? 'お気に入りから削除しました' 
        : 'お気に入りに追加しました';
      showSnackbar(message, 'info');
    } catch (error) {
      showSnackbar('操作に失敗しました', 'error');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await toggleUserActive(userId);
      const user = users.find(u => u.id === userId);
      const message = user?.isActive 
        ? 'ユーザーを非アクティブ化しました' 
        : 'ユーザーをアクティブ化しました';
      showSnackbar(message, 'info');
    } catch (error) {
      showSnackbar('操作に失敗しました', 'error');
    }
  };

  // Handle bulk operations
  const handleBulkAction = async (action, userIds) => {
    try {
      await performBulkAction(action, userIds);
      let message = '';
      switch (action) {
        case 'activate':
          message = `${userIds.length}人のユーザーをアクティブ化しました`;
          break;
        case 'deactivate':
          message = `${userIds.length}人のユーザーを非アクティブ化しました`;
          break;
        case 'delete':
          message = `${userIds.length}人のユーザーを削除しました`;
          break;
        case 'export':
          const selectedUsers = users.filter(u => userIds.includes(u.id));
          exportUsers(selectedUsers);
          message = `${userIds.length}人のユーザーをエクスポートしました`;
          break;
        default:
          message = '一括操作が完了しました';
      }
      showSnackbar(message, 'success');
    } catch (error) {
      showSnackbar('一括操作に失敗しました', 'error');
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      exportUsers();
      showSnackbar('ユーザーデータをエクスポートしました', 'success');
    } catch (error) {
      showSnackbar('エクスポートに失敗しました', 'error');
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      showSnackbar(error, 'error');
      clearError();
    }
  }, [error, clearError]);

  // Calculate financial summary
  const totalExpenses = users.reduce((sum, user) => sum + (user.totalExpenses || 0), 0);
  const totalIncome = users.reduce((sum, user) => sum + (user.totalIncome || 0), 0);
  const totalTransactions = users.reduce((sum, user) => sum + (user.transactionCount || 0), 0);

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

  return (
    <Container maxWidth="xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 4,
            }}
          >
            ユーザー管理
          </Typography>
        </motion.div>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={itemVariants}>
              <GlassCard hover>
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総ユーザー数
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={itemVariants}>
              <GlassCard hover>
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                      <PersonAddIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        アクティブユーザー
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={itemVariants}>
              <GlassCard hover>
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                      <StarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {starredUsers.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        お気に入り
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={itemVariants}>
              <GlassCard hover>
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                      <ReceiptIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {totalTransactions.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総取引数
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Financial Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <GlassCard
                gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                hover
              >
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        ¥{totalIncome.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        全ユーザー総収入
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <GlassCard
                gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                hover
              >
                <GlassCardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                      <TrendingDownIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="error.main">
                        ¥{totalExpenses.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        全ユーザー総支出
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Department and Role Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <GlassCardContent>
                  <Typography variant="h6" gutterBottom>
                    部署別分布
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(usersByDepartment)
                      .sort((a, b) => b[1].length - a[1].length)
                      .slice(0, 5)
                      .map(([dept, deptUsers], index) => {
                        const percentage = users.length > 0 ? ((deptUsers.length / users.length) * 100).toFixed(1) : 0;
                        return (
                          <Box key={dept} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{dept}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {deptUsers.length}人 ({percentage}%)
                            </Typography>
                          </Box>
                        );
                      })}
                    {Object.keys(usersByDepartment).length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        他 {Object.keys(usersByDepartment).length - 5} 部署
                      </Typography>
                    )}
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <GlassCardContent>
                  <Typography variant="h6" gutterBottom>
                    役割別分布
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(usersByRole)
                      .sort((a, b) => b[1].length - a[1].length)
                      .slice(0, 5)
                      .map(([role, roleUsers], index) => {
                        const percentage = users.length > 0 ? ((roleUsers.length / users.length) * 100).toFixed(1) : 0;
                        return (
                          <Box key={role} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{role}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {roleUsers.length}人 ({percentage}%)
                            </Typography>
                          </Box>
                        );
                      })}
                    {Object.keys(usersByRole).length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        他 {Object.keys(usersByRole).length - 5} 役割
                      </Typography>
                    )}
                  </Stack>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* User List */}
        <motion.div variants={itemVariants}>
          <UserList
            users={users}
            loading={loading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onView={handleViewUser}
            onAdd={handleAddUser}
            onToggleStarred={handleToggleStarred}
            onToggleActive={handleToggleActive}
            onBulkAction={handleBulkAction}
            onRefresh={refreshData}
            onExport={handleExport}
          />
        </motion.div>

        {/* User Dialog */}
        <UserDialog
          open={dialogState.open}
          user={dialogState.user}
          mode={dialogState.mode}
          onClose={closeDialog}
          onSave={handleDialogSave}
          onDelete={handleDialogDelete}
          onEdit={handleEditUser}
          onToggleStarred={handleToggleStarred}
          onToggleActive={handleToggleActive}
          loading={loading}
        />

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={closeSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default Users;