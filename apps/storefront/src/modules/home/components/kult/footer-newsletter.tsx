"use client"

import { useState } from "react"

const FooterNewsletter = () => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p className="mt-6 font-sans text-[15px] text-ink/70">
        Merci — à très vite dans votre boîte mail.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex items-center gap-3 border-b border-ink/25 pb-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
        aria-label="Votre email"
        className="flex-1 bg-transparent font-sans text-[15px] text-ink placeholder:text-ink/40 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="S'inscrire à la newsletter"
        className="text-ink transition-transform hover:translate-x-0.5"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  )
}

export default FooterNewsletter
