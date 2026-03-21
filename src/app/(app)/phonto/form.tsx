"use client"

import { Spinner } from "@/app/ui/spinner"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"

type Props = {
  user: string | null
}

function getCurrentDate(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    "hour": "2-digit",
    "minute": "2-digit",
    "second": "2-digit"
  })
}

export function Form(props: Props) {
  const [loading, setLoading] = useState<boolean>(false)
  const [timer, setTimer] = useState<string>(getCurrentDate())
  const [user, setUser] = useState(props.user ?? "")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState(1)
  const [mounted, setMounted] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      queueMicrotask(() => setMounted(true))
    }

    const interval = setInterval(() => {
      setTimer(getCurrentDate())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const action = async () => {
    setLoading(true)

    await new Promise((resolve) => setTimeout(() => {
      if (formRef.current) {
        formRef.current.remove()
      }
      resolve(null)
    }, 2000))

    setStep(2)
    setLoading(false)
  }

  const onPhotoTimerEnd = () => {
    setTimeout(() => setStep(3), 1500)
  }

  const onConfirmation = () => {
    const div = document.querySelector("#photo-confirmation") as HTMLDivElement

    if (div) {
      div.style.display = "none"
    }

    setTimeout(() => setStep(4), 1800)
  }

  if (step == 2) {
    return <PhotoTimer onEnd={onPhotoTimerEnd} />
  }

  if (step == 3) {
    return <PhotoConfirmation onConfirmation={onConfirmation} />
  }

  // if (step == 4) {
  //   return <Final />
  // }

  if (!mounted) return null

  return (
    <div className="relative">
      <div
        className="min-w-[410px] w-[410px] min-h-[420px] rounded-[20px] border border-neutral-200 py-[12px] px-[18px] flex flex-col mb-[40px]"
        id="fake-form"
        ref={formRef}>
        <p className="text-center font-bold mt-5 mb-0">HORÁRIO DE SÃO PAULO GMT-03</p>
        <div className="text-center w-full text-[30px] ">{timer}</div>
        <div>
          <p className="text-center w-[250px] mx-auto mt-[32px] font-bold mb-0">
            Preencha os campos de Usuário e Senha para registrar o ponto
          </p>
          <div className="flex flex-col border border-neutral-200 rounded-[10px] mx-8 mt-3 overflow-hidden">
            <input
              className="outline-none py-3 px-2 border-b text-[18px]"
              type="text" value={user} onChange={(e) => setUser(e.target.value)}
              placeholder="Usuário"
            />
            <input
              className="outline-none py-3 px-2 text-[18px]"
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />
          </div>
        </div>
        <button
          className="border-neutral-500 border bg-[#171917] h-[38px] mx-8 mt-5 py-[7px] rounded cursor-pointer text-[13px] font-bold flex justify-center items-center"
          onClick={action}
          disabled={loading}>
          {loading ? <Spinner /> : "REGISTRAR"}
        </button>
        <a href="#" className="text-[11px] underline text-center mt-2 font-bold">
          Esqueceu sua senha?
        </a>
      </div>
      <div className="fixed bottom-0 left-0 w-full border-t border-neutral-200 h-[85px] py-2 grid grid-cols-3 justify-between items-center px-6">
        <Image src="https://stou.ifractal.com.br/fulltime/imagens/registro_foto/logo-app-ifponto-log-branco.svg" width={180} height={80} alt="ponto logo" />

        <div className="flex items-center gap-x-3 text-xs justify-center">
          <span>POLÍTICA DE SEGURANÇA</span>
          |
          <span>SOBRE A IFRACTAL</span>
          |
          <span>FALE CONOSCO</span>
        </div>

        <div></div>
      </div>
    </div>
  )
}

function PhotoTimer(props: { onEnd: () => void }) {
  const [timer, setTimer] = useState(3)
  const interval = useRef<NodeJS.Timeout>(null)
  const onEnd = useRef(props.onEnd)

  useEffect(() => {
    if (interval.current) return

    interval.current = setInterval(() => {
      setTimer((prev) => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(interval.current!)
          onEnd.current()
        }
        return next
      })
    }, 1000)

    return () => {
      clearInterval(interval.current!)
    }
  }, [])

  if (timer == 0) {
    return null
  }

  return (
    <>
      <Image
        className="absolute left-[40px] top-[30px]"
        src="https://stou.ifractal.com.br/fulltime/imagens/registro_foto/logo-app-ifponto-log-branco.svg"
        width={340} height={80} alt="ponto logo"
      />

      <div>
        <div className="text-center text-[78px] font-bold mb-3">{timer}</div>
        <div className="min-w-[410px] w-[410px] min-h-[420px] border-3 rounded-[2px] border border-[#40d1c5]">
        </div>
      </div>
    </>
  )
}

function PhotoConfirmation(props: { onConfirmation: () => void }) {
  return (
    <>
      <Image
        className="absolute left-[40px] top-[30px]"
        src="https://stou.ifractal.com.br/fulltime/imagens/registro_foto/logo-app-ifponto-log-branco.svg"
        width={340} height={80} alt="ponto logo"
      />

      <div id="photo-confirmation">

        <div className="text-center text-[78px] font-bold h-[40px]"></div>
        <div className="min-w-[410px] w-[410px] min-h-[290px]">
        </div>
        <div className="flex px-6 justify-between">
          <button className="bg-red-500 p-2 px-4 rounded text-black font-bold w-[150px]" onClick={props.onConfirmation}>
            TIRAR OUTRA
          </button>
          <button className="bg-green-500 p-2 px-4 rounded text-black font-bold w-[150px]" onClick={props.onConfirmation}>
            ESTÁ OK
          </button>
        </div>
      </div>
    </>
  )
}

// function Final() {
//   return (
//     <div className="text-center">
//       <div className="min-w-[75vw] w-[410px] min-h-[420px] flex items-center justify-center">
//         <div className="text-[50px] font-bold w-[420px]">
//           <p>Registro efetuado com sucesso!</p>
//         </div>
//       </div>
//       <hr />
//     </div>
//   )
// }