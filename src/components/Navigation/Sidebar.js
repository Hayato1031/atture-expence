import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Typography,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  KeyboardArrowRight as ExpandLessIcon,
  AccountBalance as AccountBalanceIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Receipt as TransactionIcon,
  Delete as TrashIcon,
  Receipt as ReceiptIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;
const collapsedWidth = 80;

// Animated list item wrapper
const MotionListItem = motion(ListItem);
const MotionListItemButton = motion(ListItemButton);

const menuItems = [
  {
    text: 'ダッシュボード',
    icon: <DashboardIcon />,
    path: '/',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: '収支概要とグラフ',
  },
  {
    text: '収支登録',
    icon: <AddIcon />,
    path: '/registration',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: '経費・収入の登録',
    subItems: [
      {
        text: '支出登録',
        icon: <TrendingDownIcon />,
        path: '/registration?tab=expense',
        description: '経費の登録',
      },
      {
        text: '収入登録',
        icon: <TrendingUpIcon />,
        path: '/registration?tab=income',
        description: '収入の登録',
      },
    ],
  },
  {
    text: '取引履歴',
    icon: <TransactionIcon />,
    path: '/transactions',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    description: '収支の一覧と検索',
  },
  {
    text: 'ユーザー管理',
    icon: <PeopleIcon />,
    path: '/users',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: '関係者の管理',
  },
  {
    text: '分析・レポート',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    description: 'データ分析と可視化',
  },
  {
    text: '請求書管理',
    icon: <ReceiptIcon />,
    path: '/invoices',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    description: '請求書の作成・管理',
  },
  {
    text: '通知',
    icon: <NotificationsIcon />,
    path: '/notifications',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    description: '期日通知とお知らせ',
  },
  {
    text: 'ゴミ箱',
    icon: <TrashIcon />,
    path: '/trash',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    description: '削除したデータの管理',
  },
  {
    text: '設定',
    icon: <SettingsIcon />,
    path: '/settings',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    description: 'アプリケーション設定',
  },
];

