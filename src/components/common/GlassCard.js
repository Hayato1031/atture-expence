import React from 'react';
import { Card, CardContent, Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  gradient,
  hover = true,
  blur = 20,
  opacity = 0.25,
  borderOpacity = 0.18,
  shadowColor = 'primary',
  elevation = 1,
  animateOnHover = true,
  initialAnimation = true,
  delay = 0,
  ...props 
}) => {
  const theme = useTheme();
  
  const getGradientBackground = () => {
    if (gradient) {
      return gradient;
    }
    return null;
  };

  const getShadowColor = () => {
    const colorMap = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      error: theme.palette.error.main,
      warning: theme.palette.warning.main,
    };
    return colorMap[shadowColor] || shadowColor;
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: delay,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const hoverVariants = {
    rest: {
      scale: 1,
      y: 0,
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      initial={initialAnimation ? "hidden" : false}
      animate="visible"
      variants={cardVariants}
      whileHover={animateOnHover && hover ? "hover" : "rest"}
      {...(animateOnHover && hover ? { variants: hoverVariants } : {})}
    >
      <Card
        {...props}
        sx={{
          position: 'relative',
          background: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, opacity)
            : alpha('#ffffff', opacity),
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          border: `1px solid ${alpha(
            theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.divider, 
            borderOpacity
          )}`,
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: hover 
            ? `0 ${4 * elevation}px ${16 * elevation}px 0 ${alpha(getShadowColor(), 0.1 * elevation)}`
            : theme.shadows[elevation],
          '&::before': gradient ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: getGradientBackground(),
            opacity: 0.05,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          } : {},
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, 
              transparent, 
              ${alpha(theme.palette.common.white, 0.5)}, 
              transparent
            )`,
            opacity: theme.palette.mode === 'dark' ? 0.3 : 0.1,
            pointerEvents: 'none',
          },
          ...(hover && {
            '&:hover': {
              borderColor: alpha(
                theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main, 
                0.3
              ),
              boxShadow: `0 ${8 * elevation}px ${32 * elevation}px 0 ${alpha(
                getShadowColor(), 
                0.15 * elevation
              )}`,
              '&::before': gradient ? {
                opacity: 0.1,
              } : {},
            },
          }),
          ...props.sx,
        }}
      >
        {/* Animated gradient overlay */}
        {gradient && (
          <Box
            sx={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: gradient,
              opacity: 0,
              transform: 'rotate(45deg)',
              transition: 'all 0.6s ease',
              pointerEvents: 'none',
              ...(hover && {
                '&:hover': {
                  opacity: 0.03,
                  transform: 'rotate(45deg) scale(1.5)',
                },
              }),
            }}
          />
        )}
        
        {/* Shine effect */}
        <Box
          className="shine-effect"
          sx={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(
              90deg,
              transparent,
              ${alpha(theme.palette.common.white, 0.2)},
              transparent
            )`,
            transform: 'skewX(-20deg)',
            transition: 'left 0.6s ease',
            pointerEvents: 'none',
            ...(hover && {
              '&:hover': {
                left: '100%',
              },
            }),
          }}
        />

        {/* Content wrapper with proper z-index */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      </Card>
    </motion.div>
  );
};

// Preset variants for common use cases
export const GlassCardPresets = {
  primary: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: 'primary',
  },
  secondary: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    shadowColor: 'secondary',
  },
  success: {
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    shadowColor: 'success',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    shadowColor: 'warning',
  },
  info: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    shadowColor: 'primary',
  },
  dark: {
    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    shadowColor: '#000000',
  },
};

// Utility component for glass card content with padding
export const GlassCardContent = ({ children, noPadding = false, ...props }) => {
  return (
    <CardContent
      {...props}
      sx={{
        padding: noPadding ? 0 : 3,
        '&:last-child': {
          paddingBottom: noPadding ? 0 : 3,
        },
        ...props.sx,
      }}
    >
      {children}
    </CardContent>
  );
};

export default GlassCard;