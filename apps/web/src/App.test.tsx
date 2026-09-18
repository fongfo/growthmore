import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("admin app", () => {
  beforeEach(() => sessionStorage.clear());

  it("explains the console purpose and simulated-money boundary before login", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "运营控制台" })).toBeInTheDocument();
    expect(screen.getByText(/配置活动预算、审核模拟提现/)).toBeInTheDocument();
    expect(screen.getByText(/完整权限演示码/)).toBeInTheDocument();
  });
});
