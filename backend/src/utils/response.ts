import { APIResponse, ErrorResponse, SuccessResponse } from '../types';

/**
 * Create a standardized API response
 */
export const createResponse = <T = any>(
  statusCode: number,
  data: SuccessResponse<T> | ErrorResponse
): APIResponse => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    },
    body: JSON.stringify(data),
  };
};

/**
 * Create a success response
 */
export const successResponse = <T = any>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): APIResponse => {
  return createResponse(statusCode, { message, data });
};

/**
 * Create an error response
 */
export const errorResponse = (
  message: string,
  statusCode: number = 500,
  error?: string
): APIResponse => {
  return createResponse(statusCode, { message, error });
};

/**
 * Parse JSON body from API Gateway event
 */
export const parseBody = <T = any>(body: string | null): T | null => {
  if (!body) return null;
  try {
    return JSON.parse(body) as T;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
};

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = (
  data: any,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => !data || !data[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (items: any[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

/**
 * Generate ISO timestamp
 */
export const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Log with timestamp
 */
export const log = (message: string, data?: any) => {
  const timestamp = getTimestamp();
  console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

/**
 * Log error with timestamp
 */
export const logError = (message: string, error: any) => {
  const timestamp = getTimestamp();
  console.error(`[${timestamp}] ERROR: ${message}`, error);
};
