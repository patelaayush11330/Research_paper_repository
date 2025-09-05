import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSearch } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const searchParamsObj = {
      query: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = validateSearch(searchParamsObj);
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Build search query
    const where = validatedParams.query
      ? {
          OR: [
            { title: { contains: validatedParams.query, mode: 'insensitive' as const } },
            { abstract: { contains: validatedParams.query, mode: 'insensitive' as const } },
            { authors: { has: validatedParams.query } },
            { keywords: { has: validatedParams.query } },
          ],
        }
      : {};

    // Get total count
    const totalCount = await db.paper.count({ where });

    // Get papers
    const papers = await db.paper.findMany({
      where,
      orderBy: {
        [validatedParams.sortBy]: validatedParams.sortOrder,
      },
      skip,
      take: validatedParams.limit,
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

    return NextResponse.json({
      papers,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedParams.limit),
        hasNext: validatedParams.page * validatedParams.limit < totalCount,
        hasPrev: validatedParams.page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}