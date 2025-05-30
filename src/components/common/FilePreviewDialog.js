import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import fileService from '../../services/fileService';

const FilePreviewDialog = ({ open, onClose, fileIds = [] }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await fileService.getFilesByIds(fileIds);
      if (result.success) {
        setFiles(result.data);
        setCurrentIndex(0);
      } else {
        setError(result.error || 'ファイルの読み込みに失敗しました');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setError('ファイルの読み込み中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [fileIds]);

  useEffect(() => {
    if (open && fileIds.length > 0) {
      loadFiles();
    }
  }, [open, fileIds, loadFiles]);

  const currentFile = files[currentIndex];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      onKeyDown={handleKeyDown}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          {currentFile?.originalName || 'ファイルプレビュー'}
          {files.length > 1 && (
            <Typography variant="caption" sx={{ ml: 2 }}>
              ({currentIndex + 1} / {files.length})
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!loading && !error && currentFile && (
          <Box sx={{ textAlign: 'center' }}>
            {fileService.isImageFile(currentFile.mimeType) ? (
              <img
                src={currentFile.data}
                alt={currentFile.originalName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Box sx={{ py: 4 }}>
                <AttachIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography>プレビューできません</Typography>
              </Box>
            )}
            
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ファイルサイズ: {fileService.formatFileSize(currentFile.size)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                アップロード日時: {new Date(currentFile.uploadedAt).toLocaleString('ja-JP')}
              </Typography>
              {currentFile.description && (
                <Typography variant="body2">
                  説明: {currentFile.description}
                </Typography>
              )}
            </Stack>
            
            {files.length > 1 && (
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  ← → キーで画像を切り替え
                </Typography>
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;