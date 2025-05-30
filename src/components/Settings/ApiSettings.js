import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  InputAdornment,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Psychology as AiIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';

const ApiSettings = ({ settings, updateSetting, hasChanges, saveSettings, testApiConnection }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Handle API key visibility toggle
  const toggleApiKeyVisibility = useCallback(() => {
    setShowApiKey(prev => !prev);
  }, []);

  // Handle test connection
  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testApiConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  }, [testApiConnection]);

  // Handle save settings
  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    try {
      await saveSettings();
      setTestResult(null); // Clear test result after saving
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  }, [saveSettings]);

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

  return (
    <GlassCard>
      <GlassCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            <AiIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI設定
          </Typography>
          <Stack direction="row" spacing={1}>
            {hasChanges && (
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </Button>
            )}
          </Stack>
        </Box>

        <Stack spacing={3}>
          {/* AI Features Toggle */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.aiSuggestions || false}
                      onChange={(e) => updateSetting('aiSuggestions', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        AI機能を有効にする
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        カテゴリ提案や経費分析などのAI機能を使用します
                      </Typography>
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          </motion.div>

          {settings.aiSuggestions && (
            <>
              {/* API Configuration */}
              <motion.div variants={itemVariants}>
                <Typography variant="h6" gutterBottom>
                  OpenAI API設定
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    label="APIキー"
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.openaiApiKey || ''}
                    onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                    fullWidth
                    placeholder="sk-..."
                    helperText="OpenAIのAPIキーを入力してください。取得は https://platform.openai.com で行えます。"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={toggleApiKeyVisibility} edge="end">
                            {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="APIエンドポイント"
                    value={settings.apiEndpoint || 'https://api.openai.com/v1/chat/completions'}
                    onChange={(e) => updateSetting('apiEndpoint', e.target.value)}
                    fullWidth
                    helperText="通常は変更不要です。カスタムエンドポイントを使用する場合のみ変更してください。"
                  />

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleTestConnection}
                      disabled={testing || !settings.openaiApiKey}
                    >
                      {testing ? '接続テスト中...' : '接続テスト'}
                    </Button>

                    {testResult && (
                      <Chip
                        icon={testResult.success ? <CheckIcon /> : <ErrorIcon />}
                        label={testResult.success ? '接続成功' : '接続失敗'}
                        color={testResult.success ? 'success' : 'error'}
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {testing && (
                    <LinearProgress />
                  )}

                  {testResult && !testResult.success && (
                    <Alert severity="error">
                      <Typography variant="body2">
                        {testResult.error}
                      </Typography>
                    </Alert>
                  )}

                  {testResult && testResult.success && (
                    <Alert severity="success">
                      <Typography variant="body2">
                        {testResult.message}
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </motion.div>

              <Divider />

              {/* Advanced Settings */}
              <motion.div variants={itemVariants}>
                <Typography variant="h6" gutterBottom>
                  詳細設定
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    label="最大リトライ回数"
                    type="number"
                    value={settings.maxRetries || 3}
                    onChange={(e) => updateSetting('maxRetries', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 10 }}
                    helperText="API呼び出しが失敗した際の最大リトライ回数"
                  />

                  <TextField
                    label="リクエストタイムアウト（ミリ秒）"
                    type="number"
                    value={settings.requestTimeout || 30000}
                    onChange={(e) => updateSetting('requestTimeout', parseInt(e.target.value))}
                    inputProps={{ min: 5000, max: 120000 }}
                    helperText="APIリクエストのタイムアウト時間（5秒〜2分）"
                  />
                </Stack>
              </motion.div>

              <Divider />

              {/* Usage Information */}
              <motion.div variants={itemVariants}>
                <Alert severity="info" icon={<HelpIcon />}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    AI機能について
                  </Typography>
                  <Typography variant="body2" component="div">
                    • <strong>カテゴリ提案</strong>: 支出・収入の説明から適切なカテゴリを提案<br/>
                    • <strong>経費分析</strong>: 税務上の扱いや必要書類についてアドバイス<br/>
                    • <strong>月次レポート</strong>: 収支データの分析と改善提案<br/>
                    • <strong>学習機能</strong>: ユーザーの選択から学習して精度向上
                  </Typography>
                </Alert>
              </motion.div>

              {/* Privacy Notice */}
              <motion.div variants={itemVariants}>
                <Alert severity="warning">
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    プライバシーについて
                  </Typography>
                  <Typography variant="body2">
                    AI機能は入力された説明文や金額をOpenAIのAPIに送信します。
                    機密性の高い情報を含む場合は、AI機能を無効にすることをお勧めします。
                  </Typography>
                </Alert>
              </motion.div>
            </>
          )}
        </Stack>
      </GlassCardContent>
    </GlassCard>
  );
};

export default ApiSettings;