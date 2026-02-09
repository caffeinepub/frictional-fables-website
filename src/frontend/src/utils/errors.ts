/**
 * Normalizes errors from backend or frontend into user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  // If it's an Error object
  if (error instanceof Error) {
    // Check for backend trap messages (these are the most specific)
    if (error.message) {
      // Backend authorization errors
      if (error.message.includes('Unauthorized')) {
        return error.message;
      }
      // Backend validation errors
      if (error.message.includes('required') || 
          error.message.includes('cannot be empty') ||
          error.message.includes('Invalid')) {
        return error.message;
      }
      // Return the full error message from backend
      return error.message;
    }
  }

  // If it's a string
  if (typeof error === 'string') {
    return error;
  }

  // If it's an object with a message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'An unexpected error occurred';
}

/**
 * Admin login error types
 */
export enum AdminLoginErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  AUTHORIZATION_ISSUE = 'authorization_issue',
  UNKNOWN = 'unknown'
}

/**
 * Classifies admin login errors into specific types for better UX
 */
export function classifyAdminLoginError(error: unknown): {
  type: AdminLoginErrorType;
  message: string;
} {
  // Handle invalid credentials (backend returns false, we throw this error)
  if (error instanceof Error && error.message === 'Invalid admin credentials') {
    return {
      type: AdminLoginErrorType.INVALID_CREDENTIALS,
      message: 'Invalid admin credentials. Please check your admin name and password.'
    };
  }

  // Handle authorization/initialization issues (backend traps)
  if (error instanceof Error && error.message.includes('Unauthorized')) {
    return {
      type: AdminLoginErrorType.AUTHORIZATION_ISSUE,
      message: 'Admin sign-in failed due to an authorization issue. Please re-login with Internet Identity and try again.'
    };
  }

  // Handle actor not available
  if (error instanceof Error && error.message.includes('Actor not available')) {
    return {
      type: AdminLoginErrorType.AUTHORIZATION_ISSUE,
      message: 'Admin sign-in failed due to an authorization issue. Please re-login with Internet Identity and try again.'
    };
  }

  // Handle any other errors
  return {
    type: AdminLoginErrorType.UNKNOWN,
    message: 'Admin sign-in failed. Please try again or contact support if the issue persists.'
  };
}

/**
 * Validates file before upload
 */
export function validateBookFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select a file to upload' };
  }

  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload a PDF (.pdf), Word Document (.doc), or Word Document (.docx) file' 
    };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File is too large. Maximum file size is 50MB' 
    };
  }

  return { valid: true };
}

/**
 * Validates image file before upload
 */
export function validateImageFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select an image to upload' };
  }

  if (!file.type.startsWith('image/')) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload an image file (PNG, JPG, WEBP, etc.)' 
    };
  }

  // Check file size (max 10MB for images)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Image is too large. Maximum file size is 10MB' 
    };
  }

  return { valid: true };
}
