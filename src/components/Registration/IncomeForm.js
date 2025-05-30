import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CategorySuggestion from './CategorySuggestion';
import FileUpload from './FileUpload';
import OCRButton from './OCRButton';
import categoryService from '../../services/categoryService';
import userService from '../../services/userService';
import { learnFromSelection } from '../../services/aiService';

const IncomeForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    categoryId: '',
    userId: '',
    tags: [],
    memo: '',
    isRecurring: false,
    files: [],
  });

  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  // Load categories and users on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [categoriesResult, usersResult] = await Promise.all([
          categoryService.getAllCategories(),
          userService.getAllUsers()
        ]);
        
        if (categoriesResult.success) {
          const incomeCategories = categoriesResult.data.filter(cat => cat.type === 'income');
          setCategories(incomeCategories);
          
          // Organize categories into hierarchy
          const parentCategories = incomeCategories.filter(cat => !cat.parentId);
          const hierarchy = parentCategories.map(parent => ({
            ...parent,
            children: incomeCategories.filter(child => child.parentId === parent.id)
          }));
          setCategoryHierarchy(hierarchy);
        }
        
        if (usersResult.success) {
          setUsers(usersResult.data);
        }
        
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Show AI suggestion when description changes
    if (name === 'description' && value.length > 3) {
      setShowAiSuggestion(true);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryId
    }));
    setShowAiSuggestion(false);
    if (errors.categoryId) {
      setErrors(prev => ({ ...prev, categoryId: '' }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  // Handle OCR data extraction
  const handleOCRData = (ocrData) => {
    setFormData(prev => ({
      ...prev,
      amount: ocrData.amount ? ocrData.amount.toString() : prev.amount,
      date: ocrData.date || prev.date,
      description: ocrData.vendor || prev.description,
    }));

    // Try to find matching category
    if (ocrData.category) {
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(ocrData.category.toLowerCase())
      );
      if (matchingCategory) {
        setFormData(prev => ({ ...prev, categoryId: matchingCategory.id }));
      }
    }

    // Add items as tags if found
    if (ocrData.items && ocrData.items.length > 0) {
      const itemTags = ocrData.items.slice(0, 3).map(item => item.name);
      setFormData(prev => ({ ...prev, tags: [...prev.tags, ...itemTags] }));
    }

    setErrors({ success: 'レシートのデータを適用しました。内容を確認してください。' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '有効な金額を入力してください';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '説明を入力してください';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'カテゴリを選択してください';
    }
    
    if (!formData.userId) {
      newErrors.userId = 'ユーザーを選択してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Learn from user's category selection
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
      if (selectedCategory) {
        learnFromSelection(formData.description, selectedCategory.name, 'income');
      }

      // Submit the data to parent component
      await onSubmit({
        type: 'income',
        ...formData,
        amount: parseFloat(formData.amount),
        fileIds: formData.files.map(f => f.id)
      });
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        categoryId: '',
        userId: '',
        tags: [],
        memo: '',
        isRecurring: false,
        files: [],
      });
      
      setShowAiSuggestion(false);
      
    } catch (error) {
      console.error('Error submitting income:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        {/* OCR Button Row */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <OCRButton onDataExtracted={handleOCRData} />
        </Box>
        
        <Stack spacing={3}>
          {/* Date and Amount Row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="日付"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="金額"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">円</InputAdornment>,
              }}
            />
          </Stack>

          {/* Description */}
          <TextField
            label="説明"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            required
            multiline
            rows={2}
            error={!!errors.description}
            helperText={errors.description || "4文字以上入力するとAIがカテゴリを提案します"}
            placeholder="収入の詳細を入力してください（例：給与、副業収入、配当金）..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* AI Category Suggestion */}
          <AnimatePresence>
            {showAiSuggestion && formData.description.length > 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CategorySuggestion
                  description={formData.description}
                  type="income"
                  onCategorySelect={handleCategorySelect}
                  availableCategories={categories}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category and User Selection */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth required error={!!errors.categoryId}>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                label="カテゴリ"
                onChange={handleInputChange}
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon />
                  </InputAdornment>
                }
              >
                {categoryHierarchy.map((parentCategory) => [
                  // Parent category (disabled, just for grouping)
                  <MenuItem key={`parent-${parentCategory.id}`} disabled sx={{ fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: parentCategory.color || '#10b981',
                        }}
                      />
                      {parentCategory.name}
                    </Box>
                  </MenuItem>,
                  // Child categories
                  ...(parentCategory.children && parentCategory.children.length > 0 ? 
                    parentCategory.children.map((childCategory) => (
                      <MenuItem key={childCategory.id} value={childCategory.id} sx={{ pl: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: childCategory.color || parentCategory.color || '#10b981',
                            }}
                          />
                          {childCategory.name}
                        </Box>
                      </MenuItem>
                    )) : 
                    // If parent has no children, make it selectable
                    [<MenuItem key={parentCategory.id} value={parentCategory.id} sx={{ pl: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: parentCategory.color || '#10b981',
                          }}
                        />
                        {parentCategory.name}
                      </Box>
                    </MenuItem>]
                  ),
                ]).flat()}
              </Select>
              {errors.categoryId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.categoryId}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth required error={!!errors.userId}>
              <InputLabel>ユーザー</InputLabel>
              <Select
                name="userId"
                value={formData.userId}
                label="ユーザー"
                onChange={handleInputChange}
                startAdornment={
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                }
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.userId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.userId}
                </Typography>
              )}
            </FormControl>
          </Stack>

          {/* Tags */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              タグ
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                placeholder="タグを入力..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <IconButton
                onClick={addTag}
                disabled={!currentTag.trim()}
                color="success"
              >
                <AddIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Memo */}
          <TextField
            label="メモ（任意）"
            name="memo"
            value={formData.memo}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={2}
            placeholder="追加の情報があれば入力してください..."
          />

          {/* File Upload */}
          <FileUpload
            files={formData.files}
            onFilesChange={(files) => setFormData(prev => ({ ...prev, files }))}
            maxFiles={5}
          />

          <Divider />

          {/* Recurring Toggle */}
          <FormControlLabel
            control={
              <Switch
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleInputChange}
                color="success"
              />
            }
            label="定期収入"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
              },
              py: 1.5,
            }}
          >
            {isSubmitting ? '登録中...' : '収入を登録'}
          </Button>

        </Stack>
      </Box>
    </motion.div>
  );
};

export default IncomeForm;
