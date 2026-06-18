import * as React from "react";
import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SidebarAside,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

function renderSidebar(ui: React.ReactNode) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("SidebarProvider", () => {
  it("should render children", () => {
    render(
      <SidebarProvider>
        <div>Sidebar content</div>
      </SidebarProvider>,
    );
    expect(screen.getByText("Sidebar content")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarProvider.displayName).toBe("SidebarProvider");
  });
});

describe("Sidebar", () => {
  it("should render", () => {
    renderSidebar(<Sidebar>Sidebar body</Sidebar>);
    expect(screen.getByText("Sidebar body")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = renderSidebar(
      <Sidebar className="custom-class">Sidebar</Sidebar>,
    );
    expect(container.querySelector(".custom-class")).toBeDefined();
  });

  it("should render with collapsible=none", () => {
    renderSidebar(<Sidebar collapsible="none">Fixed sidebar</Sidebar>);
    expect(screen.getByText("Fixed sidebar")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(Sidebar.displayName).toBe("Sidebar");
  });
});

describe("SidebarTrigger", () => {
  it("should render", () => {
    renderSidebar(<SidebarTrigger />);
    const button = screen.getByRole("button", { name: "Toggle Sidebar" });
    expect(button).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarTrigger.displayName).toBe("SidebarTrigger");
  });
});

describe("SidebarHeader", () => {
  it("should render content", () => {
    renderSidebar(
      <Sidebar>
        <SidebarHeader>Header content</SidebarHeader>
      </Sidebar>,
    );
    expect(screen.getByText("Header content")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarHeader.displayName).toBe("SidebarHeader");
  });
});

describe("SidebarContent", () => {
  it("should render content", () => {
    renderSidebar(
      <Sidebar>
        <SidebarContent>Body content</SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByText("Body content")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarContent.displayName).toBe("SidebarContent");
  });
});

describe("SidebarFooter", () => {
  it("should render content", () => {
    renderSidebar(
      <Sidebar>
        <SidebarFooter>Footer content</SidebarFooter>
      </Sidebar>,
    );
    expect(screen.getByText("Footer content")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarFooter.displayName).toBe("SidebarFooter");
  });
});

describe("SidebarSeparator", () => {
  it("should render", () => {
    renderSidebar(
      <Sidebar>
        <SidebarSeparator />
      </Sidebar>,
    );
    const separator = document.querySelector("[data-sidebar=separator]");
    expect(separator).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarSeparator.displayName).toBe("SidebarSeparator");
  });
});

describe("SidebarGroup", () => {
  it("should render content", () => {
    renderSidebar(
      <Sidebar>
        <SidebarGroup>Group content</SidebarGroup>
      </Sidebar>,
    );
    expect(screen.getByText("Group content")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarGroup.displayName).toBe("SidebarGroup");
  });
});

describe("SidebarGroupLabel", () => {
  it("should render label", () => {
    renderSidebar(
      <Sidebar>
        <SidebarGroup>
          <SidebarGroupLabel>My Group</SidebarGroupLabel>
        </SidebarGroup>
      </Sidebar>,
    );
    expect(screen.getByText("My Group")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarGroupLabel.displayName).toBe("SidebarGroupLabel");
  });
});

describe("SidebarGroupContent", () => {
  it("should render content", () => {
    renderSidebar(
      <Sidebar>
        <SidebarGroupContent>Content</SidebarGroupContent>
      </Sidebar>,
    );
    expect(screen.getByText("Content")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarGroupContent.displayName).toBe("SidebarGroupContent");
  });
});

describe("SidebarGroupAction", () => {
  it("should render button", () => {
    renderSidebar(
      <Sidebar>
        <SidebarGroup>
          <SidebarGroupAction>+</SidebarGroupAction>
        </SidebarGroup>
      </Sidebar>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.textContent).toBe("+");
  });

  it("should have displayName", () => {
    expect(SidebarGroupAction.displayName).toBe("SidebarGroupAction");
  });
});

