import { WebviewMessager } from "@libs/service";

interface ErrorData {
    type: 'javascript' | 'unhandledrejection' | 'resourceError' | 'consoleError' | 'vueError';
    message: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    stack?: string;
    url: string;
    timestamp: number;
    userAgent: string;
    additionalInfo?: string;
}

class GlobalErrorHandler {
    private initialized = false;
    private vueApp: any = null;

    init(vueAppInstance?: any) {
        if (this.initialized) return;

        // Store Vue app instance for Vue-specific error handling
        if (vueAppInstance) {
            this.vueApp = vueAppInstance;
            this.setupVueErrorHandler();
        }

        // Capture JavaScript runtime errors
        window.onerror = (message, filename, lineno, colno, error) => {
            const errorData: ErrorData = {
                type: 'javascript',
                message: message as string,
                filename,
                lineno,
                colno,
                stack: error?.stack,
                url: window.location.href,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            };

            this.sendErrorToCSharp(errorData);
            return false;
        };

        // Capture unhandled promise rejections
        window.onunhandledrejection = (event) => {
            const errorData: ErrorData = {
                type: 'unhandledrejection',
                message: event.reason?.message || event.reason?.toString() || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                url: window.location.href,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            };

            this.sendErrorToCSharp(errorData);
        };

        // Capture resource loading errors
        window.addEventListener('error', (event) => {
            // Skip JS errors (already handled by window.onerror)
            if (event instanceof ErrorEvent && event.filename) {
                return;
            }
            const target = event.target instanceof Element ? event.target.tagName : 'Unknown resource';

            const errorData: ErrorData = {
                type: 'resourceError',
                message: `Resource loading failed: ${target} - ${event.type}`,
                url: window.location.href,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            };

            this.sendErrorToCSharp(errorData);
        }, true);

        // Capture console errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            originalConsoleError.apply(console, args);

            const errorData: ErrorData = {
                type: 'consoleError',
                message: args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' '),
                url: window.location.href,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            };

            this.sendErrorToCSharp(errorData);
        };

        this.initialized = true;
        console.log('Global error handler initialized');
    }

    setupVueErrorHandler() {
        if (this.vueApp && this.vueApp.config) {
            // Vue 3 error handling
            this.vueApp.config.errorHandler = (error: Error, instance: any, info: string) => {
                const errorData: ErrorData = {
                    type: 'vueError',
                    message: error.message,
                    stack: error.stack,
                    url: window.location.href,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    additionalInfo: info
                };

                this.sendErrorToCSharp(errorData);

                // Don't suppress default Vue error logging in development
                console.error('Vue Error:', error);
            };
        }
    }

    sendErrorToCSharp(errorData: ErrorData) {
        WebviewMessager.sendPostMessage(
            {
                Direction: 0,
                MessageDestination: '',
                MessageMethod: 'H5Logs',
                Data: { ...errorData },
            },
        );
    }
}

const globalErrorHandler = new GlobalErrorHandler();
export default globalErrorHandler;