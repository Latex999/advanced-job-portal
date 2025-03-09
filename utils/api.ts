import { NextResponse } from 'next/server';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

export const successResponse = <T>(data: T, status = 200): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
};

export const errorResponse = (message: string, status = 400, errors?: Record<string, string[]>): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(errors && { errors }),
    },
    { status }
  );
};

export const notFoundResponse = (message = 'Resource not found'): NextResponse<ApiResponse> => {
  return errorResponse(message, 404);
};

export const unauthorizedResponse = (message = 'Unauthorized'): NextResponse<ApiResponse> => {
  return errorResponse(message, 401);
};

export const forbiddenResponse = (message = 'Forbidden'): NextResponse<ApiResponse> => {
  return errorResponse(message, 403);
};

export const internalServerErrorResponse = (message = 'Internal Server Error'): NextResponse<ApiResponse> => {
  return errorResponse(message, 500);
};

export const parseSearchParams = (searchParams: URLSearchParams): Record<string, any> => {
  const params: Record<string, any> = {};
  
  for (const [key, value] of searchParams.entries()) {
    // Try to parse as number if possible
    const numericValue = Number(value);
    if (!isNaN(numericValue) && value.trim() !== '') {
      params[key] = numericValue;
      continue;
    }
    
    // Handle booleans
    if (value === 'true') {
      params[key] = true;
      continue;
    }
    
    if (value === 'false') {
      params[key] = false;
      continue;
    }
    
    // Handle arrays
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!params[arrayKey]) {
        params[arrayKey] = [];
      }
      params[arrayKey].push(value);
      continue;
    }
    
    // Default to string
    params[key] = value;
  }
  
  return params;
};