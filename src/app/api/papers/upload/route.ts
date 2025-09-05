import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadFile } from '@/lib/firebase';
import { validatePaperUpload, validateFile } from '@/lib/validation';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const authors = formData.get('authors') as string;
    const abstract = formData.get('abstract') as string;
    const keywords = formData.get('keywords') as string;
    const year = formData.get('year') as string;

    // Validate file first
    if (file) {
      try {
        validateFile(file);
      } catch (error) {
        return NextResponse.json(
          { error: 'File validation failed', details: error.details },
          { status: 400 }
        );
      }
    }

    // Validate all data
    try {
      const validatedData = validatePaperUpload({
        title,
        authors,
        abstract,
        keywords,
        year,
        file,
      });

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;

      // Upload file to Firebase Storage
      const fileUrl = await uploadFile(buffer, uniqueFileName, file.type);

      // Create paper record in database
      const paper = await db.paper.create({
        data: {
          title: validatedData.title,
          authors: validatedData.authors,
          abstract: validatedData.abstract,
          keywords: validatedData.keywords,
          year: validatedData.year,
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
        },
      });

      return NextResponse.json({
        message: 'Paper uploaded successfully',
        paper: {
          id: paper.id,
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          keywords: paper.keywords,
          year: paper.year,
          fileName: paper.fileName,
          fileUrl: paper.fileUrl,
          fileSize: paper.fileSize,
          createdAt: paper.createdAt,
        },
      });

    } catch (error) {
      if (error.code === 'VALIDATION_ERROR') {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: 400 }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('Error uploading paper:', error);
    
    // Handle specific error types
    if (error.code === 'STORAGE_ERROR') {
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    if (error.code === 'DATABASE_ERROR') {
      return NextResponse.json(
        { error: 'Failed to save paper metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while uploading the paper' },
      { status: 500 }
    );
  }
}