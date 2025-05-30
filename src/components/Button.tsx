import React from 'react';
import { motion } from 'framer-motion';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'text';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  fullWidth = false,
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size variations
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };
  
  // Variant variations
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-primary-500 shadow-sm',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 shadow-sm',
    text: 'bg-transparent text-primary-600 hover:text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
  };
  
  // Disabled styles
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${disabled || isLoading ? disabledStyles : ''}
        ${widthStyles}
        ${className}
      `}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
          <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      
      {children}
    </motion.button>
  );
};

export default Button;