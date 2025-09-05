'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { debounce } from 'lodash';

interface SearchBarProps {
  onSearch: (query: string, field?: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search papers...", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced search function
  const debouncedSearch = debounce((searchQuery: string, field: string) => {
    onSearch(searchQuery, field);
  }, 300);

  useEffect(() => {
    debouncedSearch(query, searchField);
    return () => debouncedSearch.cancel();
  }, [query, searchField, debouncedSearch]);

  const handleClearSearch = () => {
    setQuery('');
    onSearch('', searchField);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(query, searchField);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Search Input */}
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Advanced Search Options */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Search in:
                </label>
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="authors">Authors</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="keywords">Keywords</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Tips */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Search in multiple fields by selecting "All Fields"</li>
                  <li>Use specific field search for more targeted results</li>
                  <li>Search is case-insensitive</li>
                  <li>Results are sorted by publication date (newest first)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}