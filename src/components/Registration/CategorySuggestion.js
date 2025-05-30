import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Psychology as AiIcon,
  AutoAwesome as MagicIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { suggestCategory } from '../../services/aiService';

const CategorySuggestion = ({ 
  description,
  type = 'expense',
  onCategorySelect,
  availableCategories = []
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);
  const debounceTimerRef = useRef(null);

  const getSuggestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await suggestCategory(description, type);
      if (result.success && result.suggestion) {
        // Parse the AI response to extract category information
        const suggestionText = result.suggestion;
        
        // Try to extract category name from the response
        const categoryMatch = suggestionText.match(/推奨カテゴリ[：:]\s*([^\n\r]+)/);
        const reasonMatch = suggestionText.match(/理由[：:]\s*([^\n\r]+)/);
        
        if (categoryMatch) {
          setSuggestion({
            category: categoryMatch[1].trim(),
            reasoning: reasonMatch ? reasonMatch[1].trim() : '',
            confidence: 0.8 // Default confidence
          });
        } else {
          // If pattern matching fails, try to use the raw suggestion as category name
          const cleanSuggestion = suggestionText.replace(/^[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/, '').trim();
          if (cleanSuggestion) {
            setSuggestion({
              category: cleanSuggestion.split('\n')[0].trim(),
              reasoning: 'AI提案',
              confidence: 0.6
            });
          } else {
            setError('AI応答の解析に失敗しました');
          }
        }
      } else {
        setError(result.error || 'AI提案の取得に失敗しました');
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      setError('AI提案の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [description, type]);

  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (description && description.length > 3) {
      // Set a new timer to wait for 1.5 seconds of no typing
      debounceTimerRef.current = setTimeout(() => {
        getSuggestion();
      }, 1500);
    } else {
      setSuggestion(null);
      setError(null);
    }

    // Cleanup function to clear timer on unmount or dependency change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [description, type, getSuggestion]);

  const handleCategorySelect = (categoryId) => {
    onCategorySelect(categoryId);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Alert 
          severity="info" 
          icon={<CircularProgress size={20} />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            AI がカテゴリを分析中...
          </Typography>
        </Alert>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {error}（手動でカテゴリを選択してください）
          </Typography>
        </Alert>
      </motion.div>
    );
  }

  if (!suggestion || !suggestion.category) {
    return null;
  }

  const matchedCategory = availableCategories.find(
    cat => cat.name && suggestion.category && cat.name.toLowerCase() === suggestion.category.toLowerCase()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert 
        severity="info" 
        icon={<AiIcon />}
        sx={{ 
          mb: 2,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderColor: 'primary.main'
        }}
      >
        <Box>
          <Typography variant="body2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MagicIcon fontSize="small" />
            AI カテゴリ提案
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>"{description}"</strong> に最適なカテゴリ:
          </Typography>

          {matchedCategory ? (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckIcon />}
                onClick={() => handleCategorySelect(matchedCategory.id)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  mr: 1
                }}
              >
                {matchedCategory.name}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                信頼度: {Math.round(suggestion.confidence * 100)}%
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={`${suggestion.category}（未登録カテゴリ）`}
                color="warning"
                variant="outlined"
                size="small"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                このカテゴリは未登録です。手動で近いカテゴリを選択してください。
              </Typography>
            </Box>
          )}

          {suggestion.reasoning && (
            <Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                <strong>理由:</strong> {suggestion.reasoning}
              </Typography>
            </Box>
          )}
        </Box>
      </Alert>
    </motion.div>
  );
};

export default CategorySuggestion;