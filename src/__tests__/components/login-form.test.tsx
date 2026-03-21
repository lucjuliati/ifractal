import { render, screen } from "@testing-library/react"
import LoginForm from "@/app/(app)/(auth)/login/form"
import { describe, it, expect, vi } from "vitest"
import { act } from "react"

vi.mock("@/lib/actions/login", () => ({
  loginAction: vi.fn(),
}))

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    useActionState: vi.fn().mockReturnValue([{ error: {} }, vi.fn()]),
  }
})

describe("LoginForm", () => {
  it("renders login and password inputs", async () => {
    await act(async () => render(<LoginForm />))
    expect(screen.getByPlaceholderText("Usuário")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument()
  })

  it("renders submit button", async () => {
    await act(async () => render(<LoginForm />))
    expect(screen.getByRole("button", { name: /acessar/i })).toBeInTheDocument()
  })

  it("renders the login prompt text", async () => {
    await act(async () => render(<LoginForm />))
    expect(screen.getByText(/faça login para continuar/i)).toBeInTheDocument()
  })

  it("renders the close button in dialog", async () => {
    await act(async () => render(<LoginForm />))
    expect(screen.getByText("Fechar")).toBeInTheDocument()
  })
})
