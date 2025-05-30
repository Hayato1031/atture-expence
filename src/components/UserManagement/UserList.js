import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
  Fab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  ViewComfy as ViewComfyIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';
import UserCard from './UserCard';

const SORT_OPTIONS = [
  { value: 'name', label: '名前順' },
  { value: 'role', label: '役割順' },
  { value: 'department', label: '部署順' },
  { value: 'lastActivity', label: '最終活動順' },
  { value: 'transactionCount', label: '取引数順' },
  { value: 'totalExpenses', label: '支出額順' },
  { value: 'totalIncome', label: '収入額順' },
  { value: 'joinDate', label: '入社日順' },
];

const VIEW_MODES = [
  { value: 'grid', icon: ViewModuleIcon, label: 'グリッド表示' },
  { value: 'list', icon: ViewListIcon, label: 'リスト表示' },
  { value: 'compact', icon: ViewComfyIcon, label: 'コンパクト表示' },
];

const UserList = ({
  users = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onToggleStarred,
  onToggleActive,
  onBulkAction,
  onRefresh,
  onExport,
  showAddButton = true,
  showBulkActions = true,
  initialViewMode = 'grid',
}) => {
  const theme = useTheme();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);

  // Get unique values for filters
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(users.map(user => user.role))].filter(Boolean);
    return roles.sort();
  }, [users]);

  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(users.map(user => user.department))].filter(Boolean);
    return departments.sort();
  }, [users]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.notes && user.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && user.isActive) ||
        (filterStatus === 'inactive' && !user.isActive);
      const matchesStarred = !onlyStarred || user.isStarred;

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesStarred;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === 'lastActivity' || sortBy === 'joinDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (typeof aValue === 'number') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, sortBy, sortOrder, filterRole, filterDepartment, filterStatus, onlyStarred]);

  // Handle user selection
  const handleSelectUser = (userId, selected) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAndSortedUsers.map(user => user.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedUsers.length > 0) {
      onBulkAction(action, selectedUsers);
      setSelectedUsers([]);
    }
    setBulkMenuAnchor(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterDepartment('all');
    setFilterStatus('all');
    setOnlyStarred(false);
    setSortBy('name');
    setSortOrder('asc');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <Box>
      {/* Search and Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <GlassCardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="ユーザーを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            {/* Filters */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>役割</InputLabel>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  label="役割"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  {uniqueRoles.map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>部署</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="部署"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  {uniqueDepartments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="ステータス"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="active">アクティブ</MenuItem>
                  <MenuItem value="inactive">非アクティブ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={onlyStarred}
                      onChange={(e) => setOnlyStarred(e.target.checked)}
                      size="small"
                    />
                  }
                  label="お気に入りのみ"
                />
              </Stack>
            </Grid>
          </Grid>

          {/* Controls Row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            sx={{ mt: 2 }}
          >
            {/* Sort and View Controls */}
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>並び順</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="並び順"
                >
                  {SORT_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <ToggleButtonGroup
                value={sortOrder}
                exclusive
                onChange={(e, value) => value && setSortOrder(value)}
                size="small"
              >
                <ToggleButton value="asc">昇順</ToggleButton>
                <ToggleButton value="desc">降順</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, value) => value && setViewMode(value)}
                size="small"
              >
                {VIEW_MODES.map(mode => (
                  <ToggleButton key={mode.value} value={mode.value}>
                    <Tooltip title={mode.label}>
                      <mode.icon />
                    </Tooltip>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
              >
                フィルターをクリア
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={onRefresh}
                startIcon={<RefreshIcon />}
              >
                更新
              </Button>

              {onExport && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onExport}
                  startIcon={<DownloadIcon />}
                >
                  エクスポート
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Results Info */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredAndSortedUsers.length} 人のユーザーが見つかりました
            </Typography>

            {/* Bulk Actions */}
            {showBulkActions && selectedUsers.length > 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${selectedUsers.length}人を選択中`}
                  color="primary"
                  variant="outlined"
                  onDelete={() => setSelectedUsers([])}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                  startIcon={<MoreVertIcon />}
                >
                  一括操作
                </Button>
              </Stack>
            )}
          </Box>
        </GlassCardContent>
      </GlassCard>

      {/* User List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <GlassCard>
            <GlassCardContent>
              <Typography variant="body1" textAlign="center" color="text.secondary">
                ユーザーを読み込み中...
              </Typography>
            </GlassCardContent>
          </GlassCard>
        ) : filteredAndSortedUsers.length === 0 ? (
          <GlassCard>
            <GlassCardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  ユーザーが見つかりませんでした
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  検索条件を変更するか、新しいユーザーを追加してください
                </Typography>
                {showAddButton && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={onAdd}
                    sx={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    }}
                  >
                    ユーザーを追加
                  </Button>
                )}
              </Box>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <Grid container spacing={viewMode === 'compact' ? 2 : 3}>
            {/* Select All Option */}
            {showBulkActions && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUsers.length === filteredAndSortedUsers.length}
                      indeterminate={
                        selectedUsers.length > 0 && 
                        selectedUsers.length < filteredAndSortedUsers.length
                      }
                      onChange={handleSelectAll}
                    />
                  }
                  label={`すべて選択 (${filteredAndSortedUsers.length}人)`}
                />
              </Grid>
            )}

            <AnimatePresence>
              {filteredAndSortedUsers.map((user, index) => (
                <Grid
                  item
                  xs={12}
                  sm={viewMode === 'list' ? 12 : viewMode === 'compact' ? 6 : 6}
                  md={viewMode === 'list' ? 12 : viewMode === 'compact' ? 6 : 6}
                  lg={viewMode === 'list' ? 12 : viewMode === 'compact' ? 4 : 4}
                  key={user.id}
                >
                  <motion.div variants={itemVariants}>
                    <Box sx={{ position: 'relative' }}>
                      {/* Selection Checkbox */}
                      {showBulkActions && (
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 1,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            },
                          }}
                        />
                      )}

                      <UserCard
                        user={user}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onView={onView}
                        onToggleStarred={onToggleStarred}
                        onToggleActive={onToggleActive}
                        compact={viewMode === 'compact'}
                        animationDelay={index * 0.05}
                      />
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </motion.div>

      {/* Add User FAB */}
      {showAddButton && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            '&:hover': {
              opacity: 0.9,
            },
          }}
          onClick={onAdd}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
        PaperProps={{
          sx: {
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <MenuItem onClick={() => handleBulkAction('activate')}>
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>アクティブ化</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleBulkAction('deactivate')}>
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>非アクティブ化</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleBulkAction('export')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>エクスポート</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => handleBulkAction('delete')}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <ClearIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>削除</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserList;