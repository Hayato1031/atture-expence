import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AutoAwesome as AutoIcon,
  FormatSize as FontSizeIcon,
  BlurOn as BlurIcon,
  ColorLens as ColorLensIcon,
  Preview as PreviewIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';

const ThemeSettings = ({ settings, updateSetting, hasChanges, isModified }) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState('primary');
  const [customColor, setCustomColor] = useState('#6366f1');

  // Color scheme presets
  const colorSchemes = {
    default: {
      name: 'デフォルト',
      colors: {
        primary: '#6366f1',
        secondary: '#ec4899',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    },
    blue: {
      name: 'ブルー',
      colors: {
        primary: '#3b82f6',
        secondary: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    },
    purple: {
      name: 'パープル',
      colors: {
        primary: '#8b5cf6',
        secondary: '#a855f7',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    },
    green: {
      name: 'グリーン',
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    },
    custom: {
      name: 'カスタム',
      colors: settings.customColors || {}
    }
  };

  // Font size presets
  const fontSizeOptions = [
    { value: 12, label: '小 (12px)' },
    { value: 14, label: '標準 (14px)' },
    { value: 16, label: '大 (16px)' },
    { value: 18, label: '特大 (18px)' },
    { value: 20, label: '巨大 (20px)' }
  ];

  // Handle theme mode change
  const handleThemeChange = useCallback((mode) => {
    updateSetting('theme', mode);
  }, [updateSetting]);

  // Handle color scheme change
  const handleColorSchemeChange = useCallback((scheme) => {
    updateSetting('colorScheme', scheme);
    if (scheme !== 'custom') {
      updateSetting('customColors', colorSchemes[scheme].colors);
    }
  }, [updateSetting]);

  // Handle font size change
  const handleFontSizeChange = useCallback((event, value) => {
    updateSetting('fontSize', value);
  }, [updateSetting]);

  // Handle glass intensity change
  const handleGlassIntensityChange = useCallback((event, value) => {
    updateSetting('glassIntensity', value);
  }, [updateSetting]);

  // Handle custom color change
  const handleCustomColorChange = useCallback((colorType, color) => {
    const currentColors = settings.customColors || colorSchemes.default.colors;
    const newColors = {
      ...currentColors,
      [colorType]: color
    };
    updateSetting('customColors', newColors);
    if (settings.colorScheme !== 'custom') {
      updateSetting('colorScheme', 'custom');
    }
  }, [settings, updateSetting]);

  // Open color picker
  const openColorPicker = useCallback((colorType) => {
    setSelectedColorType(colorType);
    const currentColors = settings.customColors || colorSchemes.default.colors;
    setCustomColor(currentColors[colorType] || '#6366f1');
    setColorPickerOpen(true);
  }, [settings]);

  // Save custom color
  const saveCustomColor = useCallback(() => {
    handleCustomColorChange(selectedColorType, customColor);
    setColorPickerOpen(false);
  }, [selectedColorType, customColor, handleCustomColorChange]);

  // Reset to default theme
  const resetToDefault = useCallback(() => {
    updateSetting('theme', 'light');
    updateSetting('colorScheme', 'default');
    updateSetting('fontSize', 14);
    updateSetting('glassIntensity', 0.25);
    updateSetting('customColors', colorSchemes.default.colors);
  }, [updateSetting]);

  // Get current colors
  const getCurrentColors = useCallback(() => {
    const scheme = settings.colorScheme || 'default';
    if (scheme === 'custom') {
      return settings.customColors || colorSchemes.default.colors;
    }
    return colorSchemes[scheme]?.colors || colorSchemes.default.colors;
  }, [settings]);

  // Preview component
  const ThemePreview = () => {
    const currentColors = getCurrentColors();
    const currentTheme = settings.theme || 'light';
    const currentFontSize = settings.fontSize || 14;
    const currentGlassIntensity = settings.glassIntensity || 0.25;

    return (
      <Paper
        sx={{
          p: 3,
          background: currentTheme === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          color: currentTheme === 'dark' ? '#f1f5f9' : '#1e293b',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: currentTheme === 'dark'
              ? `rgba(17, 25, 40, ${currentGlassIntensity})`
              : `rgba(255, 255, 255, ${currentGlassIntensity})`,
            backdropFilter: `blur(${currentGlassIntensity * 40}px)`,
            border: currentTheme === 'dark'
              ? `1px solid rgba(255, 255, 255, ${currentGlassIntensity * 0.5})`
              : `1px solid rgba(255, 255, 255, ${currentGlassIntensity * 0.7})`,
            borderRadius: 2
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: currentFontSize + 2 }}
          >
            テーマプレビュー
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ fontSize: currentFontSize, mb: 2 }}
          >
            選択したテーマ設定のプレビューです。
          </Typography>
          
          <Stack direction="row" spacing={1} mb={2}>
            {Object.entries(currentColors).map(([colorType, color]) => (
              <Chip
                key={colorType}
                label={colorType}
                sx={{
                  backgroundColor: color,
                  color: 'white',
                  fontSize: currentFontSize - 2
                }}
              />
            ))}
          </Stack>
          
          <Button
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`,
              fontSize: currentFontSize - 2
            }}
          >
            サンプルボタン
          </Button>
        </Box>
      </Paper>
    );
  };

  return (
    <GlassCard>
      <GlassCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            テーマ設定
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewMode(!previewMode)}
            >
              プレビュー
            </Button>
            {hasChanges && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<UndoIcon />}
                onClick={resetToDefault}
                color="warning"
              >
                リセット
              </Button>
            )}
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* Theme Mode */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <DarkModeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              テーマモード
            </Typography>
            <Grid container spacing={1}>
              {[
                { value: 'light', label: 'ライト', icon: <LightModeIcon /> },
                { value: 'dark', label: 'ダーク', icon: <DarkModeIcon /> },
                { value: 'auto', label: '自動', icon: <AutoIcon /> }
              ].map((mode) => (
                <Grid item xs={4} key={mode.value}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: settings.theme === mode.value ? 2 : 1,
                      borderColor: settings.theme === mode.value ? 'primary.main' : 'divider',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleThemeChange(mode.value)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      {mode.icon}
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {mode.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Color Scheme */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <ColorLensIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              カラースキーム
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(colorSchemes).map(([key, scheme]) => (
                <Grid item xs={6} md={4} key={key}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: settings.colorScheme === key ? 2 : 1,
                      borderColor: settings.colorScheme === key ? 'primary.main' : 'divider',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleColorSchemeChange(key)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        {scheme.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {Object.values(scheme.colors).slice(0, 3).map((color, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: color,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Custom Colors */}
          {settings.colorScheme === 'custom' && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                カスタムカラー
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(getCurrentColors()).map(([colorType, color]) => (
                  <Grid item xs={6} md={4} key={colorType}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { transform: 'translateY(-2px)' },
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => openColorPicker(colorType)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: color,
                            borderRadius: 2,
                            margin: '0 auto 8px',
                            border: '2px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {colorType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {color}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Font Size */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <FontSizeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              フォントサイズ
            </Typography>
            <FormControl fullWidth>
              <Select
                value={settings.fontSize || 14}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
              >
                {fontSizeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Glass Intensity */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <BlurIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              ガラス効果の強度
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={settings.glassIntensity || 0.25}
                onChange={handleGlassIntensityChange}
                min={0}
                max={1}
                step={0.05}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 0.25, label: '25%' },
                  { value: 0.5, label: '50%' },
                  { value: 0.75, label: '75%' },
                  { value: 1, label: '100%' }
                ]}
              />
            </Box>
          </Grid>

          {/* Preview */}
          {previewMode && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <ThemePreview />
            </Grid>
          )}
        </Grid>

        {/* Modified indicator */}
        {(isModified('theme') || isModified('colorScheme') || isModified('fontSize') || isModified('glassIntensity')) && (
          <Alert severity="info" sx={{ mt: 2 }}>
            テーマ設定が変更されています。保存してください。
          </Alert>
        )}

        {/* Color Picker Dialog */}
        <Dialog open={colorPickerOpen} onClose={() => setColorPickerOpen(false)}>
          <DialogTitle>
            カラーを選択 - {selectedColorType}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                label="カラーコード"
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="16進数カラーコード"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                fullWidth
                placeholder="#000000"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setColorPickerOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={saveCustomColor} variant="contained">
              適用
            </Button>
          </DialogActions>
        </Dialog>
      </GlassCardContent>
    </GlassCard>
  );
};

export default ThemeSettings;