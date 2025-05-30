import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for managing page transitions and animations
 * Provides smooth transitions between different pages/routes
 */
export const usePageTransition = (duration = 300) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStage, setTransitionStage] = useState('idle'); // 'idle', 'exiting', 'entering'
  const location = useLocation();

  useEffect(() => {
    // Start transition when location changes
    setIsTransitioning(true);
    setTransitionStage('exiting');

    // After exit animation, switch to entering
    const exitTimer = setTimeout(() => {
      setTransitionStage('entering');
    }, duration / 2);

    // Complete transition
    const enterTimer = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionStage('idle');
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(enterTimer);
    };
  }, [location.pathname, duration]);

  // Common transition variants for framer-motion
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: duration / 1000,
  };

  // Slide transition variants
  const slideVariants = {
    initial: (direction = 1) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    in: {
      x: 0,
      opacity: 1,
    },
    out: (direction = 1) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  // Fade transition variants
  const fadeVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
  };

  // Scale transition variants
  const scaleVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    in: {
      opacity: 1,
      scale: 1,
    },
    out: {
      opacity: 0,
      scale: 1.1,
    },
  };

  // Rotation transition variants
  const rotateVariants = {
    initial: {
      opacity: 0,
      rotate: -10,
      scale: 0.8,
    },
    in: {
      opacity: 1,
      rotate: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      rotate: 10,
      scale: 0.8,
    },
  };

  // Container variants for staggered animations
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  // Item variants for staggered animations
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Helper function to get transition direction based on route
  const getTransitionDirection = (fromPath, toPath) => {
    const routes = ['/', '/registration', '/users', '/analytics', '/settings'];
    const fromIndex = routes.indexOf(fromPath);
    const toIndex = routes.indexOf(toPath);
    
    if (fromIndex === -1 || toIndex === -1) return 1;
    return fromIndex < toIndex ? 1 : -1;
  };

  // Custom transition based on route type
  const getRouteTransition = (routePath) => {
    const routeTransitions = {
      '/': 'fade', // Dashboard - simple fade
      '/registration': 'slide', // Registration - slide in
      '/users': 'scale', // Users - scale effect
      '/analytics': 'rotate', // Analytics - rotate effect
      '/settings': 'slide', // Settings - slide effect
    };

    return routeTransitions[routePath] || 'fade';
  };

  return {
    isTransitioning,
    transitionStage,
    pageVariants,
    pageTransition,
    slideVariants,
    fadeVariants,
    scaleVariants,
    rotateVariants,
    containerVariants,
    itemVariants,
    getTransitionDirection,
    getRouteTransition,
  };
};

/**
 * Hook for managing loading states during transitions
 */
export const useTransitionLoader = (delay = 200) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [location.pathname, delay]);

  return isLoading;
};

/**
 * Hook for managing breadcrumb navigation during transitions
 */
export const useBreadcrumbTransition = () => {
  const location = useLocation();
  
  const getBreadcrumbs = (pathname) => {
    const breadcrumbMap = {
      '/': [{ label: 'ダッシュボード', path: '/' }],
      '/registration': [
        { label: 'ダッシュボード', path: '/' },
        { label: '収支登録', path: '/registration' },
      ],
      '/users': [
        { label: 'ダッシュボード', path: '/' },
        { label: 'ユーザー管理', path: '/users' },
      ],
      '/analytics': [
        { label: 'ダッシュボード', path: '/' },
        { label: '分析・レポート', path: '/analytics' },
      ],
      '/settings': [
        { label: 'ダッシュボード', path: '/' },
        { label: '設定', path: '/settings' },
      ],
    };

    return breadcrumbMap[pathname] || [{ label: 'ダッシュボード', path: '/' }];
  };

  return {
    breadcrumbs: getBreadcrumbs(location.pathname),
    currentPath: location.pathname,
  };
};

export default usePageTransition;