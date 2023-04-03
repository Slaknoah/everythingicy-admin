import React, { useContext, useEffect, useState, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAdminLogin } from "medusa-react"
import Spinner from "../../atoms/spinner"
import { AccountContext } from "../../../context/account"

type IFrameLoaderProps = {
  children: ReactNode
}

const IFrameLoader = ({ children }: IFrameLoaderProps) => {
  const navigate = useNavigate()
  const { isLoggedIn, handleLogout, email } = useContext(AccountContext)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const login = useAdminLogin()

  useEffect(() => {
    if (window !== window.parent) {
      window.parent.postMessage({ type: "commerce-iframe-loaded" }, "*")
    }

    // Listen to messages from the parent window
    const messageHandler = async (event: MessageEvent) => {
      if (event.data.type === "login-blocobooked") {
        setIsLoadingAuth(true)

        if (isLoggedIn && email !== event.data.payload.email) {
          await handleLogout()
        } else if (isLoggedIn && email === event.data.payload.email) {
          setIsLoadingAuth(false)
          navigate("/a/orders")
          return
        }

        // Get password from our backend
        const { data } = await axios.get(
          `${import.meta.env.VITE_BLOCOBOOKED_PRIVATE_API}/commerce/password`,
          {
            headers: {
              Authorization: event.data.payload.token,
            },
            params: {
              organisationId: event.data.payload.organisationId,
            },
          }
        )
        await login.mutate(
          {
            email: event.data.payload.email,
            ...data,
          },
          {
            onError: () => {
              window.parent.postMessage({ type: "login-failed" }, "*")
            },
          }
        )
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsLoadingAuth(false)
        navigate("/a/orders")
      }
    }

    window.addEventListener("message", messageHandler)
  }, [])

  if (!isLoadingAuth) {
    return <>{children}</>
  }

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Spinner variant="secondary" />
    </div>
  )
}

export default IFrameLoader
