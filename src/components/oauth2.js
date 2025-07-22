import React from 'react';
import { Github, Mail, Linkedin, User, MessageCircle, Twitter, Apple, GitBranch, Slack } from 'lucide-react';

// OAuth2 Provider Configuration
const OAUTH_PROVIDERS = {
    google: {
        name: 'Google',
        icon: Mail,
        colors: {
            bg: 'bg-red-500 hover:bg-red-600',
            text: 'text-white',
            border: 'border-red-500'
        },
        endpoint: '/oauth2/authorization/google'
    },
    github: {
        name: 'GitHub',
        icon: Github,
        colors: {
            bg: 'bg-gray-800 hover:bg-gray-900',
            text: 'text-white',
            border: 'border-gray-800'
        },
        endpoint: '/oauth2/authorization/github'
    },
    microsoft: {
        name: 'Microsoft',
        icon: User,
        colors: {
            bg: 'bg-blue-500 hover:bg-blue-600',
            text: 'text-white',
            border: 'border-blue-500'
        },
        endpoint: '/oauth2/authorization/microsoft'
    },
    facebook: {
        name: 'Facebook',
        icon: MessageCircle,
        colors: {
            bg: 'bg-blue-600 hover:bg-blue-700',
            text: 'text-white',
            border: 'border-blue-600'
        },
        endpoint: '/oauth2/authorization/facebook'
    },
    discord: {
        name: 'Discord',
        icon: MessageCircle,
        colors: {
            bg: 'bg-indigo-500 hover:bg-indigo-600',
            text: 'text-white',
            border: 'border-indigo-500'
        },
        endpoint: '/oauth2/authorization/discord'
    },
    twitter: {
        name: 'Twitter',
        icon: Twitter,
        colors: {
            bg: 'bg-sky-500 hover:bg-sky-600',
            text: 'text-white',
            border: 'border-sky-500'
        },
        endpoint: '/oauth2/authorization/twitter'
    },
    linkedin: {
        name: 'LinkedIn',
        icon: Linkedin,
        colors: {
            bg: 'bg-blue-700 hover:bg-blue-800',
            text: 'text-white',
            border: 'border-blue-700'
        },
        endpoint: '/oauth2/authorization/linkedin'
    },
    apple: {
        name: 'Apple',
        icon: Apple,
        colors: {
            bg: 'bg-black hover:bg-gray-800',
            text: 'text-white',
            border: 'border-black'
        },
        endpoint: '/oauth2/authorization/apple'
    },
    gitlab: {
        name: 'GitLab',
        icon: GitBranch,
        colors: {
            bg: 'bg-orange-500 hover:bg-orange-600',
            text: 'text-white',
            border: 'border-orange-500'
        },
        endpoint: '/oauth2/authorization/gitlab'
    },
    slack: {
        name: 'Slack',
        icon: Slack,
        colors: {
            bg: 'bg-purple-500 hover:bg-purple-600',
            text: 'text-white',
            border: 'border-purple-500'
        },
        endpoint: '/oauth2/authorization/slack'
    }
};

// OAuth2 Button Component
const OAuth2Button = ({
    provider,
    action = 'sign-in',
    variant = 'filled',
    size = 'medium',
    fullWidth = false,
    baseUrl = 'http://localhost:8888',
    customEndpoints = {},
    onAuthStart,
    onAuthError,
    className = '',
    children,
    iconOnly = false
}) => {
    const providerConfig = OAUTH_PROVIDERS[provider.toLowerCase()];

    if (!providerConfig) {
        console.warn(`OAuth2Button: Unknown provider "${provider}"`);
        return null;
    }

    const { name, icon: Icon, colors, endpoint: defaultEndpoint } = providerConfig;

    // Use custom endpoint if provided, otherwise fall back to default
    const endpoint = customEndpoints[provider.toLowerCase()] || defaultEndpoint;

    // Size classes
    const sizeClasses = {
        small: iconOnly ? 'p-2' : 'px-3 py-2 text-sm',
        medium: iconOnly ? 'p-2.5' : 'px-4 py-2.5 text-base',
        large: iconOnly ? 'p-3' : 'px-6 py-3 text-lg'
    };

    // Icon sizes
    const iconSizes = {
        small: 16,
        medium: 20,
        large: 24
    };

    // Variant classes
    const getVariantClasses = () => {
        switch (variant) {
            case 'outlined':
                return `bg-white hover:bg-gray-50 text-gray-700 border-2 ${colors.border}`;
            case 'ghost':
                return `bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300`;
            default: // filled
                return `${colors.bg} ${colors.text} border border-transparent`;
        }
    };

    const handleAuth = async () => {
        try {
            onAuthStart?.();
            sessionStorage.setItem('oauth_redirect_url', window.location.pathname);
            window.location.href = `${baseUrl}${endpoint}`;
        } catch (error) {
            console.error('OAuth2 authentication error:', error);
            onAuthError?.(error);
        }
    };

    const actionText = action === 'sign-up' ? 'Sign up' : 'Sign in';

    return (
        <button
            onClick={handleAuth}
            className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-lg transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            title={iconOnly ? `${actionText} with ${name}` : undefined}
        >
            <Icon size={iconSizes[size]} />
            {!iconOnly && (children || `${actionText} with ${name}`)}
        </button>
    );
};

