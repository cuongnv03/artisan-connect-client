import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            😕
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Đã xảy ra lỗi
          </h1>
          <p className="text-gray-600 mb-8">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về
            trang chủ.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Thử lại
            </button>
            <a
              href="/"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }
}
