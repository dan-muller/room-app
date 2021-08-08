import { render, screen } from "@testing-library/react";

test("", () => {
  render(<>Hello World</>);
  const helloWorld = screen.getByText("Hello World")
  expect(helloWorld).toBeInTheDocument()
})