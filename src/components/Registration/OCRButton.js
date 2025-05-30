import React, { useState, useRef } from 'react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ocrService from '../../services/ocrServiceNew';
import { formatDate } from '../../utils/formatters';
import useSettings from '../../hooks/useSettings';

const OCRButton = ({ onDataExtracted, variant = 'contained' }) => {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleOpen = () => {
    setOpen(true);
    setError('');
    setResult(null);
    setProgress(0);
  };

  const handleClose = () => {
    setOpen(false);
    setProcessing(false);
    setProgress(0);
    setResult(null);
    setError('');
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const ocrResult = await ocrService.processReceipt(file, (progressData) => {
        setProgress(progressData.progress || 0);
      });

      if (ocrResult.success && ocrResult.data) {
        setResult(ocrResult.data);
      } else {
        setError(ocrResult.error || 'レシートの読み取りに失敗しました。');
      }
    } catch (err) {
      console.error('OCR error:', err);
      console.error('OCR error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(`レシートの処理中にエラーが発生しました。: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyData = () => {
    if (result && onDataExtracted) {
      onDataExtracted(result);
      handleClose();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  return (
    <>
      {variant === 'contained' ? (
        <Button
          variant="contained"
          startIcon={<CameraIcon />}
          onClick={handleOpen}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            },
          }}
        >
          レシート撮影
        </Button>
      ) : (
        <IconButton onClick={handleOpen} color="primary">
          <CameraIcon />
        </IconButton>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              レシート読み取り
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              レシートや請求書の写真を選択すると、自動的に金額や日付などの情報を読み取ります。
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {!processing && !result && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CameraIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
                      },
                      py: 2,
                      px: 4,
                    }}
                  >
                    写真を選択
                  </Button>
                </motion.div>
              </Box>
            )}

            {processing && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {progress < 70 ? 'レシートを読み取っています...' : 'AIで内容を解析しています...'}
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {progress}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {progress < 70 
                    ? '※日本語の認識には時間がかかる場合があります'
                    : '※GPT-4でレシート内容を解析しています'
                  }
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider' 
                }}>
                  <Typography variant="h6" gutterBottom>
                    読み取り結果
                  </Typography>

                  <Stack spacing={2}>
                    {result.amount && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          金額
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {formatCurrency(result.amount)}
                        </Typography>
                      </Box>
                    )}

                    {result.date && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          日付
                        </Typography>
                        <Typography>
                          {formatDate(result.date, settings.dateFormat)}
                        </Typography>
                      </Box>
                    )}

                    {result.vendor && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          店舗名
                        </Typography>
                        <Typography>
                          {result.vendor}
                        </Typography>
                      </Box>
                    )}

                    {result.category && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          推定カテゴリ
                        </Typography>
                        <Chip 
                          label={result.category} 
                          color="primary" 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    )}

                    {result.items && result.items.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          明細
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                          {result.items.map((item, index) => (
                            <Chip
                              key={index}
                              label={`${item.name} (${formatCurrency(item.price)})`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          読み取り精度: {Math.round(result.confidence || 0)}%
                        </Typography>
                        {result.enhanced && (
                          <Chip 
                            label="AI解析済み" 
                            size="small" 
                            color="success" 
                            icon={<CheckCircleIcon />}
                          />
                        )}
                      </Stack>
                    </Box>
                    
                    {(!result.amount && !result.date && !result.vendor) && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          レシートの情報を正しく読み取れませんでした。
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          以下をお試しください：
                        </Typography>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          <li><Typography variant="caption">レシートを明るい場所で撮影する</Typography></li>
                          <li><Typography variant="caption">文字がはっきり見えるように撮影する</Typography></li>
                          <li><Typography variant="caption">レシート全体が画像に収まるようにする</Typography></li>
                          {!result.enhanced && (
                            <li>
                              <Typography variant="caption">
                                設定画面でOpenAI APIキーを設定すると、AIによる高精度な解析が可能になります
                              </Typography>
                            </li>
                          )}
                        </ul>
                      </Alert>
                    )}
                  </Stack>
                </Box>
              </motion.div>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          {result && (
            <Button
              variant="contained"
              onClick={handleApplyData}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              データを適用
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OCRButton;