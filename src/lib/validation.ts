import { z } from 'zod';

// Paper upload validation schema
export const paperUploadSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  authors: z.string()
    .min(1, 'At least one author is required')
    .transform(val => val.split(',').map(author => author.trim()).filter(Boolean))
    .transform(authors => {
      if (authors.length === 0) {
        throw new Error('At least one author is required');
      }
      return authors;
    }),
  abstract: z.string()
    .max(2000, 'Abstract must be less than 2000 characters')
    .optional()
    .transform(val => val?.trim() || null),
  keywords: z.string()
    .optional()
    .transform(val => val ? val.split(',').map(keyword => keyword.trim()).filter(Boolean) : []),
  year: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : null)
    .refine(val => val === null || (val >= 1900 && val <= new Date().getFullYear() + 1), {
      message: 'Year must be between 1900 and next year'
    }),
  file: z.instanceof(File, { message: 'File is required' })
    .refine(file => file.size > 0, 'File cannot be empty')
    .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(file => file.type === 'application/pdf', 'Only PDF files are allowed'),
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().max(100, 'Search query too long').optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(50, 'Limit must be at most 50').default(10),
  field: z.enum(['all', 'title', 'authors', 'abstract', 'keywords']).default('all'),
  sortBy: z.enum(['createdAt', 'title', 'year']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Paper ID validation schema
export const paperIdSchema = z.string()
  .min(1, 'Paper ID is required')
  .regex(/^[a-zA-Z0-9-]+$/, 'Invalid paper ID format');

export type PaperUploadData = z.infer<typeof paperUploadSchema>;
export type SearchData = z.infer<typeof searchSchema>;

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: ValidationError[];
}

// Validation helper functions
export function validatePaperUpload(data: any): PaperUploadData {
  try {
    return paperUploadSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validationErrors,
      };
    }
    throw error;
  }
}

export function validateSearch(data: any): SearchData {
  return searchSchema.parse(data);
}

export function validatePaperId(id: string): string {
  return paperIdSchema.parse(id);
}

// File validation helper
export function validateFile(file: File): void {
  const errors: string[] = [];

  if (file.size === 0) {
    errors.push('File cannot be empty');
  }

  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size must be less than 10MB');
  }

  if (file.type !== 'application/pdf') {
    errors.push('Only PDF files are allowed');
  }

  if (errors.length > 0) {
    throw {
      message: 'File validation failed',
      code: 'FILE_VALIDATION_ERROR',
      details: errors,
    };
  }
}