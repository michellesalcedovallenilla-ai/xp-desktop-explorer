import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

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
        <a
          href={pdfUrl}
          download="Michelle_Salcedo_Resume.pdf"
          className="xp-btn"
          style={{
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
          title="Download"
        >
          <Download size={16} color="#333" />
        </a>
        <div style={{ flex: 1 }} />
      </div>

      {/* PDF Embed */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <iframe
          src={`${pdfUrl}#toolbar=0`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="Resume PDF"
        />
      </div>
    </div>
  )
}
