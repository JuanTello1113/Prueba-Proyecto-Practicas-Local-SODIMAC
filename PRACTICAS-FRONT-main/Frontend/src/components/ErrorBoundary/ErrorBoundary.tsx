import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                            <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-center text-gray-800">
                            Algo salió mal
                        </h2>
                        <p className="mt-2 text-sm text-center text-gray-600">
                            Lo sentimos, ocurrió un error inesperado. Por favor, recarga la página.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-4 p-3 bg-red-50 rounded text-xs text-red-800 overflow-auto">
                                <p className="font-semibold">Error:</p>
                                <p>{this.state.error.message}</p>
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 w-full bg-[#4669AF] text-white py-2 px-4 rounded-md hover:bg-[#3a5a9b] transition-colors"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
