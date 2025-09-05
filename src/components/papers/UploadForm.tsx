'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  authors: z.string().min(1, 'At least one author is required'),
  abstract: z.string().max(1000, 'Abstract must be less than 1000 characters').optional(),
  keywords: z.string().optional(),
  year: z.string().optional(),
  file: z.instanceof(FileList).refine((files) => files.length > 0, 'File is required'),
});

type FormData = z.infer<typeof formSchema>;

interface UploadFormProps {
  onSuccess?: () => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      authors: '',
      abstract: '',
      keywords: '',
      year: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue('file', event.target.files);
    }
  };

  const removeFile = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    setFileName('');
    form.setValue('file', new FileList());
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('authors', data.authors);
      if (data.abstract) formData.append('abstract', data.abstract);
      if (data.keywords) formData.append('keywords', data.keywords);
      if (data.year) formData.append('year', data.year);
      formData.append('file', data.file[0]);

      const response = await fetch('/api/papers/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload paper');
      }

      const result = await response.json();
      toast.success('Paper uploaded successfully!');
      
      // Reset form
      form.reset();
      setFileName('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload paper');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Research Paper
        </CardTitle>
        <CardDescription>
          Share your research with the community. Upload a PDF file along with its metadata.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <FormLabel>PDF File</FormLabel>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                {fileName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">{fileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB. Only PDF files are accepted.
              </p>
              {form.formState.errors.file && (
                <p className="text-sm text-red-500">{form.formState.errors.file.message}</p>
              )}
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter paper title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Authors */}
            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authors *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter author names separated by commas" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Separate multiple authors with commas (e.g., "John Doe, Jane Smith")
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Year */}
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="2024" 
                      min="1900" 
                      max={new Date().getFullYear() + 1}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Abstract */}
            <FormField
              control={form.control}
              name="abstract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abstract</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter paper abstract" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Optional: Brief summary of your research
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Keywords */}
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter keywords separated by commas" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Separate multiple keywords with commas (e.g., "machine learning, AI, research")
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Paper
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}