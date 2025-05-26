export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
  };
  layout: {
    borderRadius: string;
    spacing: string;
    cardStyle: 'flat' | 'shadow' | 'border' | 'elevated';
    headerStyle: 'minimal' | 'classic' | 'modern' | 'artistic';
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'traditional' | 'artistic' | 'minimal';
  previewImage: string;
  isPremium: boolean;
  config: ThemeConfig;
}
