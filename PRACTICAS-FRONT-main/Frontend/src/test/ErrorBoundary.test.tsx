import { describe, it, expect, beforeEach } from '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Test Content</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders error UI when there is an error', () => {
        const ThrowError = () => {
            throw new Error('Test error');
        };

        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
        expect(screen.getByText('Recargar página')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });
});
