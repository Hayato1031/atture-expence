import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Fab,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  AttachFile as AttachFileIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent, GlassCardPresets } from '../components/common/GlassCard';
import invoiceService from '../services/invoiceService';
import { formatDate } from '../utils/formatters';
import useSettings from '../hooks/useSettings';
import FileUpload from '../components/Registration/FileUpload';
import FilePreviewDialog from '../components/common/FilePreviewDialog';

const Invoices = () => {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    isRecurring: false,
    recurringType: 'monthly',
    client: '',
    category: 'other',
    attachments: [],
    links: []
  });
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [error, setError] = useState('');

  // Load invoices and stats
  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesResult, statsResult] = await Promise.all([
        invoiceService.getAllInvoices(),
        invoiceService.getInvoiceStats()
      ]);

      if (invoicesResult.success) {
        setInvoices(invoicesResult.data);
      }
      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setError('');
      
      if (!formData.title || !formData.amount || !formData.dueDate) {
        setError('必須項目を入力してください。');
        return;
      }

      const invoiceData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      let result;
      if (editingInvoice) {
        result = await invoiceService.updateInvoice(editingInvoice.id, invoiceData);
      } else {
        result = await invoiceService.createInvoice(invoiceData);
      }

      if (result.success) {
        await loadData();
        handleCloseDialog();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError('保存に失敗しました。');
    }
  };

  // Handle file upload
  const handleFileUpload = (files) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  // Handle removing attachment
  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Handle adding link
  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, { ...newLink, id: Date.now() }]
      }));
      setNewLink({ title: '', url: '' });
    }
  };

  // Handle removing link
  const handleRemoveLink = (id) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  // Handle attachment preview
  const handlePreviewAttachments = (attachments, startIndex = 0) => {
    setPreviewFiles(attachments);
    setPreviewIndex(startIndex);
    setPreviewDialogOpen(true);
  };

  // Handle opening dialog for new invoice
  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setFormData({
      title: '',
      description: '',
      amount: '',
      dueDate: '',
      isRecurring: false,
      recurringType: 'monthly',
      client: '',
      category: 'other',
      attachments: [],
      links: []
    });
    setNewLink({ title: '', url: '' });
    setDialogOpen(true);
  };

  // Handle editing invoice
  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      title: invoice.title,
      description: invoice.description || '',
      amount: invoice.amount.toString(),
      dueDate: invoice.dueDate.split('T')[0],
      isRecurring: invoice.isRecurring || false,
      recurringType: invoice.recurringType || 'monthly',
      client: invoice.client || '',
      category: invoice.category || 'other',
      attachments: invoice.attachments || [],
      links: invoice.links || []
    });
    setNewLink({ title: '', url: '' });
    setError('');
    setDialogOpen(true);
  };

  // Handle closing dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingInvoice(null);
    setError('');
  };

  // Handle marking as paid
  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const result = await invoiceService.markInvoiceAsPaid(invoiceId);
      if (result.success) {
        await loadData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      setError('支払い処理に失敗しました。');
    }
  };

  // Handle delete
  const handleDelete = async (invoiceId) => {
    if (window.confirm('この請求書を削除しますか？')) {
      try {
        const result = await invoiceService.deleteInvoice(invoiceId);
        if (result.success) {
          await loadData();
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setError('削除に失敗しました。');
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  // Get status color and icon
  const getStatusInfo = (invoice) => {
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    
    if (invoice.status === 'paid') {
      return { color: 'success', icon: <CheckCircleIcon />, label: '支払済' };
    } else if (dueDate < now) {
      return { color: 'error', icon: <WarningIcon />, label: '期限切れ' };
    } else {
      return { color: 'warning', icon: <PendingIcon />, label: '未払い' };
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 1,
            }}
          >
            請求書管理
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            請求書の作成・管理・期日通知システム
          </Typography>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <GlassCard {...GlassCardPresets.info}>
                <GlassCardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ReceiptIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        総請求書数
                      </Typography>
                    </Box>
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GlassCard {...GlassCardPresets.warning}>
                <GlassCardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <PendingIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.pending || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        未払い
                      </Typography>
                    </Box>
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GlassCard {...GlassCardPresets.error}>
                <GlassCardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <WarningIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.overdue || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        期限切れ
                      </Typography>
                    </Box>
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GlassCard {...GlassCardPresets.success}>
                <GlassCardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {formatCurrency(stats.paidAmount || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        支払済み金額
                      </Typography>
                    </Box>
                  </Box>
                </GlassCardContent>
              </GlassCard>
            </Grid>
          </Grid>
        </motion.div>

        {/* Invoice List */}
        <motion.div variants={itemVariants}>
          <GlassCard>
            <GlassCardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon />
                  請求書一覧
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={loadData}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  更新
                </Button>
              </Box>

              {invoices.length > 0 ? (
                <List>
                  {invoices.map((invoice) => {
                    const statusInfo = getStatusInfo(invoice);
                    return (
                      <ListItem
                        key={invoice.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          mb: 2,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: `${statusInfo.color}.main` }}>
                            {statusInfo.icon}
                          </Avatar>
                        </ListItemIcon>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {invoice.title}
                            </Typography>
                            <Chip
                              size="small"
                              label={statusInfo.label}
                              color={statusInfo.color}
                            />
                            {invoice.isRecurring && (
                              <Chip
                                size="small"
                                label="定期"
                                color="primary"
                                variant="outlined"
                                icon={<RefreshIcon />}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {invoice.description || '説明なし'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            期日: {formatDate(invoice.dueDate, settings.dateFormat)}
                            {invoice.client && ` • クライアント: ${invoice.client}`}
                          </Typography>
                          <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
                            {formatCurrency(invoice.amount)}
                          </Typography>
                          {/* Attachments and Links */}
                          {(invoice.attachments?.length > 0 || invoice.links?.length > 0) && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {invoice.attachments?.length > 0 && (
                                <Chip
                                  size="small"
                                  icon={<AttachFileIcon />}
                                  label={`${invoice.attachments.length}個のファイル`}
                                  onClick={() => handlePreviewAttachments(invoice.attachments, 0)}
                                  sx={{ cursor: 'pointer' }}
                                  color="secondary"
                                  variant="outlined"
                                />
                              )}
                              {invoice.links?.length > 0 && (
                                <Chip
                                  size="small"
                                  icon={<LinkIcon />}
                                  label={`${invoice.links.length}個のリンク`}
                                  color="info"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            {invoice.status === 'pending' && (
                              <Tooltip title="支払済みにする">
                                <IconButton
                                  color="success"
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                >
                                  <PaymentIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="編集">
                              <IconButton
                                color="primary"
                                onClick={() => handleEditInvoice(invoice)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="削除">
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(invoice.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    請求書がありません
                  </Typography>
                </Box>
              )}
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
          onClick={handleNewInvoice}
        >
          <AddIcon />
        </Fab>

        {/* Invoice Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingInvoice ? '請求書を編集' : '新しい請求書を作成'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="タイトル"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              
              <TextField
                label="説明"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <TextField
                label="金額"
                fullWidth
                required
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                InputProps={{
                  startAdornment: '¥',
                }}
              />

              <TextField
                label="期日"
                fullWidth
                required
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="クライアント"
                fullWidth
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />

              <TextField
                label="カテゴリ"
                fullWidth
                select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="consulting">コンサルティング</MenuItem>
                <MenuItem value="development">開発</MenuItem>
                <MenuItem value="maintenance">保守</MenuItem>
                <MenuItem value="licensing">ライセンス</MenuItem>
                <MenuItem value="other">その他</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  />
                }
                label="定期請求書"
              />

              {formData.isRecurring && (
                <TextField
                  label="繰り返し間隔"
                  fullWidth
                  select
                  value={formData.recurringType}
                  onChange={(e) => setFormData({ ...formData, recurringType: e.target.value })}
                >
                  <MenuItem value="weekly">毎週</MenuItem>
                  <MenuItem value="monthly">毎月</MenuItem>
                  <MenuItem value="quarterly">四半期</MenuItem>
                  <MenuItem value="yearly">毎年</MenuItem>
                </TextField>
              )}

              <Divider />

              {/* File Attachments Section */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFileIcon />
                  添付ファイル
                </Typography>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  maxFiles={10}
                  acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx']}
                />
                {formData.attachments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      アップロード済みファイル:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {formData.attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => handleRemoveAttachment(index)}
                          onClick={() => handlePreviewAttachments([file], 0)}
                          icon={<ImageIcon />}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* Links Section */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon />
                  関連リンク
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    label="リンクタイトル"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    size="small"
                    sx={{ flex: 2 }}
                    placeholder="https://..."
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddLink}
                    disabled={!newLink.title || !newLink.url}
                    size="small"
                  >
                    追加
                  </Button>
                </Stack>
                {formData.links.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      追加済みリンク:
                    </Typography>
                    <Stack spacing={1}>
                      {formData.links.map((link) => (
                        <Box
                          key={link.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: 'background.paper'
                          }}
                        >
                          <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {link.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="primary"
                              component="a"
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                              {link.url}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveLink(link.id)}
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>キャンセル</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {editingInvoice ? '更新' : '作成'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* File Preview Dialog */}
        <FilePreviewDialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          files={previewFiles}
          currentIndex={previewIndex}
          onIndexChange={setPreviewIndex}
        />
      </motion.div>
    </Container>
  );
};

export default Invoices;