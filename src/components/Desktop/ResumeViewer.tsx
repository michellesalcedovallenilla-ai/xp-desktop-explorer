import {
  Download,
  Mail,
  Phone,
  Globe,
  Printer,
  ZoomIn,
  ZoomOut,
  FileText
} from 'lucide-react'

export default function ResumeViewer() {
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
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'Tahoma',
              fontWeight: 'bold'
            }}
          >
            Adobe Reader
          </span>
        </div>
        <button
          className="xp-btn"
          style={{
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
          title="Print"
          onClick={() => window.print()}
        >
          <Printer size={16} color="#333" />
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="xp-btn"
          style={{
            padding: '2px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <ZoomOut size={16} />
        </button>
        <span style={{ fontSize: '12px', fontFamily: 'Tahoma' }}>100%</span>
        <button
          className="xp-btn"
          style={{
            padding: '2px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Document Area */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div
          className="xp-resume-page"
          style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'white',
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <div
            className="xp-resume-header"
            style={{
              borderBottom: '2px solid #333',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', color: '#111' }}>
                  Michelle Salcedo
                </h1>
                <p
                  className="xp-resume-role"
                  style={{ margin: '4px 0', fontSize: '16px', color: '#555' }}
                >
                  Full Stack Developer
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  fontSize: '12px',
                  gap: '4px',
                  color: '#444'
                }}
              >
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Mail size={12} /> michelle@portfolio.dev
                </span>
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Phone size={12} /> (555) 123-4567
                </span>
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Globe size={12} /> www.readymag.website/u2801101920/5411866
                </span>
              </div>
            </div>
          </div>

          <div className="xp-resume-section" style={{ marginBottom: '24px' }}>
            <h2>Professional Summary</h2>
            <p>
              Full stack developer with 5+ years of experience building scalable
              web applications. Proficient in React, TypeScript, Node.js, and
              modern cloud technologies. Passionate about creating intuitive
              user experiences and maintainable code.
            </p>
          </div>

          <div className="xp-resume-section">
            <h2>Experience</h2>
            <div className="xp-resume-entry">
              <div className="xp-resume-entry-header">
                <strong>Senior Frontend Developer</strong>
                <span>2022 - Present</span>
              </div>
              <div className="xp-resume-company">TechCorp Inc.</div>
              <ul>
                <li>
                  Led frontend architecture for customer-facing SaaS platform
                </li>
                <li>
                  Improved application performance by 40% through code
                  optimization
                </li>
                <li>Mentored team of 4 junior developers</li>
              </ul>
            </div>
            <div className="xp-resume-entry">
              <div className="xp-resume-entry-header">
                <strong>Frontend Developer</strong>
                <span>2020 - 2022</span>
              </div>
              <div className="xp-resume-company">StartupHub</div>
              <ul>
                <li>
                  Built reusable component library serving 3 product teams
                </li>
                <li>
                  Implemented responsive designs increasing mobile engagement by
                  25%
                </li>
              </ul>
            </div>
            <div className="xp-resume-entry">
              <div className="xp-resume-entry-header">
                <strong>Junior Developer</strong>
                <span>2018 - 2020</span>
              </div>
              <div className="xp-resume-company">AgencyOne</div>
              <ul>
                <li>Developed interactive websites for 15+ clients</li>
                <li>Created custom WordPress themes and plugins</li>
              </ul>
            </div>
          </div>

          <div className="xp-resume-section">
            <h2>Education</h2>
            <div className="xp-resume-entry">
              <div className="xp-resume-entry-header">
                <strong>BS Computer Science</strong>
                <span>2014 - 2018</span>
              </div>
              <div className="xp-resume-company">
                University of California, Berkeley
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
