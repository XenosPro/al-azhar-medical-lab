import { useEffect, useRef, useState } from 'react'
import './Chatbot.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const API_URL =
  import.meta.env.VITE_CHATBOT_API_URL ||
  'https://al-azhar-medical-lab-chatbot.onrender.com/chat'

const initialMessage: Message = {
  role: 'assistant',
  content:
    'Welcome to Al-Azhar Medical Lab. I can help you find information about our services, location, contact details, and appointments. How can I help you?',
}

const suggestions = [
  'What services do you offer?',
  'Where are you located?',
  'How can I book an appointment?',
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isOpen])

  async function sendMessage(text = input) {
    const content = text.trim()

    if (!content || isLoading) return

    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content },
    ]

    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-12),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'The assistant is temporarily unavailable. Please try again.',
        )
      }

      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('The assistant returned an empty response. Please try again.')
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply },
      ])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the assistant. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage()
  }

  return (
    <div className="lab-chatbot">
      {isOpen && (
        <section
          className="lab-chat-window"
          role="dialog"
          aria-label="Al-Azhar Medical Lab virtual assistant"
        >
          <header className="lab-chat-header">
            <div className="lab-chat-brand">
              <div className="lab-chat-logo" aria-hidden="true">+</div>
              <div>
                <strong>Al-Azhar Assistant</strong>
                <span><i /> Virtual laboratory assistant</span>
              </div>
            </div>

            <button
              className="lab-chat-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="lab-chat-messages" aria-live="polite">
            <div className="lab-chat-date">HOW CAN WE HELP?</div>

            {messages.map((message, index) => (
              <div
                className={`lab-chat-message ${message.role}`}
                key={`${index}-${message.role}`}
              >
                {message.content}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="lab-chat-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    disabled={isLoading}
                    onClick={() => void sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="lab-chat-message assistant lab-chat-typing">
                Thinking…
              </div>
            )}

            {error && (
              <div className="lab-chat-error" role="alert">
                {error}
                <button
                  type="button"
                  onClick={() => setError('')}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form className="lab-chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask us a question..."
              aria-label="Your message"
              maxLength={4000}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          <p className="lab-chat-disclaimer">
            AI-generated information may be inaccurate. This assistant does not
            provide diagnoses or replace professional medical advice.
          </p>
        </section>
      )}

      <button
        type="button"
        className={`lab-chat-launcher ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? '×' : <><span className="lab-chat-launcher-icon">+</span><span className="lab-chat-launcher-label">Ask us</span></>}
      </button>
    </div>
  )
}
