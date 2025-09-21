import React from 'react';

const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
    ghost: 'hover:bg-orange-100 text-orange-600 hover:text-orange-700',
    outline: 'border border-orange-300 text-orange-700 hover:bg-orange-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10'
  };

  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium 
        ring-offset-white transition-colors focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none 
        disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
