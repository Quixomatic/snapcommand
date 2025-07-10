import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X, Coffee, ExternalLink, Github } from 'lucide-react';
import { useUsageStats } from '@/lib/storage/usage-stats';

interface TipFooterProps {
  onDismiss: () => void;
  hideDismiss?: boolean;
}

export default function TipFooter({ onDismiss, hideDismiss = false }: TipFooterProps) {
  const { markTipShown } = useUsageStats();

  const handleKofiClick = () => {
    window.open('https://ko-fi.com/quixomatic', '_blank');
  };

  const handleGithubClick = () => {
    window.open('https://github.com/sponsors/Quixomatic?frequency=one-time', '_blank');
  };
  
  const handleDismiss = () => {
    onDismiss();
    // Don't mark as shown on dismiss, let the parent handle it
  };

  return (
    <div className="border-t bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <Coffee className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Enjoying SnapCommand?</p>
              <p className="text-xs text-muted-foreground">
                Support development with a tip
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="default"
              onClick={handleKofiClick}
              className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 border-0"
            >
              <Coffee className="h-3 w-3 mr-1" />
              Ko-fi
            </Button>
            
            <Button
              size="sm"
              variant="default"
              onClick={handleGithubClick}
              className="text-xs bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black border-0"
            >
              <Github className="h-3 w-3 mr-1" />
              Sponsor
            </Button>
            
            {!hideDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs p-1 h-8 w-8"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}