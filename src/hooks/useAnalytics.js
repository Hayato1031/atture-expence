import { useState, useEffect, useMemo } from 'react';
import expenseService from '../services/expenseService';
import incomeService from '../services/incomeService';
import userService from '../db/services/userService';

const useAnalytics = (filters = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState({
    transactions: [],
    users: []
  });

  // Load data from database
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load expenses and income from database
      const [expenseResult, incomeResult, usersResult] = await Promise.all([
        expenseService.getAllExpenses(),
        incomeService.getAllIncome(),
        userService.getAllUsers()
      ]);

      // Transform data to unified format
      const expenseTransactions = (expenseResult.success ? expenseResult.data : []).map(expense => ({
        id: expense.id,
        type: 'expense',
        amount: expense.amount,
        category: expense.category?.name || 'Unknown',
        user: expense.user?.name || 'Unknown',
        department: expense.user?.department || 'Unknown',
        date: expense.date,
        categoryId: expense.categoryId,
        userId: expense.userId,
        description: expense.description,
        status: expense.status
      }));

      const incomeTransactions = (incomeResult.success ? incomeResult.data : []).map(income => ({
        id: income.id,
        type: 'income',
        amount: income.amount,
        category: income.category?.name || 'Unknown',
        user: income.user?.name || 'Unknown',
        department: income.user?.department || 'Unknown',
        date: income.date,
        categoryId: income.categoryId,
        userId: income.userId,
        description: income.description,
        source: income.source,
        status: income.status
      }));

      const allTransactions = [...expenseTransactions, ...incomeTransactions];

      setRawData({
        transactions: allTransactions,
        users: usersResult.success ? usersResult.data : []
      });
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when filters change significantly
  useEffect(() => {
    loadData();
  }, []);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (!rawData.transactions.length) {
      return [];
    }

    try {
      let filtered = [...rawData.transactions];

      // Apply date range filter
      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      }

      // Apply transaction type filter
      if (filters.transactionType && filters.transactionType !== 'all') {
        filtered = filtered.filter(transaction => transaction.type === filters.transactionType);
      }

      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        filtered = filtered.filter(transaction => filters.categories.includes(transaction.category));
      }

      // Apply user filter
      if (filters.users && filters.users.length > 0) {
        filtered = filtered.filter(transaction => filters.users.includes(transaction.user));
      }

      // Apply department filter
      if (filters.departments && filters.departments.length > 0) {
        filtered = filtered.filter(transaction => filters.departments.includes(transaction.department));
      }

      // Apply amount range filter
      if (filters.amountRange) {
        const { min, max } = filters.amountRange;
        if (min) {
          filtered = filtered.filter(transaction => transaction.amount >= parseInt(min));
        }
        if (max) {
          filtered = filtered.filter(transaction => transaction.amount <= parseInt(max));
        }
      }

      return filtered;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [rawData, filters]);

  // Calculate financial summary
  const financialSummary = useMemo(() => {
    const incomeTransactions = filteredData.filter(t => t.type === 'income');
    const expenseTransactions = filteredData.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Calculate monthly averages based on actual data range
    const dates = filteredData.map(t => new Date(t.date));
    const minDate = dates.length ? new Date(Math.min(...dates)) : new Date();
    const maxDate = dates.length ? new Date(Math.max(...dates)) : new Date();
    const monthsDiff = Math.max(1, Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24 * 30)));
    
    const monthlyIncome = totalIncome / monthsDiff;
    const monthlyExpense = totalExpense / monthsDiff;
    const quarterlyIncome = monthlyIncome * 3;
    const quarterlyExpense = monthlyExpense * 3;

    // Calculate growth rates based on data trends (compare last period vs previous)
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);

    const lastMonthIncome = incomeTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthIncome = incomeTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= previousMonthStart && date <= previousMonthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpense = expenseTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthExpense = expenseTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= previousMonthStart && date <= previousMonthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeGrowth = previousMonthIncome > 0 
      ? ((lastMonthIncome - previousMonthIncome) / previousMonthIncome) * 100 
      : 0;

    const expenseGrowth = previousMonthExpense > 0 
      ? ((lastMonthExpense - previousMonthExpense) / previousMonthExpense) * 100 
      : 0;

    return {
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
      quarterlyIncome,
      quarterlyExpense,
      incomeGrowth,
      expenseGrowth,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
      averageTransaction: filteredData.length > 0 ? filteredData.reduce((sum, t) => sum + t.amount, 0) / filteredData.length : 0,
    };
  }, [filteredData]);

  // Calculate expense chart data
  const expenseChartData = useMemo(() => {
    const expenseTransactions = filteredData.filter(t => t.type === 'expense');
    
    // Group by category
    const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

    // Group by month for trends
    const monthlyTotals = expenseTransactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleDateString('ja-JP', { month: 'short' });
      acc[month] = (acc[month] || 0) + transaction.amount;
      return acc;
    }, {});

    // Calculate category trends based on actual data (last 2 months comparison)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const categoryTrends = Object.keys(categoryTotals).map(categoryName => {
      const currentMonthExpenses = expenseTransactions
        .filter(t => {
          const date = new Date(t.date);
          return t.category === categoryName && 
                 date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastMonthExpenses = expenseTransactions
        .filter(t => {
          const date = new Date(t.date);
          return t.category === categoryName && 
                 date.getMonth() === (currentMonth - 1 + 12) % 12 && 
                 date.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      return lastMonthExpenses > 0 
        ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
        : 0;
    });

    // Calculate previous year data for comparison
    const previousYearData = Object.keys(monthlyTotals).map(month => {
      const monthIndex = new Date(`${month} 1, 2024`).getMonth();
      const previousYearAmount = expenseTransactions
        .filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === monthIndex && date.getFullYear() === currentYear - 1;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      return previousYearAmount;
    });

    return {
      categoryData: {
        labels: Object.keys(categoryTotals),
        amounts: Object.values(categoryTotals),
        trends: categoryTrends
      },
      monthlyTrends: {
        labels: Object.keys(monthlyTotals),
        data: Object.values(monthlyTotals)
      },
      comparisonData: {
        labels: Object.keys(monthlyTotals),
        currentYear: Object.values(monthlyTotals),
        previousYear: previousYearData
      }
    };
  }, [filteredData]);

  // Calculate income chart data
  const incomeChartData = useMemo(() => {
    const incomeTransactions = filteredData.filter(t => t.type === 'income');
    
    // Group by category (income source)
    const sourceTotals = incomeTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

    // Group by month for trends
    const monthlyTotals = incomeTransactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleDateString('ja-JP', { month: 'short' });
      acc[month] = (acc[month] || 0) + transaction.amount;
      return acc;
    }, {});

    // Calculate source trends based on actual data (last 2 months comparison)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const sourceTrends = Object.keys(sourceTotals).map(sourceName => {
      const currentMonthIncome = incomeTransactions
        .filter(t => {
          const date = new Date(t.date);
          return t.category === sourceName && 
                 date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastMonthIncome = incomeTransactions
        .filter(t => {
          const date = new Date(t.date);
          return t.category === sourceName && 
                 date.getMonth() === (currentMonth - 1 + 12) % 12 && 
                 date.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      return lastMonthIncome > 0 
        ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 
        : 0;
    });

    // Calculate previous year data for comparison
    const previousYearData = Object.keys(monthlyTotals).map(month => {
      const monthIndex = new Date(`${month} 1, 2024`).getMonth();
      const previousYearAmount = incomeTransactions
        .filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === monthIndex && date.getFullYear() === currentYear - 1;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      return previousYearAmount;
    });

    // Calculate growth metrics based on actual data
    const totalCurrentYear = incomeTransactions
      .filter(t => new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPreviousYear = incomeTransactions
      .filter(t => new Date(t.date).getFullYear() === currentYear - 1)
      .reduce((sum, t) => sum + t.amount, 0);

    const yearOverYear = totalPreviousYear > 0 
      ? ((totalCurrentYear - totalPreviousYear) / totalPreviousYear) * 100 
      : 0;

    const monthlyValues = Object.values(monthlyTotals);
    const monthlyGrowth = monthlyValues.length > 1 
      ? ((monthlyValues[monthlyValues.length - 1] - monthlyValues[monthlyValues.length - 2]) / monthlyValues[monthlyValues.length - 2]) * 100 
      : 0;

    return {
      sourceData: {
        labels: Object.keys(sourceTotals),
        amounts: Object.values(sourceTotals),
        trends: sourceTrends
      },
      monthlyTrends: {
        labels: Object.keys(monthlyTotals),
        data: Object.values(monthlyTotals)
      },
      comparisonData: {
        labels: Object.keys(monthlyTotals),
        currentYear: Object.values(monthlyTotals),
        previousYear: previousYearData
      },
      growthMetrics: {
        monthlyGrowth,
        yearOverYear,
        quarterlyGrowth: monthlyGrowth * 3 // Approximate quarterly growth
      }
    };
  }, [filteredData]);

  // Calculate user ranking data
  const userRankingData = useMemo(() => {
    const userExpenses = {};
    const userTransactionCounts = {};
    
    filteredData.filter(t => t.type === 'expense').forEach(transaction => {
      userExpenses[transaction.user] = (userExpenses[transaction.user] || 0) + transaction.amount;
      userTransactionCounts[transaction.user] = (userTransactionCounts[transaction.user] || 0) + 1;
    });

    // Calculate user trends based on actual data (current vs previous month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = (currentMonth - 1 + 12) % 12;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const calculateUserTrend = (userName) => {
      const currentMonthExpenses = filteredData
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && 
                 t.user === userName && 
                 date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastMonthExpenses = filteredData
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && 
                 t.user === userName && 
                 date.getMonth() === lastMonth && 
                 date.getFullYear() === lastMonthYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      return lastMonthExpenses > 0 
        ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
        : 0;
    };

    // Create user rankings
    const userRankings = Object.entries(userExpenses)
      .map(([userName, amount], index) => {
        const user = rawData.users.find(u => u.name === userName);
        const totalTransactions = userTransactionCounts[userName] || 0;
        const averageTransaction = totalTransactions > 0 ? amount / totalTransactions : 0;
        const trend = calculateUserTrend(userName);
        
        // Calculate efficiency based on expense/transaction ratio (lower is better)
        const efficiency = totalTransactions > 0 ? Math.max(0, 100 - (averageTransaction / 10000)) : 50;
        
        return {
          id: user?.id || index + 1,
          name: userName,
          department: user?.department || '不明',
          amount,
          transactions: totalTransactions,
          trend,
          efficiency: Math.min(100, Math.max(0, efficiency)),
          rank: index + 1,
          badge: null // Will be set after sorting
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .map((user, index) => ({ 
        ...user, 
        rank: index + 1,
        badge: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null
      }));

    // Calculate department data
    const departmentExpenses = {};
    const departmentUserCounts = {};
    
    filteredData.filter(t => t.type === 'expense').forEach(transaction => {
      departmentExpenses[transaction.department] = (departmentExpenses[transaction.department] || 0) + transaction.amount;
    });

    rawData.users.forEach(user => {
      departmentUserCounts[user.department] = (departmentUserCounts[user.department] || 0) + 1;
    });

    const departmentData = Object.entries(departmentExpenses).map(([deptName, totalAmount]) => {
      const userCount = departmentUserCounts[deptName] || 1;
      const avgAmount = totalAmount / userCount;
      
      // Calculate department trend
      const currentMonthDeptExpenses = filteredData
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && 
                 t.department === deptName && 
                 date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastMonthDeptExpenses = filteredData
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && 
                 t.department === deptName && 
                 date.getMonth() === lastMonth && 
                 date.getFullYear() === lastMonthYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const trend = lastMonthDeptExpenses > 0 
        ? ((currentMonthDeptExpenses - lastMonthDeptExpenses) / lastMonthDeptExpenses) * 100 
        : 0;
      
      // Calculate efficiency based on expenses per user (lower is better)
      const efficiency = Math.max(0, 100 - (avgAmount / 50000));
      
      return {
        name: deptName,
        totalAmount,
        userCount,
        avgAmount,
        trend,
        efficiency: Math.min(100, Math.max(0, efficiency))
      };
    });

    return {
      userRankings,
      departmentData
    };
  }, [filteredData, rawData.users]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalTransactions = filteredData.length;
    const incomeTransactions = filteredData.filter(t => t.type === 'income').length;
    const expenseTransactions = filteredData.filter(t => t.type === 'expense').length;
    
    const uniqueUsers = new Set(filteredData.map(t => t.user)).size;
    const uniqueCategories = new Set(filteredData.map(t => t.category)).size;
    const uniqueDepartments = new Set(filteredData.map(t => t.department)).size;

    const averageTransactionAmount = filteredData.length > 0 
      ? filteredData.reduce((sum, t) => sum + t.amount, 0) / filteredData.length 
      : 0;

    // Calculate data quality metrics based on actual data
    const transactionsWithDescriptions = filteredData.filter(t => t.description && t.description.trim()).length;
    const transactionsWithCategories = filteredData.filter(t => t.category && t.category !== 'Unknown').length;
    const transactionsWithUsers = filteredData.filter(t => t.user && t.user !== 'Unknown').length;
    
    const completeness = totalTransactions > 0 
      ? Math.round((transactionsWithDescriptions / totalTransactions) * 100) 
      : 100;
    
    const accuracy = totalTransactions > 0 
      ? Math.round((transactionsWithCategories / totalTransactions) * 100) 
      : 100;
    
    const consistency = totalTransactions > 0 
      ? Math.round((transactionsWithUsers / totalTransactions) * 100) 
      : 100;

    return {
      totalTransactions,
      incomeTransactions,
      expenseTransactions,
      uniqueUsers,
      uniqueCategories,
      uniqueDepartments,
      averageTransactionAmount,
      dataQuality: {
        completeness,
        accuracy,
        consistency
      }
    };
  }, [filteredData]);

  // Export functionality
  const exportData = (format = 'json') => {
    const exportObj = {
      filters,
      financialSummary,
      expenseChartData,
      incomeChartData,
      userRankingData,
      statistics,
      exportDate: new Date().toISOString(),
      totalRecords: filteredData.length
    };

    switch (format) {
      case 'json':
        return JSON.stringify(exportObj, null, 2);
      case 'csv':
        // Simple CSV export of transactions
        const headers = ['Date', 'Type', 'Amount', 'Category', 'User', 'Department'];
        const csvContent = [
          headers.join(','),
          ...filteredData.map(t => 
            [t.date, t.type, t.amount, t.category, t.user, t.department].join(',')
          )
        ].join('\n');
        return csvContent;
      default:
        return exportObj;
    }
  };

  // Reset function
  const resetFilters = () => {
    setError(null);
  };

  useEffect(() => {
    resetFilters();
  }, [filters]);

  return {
    // Data
    financialSummary,
    expenseChartData,
    incomeChartData,
    userRankingData,
    statistics,
    filteredData,
    
    // State
    isLoading,
    error,
    
    // Functions
    exportData,
    resetFilters,
    
    // Metadata
    totalRecords: filteredData.length,
    appliedFilters: filters
  };
};

export default useAnalytics;