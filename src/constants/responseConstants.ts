// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
} as const;

// Response Messages
export const RESPONSE_MESSAGES = {
    // Auth Messages
    AUTH: {
        LOGIN_SUCCESS: 'Login successful.',
        REGISTER_SUCCESS: 'User registered successfully.',
        INVALID_CREDENTIALS: 'Invalid credentials.',
        MISSING_CREDENTIALS: 'Email and password are required.',
        USER_EXISTS: 'User already exists.',
        MISSING_JWT_SECRET: 'JWT secret is not configured.',
        INVALID_TOKEN: 'Invalid token.',
        TOKEN_REQUIRED: 'Authentication token is required.',
        MISSING_FIELDS: 'Required fields are missing.'
    },

    // Space Messages
    SPACE: {
        CREATED: 'Space created successfully.',
        UPDATED: 'Space updated successfully.',
        DELETED: 'Space deleted successfully.',
        NOT_FOUND: 'Space not found.',
        INVALID_DATA: 'Invalid data provided.',
        INVALID_ID: 'Invalid space ID provided.',
        ACCESS_DENIED: 'Access denied to this space.',
        FETCH_SUCCESS: 'Spaces retrieved successfully.',
        CREATED_SUCCESSFULLY: 'Space created successfully.'
    },

    // Collection Messages
    COLLECTION: {
        CREATED: 'Collection created successfully.',
        UPDATED: 'Collection updated successfully.',
        DELETED: 'Collection deleted successfully.',
        NOT_FOUND: 'Collection not found.',
        INVALID_DATA: 'Invalid collection data provided.',
        ACCESS_DENIED: 'Access denied to this collection.',
        FETCH_SUCCESS: 'Collections retrieved successfully.'
    },

    // Generic Messages
    GENERIC: {
        INTERNAL_SERVER_ERROR: 'An internal server error occurred.',
        INVALID_REQUEST: 'Invalid request.',
        MISSING_FIELDS: 'Required fields are missing.',
        DATABASE_ERROR: 'Database operation failed.',
        CREATED: 'Resource created successfully.',
        UPDATED: 'Resource updated successfully.',
        DELETED: 'Resource deleted successfully.',
        NOT_FOUND: 'Resource not found.',
        FORBIDDEN: 'Access denied.',
        FETCH_SUCCESS: 'Resources retrieved successfully.'
    }
} as const;

// Response Types
export const RESPONSE_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
} as const;

/**
 * Standard Response Structure
 */
export interface ApiResponse<T = any> {
    status: typeof RESPONSE_TYPES[keyof typeof RESPONSE_TYPES];
    message: string;
    data?: T;
    error?: string;
}
