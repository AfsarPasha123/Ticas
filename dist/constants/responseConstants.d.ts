export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const RESPONSE_MESSAGES: {
    readonly AUTH: {
        readonly LOGIN_SUCCESS: "Login successful.";
        readonly REGISTER_SUCCESS: "User registered successfully.";
        readonly INVALID_CREDENTIALS: "Invalid credentials.";
        readonly MISSING_CREDENTIALS: "Email and password are required.";
        readonly USER_EXISTS: "User already exists.";
        readonly MISSING_JWT_SECRET: "JWT secret is not configured.";
        readonly INVALID_TOKEN: "Invalid token.";
        readonly TOKEN_REQUIRED: "Authentication token is required.";
        readonly MISSING_FIELDS: "Required fields are missing.";
    };
    readonly SPACE: {
        readonly CREATED: "Space created successfully.";
        readonly UPDATED: "Space updated successfully.";
        readonly DELETED: "Space deleted successfully.";
        readonly NOT_FOUND: "Space not found.";
        readonly INVALID_DATA: "Invalid data provided.";
        readonly INVALID_ID: "Invalid space ID provided.";
        readonly ACCESS_DENIED: "Access denied to this space.";
        readonly FETCH_SUCCESS: "Spaces retrieved successfully.";
        readonly CREATED_SUCCESSFULLY: "Space created successfully.";
    };
    readonly COLLECTION: {
        readonly CREATED: "Collection created successfully.";
        readonly UPDATED: "Collection updated successfully.";
        readonly DELETED: "Collection deleted successfully.";
        readonly NOT_FOUND: "Collection not found.";
        readonly INVALID_DATA: "Invalid collection data provided.";
        readonly ACCESS_DENIED: "Access denied to this collection.";
        readonly FETCH_SUCCESS: "Collections retrieved successfully.";
    };
    readonly GENERIC: {
        readonly INTERNAL_SERVER_ERROR: "An internal server error occurred.";
        readonly INVALID_REQUEST: "Invalid request.";
        readonly MISSING_FIELDS: "Required fields are missing.";
        readonly DATABASE_ERROR: "Database operation failed.";
        readonly CREATED: "Resource created successfully.";
        readonly UPDATED: "Resource updated successfully.";
        readonly DELETED: "Resource deleted successfully.";
        readonly NOT_FOUND: "Resource not found.";
        readonly FORBIDDEN: "Access denied.";
        readonly FETCH_SUCCESS: "Resources retrieved successfully.";
    };
};
export declare const RESPONSE_TYPES: {
    readonly SUCCESS: "success";
    readonly ERROR: "error";
    readonly WARNING: "warning";
    readonly INFO: "info";
};
/**
 * Standard Response Structure
 */
export interface ApiResponse<T = any> {
    status: typeof RESPONSE_TYPES[keyof typeof RESPONSE_TYPES];
    message: string;
    data?: T;
    error?: string;
}
