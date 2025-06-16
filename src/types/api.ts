// API specific types
export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
  uploaded?: boolean;
}
