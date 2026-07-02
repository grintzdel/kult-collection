"use client"

const EnveloppeShake = () => {
  const handleScroll = () => {
    const el = document.getElementById("enveloppe")
    if (el) {
      el.style.animation = "shake 0.5s ease-in-out 8"
      setTimeout(() => {
        el.style.animation = "none"
      }, 4000)
    }
  }

  return (
    <div onMouseEnter={handleScroll}>
      <img
        id="enveloppe"
        src="/kult/imgt1.png"
        alt="Enveloppe KULT"
        className="w-full max-w-lg rotate-6"
      />
    </div>
  )
}

export default EnveloppeShake