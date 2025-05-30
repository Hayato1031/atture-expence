import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Grid,
  Alert,
  Divider,
  Card,
  CardContent,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  Tooltip,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';
import categoryService from '../../services/categoryService';

const CategorySettings = ({ settings, updateSetting, hasChanges, isModified }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense',
    color: '#6366f1',
    icon: 'category',
    parentId: null,
    isActive: true
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [error, setError] = useState(null);

  // Available icons for categories
  const availableIcons = useMemo(() => [
    { name: 'category', icon: '📁', label: 'フォルダ' },
    { name: 'transport', icon: '🚗', label: '交通' },
    { name: 'food', icon: '🍽️', label: '食事' },
    { name: 'shopping', icon: '🛒', label: '買い物' },
    { name: 'entertainment', icon: '🎬', label: '娯楽' },
    { name: 'utilities', icon: '⚡', label: '光熱費' },
    { name: 'health', icon: '🏥', label: '医療' },
    { name: 'education', icon: '📚', label: '教育' },
    { name: 'work', icon: '💼', label: '仕事' },
    { name: 'home', icon: '🏠', label: '住居' },
    { name: 'travel', icon: '✈️', label: '旅行' },
    { name: 'gift', icon: '🎁', label: 'ギフト' },
    { name: 'investment', icon: '📈', label: '投資' },
    { name: 'salary', icon: '💰', label: '給与' },
    { name: 'bonus', icon: '🎉', label: 'ボーナス' },
    { name: 'freelance', icon: '💻', label: 'フリーランス' }
  ], []);

  // Category presets for import
  const categoryPresets = useMemo(() => ({
    taxAccounting: {
      name: '税務会計カテゴリ',
      categories: [
        // Income categories
        { name: '売上高', type: 'income', color: '#4CAF50', icon: 'salary', parentId: null },
        { name: '受取手数料', type: 'income', color: '#2196F3', icon: 'work', parentId: null },
        { name: '受取利息', type: 'income', color: '#00BCD4', icon: 'investment', parentId: null },
        { name: '雑収入', type: 'income', color: '#795548', icon: 'category', parentId: null },
        
        // Expense parent categories and their children
        { name: '人件費', type: 'expense', color: '#F44336', icon: 'category', parentId: null },
        { name: '給与手当', type: 'expense', color: '#F44336', icon: 'salary', parentId: '人件費' },
        { name: '法定福利費', type: 'expense', color: '#F44336', icon: 'health', parentId: '人件費' },
        
        { name: '売上原価', type: 'expense', color: '#E91E63', icon: 'category', parentId: null },
        { name: '仕入高', type: 'expense', color: '#E91E63', icon: 'shopping', parentId: '売上原価' },
        { name: '外注費', type: 'expense', color: '#E91E63', icon: 'work', parentId: '売上原価' },
        
        { name: '一般管理費', type: 'expense', color: '#3F51B5', icon: 'category', parentId: null },
        { name: '通信費', type: 'expense', color: '#3F51B5', icon: 'utilities', parentId: '一般管理費' },
        { name: '旅費交通費', type: 'expense', color: '#3F51B5', icon: 'transport', parentId: '一般管理費' },
        { name: '会議費', type: 'expense', color: '#3F51B5', icon: 'work', parentId: '一般管理費' },
        { name: '消耗品費', type: 'expense', color: '#3F51B5', icon: 'shopping', parentId: '一般管理費' }
      ]
    },
    personal: {
      name: '個人用',
      categories: [
        { name: '食費', type: 'expense', color: '#f59e0b', icon: 'food' },
        { name: '交通費', type: 'expense', color: '#3b82f6', icon: 'transport' },
        { name: '娯楽費', type: 'expense', color: '#ec4899', icon: 'entertainment' },
        { name: '光熱費', type: 'expense', color: '#eab308', icon: 'utilities' },
        { name: '医療費', type: 'expense', color: '#ef4444', icon: 'health' },
        { name: '教育費', type: 'expense', color: '#8b5cf6', icon: 'education' },
        { name: '給与', type: 'income', color: '#22c55e', icon: 'salary' },
        { name: 'ボーナス', type: 'income', color: '#10b981', icon: 'bonus' }
      ]
    }
  }), []);

  // Load categories from database
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await categoryService.getAllCategories();
      const categoriesData = result.success ? result.data : [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('カテゴリの読み込みに失敗しました');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save category
  const saveCategory = useCallback(async () => {
    try {
      if (!categoryForm.name.trim()) {
        setError('カテゴリ名を入力してください');
        return;
      }

      if (selectedCategory) {
        // Update existing category
        await categoryService.updateCategory(selectedCategory.id, categoryForm);
      } else {
        // Create new category
        await categoryService.createCategory(categoryForm);
      }

      await loadCategories();
      setOpenDialog('');
      setSelectedCategory(null);
      setCategoryForm({
        name: '',
        type: 'expense',
        color: '#6366f1',
        icon: 'category',
        parentId: null,
        isActive: true
      });
      setError(null);
    } catch (err) {
      console.error('Failed to save category:', err);
      setError('カテゴリの保存に失敗しました');
    }
  }, [categoryForm, selectedCategory, loadCategories]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId) => {
    try {
      await categoryService.deleteCategory(categoryId);
      await loadCategories();
      setError(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('カテゴリの削除に失敗しました');
    }
  }, [loadCategories]);

  // Open edit dialog
  const openEditDialog = useCallback((category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon || 'category',
      parentId: category.parentId || null,
      isActive: category.isActive !== false
    });
    setOpenDialog('edit');
  }, []);

  // Open add dialog
  const openAddDialog = useCallback((parentId = null) => {
    setSelectedCategory(null);
    setCategoryForm({
      name: '',
      type: 'expense',
      color: '#6366f1',
      icon: 'category',
      parentId,
      isActive: true
    });
    setOpenDialog('add');
  }, []);

  // Toggle category expansion
  const toggleCategoryExpansion = useCallback((categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Export categories
  const exportCategories = useCallback(() => {
    const exportData = {
      exported_at: new Date().toISOString(),
      version: '1.0',
      categories: categories
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `categories_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [categories]);

  // Import categories
  const importCategories = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (!importData.categories || !Array.isArray(importData.categories)) {
          throw new Error('Invalid file format');
        }

        for (const category of importData.categories) {
          const { id, createdAt, updatedAt, ...categoryData } = category;
          await categoryService.createCategory(categoryData);
        }

        await loadCategories();
        setError(null);
        alert('カテゴリのインポートが完了しました');
      } catch (err) {
        console.error('Failed to import categories:', err);
        setError('カテゴリのインポートに失敗しました');
      }
    };
    reader.readAsText(file);
  }, [loadCategories]);

  // Import preset categories
  const importPreset = useCallback(async (presetKey) => {
    try {
      const preset = categoryPresets[presetKey];
      const parentIdMap = {}; // Map parent names to their IDs
      
      // First, create all parent categories
      for (const category of preset.categories) {
        if (!category.parentId) {
          const result = await categoryService.createCategory(category);
          if (result.success) {
            parentIdMap[category.name] = result.data.id;
          }
        }
      }
      
      // Then, create child categories with correct parent IDs
      for (const category of preset.categories) {
        if (category.parentId) {
          const parentId = parentIdMap[category.parentId];
          if (parentId) {
            await categoryService.createCategory({
              ...category,
              parentId: parentId
            });
          }
        }
      }

      await loadCategories();
      setMenuAnchor(null);
      setError(null);
      alert(`${preset.name}カテゴリをインポートしました`);
    } catch (err) {
      console.error('Failed to import preset:', err);
      setError('プリセットのインポートに失敗しました');
    }
  }, [loadCategories, categoryPresets]);

  // Get icon for category
  const getIconForCategory = useCallback((iconName) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : '📁';
  }, [availableIcons]);

  // Organize categories into hierarchy
  const organizeCategories = useCallback((categoriesList) => {
    if (!Array.isArray(categoriesList)) {
      return [];
    }
    const parentCategories = categoriesList.filter(cat => !cat.parentId);
    const childCategories = categoriesList.filter(cat => cat.parentId);
    
    return parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parentId === parent.id)
    }));
  }, []);

  // Render category item
  const renderCategoryItem = useCallback((category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    
    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <ListItem
          sx={{
            pl: 2 + level * 2,
            borderRadius: 1,
            mb: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={() => toggleCategoryExpansion(category.id)}
                >
                  {isExpanded ? <FolderOpenIcon /> : <FolderIcon />}
                </IconButton>
              )}
              <Box sx={{ fontSize: '1.2rem' }}>
                {getIconForCategory(category.icon)}
              </Box>
            </Stack>
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">{category.name}</Typography>
                <Chip
                  size="small"
                  label={category.type === 'income' ? '収入' : '支出'}
                  sx={{
                    backgroundColor: category.color,
                    color: 'white',
                    minWidth: 60
                  }}
                />
                {!category.isActive && (
                  <Chip
                    size="small"
                    label="無効"
                    color="default"
                    variant="outlined"
                  />
                )}
              </Box>
            }
            secondary={hasChildren ? `${category.children.length}個のサブカテゴリ` : null}
          />
          
          <ListItemSecondaryAction>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="サブカテゴリを追加">
                <IconButton
                  size="small"
                  onClick={() => openAddDialog(category.id)}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="編集">
                <IconButton
                  size="small"
                  onClick={() => openEditDialog(category)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="削除">
                <IconButton
                  size="small"
                  onClick={() => deleteCategory(category.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItemSecondaryAction>
        </ListItem>
        
        {/* Render children */}
        {hasChildren && isExpanded && (
          <AnimatePresence>
            {category.children.map(child => renderCategoryItem(child, level + 1))}
          </AnimatePresence>
        )}
      </motion.div>
    );
  }, [expandedCategories, openAddDialog, openEditDialog, deleteCategory, toggleCategoryExpansion, getIconForCategory]);

  // Initialize
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const organizedCategories = organizeCategories(categories);

  return (
    <GlassCard>
      <GlassCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            カテゴリ管理
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={loadCategories}
            >
              更新
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportCategories}
            >
              エクスポート
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MoreVertIcon />}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              インポート
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => openAddDialog()}
            >
              追加
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Category Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {categories.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  総カテゴリ数
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error">
                  {categories.filter(cat => cat.type === 'expense').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  支出カテゴリ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success">
                  {categories.filter(cat => cat.type === 'income').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  収入カテゴリ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning">
                  {categories.filter(cat => cat.parentId).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  サブカテゴリ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Categories List */}
        {loading ? (
          <Typography>読み込み中...</Typography>
        ) : (
          <List dense>
            <AnimatePresence>
              {organizedCategories.map(category => renderCategoryItem(category))}
            </AnimatePresence>
          </List>
        )}

        {/* Import Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuList dense>
            <MenuItemComponent>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                id="import-file"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    importCategories(e.target.files[0]);
                    setMenuAnchor(null);
                  }
                }}
              />
              <label htmlFor="import-file" style={{ cursor: 'pointer', width: '100%' }}>
                <UploadIcon sx={{ mr: 1 }} />
                ファイルからインポート
              </label>
            </MenuItemComponent>
            <Divider />
            {Object.entries(categoryPresets).map(([key, preset]) => (
              <MenuItemComponent key={key} onClick={() => importPreset(key)}>
                <CategoryIcon sx={{ mr: 1 }} />
                {preset.name}
              </MenuItemComponent>
            ))}
          </MenuList>
        </Menu>

        {/* Add/Edit Category Dialog */}
        <Dialog 
          open={openDialog === 'add' || openDialog === 'edit'} 
          onClose={() => setOpenDialog('')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {openDialog === 'edit' ? 'カテゴリを編集' : 'カテゴリを追加'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="カテゴリ名"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
              
              <FormControl fullWidth>
                <InputLabel>タイプ</InputLabel>
                <Select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, type: e.target.value }))}
                  label="タイプ"
                >
                  <MenuItem value="expense">支出</MenuItem>
                  <MenuItem value="income">収入</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>親カテゴリ</InputLabel>
                <Select
                  value={categoryForm.parentId || ''}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, parentId: e.target.value || null }))}
                  label="親カテゴリ"
                >
                  <MenuItem value="">なし（ルートカテゴリ）</MenuItem>
                  {categories
                    .filter(cat => !cat.parentId && cat.id !== selectedCategory?.id)
                    .map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                label="カラー"
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>アイコン</InputLabel>
                <Select
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                  label="アイコン"
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {getIconForCategory(value)}
                      </span>
                      {availableIcons.find(icon => icon.name === value)?.label}
                    </Box>
                  )}
                >
                  {availableIcons.map(icon => (
                    <MenuItem key={icon.name} value={icon.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.2rem' }}>{icon.icon}</span>
                        {icon.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')} startIcon={<CancelIcon />}>
              キャンセル
            </Button>
            <Button onClick={saveCategory} variant="contained" startIcon={<SaveIcon />}>
              {openDialog === 'edit' ? '更新' : '追加'}
            </Button>
          </DialogActions>
        </Dialog>
      </GlassCardContent>
    </GlassCard>
  );
};

export default CategorySettings;