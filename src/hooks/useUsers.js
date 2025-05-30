import { useState, useEffect, useCallback, useMemo } from 'react';
import userService from '../services/userService';

/**
 * Custom hook for user management operations
 * Provides state management and CRUD operations for users
 */
const useUsers = () => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: 0,
    roles: 0,
    departmentList: [],
    roleList: [],
  });

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load all users
  const loadUsers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.getAllUsers();
      if (result.success) {
        setUsers(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'ユーザーの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user statistics
  const loadStats = useCallback(async () => {
    try {
      // Get stats for all users
      const result = await userService.getAllUsers();
      if (result.success) {
        const stats = {
          total: result.data.length,
          active: result.data.filter(u => u.status === 'active').length,
          inactive: result.data.filter(u => u.status === 'inactive').length
        };
        setStats(stats);
      }
    } catch (err) {
      console.error('Error loading user stats:', err);
    }
  }, []);

  // Create new user
  const addUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.createUser(userData);
      if (result.success) {
        setUsers(prev => [...prev, result.data]);
        await loadStats(); // Refresh stats
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'ユーザーの作成に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Update existing user
  const updateExistingUser = useCallback(async (userId, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.updateUser(userId, updateData);
      if (!result.success) {
        throw new Error(result.error);
      }
      const updatedUser = result.data;
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      await loadStats(); // Refresh stats
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'ユーザーの更新に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Delete user
  const removeUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.deleteUser(userId);
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        await loadStats(); // Refresh stats
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'ユーザーの削除に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Toggle user active status
  const toggleUserActive = useCallback(async (userId) => {
    setError(null);

    try {
      const result = await userService.toggleUserActive(userId);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state with the toggled user
      setUsers(prev => prev.map(u => 
        u.id === userId ? result.data : u
      ));
      
      await loadStats(); // Refresh stats
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.message || 'ユーザーステータスの変更に失敗しました');
      throw err;
    }
  }, [loadStats]);

  // Toggle user starred status (local only for now)
  const toggleUserStarred = useCallback(async (userId) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isStarred: !user.isStarred }
          : user
      ));

      // Note: In a real app, this would also update the database
      // For now, we're keeping it in local state only
    } catch (err) {
      console.error('Error toggling user starred status:', err);
      setError('お気に入りの変更に失敗しました');
    }
  }, []);

  // Search users
  const searchUsersByTerm = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      await loadUsers(); // Load all users if search term is empty
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simple search implementation
      const result = await userService.getAllUsers();
      if (result.success) {
        const filtered = result.data.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUsers(filtered);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err.message || 'ユーザーの検索に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Get user by ID
  const getUserData = useCallback(async (userId) => {
    setError(null);

    try {
      const result = await userService.getUserById(userId);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error getting user:', err);
      setError(err.message || 'ユーザーの取得に失敗しました');
      throw err;
    }
  }, []);

  // Bulk operations
  const performBulkAction = useCallback(async (action, userIds) => {
    setLoading(true);
    setError(null);

    try {
      const promises = userIds.map(userId => {
        switch (action) {
          case 'activate':
          case 'deactivate':
            return userService.toggleUserActive(userId);
          case 'delete':
            return userService.deleteUser(userId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      // Refresh user list
      await loadUsers();
      await loadStats();

      return true;
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError(err.message || '一括操作に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadStats]);

  // Export users to CSV
  const exportUsers = useCallback((usersToExport = users) => {
    try {
      const headers = [
        'ID',
        '名前',
        'メールアドレス',
        '電話番号',
        '役割',
        '部署',
        'ステータス',
        '総支出',
        '総収入',
        '取引数',
        '最終活動',
        '入社日',
        '備考'
      ];

      const csvData = usersToExport.map(user => [
        user.id,
        user.name,
        user.email,
        user.phone || '',
        user.role,
        user.department,
        user.isActive ? 'アクティブ' : '非アクティブ',
        user.totalExpenses || 0,
        user.totalIncome || 0,
        user.transactionCount || 0,
        user.lastActivity || '',
        user.joinDate || '',
        user.notes || ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (err) {
      console.error('Error exporting users:', err);
      setError('ユーザーのエクスポートに失敗しました');
      return false;
    }
  }, [users]);

  // Computed values
  const activeUsers = useMemo(() => 
    users.filter(user => user.isActive || user.status === 'active'),
    [users]
  );

  const starredUsers = useMemo(() => 
    users.filter(user => user.isStarred),
    [users]
  );

  const usersByDepartment = useMemo(() => {
    const grouped = users.reduce((acc, user) => {
      const dept = user.department || 'その他';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(user);
      return acc;
    }, {});
    return grouped;
  }, [users]);

  const usersByRole = useMemo(() => {
    const grouped = users.reduce((acc, user) => {
      const role = user.role || 'その他';
      if (!acc[role]) acc[role] = [];
      acc[role].push(user);
      return acc;
    }, {});
    return grouped;
  }, [users]);

  // Load initial data
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [loadUsers, loadStats]);

  return {
    // State
    users,
    loading,
    error,
    stats,

    // Computed values
    activeUsers,
    starredUsers,
    usersByDepartment,
    usersByRole,

    // Actions
    loadUsers,
    loadStats,
    addUser,
    updateUser: updateExistingUser,
    removeUser,
    toggleUserActive,
    toggleUserStarred,
    searchUsers: searchUsersByTerm,
    getUserData,
    performBulkAction,
    exportUsers,
    clearError,

    // Utilities
    refreshData: useCallback(() => {
      loadUsers();
      loadStats();
    }, [loadUsers, loadStats]),
  };
};

export default useUsers;