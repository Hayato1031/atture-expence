import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
  AttachFile as AttachIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import fileService from '../../services/fileService';

const FileUpload = ({ files = [], onFilesChange, maxFiles = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles) => {
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`最大${maxFiles}ファイルまでアップロードできます。`);
      return;
    }

    setUploading(true);
    setError('');
    
    const newFiles = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      try {
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));
        
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }));
        }, 100);
        
        // Upload file
        const result = await fileService.uploadFile(file);
        
        clearInterval(progressInterval);
        
        if (result.success) {
          newFiles.push(result.data);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));
        } else {
          setError(result.error);
        }
        
      } catch (error) {
        console.error('Upload error:', error);
        setError('ファイルのアップロードに失敗しました。');
      }
    }
    
    // Clear progress after delay
    setTimeout(() => {
      setUploadProgress({});
    }, 1000);
    
    setUploading(false);
    onFilesChange([...files, ...newFiles]);
  }, [files, maxFiles, onFilesChange]);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Handle file input change
  const handleInputChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFileSelect(selectedFiles);
    e.target.value = ''; // Reset input
  }, [handleFileSelect]);

  // Remove file
  const handleRemoveFile = useCallback((fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  // Preview file
  const handlePreviewFile = useCallback((file) => {
    setPreviewDialog({ open: true, file });
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        ファイル添付 ({files.length}/{maxFiles})
      </Typography>

      {/* Upload Area */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: 'action.hover',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'action.selected',
            borderColor: 'primary.dark',
          },
          mb: 2
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          id="file-upload-input"
          disabled={uploading || files.length >= maxFiles}
        />
        
        <label htmlFor="file-upload-input" style={{ cursor: 'pointer', display: 'block' }}>
          <Stack spacing={2} alignItems="center">
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="body1">
              画像をドラッグ&ドロップまたはクリックしてアップロード
            </Typography>
            <Typography variant="caption" color="text.secondary">
              JPEG、PNG、GIF、WebP形式対応（最大10MB）
            </Typography>
            {files.length >= maxFiles && (
              <Typography variant="caption" color="error">
                最大ファイル数に達しています
              </Typography>
            )}
          </Stack>
        </label>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mb: 2 }}>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <Box key={fileName} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {fileName}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          ))}
        </Box>
      )}

      {/* File Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={2}>
              {files.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.id}>
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <Card>
                      {file.thumbnail ? (
                        <CardMedia
                          component="img"
                          height="120"
                          image={file.thumbnail}
                          alt={file.originalName}
                          sx={{ objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => handlePreviewFile(file)}
                          onError={(e) => {
                            console.error('Thumbnail load error:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'grey.100',
                            cursor: 'pointer'
                          }}
                          onClick={() => handlePreviewFile(file)}
                        >
                          <AttachIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                        </Box>
                      )}
                      
                      <CardContent sx={{ pb: 1 }}>
                        <Tooltip title={file.originalName}>
                          <Typography variant="body2" noWrap>
                            {file.originalName}
                          </Typography>
                        </Tooltip>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={fileService.formatFileSize(file.size)}
                            size="small"
                            variant="outlined"
                          />
                          {fileService.isImageFile(file.mimeType) && (
                            <Chip
                              icon={<ImageIcon />}
                              label="画像"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </CardContent>
                      
                      <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                        <IconButton
                          size="small"
                          onClick={() => handlePreviewFile(file)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(file.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, file: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {previewDialog.file?.originalName}
          <IconButton onClick={() => setPreviewDialog({ open: false, file: null })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewDialog.file && (
            <Box sx={{ textAlign: 'center' }}>
              {fileService.isImageFile(previewDialog.file.mimeType) && previewDialog.file.data ? (
                <img
                  src={previewDialog.file.data}
                  alt={previewDialog.file.originalName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    console.error('Image preview error:', e);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Box sx={{ py: 4 }}>
                  <AttachIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography>
                    {!previewDialog.file.data ? 'プレビューデータがありません' : 'プレビューできません'}
                  </Typography>
                </Box>
              )}
              
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ファイルサイズ: {fileService.formatFileSize(previewDialog.file.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  アップロード日時: {new Date(previewDialog.file.uploadedAt).toLocaleString('ja-JP')}
                </Typography>
                {previewDialog.file.description && (
                  <Typography variant="body2">
                    説明: {previewDialog.file.description}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FileUpload;