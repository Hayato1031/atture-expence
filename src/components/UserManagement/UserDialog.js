import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  Grid,
  Divider,
  IconButton,
  Slide,
  useTheme,
  alpha,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';
import UserForm from './UserForm';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const UserDialog = ({
  open = false,
  user = null,
  mode = 'view', // 'view', 'edit', 'create', 'delete'
  onClose,
  onSave,
  onDelete,
  onEdit,
  onToggleStarred,
  onToggleActive,
  loading = false,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [formLoading, setFormLoading] = useState(false);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (onDelete && user) {
      try {
        await onDelete(user.id);
        onClose();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      '代表取締役': 'error',
      'マネージャー': 'warning',
      'スタッフ': 'primary',
      'インターン': 'info',
      '契約社員': 'secondary',
      'パートタイム': 'success',
    };
    return colors[role] || 'default';
  };

  // Get activity status
  const getActivityStatus = (lastActivity) => {
    if (!lastActivity) return { label: '未活動', color: 'default' };
    
    const today = new Date();
    const activityDate = new Date(lastActivity);
    const diffDays = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { label: '今日', color: 'success' };
    if (diffDays <= 3) return { label: `${diffDays}日前`, color: 'info' };
    if (diffDays <= 7) return { label: `${diffDays}日前`, color: 'warning' };
    return { label: `${diffDays}日前`, color: 'error' };
  };

  // Calculate engagement score
  const calculateEngagementScore = () => {
    if (!user?.transactionCount) return 0;
    const maxTransactions = 100;
    return Math.min((user.transactionCount / maxTransactions) * 100, 100);
  };

  const activityStatus = user ? getActivityStatus(user.lastActivity) : null;
  const engagementScore = calculateEngagementScore();

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  // Render different modes
  const renderContent = () => {
    switch (mode) {
      case 'create':
      case 'edit':
        return (
          <UserForm
            user={mode === 'edit' ? user : null}
            mode={mode}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            isLoading={formLoading}
          />
        );

      case 'delete':
        return (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  backgroundColor: 'error.main',
                }}
              >
                <PersonOffIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                ユーザーを削除しますか？
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                <strong>{user?.name}</strong> を削除すると、関連するデータも失われる可能性があります。
                この操作は取り消せません。
              </Typography>

              <Alert severity="warning" sx={{ mb: 3 }}>
                このユーザーに関連する経費や収入記録がある場合、削除の代わりに非アクティブ化することをお勧めします。
              </Alert>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="outlined" onClick={onClose}>
                  キャンセル
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? '削除中...' : '削除する'}
                </Button>
              </Stack>
            </Box>
          </motion.div>
        );

      case 'view':
      default:
        return (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* User Header */}
            <motion.div variants={itemVariants}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 3,
                    border: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {user?.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      label={user?.role}
                      color={getRoleColor(user?.role)}
                      variant="outlined"
                      icon={<WorkIcon />}
                    />
                    <Chip
                      label={user?.department}
                      variant="outlined"
                      icon={<BusinessIcon />}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={user?.isActive ? 'アクティブ' : '非アクティブ'}
                      color={user?.isActive ? 'success' : 'default'}
                      size="small"
                      icon={user?.isActive ? <PersonIcon /> : <PersonOffIcon />}
                    />
                    {activityStatus && (
                      <Chip
                        label={activityStatus.label}
                        color={activityStatus.color}
                        size="small"
                        variant="outlined"
                        icon={<ScheduleIcon />}
                      />
                    )}
                    {user?.isStarred && (
                      <Chip
                        label="お気に入り"
                        color="warning"
                        size="small"
                        icon={<StarIcon />}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={() => onToggleStarred(user?.id)}
                    color={user?.isStarred ? 'warning' : 'default'}
                  >
                    {user?.isStarred ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton onClick={() => onEdit(user)} color="primary">
                    <EditIcon />
                  </IconButton>
                </Stack>
              </Box>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ mb: 3 }}
              >
                <Tab label="基本情報" icon={<PersonIcon />} />
                <Tab label="統計" icon={<AnalyticsIcon />} />
                <Tab label="活動履歴" icon={<HistoryIcon />} />
              </Tabs>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {tabValue === 0 && (
                <motion.div
                  key="basic"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Grid container spacing={3}>
                    {/* Contact Information */}
                    <Grid item xs={12} md={6}>
                      <GlassCard>
                        <GlassCardContent>
                          <Typography variant="h6" gutterBottom>
                            連絡先情報
                          </Typography>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <EmailIcon color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  メールアドレス
                                </Typography>
                                <Typography variant="body1">
                                  {user?.email}
                                </Typography>
                              </Box>
                            </Box>
                            {user?.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <PhoneIcon color="primary" />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    電話番号
                                  </Typography>
                                  <Typography variant="body1">
                                    {user.phone}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Stack>
                        </GlassCardContent>
                      </GlassCard>
                    </Grid>

                    {/* Work Information */}
                    <Grid item xs={12} md={6}>
                      <GlassCard>
                        <GlassCardContent>
                          <Typography variant="h6" gutterBottom>
                            勤務情報
                          </Typography>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <BusinessIcon color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  部署
                                </Typography>
                                <Typography variant="body1">
                                  {user?.department}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <WorkIcon color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  役割
                                </Typography>
                                <Typography variant="body1">
                                  {user?.role}
                                </Typography>
                              </Box>
                            </Box>
                            {user?.joinDate && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <ScheduleIcon color="primary" />
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    入社日
                                  </Typography>
                                  <Typography variant="body1">
                                    {user.joinDate}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Stack>
                        </GlassCardContent>
                      </GlassCard>
                    </Grid>

                    {/* Notes */}
                    {user?.notes && (
                      <Grid item xs={12}>
                        <GlassCard>
                          <GlassCardContent>
                            <Typography variant="h6" gutterBottom>
                              備考
                            </Typography>
                            <Typography variant="body1">
                              {user.notes}
                            </Typography>
                          </GlassCardContent>
                        </GlassCard>
                      </Grid>
                    )}
                  </Grid>
                </motion.div>
              )}

              {tabValue === 1 && (
                <motion.div
                  key="stats"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Grid container spacing={3}>
                    {/* Financial Summary */}
                    <Grid item xs={12} md={6}>
                      <GlassCard>
                        <GlassCardContent>
                          <Typography variant="h6" gutterBottom>
                            取引サマリー
                          </Typography>
                          <Stack spacing={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingDownIcon color="error" />
                                <Typography variant="body1">総支出</Typography>
                              </Box>
                              <Typography variant="h6" color="error.main" fontWeight="bold">
                                ¥{(user?.totalExpenses || 0).toLocaleString()}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUpIcon color="success" />
                                <Typography variant="body1">総収入</Typography>
                              </Box>
                              <Typography variant="h6" color="success.main" fontWeight="bold">
                                ¥{(user?.totalIncome || 0).toLocaleString()}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ReceiptIcon color="info" />
                                <Typography variant="body1">取引数</Typography>
                              </Box>
                              <Typography variant="h6" fontWeight="bold">
                                {user?.transactionCount || 0}
                              </Typography>
                            </Box>

                            <Divider />

                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                差額 (収入 - 支出)
                              </Typography>
                              <Typography 
                                variant="h5" 
                                fontWeight="bold"
                                color={
                                  (user?.totalIncome || 0) - (user?.totalExpenses || 0) >= 0 
                                    ? 'success.main' 
                                    : 'error.main'
                                }
                              >
                                ¥{((user?.totalIncome || 0) - (user?.totalExpenses || 0)).toLocaleString()}
                              </Typography>
                            </Box>
                          </Stack>
                        </GlassCardContent>
                      </GlassCard>
                    </Grid>

                    {/* Engagement Score */}
                    <Grid item xs={12} md={6}>
                      <GlassCard>
                        <GlassCardContent>
                          <Typography variant="h6" gutterBottom>
                            活動レベル
                          </Typography>
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h3" fontWeight="bold" color="primary.main">
                              {Math.round(engagementScore)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              エンゲージメントスコア
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={engagementScore}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background: `linear-gradient(90deg, 
                                    ${theme.palette.primary.main} 0%, 
                                    ${theme.palette.secondary.main} 100%
                                  )`,
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              取引数と最終活動日に基づいて計算
                            </Typography>
                          </Box>
                        </GlassCardContent>
                      </GlassCard>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {tabValue === 2 && (
                <motion.div
                  key="history"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <GlassCard>
                    <GlassCardContent>
                      <Typography variant="h6" gutterBottom>
                        活動履歴
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        詳細な活動履歴は今後のアップデートで追加予定です。
                      </Typography>
                    </GlassCardContent>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'create':
        return '新しいユーザーを追加';
      case 'edit':
        return 'ユーザー情報を編集';
      case 'delete':
        return 'ユーザーを削除';
      case 'view':
      default:
        return 'ユーザー詳細';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth={mode === 'view' ? 'lg' : 'md'}
      fullWidth
      PaperProps={{
        sx: {
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        },
      }}
    >
      {mode !== 'create' && mode !== 'edit' && (
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight="bold">
              {getDialogTitle()}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}

      <DialogContent sx={{ p: mode === 'create' || mode === 'edit' ? 0 : 3 }}>
        {renderContent()}
      </DialogContent>

      {mode === 'view' && (
        <DialogActions>
          <Button onClick={onClose}>閉じる</Button>
          <Button
            variant="outlined"
            onClick={() => onToggleActive(user?.id)}
            startIcon={user?.isActive ? <PersonOffIcon /> : <PersonIcon />}
          >
            {user?.isActive ? '非アクティブ化' : 'アクティブ化'}
          </Button>
          <Button
            variant="contained"
            onClick={() => onEdit(user)}
            startIcon={<EditIcon />}
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            }}
          >
            編集
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default UserDialog;