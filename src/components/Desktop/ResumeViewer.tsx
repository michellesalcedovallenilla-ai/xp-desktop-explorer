import { Download, Printer } from 'lucide-react'

export default function ResumeViewer() {
  const pdfUrl = '/Michelle_Salcedo_Resume.pdf'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#525659' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '3px 6px',
        background: '#f0f0f0', borderBottom: '1px solid #aaa', gap: 6, flexShrink: 0
      }}>
        <div style={{
          width: 14, height: 14, background: '#ed1c24', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 'bold', borderRadius: 2
        }}>A</div>
        <span style={{ fontSize: 11, fontFamily: 'Tahoma, sans-serif', fontWeight: 'bold', marginRight: 8 }}>
          Adobe Reader
        </span>
        <button onClick={() => window.print()} title="Print"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <Printer size={14} color="#333" />
        </button>
        <a href={pdfUrl} download="Michelle_Salcedo_Resume.pdf" title="Download PDF"
          style={{ padding: 2, display: 'flex' }}>
          <Download size={14} color="#333" />
        </a>
      </div>

      {/* Document */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          background: '#fff', fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: 12, lineHeight: 1.6, color: '#1a1a1a',
          padding: '28px 32px', minHeight: '100%'
        }}>

          {/* Name */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h1 style={{
              margin: 0, fontSize: 22, fontFamily: 'Georgia, serif',
              letterSpacing: 2, textTransform: 'uppercase', color: '#003366'
            }}>
              Michelle De Joseph
            </h1>
            <div style={{
              fontSize: 11, color: '#555', marginTop: 4,
              fontStyle: 'italic'
            }}>
              Influencer Marketing Strategist · Campaign Systems & AI Integration
            </div>
            <div style={{
              fontSize: 10, color: '#666', marginTop: 6,
              display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap'
            }}>
              <span>Buenos Aires, Argentina</span>
              <span>·</span>
              <span>michellesalcedovallenilla@gmail.com</span>
              <span>·</span>
              <span>linkedin.com/in/marketingwithcats</span>
            </div>
          </div>

          <Hr />

          {/* Summary */}
          <Section title="Professional Summary">
            <p style={{ margin: 0 }}>
              Bilingual marketing and operations professional with 4+ years of experience driving execution across executive support, account management, and influencer campaigns. Operates at the intersection of creativity and systems — building organized workflows, optimizing processes, and turning strategy into measurable results. Tech-native and AI-literate, thrives in fast-paced, remote environments where ownership, clarity, and performance matter.
            </p>
          </Section>

          {/* Core Strengths */}
          <Section title="Core Strengths">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Execution-focused with strong ability to bring structure and clarity to fast-paced environments</li>
              <li>Skilled in cross-functional coordination, campaign operations, and remote collaboration</li>
              <li>Systems-oriented thinker with a focus on workflow optimization and performance improvement</li>
              <li>Highly adaptable, self-taught, and continuously upskilling in AI and automation tools</li>
            </ul>
          </Section>

          {/* Tools */}
          <Section title="Tools & Technologies">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {[
                'Google Workspace', 'Slack', 'Notion', 'Monday.com', 'ClickUp', 'Trello',
                'ChatGPT & AI tools', 'Zapier', 'Make', 'Claude',
                'Figma', 'Canva', 'Readymag', 'Squarespace', 'Loom',
                'CapCut', 'Adobe Lightroom'
              ].map(t => (
                <span key={t} style={{
                  background: '#e8eef4', padding: '1px 7px', borderRadius: 2,
                  fontSize: 10, border: '1px solid #c0cfe0', color: '#003366'
                }}>{t}</span>
              ))}
            </div>
          </Section>

          {/* Experience */}
          <Section title="Work Experience">
            {[
              { role: 'Influencer Marketing Specialist', type: 'Hybrid', company: 'Brainlabs (NYC, US / BA, Argentina)', period: 'Aug 2025 – Present', desc: 'Lead end-to-end execution of influencer campaigns, managing creator sourcing, outreach, negotiation, briefing, and performance tracking. Collaborate with creative, strategy, and paid media teams to bridge storytelling with data-driven decision-making.' },
              { role: 'Collaborations Manager', type: 'Remote', company: 'inBeat Agency (Montreal, CA)', period: 'Nov 2024 – May 2025', desc: 'Led influencer discovery and outreach, managed documentation workflows, and contributed to an organized influencer tracking system across creative and operations teams.' },
              { role: 'Account Manager', type: 'Remote', company: 'Indure Mgmt (Miami, FL)', period: 'Aug 2023 – Feb 2024', desc: 'Oversaw multiple client projects, optimized accounts across three models, and crafted content previews resulting in significant increase in client acquisition and retention.' },
              { role: 'Executive Assistant', type: 'Remote', company: 'Duke Renders LLC (Miami, FL)', period: 'Oct 2022 – Aug 2023', desc: 'Managed calendars, coordinated high-level meetings, reviewed scopes of work, and improved project alignment using Slack, Notion, and Monday.com.' },
              { role: 'Bids Sourcer Assistant', type: 'Remote', company: 'Alphapromed LLC (Tampa, FL)', period: 'Dec 2021 – Aug 2022', desc: 'Spearheaded bid sourcing projects, optimized registration processes, and managed document workflows with precision.' },
              { role: 'Virtual Assistant', type: 'Remote', company: 'Sentido Radio (Madrid, Spain)', period: 'Jul 2021 – Oct 2021', desc: 'Supported scheduling, meeting coordination, and appointment bookings in Spanish and English for a creative media environment.' },
            ].map((exp, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong style={{ color: '#003366' }}>{exp.role}</strong>
                    <span style={{ color: '#888', fontSize: 10 }}> ({exp.type})</span>
                  </span>
                  <span style={{ fontSize: 10, color: '#666', whiteSpace: 'nowrap' }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: 10, color: '#777', fontStyle: 'italic' }}>{exp.company}</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>{exp.desc}</div>
              </div>
            ))}
          </Section>

          {/* Languages */}
          <Section title="Languages">
            <p style={{ margin: 0 }}>English (C1 Advanced) · Spanish (Native)</p>
          </Section>

          {/* Certifications */}
          <Section title="Education & Certifications">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>AI Professional Certificate (Google)</li>
              <li>Fundamentals of Building AI Agents (IBM)</li>
              <li>Influencer Marketing II – Industry Specialist (Meltwater)</li>
              <li>Influencer Marketing I – Industry Specialist (Meltwater)</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Hr() {
  return <div style={{ borderBottom: '2px solid #003366', margin: '12px 0' }} />
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{
        fontSize: 13, textTransform: 'uppercase', letterSpacing: 1,
        color: '#003366', fontFamily: 'Georgia, serif',
        borderBottom: '1px solid #c0cfe0', paddingBottom: 3, marginBottom: 6, marginTop: 0
      }}>{title}</h2>
      {children}
    </div>
  )
}
