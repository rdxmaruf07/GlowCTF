import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { useGlobalAnimation } from '@/contexts/animation-context';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function GlobalAnimationControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    isGlobalAnimationEnabled, 
    toggleGlobalAnimation, 
    stopGlobalAnimation, 
    startGlobalAnimation, 
    resetGlobalAnimation 
  } = useGlobalAnimation();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Card className="bg-background/95 backdrop-blur-sm border border-border shadow-lg">
        {/* Main Control Button */}
        <div className="p-2">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Animation Controls</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={isGlobalAnimationEnabled ? "default" : "secondary"}
                  onClick={toggleGlobalAnimation}
                  className="h-8 px-3"
                >
                  {isGlobalAnimationEnabled ? (
                    <Pause className="h-3 w-3 mr-1" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  <span className="text-xs">
                    {isGlobalAnimationEnabled ? 'Pause' : 'Play'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isGlobalAnimationEnabled ? 'Pause all animations' : 'Resume all animations'}</p>
              </TooltipContent>
            </Tooltip>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="px-2 pb-2 border-t border-border">
            <div className="pt-2 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">
                Global Animation Controls
              </div>
              
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={startGlobalAnimation}
                      disabled={isGlobalAnimationEnabled}
                      className="flex-1 h-7 text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start all animations</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={stopGlobalAnimation}
                      disabled={!isGlobalAnimationEnabled}
                      className="flex-1 h-7 text-xs"
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop all animations</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetGlobalAnimation}
                      className="flex-1 h-7 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all animations</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="text-xs text-muted-foreground">
                Status: {isGlobalAnimationEnabled ? (
                  <span className="text-green-500">Active</span>
                ) : (
                  <span className="text-red-500">Paused</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}