import React from 'react';
import clsx from 'clsx';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Base props shared by all button types
interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean; // Add disabled explicitly to the base props
}

// Type for HTML button element
type ButtonAsButtonProps = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: 'button';
  };

// Type for anchor element
type ButtonAsLinkProps = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    as: 'a';
  };

// Type for custom component
type ButtonAsCustomProps = ButtonBaseProps & {
  as: React.ElementType;
  [key: string]: any;
};

// Union type for all button variants
type ButtonProps =
  | ButtonAsButtonProps
  | ButtonAsLinkProps
  | ButtonAsCustomProps;

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      variant = 'primary',
      size = 'md',
      isFullWidth = false,
      isLoading = false,
      className = '',
      leftIcon,
      rightIcon,
      disabled,
      as: Component = 'button',
      ...rest
    } = props;

    const baseStyle =
      'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200 ease-in-out';

    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-accent hover:bg-accent-dark text-white shadow-sm',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      outline: 'border border-accent text-accent hover:bg-accent/10',
      ghost: 'hover:bg-gray-100 text-gray-700',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      xs: 'text-xs px-2 py-1',
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-5 py-2.5',
      xl: 'text-lg px-6 py-3',
    };

    const disabledStyle = 'opacity-50 cursor-not-allowed';
    const loadingStyle =
      'relative text-transparent transition-none hover:text-transparent';

    // Ensure we get the correct variant and size styling
    const variantStyle = variantStyles[variant as ButtonVariant];
    const sizeStyle = sizeStyles[size as ButtonSize];

    return (
      <Component
        className={clsx(
          baseStyle,
          variantStyle,
          sizeStyle,
          isFullWidth ? 'w-full' : '',
          (disabled || isLoading) && disabledStyle,
          isLoading && loadingStyle,
          className,
        )}
        disabled={Component === 'button' ? disabled || isLoading : undefined}
        ref={ref as any}
        {...rest}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {leftIcon && (
          <span className={clsx('mr-2', isLoading && 'opacity-0')}>
            {leftIcon}
          </span>
        )}
        <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
        {rightIcon && (
          <span className={clsx('ml-2', isLoading && 'opacity-0')}>
            {rightIcon}
          </span>
        )}
      </Component>
    );
  },
);

Button.displayName = 'Button';