// Main OAuth2 Button Group Component
const OAuth2ButtonGroup = ({
    providers = ['google', 'github'],
    action = 'sign-in',
    variant = 'filled',
    size = 'medium',
    layout = 'vertical', // 'vertical', 'horizontal', 'grid'
    baseUrl = 'http://localhost:8888',
    customEndpoints = {}, // Object to override default endpoints
    onAuthStart,
    onAuthError,
    className = '',
    buttonClassName = '',
    showText = true,
    columns = 2 // For grid layout
}) => {
    // Filter out invalid providers
    const validProviders = providers.filter(provider =>
        OAUTH_PROVIDERS[provider.toLowerCase()]
    );

    if (validProviders.length === 0) {
        console.warn('OAuth2ButtonGroup: No valid providers specified');
        return null;
    }

    // Layout classes
    const getLayoutClasses = () => {
        switch (layout) {
            case 'horizontal':
                return 'flex flex-wrap gap-3';
            case 'grid':
                return `grid gap-3 grid-cols-${Math.min(columns, validProviders.length)}`;
            default: // vertical
                return 'space-y-3';
        }
    };

    // Determine if buttons should be full width
    const shouldBeFullWidth = layout === 'vertical';

    return (
        <div className={`${getLayoutClasses()} ${className}`}>
            {validProviders.map((provider) => (
                <OAuth2Button
                    key={provider}
                    provider={provider}
                    action={action}
                    variant={variant}
                    size={size}
                    fullWidth={shouldBeFullWidth}
                    baseUrl={baseUrl}
                    customEndpoints={customEndpoints}
                    onAuthStart={onAuthStart}
                    onAuthError={onAuthError}
                    className={buttonClassName}
                    iconOnly={!showText}
                />
            ))}
        </div>
    );
};

// Demo component to show usage examples
const Demo = () => {
    const handleAuthStart = () => console.log('Auth started');
    const handleAuthError = (err) => console.error('Auth error:', err);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-center mb-8">OAuth2 Button Group Examples</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Vertical Layout */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Vertical Layout</h2>
                    <OAuth2ButtonGroup
                        providers={['google', 'github', 'microsoft']}
                        layout="vertical"
                        onAuthStart={handleAuthStart}
                        onAuthError={handleAuthError}
                    />
                </div>

                {/* Horizontal Layout */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Horizontal Layout</h2>
                    <OAuth2ButtonGroup
                        providers={['google', 'github', 'discord', 'apple']}
                        layout="horizontal"
                        variant="outlined"
                        onAuthStart={handleAuthStart}
                        onAuthError={handleAuthError}
                    />
                </div>

                {/* Grid Layout */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Grid Layout (2 columns)</h2>
                    <OAuth2ButtonGroup
                        providers={['google', 'github', 'microsoft', 'discord']}
                        layout="grid"
                        columns={2}
                        variant="ghost"
                        onAuthStart={handleAuthStart}
                        onAuthError={handleAuthError}
                    />
                </div>

                {/* Custom Endpoints Example */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Custom Endpoints</h2>
                    <OAuth2ButtonGroup
                        providers={['google', 'github', 'microsoft']}
                        layout="vertical"
                        customEndpoints={{
                            google: '/auth/google/login',
                            github: '/auth/github/login',
                            microsoft: '/auth/microsoft/login'
                        }}
                        onAuthStart={handleAuthStart}
                        onAuthError={handleAuthError}
                    />
                </div>
            </div>

            {/* Large Example */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Providers (Grid 3 columns)</h2>
                <OAuth2ButtonGroup
                    providers={['google', 'github', 'microsoft', 'facebook', 'discord', 'twitter', 'linkedin', 'apple', 'gitlab']}
                    layout="grid"
                    columns={3}
                    size="small"
                    onAuthStart={handleAuthStart}
                    onAuthError={handleAuthError}
                />
            </div>
        </div>
    );
};

// Export the main component
export default OAuth2ButtonGroup;

// Also export individual components for flexibility
export { OAuth2Button, OAuth2ButtonGroup };