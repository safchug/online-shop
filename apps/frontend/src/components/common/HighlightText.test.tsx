import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HighlightText } from "./HighlightText";

describe("HighlightText", () => {
  it("renders text without highlighting when highlight is empty", () => {
    render(<HighlightText text="Hello World" highlight="" />);

    const element = screen.getByText("Hello World");
    expect(element).toBeInTheDocument();
    expect(element.querySelector("mark")).toBeNull();
  });

  it("highlights matching text case-insensitively", () => {
    const { container } = render(
      <HighlightText text="Hello World" highlight="world" />
    );

    const mark = container.querySelector("mark");
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe("World");
  });

  it("highlights multiple occurrences", () => {
    const { container } = render(
      <HighlightText text="test test test" highlight="test" />
    );

    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(3);
    marks.forEach((mark) => {
      expect(mark.textContent).toBe("test");
    });
  });

  it("handles special regex characters in highlight string", () => {
    const { container } = render(
      <HighlightText text="Price: $99.99" highlight="$99.99" />
    );

    const mark = container.querySelector("mark");
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe("$99.99");
  });

  it("applies custom className", () => {
    const { container } = render(
      <HighlightText text="Hello World" highlight="" className="custom-class" />
    );

    const span = container.querySelector("span.custom-class");
    expect(span).toBeInTheDocument();
  });

  it("highlights partial matches", () => {
    const { container } = render(
      <HighlightText text="JavaScript Developer" highlight="script" />
    );

    const mark = container.querySelector("mark");
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe("Script");
  });

  it("handles text with no matches", () => {
    const { container } = render(
      <HighlightText text="Hello World" highlight="xyz" />
    );

    const mark = container.querySelector("mark");
    expect(mark).toBeNull();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("highlights text at the beginning", () => {
    const { container } = render(
      <HighlightText text="Hello World" highlight="hello" />
    );

    const mark = container.querySelector("mark");
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe("Hello");
  });

  it("highlights text at the end", () => {
    const { container } = render(
      <HighlightText text="Hello World" highlight="world" />
    );

    const mark = container.querySelector("mark");
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe("World");
  });

  it("applies highlight styling classes", () => {
    const { container } = render(
      <HighlightText text="Hello World" highlight="world" />
    );

    const mark = container.querySelector("mark");
    expect(mark).toHaveClass("bg-yellow-200");
    expect(mark).toHaveClass("font-semibold");
    expect(mark).toHaveClass("px-0.5");
    expect(mark).toHaveClass("rounded");
  });

  it("handles whitespace in highlight string", () => {
    render(<HighlightText text="Hello World" highlight="  " />);

    const element = screen.getByText("Hello World");
    expect(element).toBeInTheDocument();
    expect(element.querySelector("mark")).toBeNull();
  });

  it("highlights multi-word phrases", () => {
    const { container } = render(
      <HighlightText text="The quick brown fox" highlight="quick brown" />
    );

    const mark = container.querySelector("mark");
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe("quick brown");
  });
});
