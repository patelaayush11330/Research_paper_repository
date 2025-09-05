'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Download, FileText, Users } from 'lucide-react';
import { format } from 'date-fns';

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

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    window.open(paper.fileUrl, '_blank');
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {paper.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span className="line-clamp-1">
                {paper.authors.join(', ')}
              </span>
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-shrink-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {paper.abstract && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Abstract</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {paper.abstract}
            </p>
          </div>
        )}

        {paper.keywords && paper.keywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Keywords</h4>
            <div className="flex flex-wrap gap-1">
              {paper.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {paper.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{paper.year}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{formatFileSize(paper.fileSize)}</span>
            </div>
          </div>
          <div>
            {format(new Date(paper.createdAt), 'MMM dd, yyyy')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}