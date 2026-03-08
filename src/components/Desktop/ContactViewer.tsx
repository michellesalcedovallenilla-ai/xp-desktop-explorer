import { useState } from 'react'
import {
  Mail,
  Globe,
  Send,
  Linkedin
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
            <Mail size={14} /> michellesalcedovallenilla@gmail.com
          </div>
          <div className="xp-contact-detail">
            <Globe size={14} /> www.readymag.website/u2801101920/5411866
          </div>
        </div>
        <div className="xp-contact-socials">
          <a href="https://www.instagram.com/mydigitalcrib" target="_blank" rel="noopener noreferrer" className="xp-social-link" title="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/marketingwithcats/" target="_blank" rel="noopener noreferrer" className="xp-social-link" title="LinkedIn">
            <Linkedin size={16} />
          </a>
          <a href="https://www.upwork.com/freelancers/~010a7fb03b1054fb6b?mp_source=share" target="_blank" rel="noopener noreferrer" className="xp-social-link" title="Upwork">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/></svg>
          </a>
          <a href="https://www.fiverr.com/chellesalcedo" target="_blank" rel="noopener noreferrer" className="xp-social-link" title="Fiverr">
            <span style={{ fontWeight: 'bold', fontSize: 14, color: '#404145', fontFamily: 'Arial, sans-serif' }}>F<span style={{ color: '#1dbf73' }}>.</span></span>
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