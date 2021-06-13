import { render, screen } from "@testing-library/react";
import App from "./App";

test.skip("renders Hello World", () => {
  render(<App />);
  const helloElement = screen.getByText(/Hello World/i);
  expect(helloElement).toBeInTheDocument();
});
