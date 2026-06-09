import {
  Button,
  Header,
  ThemeToggle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lentil/ui";
import { PanelLeft, PanelLeftClose } from "lucide-react";

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

function AppHeader({ collapsed, onToggle }: AppHeaderProps) {
  return (
    <Header
      title="Lentil UI"
      start={
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                {collapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
      end={<ThemeToggle />}
    />
  );
}

export { AppHeader };
