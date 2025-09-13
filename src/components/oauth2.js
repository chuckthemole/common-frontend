import React from 'react';
import { Github, Mail, Linkedin, User, MessageCircle, Twitter, Apple, GitBranch, Slack } from 'lucide-react';

/**
 * OAuth2 Providers Configuration
 * Each provider has:
 * - name: Display name
 * - icon: Lucide icon component
 * - endpoint: OAuth2 endpoint
 * Bulma classes will handle colors and button styles
 */
const OAUTH_PROVIDERS = {
    google: { name: 'Google', icon: Mail, endpoint: '/oauth2/authorization/google' },
    github: { name: 'GitHub', icon: Github, endpoint: '/oauth2/authorization/github' },
    microsoft: { name: 'Microsoft', icon: User, endpoint: '/oauth2/authorization/microsoft' },
    facebook: { name: 'Facebook', icon: MessageCircle, endpoint: '/oauth2/authorization/facebook' },
    discord: { name: 'Discord', icon: MessageCircle, endpoint: '/oauth2/authorization/discord' },
    twitter: { name: 'Twitter', icon: Twitter, endpoint: '/oauth2/authorization/twitter' },
    linkedin: { name: 'LinkedIn', icon: Linkedin, endpoint: '/oauth2/authorization/linkedin' },
    apple: { name: 'Apple', icon: Apple, endpoint: '/oauth2/authorization/apple' },
    gitlab: { name: 'GitLab', icon: GitBranch, endpoint: '/oauth2/authorization/gitlab' },
    slack: { name: 'Slack', icon: Slack, endpoint: '/oauth2/authorization/slack' }
};

/**
 * Maps each provider to a Bulma color class
 * Adjust colors for clarity and branding
 */
const PROVIDER_BULMA_CLASSES = {
    google: 'is-info',     // red
    github: 'is-dark',       // dark gray
    microsoft: 'is-danger',    // blue
    facebook: 'is-link',     // blue
    discord: 'is-primary',   // indigo
    twitter: 'is-info',      // light blue
    linkedin: 'is-link',     // darker blue
    apple: 'is-black',       // black
    gitlab: 'is-warning',    // orange
    slack: 'is-primary'      // purple-ish
};

/**
 * OAuth2Button
 * Renders a single OAuth2 login button
 */
const OAuth2Button = ({
    provider,
    size = 'medium',       // small, medium, large
    fullWidth = false,
    iconOnly = false,
    variant = 'filled',    // filled, outlined
    baseUrl = 'http://localhost:8888',
    customEndpoints = {},
    onAuthStart,
    onAuthError
}) => {
    const providerConfig = OAUTH_PROVIDERS[provider.toLowerCase()];
    if (!providerConfig) return null;

    const { name, icon: Icon, endpoint: defaultEndpoint } = providerConfig;
    const endpoint = customEndpoints[provider.toLowerCase()] || defaultEndpoint;

    // Handle authentication redirect
    const handleAuth = () => {
        try {
            onAuthStart?.();
            sessionStorage.setItem('oauth_redirect_url', window.location.pathname);
            window.location.href = `${baseUrl}${endpoint}`;
        } catch (err) {
            console.error('OAuth error', err);
            onAuthError?.(err);
        }
    };

    // Bulma button classes
    const classes = [
        'button',
        PROVIDER_BULMA_CLASSES[provider.toLowerCase()] || 'is-primary',
        variant === 'outlined' ? 'is-outlined' : '',
        fullWidth ? 'is-fullwidth' : '',
        size === 'small' ? 'is-small' : size === 'large' ? 'is-large' : '' // medium default
    ].join(' ');

    return (
        <button
            onClick={handleAuth}
            className={classes}
            title={iconOnly ? `${name} login` : undefined}
            type="button"
        >
            <Icon size={20} />
            {!iconOnly && <span style={{ marginLeft: '0.5em' }}>Sign in with {name}</span>}
        </button>
    );
};

/**
 * OAuth2ButtonGroup
 * Renders multiple OAuth2 buttons with layout options:
 * - vertical
 * - horizontal
 * - grid (columns specified)
 */
const OAuth2ButtonGroup = ({
    providers = ['google'],
    layout = 'vertical',
    size = 'medium',
    variant = 'filled',
    columns = 2,
    iconOnly = false,
    fullWidth = false,
    baseUrl,
    customEndpoints,
    onAuthStart,
    onAuthError,
    className = ''
}) => {
    const validProviders = providers.filter(p => OAUTH_PROVIDERS[p.toLowerCase()]);
    if (!validProviders.length) return null;

    // Layout classes using Bulma helper classes
    const layoutClasses = {
        vertical: 'buttons is-flex is-flex-direction-column',
        horizontal: 'buttons',
        grid: `columns is-multiline`
    };

    return (
        <div className={`${layoutClasses[layout] || layoutClasses.vertical} ${className}`}>
            {validProviders.map(p => (
                <div key={p} className={layout === 'grid' ? `column is-${12 / columns}` : ''}>
                    <OAuth2Button
                        provider={p}
                        size={size}
                        variant={variant}
                        fullWidth={fullWidth || layout === 'vertical'}
                        iconOnly={iconOnly}
                        baseUrl={baseUrl}
                        customEndpoints={customEndpoints}
                        onAuthStart={onAuthStart}
                        onAuthError={onAuthError}
                    />
                </div>
            ))}
        </div>
    );
};

// Export components for flexibility
export default OAuth2ButtonGroup;
export { OAuth2Button, OAuth2ButtonGroup };
