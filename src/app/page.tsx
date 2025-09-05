'use client';

import { useState, useEffect } from 'react';
import { PaperList } from '@/components/papers/PaperList';
import { UploadForm } from '@/components/papers/UploadForm';
import { SearchBar } from '@/components/papers/SearchBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Upload, Search, Library } from 'lucide-react';
import { toast } from 'sonner';

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
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  const fetchPapers = async (query = '', page = 1, field = 'all') => {
    setLoading(true);
    try {
      const url = query 
        ? `/api/papers/search?q=${encodeURIComponent(query)}&page=${page}&limit=9&field=${field}`
        : `/api/papers?page=${page}&limit=9`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch papers');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setPapers(data.papers);
      } else {
        setPapers(prev => [...prev, ...data.papers]);
      }
      
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string, field?: string) => {
    setSearchQuery(query);
    fetchPapers(query, 1, field);
  };

  const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      fetchPapers(searchQuery, pagination.page + 1);
    }
  };

  const handleUploadSuccess = () => {
    // Refresh the papers list after successful upload
    fetchPapers(searchQuery, 1);
    setActiveTab('browse');
    toast.success('Paper uploaded successfully!');
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Library className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Research Paper Repository</h1>
                <p className="text-sm text-muted-foreground">
                  Discover and share academic research papers
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Papers
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Paper
            </TabsTrigger>
          </TabsList>

          {/* Browse Papers Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search Section */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Explore Research Papers</h2>
                <p className="text-muted-foreground">
                  Search through our collection of academic papers
                </p>
              </div>
              
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search by title, author, abstract, or keywords..."
                className="max-w-2xl mx-auto"
              />
            </div>

            {/* Statistics */}
            {pagination && (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-4">
                  <div className="flex items-center justify-around text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {pagination.totalCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Papers
                      </div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {papers.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Displayed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Papers List */}
            <PaperList
              papers={papers}
              pagination={pagination}
              onLoadMore={handleLoadMore}
              loading={loading}
              searchQuery={searchQuery}
            />
          </TabsContent>

          {/* Upload Paper Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Share Your Research</h2>
              <p className="text-muted-foreground">
                Upload your research paper and contribute to our academic community
              </p>
            </div>

            <UploadForm onSuccess={handleUploadSuccess} />

            {/* Upload Guidelines */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">File Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• PDF format only</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• File name should be descriptive</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Metadata Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Title (required)</li>
                      <li>• Authors (required)</li>
                      <li>• Abstract (optional)</li>
                      <li>• Keywords (optional)</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    By uploading your paper, you agree to make it publicly available for research and educational purposes.
                    Please ensure you have the necessary rights to share the content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Research Paper Repository. Built with Next.js and Firebase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}