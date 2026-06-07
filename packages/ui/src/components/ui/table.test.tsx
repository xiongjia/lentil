import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";
import React from "react";

describe("Table", () => {
  it("should render", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("table")).toBeDefined();
    expect(container.querySelector("table")).toHaveClass("w-full");
    expect(container.querySelector("table")).toHaveClass("caption-bottom");
    expect(container.querySelector("table")).toHaveClass("text-sm");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Table className="custom-class">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("table")).toHaveClass("custom-class");
  });

  it("should have displayName", () => {
    expect(Table.displayName).toBe("Table");
  });
});

describe("TableHeader", () => {
  it("should render", () => {
    const { container } = render(
      <table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </table>,
    );
    expect(container.querySelector("thead")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <table>
        <TableHeader className="custom-header">
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </table>,
    );
    expect(container.querySelector("thead")).toHaveClass("custom-header");
  });

  it("should have displayName", () => {
    expect(TableHeader.displayName).toBe("TableHeader");
  });
});

describe("TableBody", () => {
  it("should render", () => {
    const { container } = render(
      <table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(container.querySelector("tbody")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <table>
        <TableBody className="custom-body">
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(container.querySelector("tbody")).toHaveClass("custom-body");
  });

  it("should have displayName", () => {
    expect(TableBody.displayName).toBe("TableBody");
  });
});

describe("TableFooter", () => {
  it("should render", () => {
    const { container } = render(
      <table>
        <TableFooter>
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </table>,
    );
    expect(container.querySelector("tfoot")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <table>
        <TableFooter className="custom-footer">
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </table>,
    );
    expect(container.querySelector("tfoot")).toHaveClass("custom-footer");
  });

  it("should have displayName", () => {
    expect(TableFooter.displayName).toBe("TableFooter");
  });
});

describe("TableRow", () => {
  it("should render", () => {
    const { container } = render(
      <table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(container.querySelector("tr")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <table>
        <TableBody>
          <TableRow className="custom-row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(container.querySelector("tr")).toHaveClass("custom-row");
  });

  it("should have displayName", () => {
    expect(TableRow.displayName).toBe("TableRow");
  });
});

describe("TableHead", () => {
  it("should render", () => {
    const { container } = render(
      <table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </table>,
    );
    const th = container.querySelector("th");
    expect(th).toBeDefined();
    expect(th).toHaveClass("h-10");
    expect(th).toHaveClass("text-left");
    expect(th).toHaveClass("align-middle");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <table>
        <TableHeader>
          <TableRow>
            <TableHead className="custom-head">Header</TableHead>
          </TableRow>
        </TableHeader>
      </table>,
    );
    expect(container.querySelector("th")).toHaveClass("custom-head");
  });

  it("should have displayName", () => {
    expect(TableHead.displayName).toBe("TableHead");
  });
});

describe("TableCell", () => {
  it("should render", () => {
    const { container } = render(
      <table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    const td = container.querySelector("td");
    expect(td).toBeDefined();
    expect(td).toHaveClass("p-2");
    expect(td).toHaveClass("align-middle");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <table>
        <TableBody>
          <TableRow>
            <TableCell className="custom-cell">Cell</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(container.querySelector("td")).toHaveClass("custom-cell");
  });

  it("should have displayName", () => {
    expect(TableCell.displayName).toBe("TableCell");
  });
});

describe("TableCaption", () => {
  it("should render", () => {
    render(
      <Table>
        <TableCaption>Caption text</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("Caption text")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Table>
        <TableCaption className="custom-caption">Caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("caption")).toHaveClass("custom-caption");
  });

  it("should have displayName", () => {
    expect(TableCaption.displayName).toBe("TableCaption");
  });
});
