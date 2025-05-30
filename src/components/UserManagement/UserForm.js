import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  IconButton,
  Alert,
  Chip,
  FormHelperText,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard, { GlassCardContent } from '../common/GlassCard';

const ROLES = [
  '代表取締役',
  'マネージャー',
  'スタッフ',
  'インターン',
  '契約社員',
  'パートタイム',
];

const DEPARTMENTS = [
  '経営',
  '営業',
  '開発',
  '経理',
  'マーケティング',
  '人事',
  '総務',
  'サポート',
];

const UserForm = ({
  user = null,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create', // 'create' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'スタッフ',
    department: '',
    notes: '',
    isActive: true,
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'スタッフ',
        department: user.department || '',
        notes: user.notes || '',
        isActive: user.isActive !== false,
        avatar: user.avatar || null,
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user, mode]);

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = '名前は必須です';
        } else if (value.trim().length < 2) {
          newErrors.name = '名前は2文字以上である必要があります';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'メールアドレスは必須です';
        } else if (!emailRegex.test(value)) {
          newErrors.email = '有効なメールアドレスを入力してください';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (value && value.trim()) {
          const phoneRegex = /^[\d\-+()\\s]+$/;
          if (!phoneRegex.test(value)) {
            newErrors.phone = '有効な電話番号を入力してください';
          } else {
            delete newErrors.phone;
          }
        } else {
          delete newErrors.phone;
        }
        break;

      case 'department':
        if (!value.trim()) {
          newErrors.department = '部署は必須です';
        } else {
          delete newErrors.department;
        }
        break;

      case 'role':
        if (!value.trim()) {
          newErrors.role = '役割は必須です';
        } else {
          delete newErrors.role;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    validateField(name, value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    if (isValid) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setAvatarPreview(result);
        handleChange('avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear avatar
  const clearAvatar = () => {
    setAvatarPreview(null);
    handleChange('avatar', null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <GlassCard>
        <GlassCardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 3,
            }}
          >
            {mode === 'edit' ? 'ユーザー情報を編集' : '新しいユーザーを追加'}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Avatar Section */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={avatarPreview}
                      sx={{ width: 80, height: 80 }}
                    >
                      {formData.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="avatar-upload"
                        type="file"
                        onChange={handleAvatarChange}
                      />
                      <label htmlFor="avatar-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<PhotoCameraIcon />}
                          size="small"
                        >
                          写真を選択
                        </Button>
                      </label>
                      {avatarPreview && (
                        <IconButton
                          size="small"
                          onClick={clearAvatar}
                          sx={{ ml: 1 }}
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="名前"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    required
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="メールアドレス"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    required
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="電話番号"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    placeholder="090-1234-5678"
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </motion.div>
              </Grid>

              {/* Role and Department */}
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <FormControl
                    fullWidth
                    error={touched.role && !!errors.role}
                  >
                    <InputLabel>役割 *</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      label="役割 *"
                      startAdornment={<WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      {ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.role && errors.role && (
                      <FormHelperText>{errors.role}</FormHelperText>
                    )}
                  </FormControl>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Autocomplete
                    freeSolo
                    options={DEPARTMENTS}
                    value={formData.department}
                    onChange={(e, newValue) => handleChange('department', newValue || '')}
                    onInputChange={(e, newInputValue) => handleChange('department', newInputValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="部署"
                        required
                        error={touched.department && !!errors.department}
                        helperText={touched.department && errors.department}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </motion.div>
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <GlassCard opacity={0.1}>
                    <GlassCardContent>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={(e) => handleChange('isActive', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">アクティブユーザー</Typography>
                            <Chip
                              label={formData.isActive ? 'アクティブ' : '非アクティブ'}
                              color={formData.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        }
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        非アクティブにすると、このユーザーは新規取引で選択できなくなります
                      </Typography>
                    </GlassCardContent>
                  </GlassCard>
                </motion.div>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="備考"
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="追加情報やメモを入力してください..."
                  />
                </motion.div>
              </Grid>

              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Alert severity="error">
                      入力内容を確認してください。必須項目が未入力または無効な値が入力されています。
                    </Alert>
                  </motion.div>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      startIcon={<ClearIcon />}
                      disabled={isLoading}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isLoading || Object.keys(errors).length > 0}
                      sx={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        '&:hover': {
                          opacity: 0.9,
                        },
                      }}
                    >
                      {isLoading ? '保存中...' : (mode === 'edit' ? '更新' : '追加')}
                    </Button>
                  </Stack>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
};

export default UserForm;