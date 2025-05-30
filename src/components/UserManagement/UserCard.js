import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  PersonOff as PersonOffIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';

const UserCard = ({
  user,
  onEdit,
  onDelete,
  onView,
  onToggleStarred,
  onToggleActive,
  showActions = true,
  compact = false,
  animationDelay = 0,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    if (onView) {
      onView(user);
    }
  };

  // Helper functions
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

  const calculateEngagementScore = () => {
    if (!user.transactionCount) return 0;
    const maxTransactions = 100; // Assume max for normalization
    return Math.min((user.transactionCount / maxTransactions) * 100, 100);
  };

  const activityStatus = getActivityStatus(user.lastActivity);
  const engagementScore = calculateEngagementScore();

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: animationDelay,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const avatarVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <GlassCard
        hover
        gradient={user.isStarred ? 'linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)' : null}
        onClick={handleCardClick}
        sx={{
          cursor: onView ? 'pointer' : 'default',
          opacity: user.isActive ? 1 : 0.7,
          transition: 'all 0.3s ease',
          height: compact ? 'auto' : 'auto',
          minHeight: compact ? 'auto' : 380,
        }}
      >
        <GlassCardContent>
          {/* Header with Avatar and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                user.isStarred ? (
                  <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                ) : null
              }
            >
              <motion.div variants={avatarVariants}>
                <Avatar
                  src={user.avatar}
                  sx={{ 
                    width: compact ? 48 : 64, 
                    height: compact ? 48 : 64,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>
              </motion.div>
            </Badge>
            
            <Box sx={{ ml: 2, flex: 1 }}>
              <Tooltip title={user.name}>
                <Typography 
                  variant={compact ? "body1" : "h6"} 
                  fontWeight="bold" 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px'
                  }}
                >
                  {user.name}
                </Typography>
              </Tooltip>
              <Tooltip title={user.email}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px'
                  }}
                >
                  {user.email}
                </Typography>
              </Tooltip>
            </Box>

            {showActions && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title={user.isStarred ? 'お気に入りから削除' : 'お気に入りに追加'}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStarred(user.id);
                    }}
                    color={user.isStarred ? 'warning' : 'default'}
                  >
                    {user.isStarred ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Tooltip>
                
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Role and Department */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label={user.role}
              color={getRoleColor(user.role)}
              size="small"
              variant="outlined"
              icon={<WorkIcon />}
            />
            <Chip
              label={user.department}
              size="small"
              variant="outlined"
              icon={<BusinessIcon />}
            />
          </Stack>

          {/* Status and Activity */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label={user.isActive ? 'アクティブ' : '非アクティブ'}
              color={user.isActive ? 'success' : 'default'}
              size="small"
              icon={user.isActive ? <PersonIcon /> : <PersonOffIcon />}
            />
            <Chip
              label={activityStatus.label}
              color={activityStatus.color}
              size="small"
              variant="outlined"
              icon={<ScheduleIcon />}
            />
          </Stack>

          {!compact && (
            <>
              {/* Contact Information */}
              <Box sx={{ mb: 2 }}>
                <Stack spacing={1}>
                  {user.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Tooltip title={user.email}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '200px'
                        }}
                      >
                        {user.email}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Stack>
              </Box>

              {/* Financial Summary */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  取引サマリー
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                      <Typography variant="caption">支出</Typography>
                    </Box>
                    <Typography variant="caption" color="error.main" fontWeight="bold">
                      ¥{(user.totalExpenses || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="caption">収入</Typography>
                    </Box>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      ¥{(user.totalIncome || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ReceiptIcon sx={{ fontSize: 16, color: 'info.main' }} />
                      <Typography variant="caption">取引数</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight="bold">
                      {user.transactionCount || 0}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Engagement Score */}
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  活動レベル
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={engagementScore}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: `linear-gradient(90deg, 
                          ${theme.palette.primary.main} 0%, 
                          ${theme.palette.secondary.main} 100%
                        )`,
                      },
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {Math.round(engagementScore)}%
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {/* Notes Preview (if not compact) */}
          {!compact && user.notes && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Tooltip title={user.notes}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block'
                  }}
                >
                  {user.notes}
                </Typography>
              </Tooltip>
            </Box>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); onView(user); }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>詳細を表示</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { handleMenuClose(); onEdit(user); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>編集</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            onToggleActive(user.id); 
          }}
        >
          <ListItemIcon>
            {user.isActive ? <PersonOffIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {user.isActive ? '非アクティブ化' : 'アクティブ化'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => { handleMenuClose(); onDelete(user.id); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>削除</ListItemText>
        </MenuItem>
      </Menu>
    </motion.div>
  );
};

export default UserCard;