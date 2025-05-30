import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  alpha,
  Collapse,
  Avatar,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AddCircleOutline as AddIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  ChevronLeft as ChevronLeftIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;
const collapsedWidth = 80;

// Animated list item wrapper
const MotionListItem = motion(ListItem);

const menuItems = [
  { 
    text: 'ダッシュボード', 
    icon: <DashboardIcon />, 
    path: '/dashboard',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  { 
    text: '収支登録', 
    icon: <AddIcon />, 
    path: '/register',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    subItems: [
      { text: '収入登録', icon: <TrendingUpIcon />, path: '/register/income' },
      { text: '支出登録', icon: <MoneyIcon />, path: '/register/expense' },
    ],
  },
  { 
    text: '取引先・ユーザー', 
    icon: <PeopleIcon />, 
    path: '/users',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  { 
    text: 'レシート管理', 
    icon: <ReceiptIcon />, 
    path: '/receipts',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  { 
    text: '分析', 
    icon: <AnalyticsIcon />, 
    path: '/analytics',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  { 
    text: '設定', 
    icon: <SettingsIcon />, 
    path: '/settings',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },
];

const Layout = ({ children, themeMode, toggleTheme }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [selectedPath, setSelectedPath] = useState('/dashboard');
  const [expandedItems, setExpandedItems] = useState({});

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (path) => {
    setSelectedPath(path);
  };

  const handleExpandClick = (text) => {
    setExpandedItems(prev => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const sidebarVariants = {
    open: { width: drawerWidth },
    closed: { width: collapsedWidth },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ 
              mr: 2,
              color: theme.palette.text.primary,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
              component="div"
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
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            sx={{
              color: theme.palette.text.primary,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(180deg)',
              },
            }}
          >
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Avatar
            sx={{
              ml: 2,
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px 0 rgba(102, 126, 234, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 30px 0 rgba(102, 126, 234, 0.6)',
              },
            }}
          >
            A
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <motion.div
        initial={false}
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Drawer
          variant="permanent"
          sx={{
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedWidth,
              boxSizing: 'border-box',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowX: 'hidden',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2 }}>
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
                  >
                    <ListItemButton
                      selected={selectedPath === item.path}
                      onClick={() => {
                        handleMenuClick(item.path);
                        if (item.subItems) {
                          handleExpandClick(item.text);
                        }
                      }}
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
                            opacity: 0.1,
                          },
                          '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.main,
                            transform: 'scale(1.1)',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                          '&::before': {
                            opacity: 0.08,
                          },
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : 'auto',
                          justifyContent: 'center',
                          color: selectedPath === item.path ? theme.palette.primary.main : theme.palette.text.secondary,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {item.icon}
                        </motion.div>
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        sx={{ 
                          opacity: open ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        }} 
                      />
                      {item.subItems && open && (
                        <KeyboardArrowDownIcon
                          sx={{
                            transform: expandedItems[item.text] ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      )}
                    </ListItemButton>
                  </MotionListItem>

                  {/* Sub Items */}
                  {item.subItems && (
                    <Collapse in={expandedItems[item.text] && open} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.subItems.map((subItem) => (
                          <ListItemButton
                            key={subItem.text}
                            selected={selectedPath === subItem.path}
                            onClick={() => handleMenuClick(subItem.path)}
                            sx={{
                              pl: 4,
                              minHeight: 48,
                              borderRadius: 2,
                              mx: 1,
                              my: 0.25,
                              transition: 'all 0.3s ease',
                              '&.Mui-selected': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              },
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text}
                              primaryTypographyProps={{
                                fontSize: '0.875rem',
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              ))}
            </List>
          </Box>
        </Drawer>
      </motion.div>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPath}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Layout;