const Sidebar = ({ open, onToggle, themeMode, onToggleTheme }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const handleMenuClick = (path, hasSubItems = false, itemText = '') => {
    if (hasSubItems && open) {
      // Only expand/collapse when sidebar is open
      setExpandedItems(prev => ({
        ...prev,
        [itemText]: !prev[itemText],
      }));
    } else {
      navigate(path);
    }
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const sidebarVariants = {
    open: {
      width: drawerWidth,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    closed: {
      width: collapsedWidth,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const listItemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
    hover: {
      x: 8,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const iconVariants = {
    rest: { rotate: 0 },
    hover: { rotate: 360, transition: { duration: 0.5 } },
  };

  const expandIconVariants = {
    collapsed: { rotate: 0 },
    expanded: { rotate: 90 },
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
            display: { md: 'none' },
          }}
          onClick={onToggle}
        />
      )}

      <motion.div
        initial={false}
        animate={open ? 'open' : 'closed'}
        variants={sidebarVariants}
        style={{ zIndex: 1300 }}
      >
        <Drawer
          variant="permanent"
          sx={{
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedWidth,
              boxSizing: 'border-box',
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowX: 'hidden',
              overflowY: 'auto',
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              boxShadow: open
                ? '8px 0 32px rgba(0, 0, 0, 0.12)'
                : '4px 0 16px rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              minHeight: 64,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <AccountBalanceIcon
                      sx={{
                        fontSize: 32,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    />
                  </motion.div>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    ExpenceAtture
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>

            <IconButton
              onClick={onToggle}
              sx={{
                color: theme.palette.text.primary,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
            <List>
              {menuItems.map((item, index) => (
                <Box key={item.text}>
                  <MotionListItem
                    disablePadding
                    sx={{ display: 'block' }}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={listItemVariants}
                    whileHover="hover"
                  >
                    <Tooltip
                      title={!open ? item.description : ''}
                      placement="right"
                      arrow
                    >
                      <MotionListItemButton
                        selected={isActivePath(item.path)}
                        onClick={() =>
                          handleMenuClick(item.path, !!item.subItems, item.text)
                        }
                        sx={{
                          minHeight: 56,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          mx: 1,
                          my: 0.5,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: item.gradient,
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'transparent',
                            '&::before': {
                              opacity: 0.12,
                            },
                            '& .MuiListItemIcon-root': {
                              color: theme.palette.primary.main,
                              transform: 'scale(1.1)',
                            },
                            '& .MuiListItemText-primary': {
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                            },
                          },
                          '&:hover': {
                            backgroundColor: 'transparent',
                            '&::before': {
                              opacity: 0.08,
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: isActivePath(item.path)
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <motion.div
                            variants={iconVariants}
                            initial="rest"
                            whileHover="hover"
                          >
                            {item.icon}
                          </motion.div>
                        </ListItemIcon>

                        <ListItemText
                          primary={item.text}
                          secondary={open ? item.description : ''}
                          sx={{
                            opacity: open ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            '& .MuiListItemText-primary': {
                              fontSize: '0.95rem',
                              fontWeight: isActivePath(item.path) ? 600 : 500,
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: '0.75rem',
                              opacity: 0.7,
                            },
                          }}
                        />

                        {item.subItems && open && (
                          <motion.div
                            variants={expandIconVariants}
                            animate={
                              expandedItems[item.text] ? 'expanded' : 'collapsed'
                            }
                            transition={{ duration: 0.2 }}
                          >
                            <ExpandLessIcon
                              sx={{
                                color: theme.palette.text.secondary,
                              }}
                            />
                          </motion.div>
                        )}

                        {/* Active indicator */}
                        {isActivePath(item.path) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              position: 'absolute',
                              right: 8,
                              width: 4,
                              height: 32,
                              background: item.gradient,
                              borderRadius: 2,
                            }}
                          />
                        )}
                      </MotionListItemButton>
                    </Tooltip>
                  </MotionListItem>

                  {/* Sub Items */}
                  {item.subItems && (
                    <AnimatePresence>
                      {expandedItems[item.text] && open && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Collapse in={true} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {item.subItems.map((subItem, subIndex) => (
                                <motion.div
                                  key={subItem.text}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: subIndex * 0.1,
                                    duration: 0.3,
                                  }}
                                >
                                  <ListItemButton
                                    selected={isActivePath(subItem.path)}
                                    onClick={() => handleMenuClick(subItem.path)}
                                    sx={{
                                      pl: 4,
                                      minHeight: 48,
                                      borderRadius: 2,
                                      mx: 1,
                                      my: 0.25,
                                      transition: 'all 0.3s ease',
                                      '&.Mui-selected': {
                                        backgroundColor: alpha(
                                          theme.palette.primary.main,
                                          0.08
                                        ),
                                        '& .MuiListItemIcon-root': {
                                          color: theme.palette.primary.main,
                                        },
                                        '& .MuiListItemText-primary': {
                                          color: theme.palette.primary.main,
                                          fontWeight: 600,
                                        },
                                      },
                                      '&:hover': {
                                        backgroundColor: alpha(
                                          theme.palette.primary.main,
                                          0.04
                                        ),
                                        transform: 'translateX(4px)',
                                      },
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        {subItem.icon}
                                      </motion.div>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={subItem.text}
                                      secondary={subItem.description}
                                      primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                      }}
                                      secondaryTypographyProps={{
                                        fontSize: '0.75rem',
                                      }}
                                    />
                                  </ListItemButton>
                                </motion.div>
                              ))}
                            </List>
                          </Collapse>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </Box>
              ))}
            </List>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              p: 2,
            }}
          >
            {/* Theme Toggle */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: open ? 'space-between' : 'center',
                mb: 2,
              }}
            >
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      テーマ
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>

              <Tooltip title={`${themeMode === 'dark' ? 'ライト' : 'ダーク'}モードに切替`} placement="top">
                <IconButton
                  onClick={onToggleTheme}
                  sx={{
                    color: theme.palette.text.primary,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(180deg)',
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* User Profile */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  background: alpha(theme.palette.primary.main, 0.08),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  A
                </Avatar>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{ marginLeft: 12, overflow: 'hidden' }}
                    >
                      <Typography variant="body2" fontWeight={600} noWrap>
                        管理者
                      </Typography>
                      <Chip
                        label="オンライン"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>
          </Box>
        </Drawer>
      </motion.div>
    </>
  );
};

export default Sidebar;