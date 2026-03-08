import { useState } from 'react'
import {
  Mail,
  Phone,
  Globe,
  Send,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react'

export default function ContactViewer() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <div className="xp-contact-viewer">
      <div className="xp-contact-left">
        <h2>📧 Contact Information</h2>
        <p className="xp-contact-subtitle">Feel free to reach out anytime!</p>
        <div className="xp-contact-details">
          <div className="xp-contact-detail">
            <Mail size={14} /> michelle@portfolio.dev
          </div>
          <div className="xp-contact-detail">
            <Phone size={14} /> (555) 123-4567
          </div>
          <div className="xp-contact-detail">
            <Globe size={14} /> www.readymag.website/u2801101920/5411866
          </div>
        </div>
        <div className="xp-contact-socials">
          <a href="#" className="xp-social-link" title="GitHub">
            <Github size={16} />
          </a>
          <a href="#" className="xp-social-link" title="LinkedIn">
            <Linkedin size={16} />
          </a>
          <a href="#" className="xp-social-link" title="Twitter">
            <Twitter size={16} />
          </a>
        </div>
      </div>
      <div className="xp-contact-right">
        <h2>Send a Message</h2>
        <form onSubmit={handleSubmit} className="xp-contact-form">
          <div className="xp-form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="xp-form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="xp-form-group">
            <label>Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="xp-form-actions">
            <button type="submit" className="xp-btn xp-btn-primary">
              <Send size={12} /> Send Message
            </button>
            {sent && <span className="xp-form-success">✓ Message sent!</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
