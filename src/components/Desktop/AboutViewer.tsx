import { MapPin, Briefcase, Code, Sparkles } from 'lucide-react'

const skills = [
  'Influencer Marketing',
  'Campaign Management',
  'Creator Sourcing & Outreach',
  'Negotiations',
  'Performance Tracking',
  'Notion',
  'Zapier',
  'Make',
  'AI Tools',
  'Operations',
  'Account Management',
  'Cross-functional Collaboration'
]

const experience = [
  {
    role: 'Influencer Marketing Specialist',
    company: 'Brainlabs',
    period: 'Present',
    desc: 'Managing creator sourcing, outreach, negotiations, campaign execution, and performance tracking for global campaigns. Collaborating with strategy, creative, and paid media teams to connect storytelling with measurable growth.'
  }
]

export default function AboutViewer() {
  return (
    <div className="xp-about-viewer">
      <div className="xp-about-header">
        <div className="xp-about-avatar">🐱</div>
        <div>
          <h1 className="xp-about-name">Michelle Salcedo</h1>
          <p className="xp-about-title">Marketing & Operations Professional</p>
          <p className="xp-about-location">
            <MapPin size={12} /> Buenos Aires, Argentina
          </p>
        </div>
      </div>

      <div className="xp-about-section">
        <h2>
          <Briefcase size={14} /> About
        </h2>
        <p className="xp-about-bio">
          I'm a bilingual marketing and operations professional based in Buenos Aires, working at the intersection of creativity, systems, and AI.
        </p>
        <p className="xp-about-bio" style={{ marginTop: 8 }}>
          Over the past few years, I've built my career supporting fast-moving digital teams — from influencer marketing campaigns to executive operations and account management. I enjoy turning complex workflows into organized systems, coordinating teams across different time zones, and making sure ideas actually turn into results.
        </p>
      </div>

      <div className="xp-about-section">
        <h2>
          <Briefcase size={14} /> Experience
        </h2>
        {experience.map((exp, i) => (
          <div key={i} className="xp-exp-item">
            <div className="xp-exp-header">
              <strong>{exp.role}</strong>
              <span className="xp-exp-period">{exp.period}</span>
            </div>
            <div className="xp-exp-company">{exp.company}</div>
            <p className="xp-exp-desc">{exp.desc}</p>
          </div>
        ))}
      </div>

      <div className="xp-about-section">
        <h2>
          <Code size={14} /> Skills & Tools
        </h2>
        <div className="xp-about-skills">
          {skills.map((s) => (
            <span key={s} className="xp-skill-tag">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="xp-about-section">
        <h2>
          <Sparkles size={14} /> What Drives Me
        </h2>
        <p className="xp-about-bio">
          I'm naturally systems-oriented and constantly exploring new tools — especially AI and automation — to improve how teams work. Whether it's building workflows in Notion, automating processes with Zapier or Make, or experimenting with new AI tools, I love finding smarter ways to work.
        </p>
        <p className="xp-about-bio" style={{ marginTop: 8 }}>
          Outside of my day-to-day work, I enjoy building creative digital projects, designing interactive portfolio experiences, and experimenting with nostalgic UI concepts.
        </p>
      </div>
    </div>
  )
}
