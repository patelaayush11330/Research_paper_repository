import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validatePaperId } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate paper ID
    const paperId = validatePaperId(params.id);

    const paper = await db.paper.findUnique({
      where: { id: paperId },
      select: {
        id: true,
        title: true,
        authors: true,
        abstract: true,
        keywords: true,
        year: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ paper });
  } catch (error) {
    console.error('Error fetching paper:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate paper ID
    const paperId = validatePaperId(params.id);

    const paper = await db.paper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    // Delete from database
    await db.paper.delete({
      where: { id: paperId },
    });

    return NextResponse.json({
      message: 'Paper deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting paper:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    );
  }
}