"use client"

import { loginAction } from "@/lib/actions/login"
import { Lock, User } from "lucide-react"
import { useActionState, useRef } from "react"

const initialState = { error: {} }

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState)
  const { error } = state as { error?: Record<string, string> }
  const dialog = useRef<HTMLDialogElement>(null)

  return (
    <>
      <dialog
        id="modal"
        className="rounded-xl p-6 text-white text-sm"
        ref={dialog}
        open={Boolean(error)}
        style={{
          background: "#1c1c1e",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
        }}>
        <p id="modal-content" className="mb-4" />
        <button
          className="bg-transparent cursor-pointer" style={{ color: "#BF5AF2" }}
          onClick={() => dialog.current?.close()}>
          Fechar
        </button>
      </dialog>

      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: "#111113" }}>

        <div
          className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-8 py-6 mb-[120px]"
          style={{
            background: "rgba(28, 28, 30, 0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
          <div className="flex justify-center mb-5">
            <div
              className="w-12 h-12 rounded-[32px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4372f3ff, #174db3)",
              }}>
              <User />
            </div>
          </div>

          <p className="text-center text-sm mb-5 text-neutral-500 select-none">
            Faça login para continuar
          </p>

          <form action={formAction} className="flex flex-col gap-y-2">
            <div>
              <label className="flex items-center gap-x-1 opacity-70 text-[14px] mb-[2px]">
                <User size={18} />
                Usuário
              </label>
              <input
                type="text"
                name="login"
                className="w-full px-4 py-3 rounded-md text-sm text-white bg-neutral-800 outline-none border border-neutral-700 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-x-1 opacity-70 text-[14px] mb-[2px]">
                <Lock size={18} />
                Senha
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 rounded-md text-sm text-white bg-neutral-800 outline-none border border-neutral-700 focus:border-indigo-400"
              />
            </div>

            <button
              type="submit"
              className="mt-1 w-full py-3 rounded-md text-sm font-semibold text-white tracking-wide transition-opacity duration-150 hover:opacity-85 focus:scale-[0.98] cursor-pointer mt-4"
              style={{ background: "linear-gradient(135deg,  #4372f3ff 30%, #174db3 80%)", }}>
              Acessar
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
