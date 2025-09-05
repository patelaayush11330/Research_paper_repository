'use client';

import { useState, useEffect } from 'react';
import { PaperCard } from './PaperCard';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  keywords?: string[];
  year?: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaperListProps {
  papers?: Paper[];
  pagination?: Pagination;
  onLoadMore?: () => void;
  loading?: boolean;
  searchQuery?: string;
}

export function PaperList({ 
  papers = [], 
  pagination, 
  onLoadMore, 
  loading = false,
  searchQuery 
}: PaperListProps) {
  const [displayedPapers, setDisplayedPapers] = useState<Paper[]>(papers);

  useEffect(() => {
    setDisplayedPapers(papers);
  }, [papers]);

  if (displayedPapers.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {searchQuery ? 'No papers found' : 'No papers available'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery 
            ? `No papers match your search for "${searchQuery}". Try different keywords.`
            : 'Be the first to upload a research paper!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Papers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedPapers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Load More Button */}
      {pagination?.hasNext && onLoadMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onLoadMore}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Load More Papers
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <div>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} papers
          </div>
          <div className="mt-2 sm:mt-0">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>
      )}
    </div>
  );
}