import { MapPin, Briefcase, GraduationCap, Code } from 'lucide-react'

const skills = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Python',
  'PostgreSQL',
  'Tailwind CSS',
  'Framer Motion',
  'GraphQL',
  'Docker',
  'AWS',
  'Figma'
]

const experience = [
  {
    role: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    period: '2022 - Present',
    desc: 'Led development of customer-facing web applications using React and TypeScript.'
  },
  {
    role: 'Frontend Developer',
    company: 'StartupHub',
    period: '2020 - 2022',
    desc: 'Built responsive web apps and component libraries for early-stage startups.'
  },
  {
    role: 'Junior Developer',
    company: 'AgencyOne',
    period: '2018 - 2020',
    desc: 'Developed interactive websites and landing pages for various clients.'
  }
]

export default function AboutViewer() {
  return (
    <div className="xp-about-viewer">
      <div className="xp-about-header">
        <div className="xp-about-avatar">🐱</div>
        <div>
          <h1 className="xp-about-name">Michelle Salcedo</h1>
          <p className="xp-about-title">Full Stack Developer & Designer</p>
          <p className="xp-about-location">
            <MapPin size={12} /> San Francisco, CA
          </p>
        </div>
      </div>

      <div className="xp-about-section">
        <h2>
          <Briefcase size={14} /> About
        </h2>
        <p className="xp-about-bio">
          Passionate developer with 5+ years of experience building beautiful,
          performant web applications. I love creating intuitive user
          experiences and bringing creative designs to life through code. When
          I'm not coding, you can find me exploring new technologies,
          contributing to open source, or experimenting with nostalgic UI
          designs.
        </p>
      </div>

      <div className="xp-about-section">
        <h2>
          <Code size={14} /> Skills
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
          <GraduationCap size={14} /> Education
        </h2>
        <div className="xp-exp-item">
          <strong>BS Computer Science</strong>
          <div className="xp-exp-company">
            University of California, Berkeley
          </div>
          <span className="xp-exp-period">2014 - 2018</span>
        </div>
      </div>
    </div>
  )
}
