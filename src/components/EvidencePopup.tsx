import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Clock, ExternalLink, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EvidencePopupProps {
  dataTable: string;
  dataId: string;
  value: string | number;
  children: React.ReactNode;
}

interface SourceDocument {
  id: string;
  title: string;
  content: string;
  document_type: string;
  author_id: string;
  created_at: string;
  metadata: any;
  author?: {
    full_name: string;
    discipline: string;
  };
}

interface DataSourceLink {
  id: string;
  extracted_snippet: string;
  confidence_score: number;
  source_document: SourceDocument;
}

const getDocumentTypeIcon = (type: string) => {
  switch (type) {
    case 'assessment': return <FileText className="h-4 w-4" />;
    case 'note': return <FileText className="h-4 w-4" />;
    case 'transcript': return <FileText className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getDocumentTypeColor = (type: string) => {
  switch (type) {
    case 'assessment': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'note': return 'bg-green-100 text-green-800 border-green-200';
    case 'transcript': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function EvidencePopup({ dataTable, dataId, value, children }: EvidencePopupProps) {
  const [selectedSource, setSelectedSource] = useState<SourceDocument | null>(null);

  // Fetch data source links
  const { data: sourceLinks, isLoading } = useQuery({
    queryKey: ['data-source-links', dataTable, dataId],
    queryFn: async () => {
      // Don't make the request if dataId is empty or invalid
      if (!dataId || dataId === '') {
        return [];
      }

      const { data, error } = await supabase
        .from('data_source_links')
        .select(`
          id,
          extracted_snippet,
          confidence_score,
          source_document:source_documents (
            id,
            title,
            content,
            document_type,
            author_id,
            created_at,
            metadata,
            author:profiles (
              full_name,
              discipline
            )
          )
        `)
        .eq('data_table', dataTable)
        .eq('data_id', dataId)
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      return data as DataSourceLink[];
    },
    enabled: Boolean(dataId && dataId !== ''), // Only run if we have a valid dataId
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-auto p-1 text-left justify-start hover:bg-accent/10">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <span>Data Evidence: {value}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[60vh]">
          {/* Source Documents List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Source Documents</h3>
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading evidence...
                </div>
              ) : !sourceLinks || sourceLinks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No source evidence found for this data point.</p>
                  <p className="text-sm mt-2">This may be calculated or imported data.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sourceLinks.map((link) => (
                    <Card 
                      key={link.id} 
                      className={`cursor-pointer transition-all ${
                        selectedSource?.id === link.source_document.id 
                          ? 'ring-2 ring-primary shadow-md' 
                          : 'hover:shadow-clinical'
                      }`}
                      onClick={() => setSelectedSource(link.source_document)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {link.source_document.title}
                          </CardTitle>
                          <Badge className={getDocumentTypeColor(link.source_document.document_type)}>
                            {getDocumentTypeIcon(link.source_document.document_type)}
                            <span className="ml-1 capitalize">{link.source_document.document_type}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{link.source_document.author?.full_name || 'Unknown Author'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(link.source_document.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {link.source_document.author?.discipline && (
                            <Badge variant="outline" className="text-xs">
                              {link.source_document.author.discipline.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          )}
                          
                          <div className="bg-accent/10 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Extracted Evidence:</p>
                            <p className="text-sm text-muted-foreground italic">
                              "{link.extracted_snippet}"
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-muted-foreground">
                                Confidence: {Math.round((link.confidence_score || 0) * 100)}%
                              </span>
                              <Button variant="ghost" size="sm" className="text-xs h-6">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Full
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Full Document View */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Document Details</h3>
            <ScrollArea className="h-full">
              {selectedSource ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedSource.title}</CardTitle>
                      <Badge className={getDocumentTypeColor(selectedSource.document_type)}>
                        {getDocumentTypeIcon(selectedSource.document_type)}
                        <span className="ml-1 capitalize">{selectedSource.document_type}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{selectedSource.author?.full_name || 'Unknown Author'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(selectedSource.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    {selectedSource.author?.discipline && (
                      <Badge variant="outline">
                        {selectedSource.author.discipline.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Separator className="mb-4" />
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm">{selectedSource.content}</p>
                    </div>
                    
                    {selectedSource.metadata && Object.keys(selectedSource.metadata).length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-sm mb-2">Additional Information</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {Object.entries(selectedSource.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}:</span>
                              <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>Select a source document to view details</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}