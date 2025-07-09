import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  History, 
  Download, 
  Copy, 
  Trash2, 
  Search, 
  Camera, 
  Maximize, 
  MousePointer, 
  Square, 
  Code,
  ExternalLink,
  Image
} from 'lucide-react';
import { useCaptureHistory, CaptureHistoryItem, formatFileSize, formatDate } from '@/lib/storage/capture-history';
import { useToast } from '@/components/ui/use-toast';
import { browser } from 'wxt/browser';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface CaptureHistoryModalProps {
  open: boolean;
  onClose: () => void;
  onBackToMenu: () => void;
}

const typeIcons = {
  visible: Camera,
  fullpage: Maximize,
  element: MousePointer,
  selection: Square,
  css: Code,
};

const typeLabels = {
  visible: 'Visible Area',
  fullpage: 'Full Page',
  element: 'Element',
  selection: 'Selection',
  css: 'CSS Selector',
};

export default function CaptureHistoryModal({ open, onClose, onBackToMenu }: CaptureHistoryModalProps) {
  const { history, loading, removeFromHistory, clearHistory } = useCaptureHistory();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [formatFilter, setFormatFilter] = React.useState<string>('all');
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  const filteredHistory = React.useMemo(() => {
    return history.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesFormat = formatFilter === 'all' || item.format === formatFilter;
      
      return matchesSearch && matchesType && matchesFormat;
    });
  }, [history, searchQuery, typeFilter, formatFilter]);

  const handleCopyToClipboard = async (item: CaptureHistoryItem) => {
    try {
      const blob = await fetch(item.dataUrl).then(r => r.blob());
      
      if ('ClipboardItem' in window) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
      } else {
        await navigator.clipboard.writeText(item.dataUrl);
      }
      
      toast({
        title: "Copied to clipboard!",
        description: "The screenshot has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Failed to copy",
        description: "Could not copy the image to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (item: CaptureHistoryItem) => {
    try {
      const filename = `snapcommand-${item.domain}-${new Date(item.timestamp).toISOString().slice(0, 19).replace(/:/g, '-')}.${item.format}`;
      
      await browser.runtime.sendMessage({
        action: 'download',
        url: item.dataUrl,
        filename: filename,
        saveAs: false
      });
      
      toast({
        title: "Download started!",
        description: `Saving as ${filename}`,
      });
    } catch (error) {
      console.error('Failed to download:', error);
      toast({
        title: "Download failed",
        description: "Could not download the image.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (item: CaptureHistoryItem) => {
    await removeFromHistory(item.id);
    toast({
      title: "Deleted",
      description: "Screenshot removed from history.",
    });
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all capture history? This action cannot be undone.')) {
      await clearHistory();
      toast({
        title: "History cleared",
        description: "All screenshots have been removed from history.",
      });
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map(item => item.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} selected screenshots?`)) {
      for (const itemId of selectedItems) {
        await removeFromHistory(itemId);
      }
      setSelectedItems(new Set());
      toast({
        title: "Deleted selected",
        description: `${selectedItems.size} screenshots removed from history.`,
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <VisuallyHidden>
          <DialogTitle>Loading Capture History</DialogTitle>
        </VisuallyHidden>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading history...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToMenu}
              className="h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <History className="h-5 w-5" />
            Capture History
            <span className="text-sm text-muted-foreground ml-2">
              ({filteredHistory.length} of {history.length})
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="visible">Visible Area</SelectItem>
              <SelectItem value="fullpage">Full Page</SelectItem>
              <SelectItem value="element">Element</SelectItem>
              <SelectItem value="selection">Selection</SelectItem>
              <SelectItem value="css">CSS Selector</SelectItem>
            </SelectContent>
          </Select>

          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        {history.length > 0 && (
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedItems.size === filteredHistory.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedItems.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete Selected ({selectedItems.size})
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700"
            >
              Clear All History
            </Button>
          </div>
        )}

        {/* History Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No screenshots found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {history.length === 0 
                    ? 'Start capturing screenshots to see them here' 
                    : 'Try adjusting your search or filters'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredHistory.map((item) => {
                const TypeIcon = typeIcons[item.type];
                const isSelected = selectedItems.has(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`relative border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>

                    {/* Image preview */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img
                        src={item.dataUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <TypeIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate" title={item.title}>
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate" title={item.domain}>
                            {item.domain}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="uppercase font-medium">{item.format}</span>
                          <span>•</span>
                          <span>{formatFileSize(item.size)}</span>
                        </div>
                        <span>{formatDate(item.timestamp)}</span>
                      </div>

                      <div className="flex items-center gap-1 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyToClipboard(item)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(item)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.url, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}