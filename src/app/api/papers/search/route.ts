import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateSearch, validatePaperId } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const searchParamsObj = {
      query: searchParams.get('q') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      field: searchParams.get('field') || 'all',
    };

    const validatedParams = validateSearch(searchParamsObj);
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    if (!validatedParams.query.trim()) {
      return NextResponse.json({
        papers: [],
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    // Build search query based on field
    let where = {};
    const searchQuery = validatedParams.query.trim();

    switch (validatedParams.field) {
      case 'title':
        where = { title: { contains: searchQuery, mode: 'insensitive' as const } };
        break;
      case 'authors':
        where = { authors: { has: searchQuery } };
        break;
      case 'abstract':
        where = { abstract: { contains: searchQuery, mode: 'insensitive' as const } };
        break;
      case 'keywords':
        where = { keywords: { has: searchQuery } };
        break;
      default: // 'all'
        where = {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' as const } },
            { abstract: { contains: searchQuery, mode: 'insensitive' as const } },
            { authors: { has: searchQuery } },
            { keywords: { has: searchQuery } },
          ],
        };
    }

    // Get total count
    const totalCount = await db.paper.count({ where });

    // Get papers
    const papers = await db.paper.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
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
      searchInfo: {
        query: searchQuery,
        field: validatedParams.field,
        resultCount: totalCount,
      },
    });
  } catch (error) {
    console.error('Error searching papers:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search papers' },
      { status: 500 }
    );
  }
}