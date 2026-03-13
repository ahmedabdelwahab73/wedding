"use client"

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

/**
 * Custom fetch wrapper that handles:
 * 1. Automatic inclusion of Authorization & lang headers.
 * 2. Automatic token refresh if a 401 response is received.
 * 3. Standardized error handling.
 */
export async function apiFetch(endpoint: string, options: any = {}) {
    const accessToken = localStorage.getItem('accessToken');
    const lang = 'ar'; // Default dashboard language
    const timeout = options.timeout || 0; // Default: no timeout

    // Setup headers
    const headers: any = {
        'lang': lang,
        ...options.headers,
    };

    // Only add Authorization if token exists and it's an API request (not login)
    if (accessToken && !endpoint.includes('/auth/login')) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Default to JSON Content-Type if body is not FormData
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const abortController = timeout > 0 ? new AbortController() : null;
    const signal = abortController?.signal;

    const config = {
        ...options,
        headers,
        signal,
    };

    let timeoutId: any = null;
    if (abortController && timeout > 0) {
        timeoutId = setTimeout(() => abortController.abort(), timeout);
    }

    try {
        // First attempt at the request
        let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (timeoutId) clearTimeout(timeoutId);

        // If 401 Unauthorized (invalid/expired token), attempt refresh
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken) {
                try {
                    // Call refresh endpoint
                    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'lang': lang },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (refreshRes.ok) {
                        const data = await refreshRes.json();
                        
                        // Save new access token
                        localStorage.setItem('accessToken', data.accessToken);
                        
                        // Update headers and retry the original request
                        const retryConfig = {
                            ...options,
                            headers: {
                                ...headers,
                                'Authorization': `Bearer ${data.accessToken}`
                            },
                            signal,
                        };
                        
                        // Explicitly clone FormData if present to avoid browser hang on stream consumption
                        if (options.body instanceof FormData) {
                            const newFormData = new FormData();
                            for (const [key, value] of options.body.entries()) {
                                newFormData.append(key, value);
                            }
                            retryConfig.body = newFormData;
                        }
                        
                        if (abortController && timeout > 0) {
                            timeoutId = setTimeout(() => abortController.abort(), timeout);
                        }

                        response = await fetch(`${API_BASE_URL}${endpoint}`, retryConfig);
                        
                        if (timeoutId) clearTimeout(timeoutId);
                    } else {
                        // Refresh token is also invalid/expired - force logout
                        handleLogout();
                        throw new Error('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
                    }
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    handleLogout();
                    throw error;
                }
            } else {
                // No refresh token available - force logout
                handleLogout();
                throw new Error('يرجى تسجيل الدخول');
            }
        }

        return response;
    } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('TIMEOUT');
        }
        throw error;
    }
}

function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Ensure we're in browser environment before redirecting
    if (typeof window !== 'undefined') {
        window.location.replace('/mimo'); 
    }
}