describe("SidebarMenu", () => {
  it("should render as ul", () => {
    const { container } = renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    const ul = container.querySelector("ul");
    expect(ul).toBeDefined();
  });

  it("should have no list-style", () => {
    const { container } = renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    const ul = container.querySelector("ul");
    expect(ul?.className).toContain("list-none");
  });

  it("should have displayName", () => {
    expect(SidebarMenu.displayName).toBe("SidebarMenu");
  });
});

describe("SidebarMenuItem", () => {
  it("should render li", () => {
    const { container } = renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem />
        </SidebarMenu>
      </Sidebar>,
    );
    const li = container.querySelector("li");
    expect(li).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarMenuItem.displayName).toBe("SidebarMenuItem");
  });
});

describe("SidebarMenuButton", () => {
  it("should render button", () => {
    renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Menu Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    expect(screen.getByText("Menu Item")).toBeDefined();
  });

  it("should apply size variant", () => {
    const { container } = renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">Large</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    const button = container.querySelector("[data-size=lg]");
    expect(button).toBeDefined();
  });

  it("should show tooltip when collapsed", () => {
    renderSidebar(
      <Sidebar collapsible="icon">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Tooltip text">Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    expect(screen.getByText("Item")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarMenuButton.displayName).toBe("SidebarMenuButton");
  });
});

describe("SidebarMenuAction", () => {
  it("should render button", () => {
    renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuAction>×</SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    expect(screen.getByText("×")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarMenuAction.displayName).toBe("SidebarMenuAction");
  });
});

describe("SidebarMenuBadge", () => {
  it("should render badge", () => {
    renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Inbox</SidebarMenuButton>
            <SidebarMenuBadge>3</SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    expect(screen.getByText("3")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarMenuBadge.displayName).toBe("SidebarMenuBadge");
  });
});

describe("SidebarMenuSub", () => {
  it("should render sub menu", () => {
    renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Parent</SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <span>Sub Item</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    expect(screen.getByText("Parent")).toBeDefined();
    expect(screen.getByText("Sub Item")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarMenuSub.displayName).toBe("SidebarMenuSub");
  });
});

describe("SidebarMenuSubItem", () => {
  it("should have displayName", () => {
    expect(SidebarMenuSubItem.displayName).toBe("SidebarMenuSubItem");
  });
});

describe("SidebarMenuSubButton", () => {
  it("should render as a link", () => {
    renderSidebar(
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Parent</SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <span>Sub Link</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>,
    );
    expect(screen.getByText("Sub Link")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarMenuSubButton.displayName).toBe("SidebarMenuSubButton");
  });
});

describe("SidebarAside", () => {
  it("should render as <aside>", () => {
    const { container } = render(<SidebarAside>Aside content</SidebarAside>);
    const aside = container.querySelector("aside");
    expect(aside).toBeDefined();
    expect(aside?.textContent).toBe("Aside content");
  });

  it("should not require SidebarProvider", () => {
    render(<SidebarAside>Standalone</SidebarAside>);
    expect(screen.getByText("Standalone")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <SidebarAside className="my-custom">Content</SidebarAside>,
    );
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("my-custom");
  });

  it("should have shrunk width when collapsed=true", () => {
    const { container } = render(
      <SidebarAside collapsed={true}>Collapsed</SidebarAside>,
    );
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("w-12");
    expect(aside?.className).not.toContain("w-64");
  });

  it("should have expanded width when collapsed=false (default)", () => {
    const { container } = render(<SidebarAside>Expanded</SidebarAside>);
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("w-64");
    expect(aside?.className).not.toContain("w-12");
  });

  it("should forward extra props to the aside element", () => {
    render(<SidebarAside aria-label="Main navigation">Content</SidebarAside>);
    const aside = screen.getByLabelText("Main navigation");
    expect(aside).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SidebarAside.displayName).toBe("SidebarAside");
  });
});
