import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent, GlassCardPresets } from '../components/common/GlassCard';
import notificationService from '../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load notifications and stats
  const loadData = async () => {
    try {
      setLoading(true);
      const [notificationsResult, statsResult] = await Promise.all([
        notificationService.getAllNotifications(),
        notificationService.getNotificationStats()
      ]);

      if (notificationsResult.success) {
        setNotifications(notificationsResult.data);
      }
      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Check for new notifications
    notificationService.autoCheckNotifications().then(() => {
      loadData(); // Reload after checking
    });
  }, []);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        await loadData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      setError('既読処理に失敗しました。');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        await loadData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError('一括既読処理に失敗しました。');
    }
  };

  // Handle delete
  const handleDelete = async (notificationId) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        await loadData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('削除に失敗しました。');
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (window.confirm('すべての通知を削除しますか？')) {
      try {
        const result = await notificationService.clearAllNotifications();
        if (result.success) {
          await loadData();
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error('Error clearing all notifications:', error);
        setError('一括削除に失敗しました。');
      }
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await notificationService.autoCheckNotifications();
    await loadData();
  };

  // Get notification icon and color
  const getNotificationInfo = (notification) => {
    switch (notification.type) {
      case 'invoice_due_soon':
        return { icon: <ScheduleIcon />, color: 'warning', bgColor: 'warning.main' };
      case 'invoice_overdue':
        return { icon: <WarningIcon />, color: 'error', bgColor: 'error.main' };
      case 'expense_approved':
        return { icon: <CheckCircleIcon />, color: 'success', bgColor: 'success.main' };
      case 'expense_rejected':
        return { icon: <WarningIcon />, color: 'error', bgColor: 'error.main' };
      case 'system':
        return { icon: <InfoIcon />, color: 'info', bgColor: 'info.main' };
      default:
        return { icon: <NotificationsIcon />, color: 'default', bgColor: 'grey.500' };
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}日前`;
    } else if (diffInHours > 0) {
      return `${diffInHours}時間前`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes}分前`;
    } else {
      return 'たった今';
    }
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
            通知センター
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            請求書期日やシステム通知を管理
          </Typography>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <GlassCard {...GlassCardPresets.info}>
                <GlassCardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Badge badgeContent={stats.unread || 0} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        総通知数
                      </Typography>
                    </Box>
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GlassCard {...GlassCardPresets.warning}>
                <GlassCardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <NotificationsActiveIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.unread || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        未読通知
                      </Typography>
                    </Box>
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GlassCard {...GlassCardPresets.error}>
                <GlassCardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <WarningIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.high || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        重要度：高
                      </Typography>
                    </Box>
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GlassCard {...GlassCardPresets.success}>
                <GlassCardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <ReceiptIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.byType?.invoice_due_soon || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        期日間近
                      </Typography>
                    </Box>
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </Grid>
          </Grid>
        </motion.div>

        {/* Notification List */}
        <motion.div variants={itemVariants}>
          <GlassCard>
            <GlassCardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon />
                  通知一覧
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    size="small"
                  >
                    更新
                  </Button>
                  {stats.unread > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<MarkEmailReadIcon />}
                      onClick={handleMarkAllAsRead}
                      size="small"
                    >
                      全て既読
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteSweepIcon />}
                      onClick={handleClearAll}
                      size="small"
                    >
                      全て削除
                    </Button>
                  )}
                </Stack>
              </Box>

              {notifications.length > 0 ? (
                <List>
                  {notifications.map((notification, index) => {
                    const notificationInfo = getNotificationInfo(notification);
                    return (
                      <React.Fragment key={notification.id}>
                        <ListItem
                          sx={{
                            backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                            borderRadius: 1,
                            mb: 1,
                            opacity: notification.isRead ? 0.7 : 1,
                          }}
                        >
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: notificationInfo.bgColor }}>
                              {notificationInfo.icon}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={notification.isRead ? 'normal' : 'bold'}
                                >
                                  {notification.title}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={notification.priority}
                                  color={getPriorityColor(notification.priority)}
                                  variant="outlined"
                                />
                                {!notification.isRead && (
                                  <Chip
                                    size="small"
                                    label="新着"
                                    color="primary"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimeAgo(notification.createdAt)}
                                  {notification.readAt && (
                                    <> • 既読: {formatTimeAgo(notification.readAt)}</>
                                  )}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              {!notification.isRead && (
                                <Tooltip title="既読にする">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    size="small"
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="削除">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(notification.id)}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < notifications.length - 1 && <Divider sx={{ my: 1 }} />}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    通知がありません
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    新しい通知が届くとここに表示されます
                  </Typography>
                </Box>
              )}
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default Notifications;