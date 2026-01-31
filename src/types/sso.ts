// Types for SSO (Single Sign-On)
// Database types can be inferred or imported if needed later

export interface SSOClient {
    id: string;
    client_id: string;
    client_name: string;
    redirect_uris: string[];
    is_active: boolean;
}

export interface SSOCode {
    code: string;
    user_id: string;
    client_id: string;
    expires_at: string;
    used: boolean;
}

export interface SSOAuthorizeParams {
    client_id: string;
    redirect_uri: string;
    response_type: 'code';
    state?: string;
}

export interface SSOExchangeParams {
    client_id: string;
    code: string;
}
