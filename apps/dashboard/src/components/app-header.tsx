import { useMemo } from "react";
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

const shortcutLabel = (() => {
  if (typeof navigator === "undefined") return "⌘B";
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? "")
    ? "⌘B"
    : "Ctrl+B";
})();

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppHeader = ({ collapsed, onToggle }: AppHeaderProps) => {
  const tooltipText = useMemo(
    () =>
      collapsed
        ? `Expand sidebar (${shortcutLabel})`
        : `Collapse sidebar (${shortcutLabel})`,
    [collapsed],
  );

  return (
    <Header
      title="Dashboard"
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
            <TooltipContent>{tooltipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
      end={<ThemeToggle />}
    />
  );
};

export { AppHeader };
