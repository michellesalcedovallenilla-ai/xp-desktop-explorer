import {
  Download,
  Printer
} from 'lucide-react'

const experience = [
  {
    role: 'Influencer Marketing Specialist',
    type: 'Hybrid',
    company: 'Brainlabs (NYC, US / BA, Argentina)',
    period: 'Aug 2025 - Present',
    desc: 'Lead end-to-end execution of influencer campaigns, managing creator sourcing, outreach, negotiation, briefing, and performance tracking. Collaborate with creative, strategy, and paid media teams to bridge storytelling with data-driven decision-making.'
  },
  {
    role: 'Collaborations Manager',
    type: 'Remote',
    company: 'inBeat Agency (Montreal, CA)',
    period: 'Nov 2024 - May 2025',
    desc: 'Led influencer discovery and outreach, managed documentation workflows, and contributed to an organized influencer tracking system across creative and operations teams.'
  },
  {
    role: 'Account Manager',
    type: 'Remote',
    company: 'Indure Mgmt (Miami, FL)',
    period: 'Aug 2023 - Feb 2024',
    desc: 'Oversaw multiple client projects, optimized accounts across three models, and crafted content previews resulting in significant increase in client acquisition and retention.'
  },
  {
    role: 'Executive Assistant',
    type: 'Remote',
    company: 'Duke Renders LLC (Miami, FL)',
    period: 'Oct 2022 - Aug 2023',
    desc: 'Managed calendars, coordinated high-level meetings, reviewed scopes of work, and improved project alignment using Slack, Notion, and Monday.com.'
  },
  {
    role: 'Bids Sourcer Assistant',
    type: 'Remote',
    company: 'Alphapromed LLC (Tampa, FL)',
    period: 'Dec 2021 - Aug 2022',
    desc: 'Spearheaded bid sourcing projects, optimized registration processes, and managed document workflows with precision.'
  },
  {
    role: 'Virtual Assistant',
    type: 'Remote',
    company: 'Sentido Radio (Madrid, Spain)',
    period: 'Jul 2021 - Oct 2021',
    desc: 'Supported scheduling, meeting coordination, and appointment bookings in Spanish and English for a creative media environment.'
  }
]

const certifications = [
  'AI Professional Certificate',
  'Fundamentals of Building AI Agents (IBM)',
  'Influencer Marketing II – Industry Specialist (Meltwater)',
  'Influencer Marketing I – Industry Specialist (Meltwater)'
]

const tools = [
  'Google Workspace', 'Slack', 'Notion', 'Monday.com', 'ClickUp', 'Trello',
  'ChatGPT & AI tools', 'Zapier', 'Make', 'Claude',
  'Figma', 'Canva', 'Readymag', 'Squarespace', 'Loom',
  'CapCut', 'Adobe Lightroom'
]

export default function ResumeViewer() {
  const pdfUrl = '/Michelle_Salcedo_Resume.pdf'

  return (
    <div
      className="xp-resume-viewer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#525659'
      }}
    >
      {/* Adobe Reader Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          backgroundColor: '#F0F0F0',
          borderBottom: '1px solid #CCC',
          gap: '8px',
          flexShrink: 0
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            paddingRight: '8px',
            borderRight: '1px solid #CCC'
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: '#ED1C24',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 'bold',
              borderRadius: 2
            }}
          >
            A
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'Tahoma', fontWeight: 'bold' }}>
            Adobe Reader
          </span>
        </div>
        <button
          className="xp-btn"
          style={{ padding: '2px', display: 'flex', alignItems: 'center', border: '1px solid transparent', backgroundColor: 'transparent', cursor: 'pointer' }}
          title="Print"
          onClick={() => window.print()}
        >
          <Printer size={16} color="#333" />
        </button>
        <a
          href={pdfUrl}
          download="Michelle_Salcedo_Resume.pdf"
          className="xp-btn"
          style={{ padding: '2px', display: 'flex', alignItems: 'center', border: '1px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', textDecoration: 'none' }}
          title="Download PDF"
        >
          <Download size={16} color="#333" />
        </a>
        <div style={{ flex: 1 }} />
      </div>

      {/* Document Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'white',
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontFamily: 'Arial, sans-serif',
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#222'
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: '2px solid #333', paddingBottom: '16px', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', color: '#111', letterSpacing: '1px' }}>
              MICHELLE DE JOSEPH
            </h1>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#555', fontStyle: 'italic' }}>
              Influencer Marketing Strategist | Campaign Systems, Performance & AI Integration
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11px', color: '#444', marginTop: '8px' }}>
              <span>📍 Buenos Aires, Argentina</span>
              <span>✉️ michellesalcedovallenilla@gmail.com</span>
              <span>🔗 linkedin.com/in/marketingwithcats/</span>
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Summary</h2>
            <p style={{ margin: 0 }}>
              Bilingual marketing and operations professional with 4+ years of experience driving execution across executive support, account management, and influencer campaigns. I operate at the intersection of creativity and systems — building organized workflows, optimizing processes, and turning strategy into measurable results.
            </p>
            <p style={{ margin: '8px 0 0' }}>
              Tech-native and AI-literate, I thrive in fast-paced, remote environments where ownership, clarity, and performance matter.
            </p>
          </div>

          {/* Core Strengths */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Core Strengths</h2>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Execution-focused with strong ability to bring structure and clarity to fast-paced environments</li>
              <li>Skilled in cross-functional coordination, campaign operations, and remote collaboration</li>
              <li>Systems-oriented thinker with a focus on workflow optimization and performance improvement</li>
              <li>Highly adaptable, self-taught, and continuously upskilling in AI and automation tools</li>
            </ul>
          </div>

          {/* Tools */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Tools & Technologies</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tools.map((t) => (
                <span key={t} style={{ backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '3px', fontSize: '11px', border: '1px solid #ddd' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Work Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '13px' }}>{exp.role} <span style={{ fontWeight: 'normal', color: '#777', fontSize: '11px' }}>({exp.type})</span></strong>
                  <span style={{ fontSize: '11px', color: '#666', whiteSpace: 'nowrap' }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>{exp.company}</div>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>{exp.desc}</p>
              </div>
            ))}
          </div>

          {/* Languages */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Languages</h2>
            <p style={{ margin: 0 }}>English (C1 Advanced) · Spanish (Native)</p>
          </div>

          {/* Education & Certifications */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Education & Certifications</h2>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {certifications.map((c) => (
                <li key={c} style={{ marginBottom: '4px' }}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
