import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../types/auth';

interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  [key: string]: any;
}

export const authUtils = {
  // Token management
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setTokens: (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  removeTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Token validation
  isTokenValid: (token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp <= currentTime;
    } catch {
      return true;
    }
  },

  getTokenExpiration: (token: string): Date | null => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  },

  // Token decoding
  decodeToken: (token: string): JWTPayload | null => {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch {
      return null;
    }
  },

  getUserFromToken: (token: string): Partial<User> | null => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  },

  // Authentication state
  isAuthenticated: (): boolean => {
    const token = authUtils.getAccessToken();
    return token ? authUtils.isTokenValid(token) : false;
  },

  // Role checking
  hasRole: (user: User | null, role: UserRole): boolean => {
    return user?.role === role;
  },

  hasAnyRole: (user: User | null, roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  },

  isAdmin: (user: User | null): boolean => {
    return authUtils.hasRole(user, UserRole.ADMIN);
  },

  isArtisan: (user: User | null): boolean => {
    return authUtils.hasRole(user, UserRole.ARTISAN);
  },

  isCustomer: (user: User | null): boolean => {
    return authUtils.hasRole(user, UserRole.CUSTOMER);
  },

  // Permission checking
  canAccessAdminPanel: (user: User | null): boolean => {
    return authUtils.isAdmin(user);
  },

  canCreateProduct: (user: User | null): boolean => {
    return authUtils.isArtisan(user) || authUtils.isAdmin(user);
  },

  canEditProduct: (user: User | null, productOwnerId: string): boolean => {
    if (authUtils.isAdmin(user)) return true;
    if (authUtils.isArtisan(user) && user?.id === productOwnerId) return true;
    return false;
  },

  canCreatePost: (user: User | null): boolean => {
    return user !== null; // All authenticated users can create posts
  },

  canEditPost: (user: User | null, postOwnerId: string): boolean => {
    if (authUtils.isAdmin(user)) return true;
    if (user?.id === postOwnerId) return true;
    return false;
  },

  canViewProfile: (user: User | null, profileOwnerId: string): boolean => {
    // Public profiles can be viewed by anyone
    // Private profiles only by owner or admin
    if (authUtils.isAdmin(user)) return true;
    if (user?.id === profileOwnerId) return true;
    return true; // Assuming profiles are public by default
  },

  canEditProfile: (user: User | null, profileOwnerId: string): boolean => {
    if (authUtils.isAdmin(user)) return true;
    if (user?.id === profileOwnerId) return true;
    return false;
  },

  canManageUsers: (user: User | null): boolean => {
    return authUtils.isAdmin(user);
  },

  canApproveArtisan: (user: User | null): boolean => {
    return authUtils.isAdmin(user);
  },

  canRequestArtisanUpgrade: (user: User | null): boolean => {
    return authUtils.isCustomer(user);
  },

  // Login redirect logic
  getRedirectPath: (user: User | null): string => {
    if (!user) return '/auth/login';

    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.ARTISAN:
        return '/artisan/dashboard';
      case UserRole.CUSTOMER:
        return '/home';
      default:
        return '/home';
    }
  },

  getDefaultRoute: (userRole: UserRole): string => {
    switch (userRole) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.ARTISAN:
        return '/artisan/dashboard';
      case UserRole.CUSTOMER:
        return '/home';
      default:
        return '/home';
    }
  },

  // Session management
  shouldRefreshToken: (token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      // Refresh if token expires within 5 minutes
      return timeUntilExpiry < 300;
    } catch {
      return true;
    }
  },

  getTimeUntilExpiry: (token: string): number | null => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return Math.max(0, decoded.exp - currentTime);
    } catch {
      return null;
    }
  },

  // Security helpers
  generateRandomString: (length: number = 32): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  generateStateParameter: (): string => {
    return authUtils.generateRandomString(32);
  },

  // Password validation
  validatePassword: (
    password: string,
  ): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (password.length > 128) {
      errors.push('Mật khẩu không được quá 128 ký tự');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }

    if (!/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  getPasswordStrength: (
    password: string,
  ): {
    score: number; // 0-4
    label: string;
    color: string;
  } => {
    let score = 0;

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character types
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    // Normalize to 0-4
    score = Math.min(4, Math.floor(score / 1.5));

    const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
    const strengthColors = ['red', 'orange', 'yellow', 'blue', 'green'];

    return {
      score,
      label: strengthLabels[score],
      color: strengthColors[score],
    };
  },

  // Username validation
  validateUsername: (
    username: string,
  ): {
    isValid: boolean;
    error?: string;
  } => {
    if (username.length < 3) {
      return { isValid: false, error: 'Username phải có ít nhất 3 ký tự' };
    }

    if (username.length > 20) {
      return { isValid: false, error: 'Username không được quá 20 ký tự' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        isValid: false,
        error: 'Username chỉ được chứa chữ, số và dấu gạch dưới',
      };
    }

    if (/^[0-9]/.test(username)) {
      return { isValid: false, error: 'Username không được bắt đầu bằng số' };
    }

    const reservedUsernames = [
      'admin',
      'root',
      'administrator',
      'mod',
      'moderator',
      'system',
      'support',
      'help',
      'info',
      'contact',
      'api',
      'www',
      'mail',
      'email',
      'ftp',
      'blog',
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      return { isValid: false, error: 'Username này đã được sử dụng' };
    }

    return { isValid: true };
  },

  // Email validation
  validateEmail: (
    email: string,
  ): {
    isValid: boolean;
    error?: string;
  } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email không hợp lệ' };
    }

    if (email.length > 254) {
      return { isValid: false, error: 'Email quá dài' };
    }

    return { isValid: true };
  },

  // Device and browser detection
  getDeviceInfo: (): {
    userAgent: string;
    platform: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  } => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    const isMobile =
      /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(
        userAgent,
      );
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    return {
      userAgent,
      platform,
      isMobile,
      isTablet,
      isDesktop,
    };
  },

  // Session timeout warning
  getSessionTimeoutWarning: (
    token: string,
  ): {
    shouldWarn: boolean;
    timeLeft: number;
  } => {
    const timeLeft = authUtils.getTimeUntilExpiry(token);

    if (!timeLeft) {
      return { shouldWarn: false, timeLeft: 0 };
    }

    // Warn when 5 minutes left
    const shouldWarn = timeLeft <= 300;

    return { shouldWarn, timeLeft };
  },

  // Format time until expiry
  formatTimeUntilExpiry: (seconds: number): string => {
    if (seconds <= 0) return 'Đã hết hạn';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes} phút ${remainingSeconds} giây`;
    }

    return `${remainingSeconds} giây`;
  },
};
