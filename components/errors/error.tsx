import React from 'react';
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';

// i18n translations
const translations = {
  en: {
    errorTitle: "Something went wrong",
    tryAgain: "Try Again",
    dismiss: "Dismiss"
  },
  vi: {
    errorTitle: "Đã xảy ra lỗi",
    tryAgain: "Thử lại",
    dismiss: "Đóng"
  }
};

// Error Message Component
interface ErrorMessageProps {
  error?: Error | string;
  message?: string;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'default' | 'compact' | 'banner';
  language?: 'en' | 'vi';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  message,
  title,
  onRetry,
  onDismiss,
  variant = 'default',
  language = 'en',
  className = ''
}) => {
  const t = translations[language];
  
  const errorMessage = message || (typeof error === 'string' ? error : error?.message) || '';
  const errorTitle = title || t.errorTitle;

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg ${className}`}>
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">{errorMessage}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 hover:bg-red-100 rounded p-1 transition-colors"
            aria-label={t.dismiss}
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`w-full bg-red-50 border-l-4 border-red-500 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">{errorTitle}</p>
                {errorMessage && (
                  <p className="text-sm text-red-700 mt-0.5">{errorMessage}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
                >
                  {t.tryAgain}
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label={t.dismiss}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto shadow-sm">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {errorTitle}
          </h3>
          
          {errorMessage && (
            <p className="text-sm text-red-700 mb-6 leading-relaxed">
              {errorMessage}
            </p>
          )}
          
          <div className="flex gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                {t.tryAgain}
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {t.dismiss}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const Demo: React.FC = () => {
  const [language, setLanguage] = React.useState<'en' | 'vi'>('en');
  const [showError, setShowError] = React.useState(true);

  const handleRetry = () => {
    console.log('Retry clicked');
    alert('Retrying...');
  };

  const handleDismiss = () => {
    setShowError(false);
    setTimeout(() => setShowError(true), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Error Message Component
          </h1>
          <p className="text-gray-600 mb-6">
            Beautiful error messages with i18n support
          </p>
          
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('vi')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                language === 'vi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tiếng Việt
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Default Variant</h2>
              {showError && (
                <ErrorMessage
                  error={new Error('Failed to load data from server')}
                  onRetry={handleRetry}
                  onDismiss={handleDismiss}
                  language={language}
                />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Compact Variant</h2>
              <div className="flex justify-center">
                <ErrorMessage
                  message="Unable to connect to the network"
                  variant="compact"
                  onDismiss={handleDismiss}
                  language={language}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Banner Variant</h2>
              <ErrorMessage
                title="Connection Error"
                message="Please check your internet connection and try again"
                variant="banner"
                onRetry={handleRetry}
                onDismiss={handleDismiss}
                language={language}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Usage Example</h2>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
{`<ErrorMessage
  error={error}
  onRetry={handleRetry}
  language="vi"
  variant="default"
/>

<ErrorMessage
  message="Custom error message"
  variant="compact"
  onDismiss={handleDismiss}
/>

<ErrorMessage
  title="Error Title"
  message="Error description"
  variant="banner"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Demo;