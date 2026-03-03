import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  X, 
  Upload, 
  Download, 
  History, 
  Eye,
  Tag,
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OasisItem {
  id: string;
  code: string;
  label: string;
  description?: string;
  category?: string;
}

interface Keyword {
  id: string;
  term: string;
  tag_type?: string;
  usage_count: number;
  last_matched_at?: string;
  synonyms?: KeywordSynonym[];
}

interface KeywordSynonym {
  id: string;
  synonym: string;
}

const tagTypeColors = {
  device: "bg-blue-100 text-blue-800 border-blue-200",
  risk: "bg-red-100 text-red-800 border-red-200", 
  symptom: "bg-orange-100 text-orange-800 border-orange-200",
  action: "bg-green-100 text-green-800 border-green-200",
  env: "bg-purple-100 text-purple-800 border-purple-200",
  general: "bg-gray-100 text-gray-800 border-gray-200"
};

export function KeywordsManager() {
  const [oasisItems, setOasisItems] = useState<OasisItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<OasisItem | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newTagType, setNewTagType] = useState<string>("general");
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkKeywords, setBulkKeywords] = useState("");
  const [addingSynonymFor, setAddingSynonymFor] = useState<string | null>(null);
  const [newSynonym, setNewSynonym] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadOasisItems();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      loadKeywords(selectedItem.id);
    }
  }, [selectedItem]);

  const loadOasisItems = async () => {
    try {
      const { data, error } = await supabase
        .from('oasis_items')
        .select('*')
        .order('code');

      if (error) throw error;
      setOasisItems(data || []);
      
      if (data?.length > 0 && !selectedItem) {
        setSelectedItem(data[0]);
      }
    } catch (error) {
      console.error('Error loading OASIS items:', error);
      toast({
        title: "Error",
        description: "Failed to load OASIS items",
        variant: "destructive"
      });
    }
  };

  const loadKeywords = async (oasisItemId: string) => {
    try {
      const { data: keywordData, error: keywordError } = await supabase
        .from('keywords')
        .select(`
          *,
          keyword_synonyms (
            id,
            synonym
          )
        `)
        .eq('oasis_item_id', oasisItemId)
        .order('term');

      if (keywordError) throw keywordError;

      const formattedKeywords = keywordData?.map(k => ({
        ...k,
        synonyms: k.keyword_synonyms || []
      })) || [];

      setKeywords(formattedKeywords);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast({
        title: "Error",
        description: "Failed to load keywords",
        variant: "destructive"
      });
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim() || !selectedItem) return;

    try {
      const { error } = await supabase
        .from('keywords')
        .insert({
          oasis_item_id: selectedItem.id,
          term: newKeyword.trim(),
          tag_type: newTagType
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Keyword added successfully"
      });

      setNewKeyword("");
      setIsAddingKeyword(false);
      loadKeywords(selectedItem.id);
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast({
        title: "Error", 
        description: "Failed to add keyword",
        variant: "destructive"
      });
    }
  };

  const deleteKeyword = async (keywordId: string) => {
    try {
      const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('id', keywordId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Keyword deleted successfully"
      });

      if (selectedItem) {
        loadKeywords(selectedItem.id);
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
      toast({
        title: "Error",
        description: "Failed to delete keyword", 
        variant: "destructive"
      });
    }
  };

  const addSynonym = async (keywordId: string) => {
    if (!newSynonym.trim()) return;

    try {
      const { error } = await supabase
        .from('keyword_synonyms')
        .insert({
          keyword_id: keywordId,
          synonym: newSynonym.trim()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Synonym added successfully"
      });

      setNewSynonym("");
      setAddingSynonymFor(null);
      if (selectedItem) {
        loadKeywords(selectedItem.id);
      }
    } catch (error) {
      console.error('Error adding synonym:', error);
      toast({
        title: "Error",
        description: "Failed to add synonym",
        variant: "destructive"
      });
    }
  };

  const deleteSynonym = async (synonymId: string) => {
    try {
      const { error } = await supabase
        .from('keyword_synonyms')
        .delete()
        .eq('id', synonymId);

      if (error) throw error;

      toast({
        title: "Success", 
        description: "Synonym deleted successfully"
      });

      if (selectedItem) {
        loadKeywords(selectedItem.id);
      }
    } catch (error) {
      console.error('Error deleting synonym:', error);
      toast({
        title: "Error",
        description: "Failed to delete synonym",
        variant: "destructive"
      });
    }
  };

  const processBulkImport = async () => {
    if (!bulkKeywords.trim() || !selectedItem) return;

    const terms = bulkKeywords
      .split(/[,;\n]/)
      .map(term => term.trim())
      .filter(term => term.length > 0)
      .filter((term, index, arr) => arr.indexOf(term) === index); // Remove duplicates

    if (terms.length === 0) {
      toast({
        title: "Error",
        description: "No valid keywords found to import",
        variant: "destructive"
      });
      return;
    }

    try {
      const insertData = terms.map(term => ({
        oasis_item_id: selectedItem.id,
        term,
        tag_type: 'general'
      }));

      const { error } = await supabase
        .from('keywords')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Imported ${terms.length} keywords successfully`
      });

      setBulkKeywords("");
      setIsBulkImportOpen(false);
      loadKeywords(selectedItem.id);
    } catch (error) {
      console.error('Error importing keywords:', error);
      toast({
        title: "Error",
        description: "Failed to import keywords",
        variant: "destructive"
      });
    }
  };

  const exportKeywords = async () => {
    if (!selectedItem) return;

    const csvContent = keywords.map(k => {
      const synonymsStr = k.synonyms?.map(s => s.synonym).join(';') || '';
      return `"${k.term}","${k.tag_type || ''}","${synonymsStr}","${k.usage_count}","${k.last_matched_at || ''}"`;
    }).join('\n');

    const header = 'Keyword,Type,Synonyms,Usage Count,Last Matched\n';
    const csv = header + csvContent;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedItem.code}_keywords.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredItems = oasisItems.filter(item => 
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Left Panel - OASIS Items */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            OASIS Items
          </CardTitle>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[450px] overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 border-b cursor-pointer hover:bg-primary/10 transition-colors ${
                  selectedItem?.id === item.id ? 'bg-accent' : ''
                }`}
              >
                <div className={`font-medium text-sm ${
                  selectedItem?.id === item.id ? 'text-white' : ''
                }`}>{item.code}</div>
                <div className={`text-sm ${
                  selectedItem?.id === item.id ? 'text-white/80' : 'text-muted-foreground'
                }`}>{item.label}</div>
                {item.category && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {item.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Keywords */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Keywords {selectedItem && `- ${selectedItem.code}`}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={exportKeywords}
                disabled={!selectedItem || keywords.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={!selectedItem}>
                    <Upload className="h-4 w-4 mr-1" />
                    Bulk Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Import Keywords</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bulkKeywords">Keywords (comma, semicolon, or newline separated)</Label>
                      <Textarea
                        id="bulkKeywords"
                        placeholder="walker, rollator, walking frame&#10;shower chair&#10;grab bars"
                        value={bulkKeywords}
                        onChange={(e) => setBulkKeywords(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={processBulkImport}>
                        Import Keywords
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                onClick={() => setIsAddingKeyword(true)}
                disabled={!selectedItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Keyword
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedItem ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select an OASIS Item</h3>
              <p className="text-muted-foreground">
                Choose an OASIS item from the left panel to manage its keywords
              </p>
            </div>
          ) : (
            <div className="max-h-[450px] overflow-y-auto space-y-4">
              {/* Add New Keyword Form */}
              {isAddingKeyword && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter keyword..."
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                        />
                        <Select value={newTagType} onValueChange={setNewTagType}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="device">Device</SelectItem>
                            <SelectItem value="risk">Risk</SelectItem>
                            <SelectItem value="symptom">Symptom</SelectItem>
                            <SelectItem value="action">Action</SelectItem>
                            <SelectItem value="env">Environment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={addKeyword}>
                          Add Keyword
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsAddingKeyword(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Keywords List */}
              {keywords.map((keyword) => (
                <Card key={keyword.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{keyword.term}</span>
                        {keyword.tag_type && (
                          <Badge className={`text-xs ${tagTypeColors[keyword.tag_type as keyof typeof tagTypeColors]}`}>
                            {keyword.tag_type}
                          </Badge>
                        )}
                        {keyword.usage_count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {keyword.usage_count} uses
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteKeyword(keyword.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Synonyms */}
                    {keyword.synonyms && keyword.synonyms.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-muted-foreground mb-1">Synonyms:</div>
                        <div className="flex flex-wrap gap-1">
                          {keyword.synonyms.map((synonym) => (
                            <Badge key={synonym.id} variant="secondary" className="text-xs">
                              {synonym.synonym}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteSynonym(synonym.id)}
                                className="h-3 w-3 p-0 ml-1 hover:text-primary"
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Synonym */}
                    {addingSynonymFor === keyword.id ? (
                      <div className="flex space-x-2 mt-2">
                        <Input
                          placeholder="Add synonym..."
                          value={newSynonym}
                          onChange={(e) => setNewSynonym(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSynonym(keyword.id)}
                          className="text-xs"
                        />
                        <Button size="sm" onClick={() => addSynonym(keyword.id)}>
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAddingSynonymFor(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAddingSynonymFor(keyword.id)}
                        className="text-xs h-6 px-2 text-muted-foreground"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add synonym
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {keywords.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No keywords added yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}