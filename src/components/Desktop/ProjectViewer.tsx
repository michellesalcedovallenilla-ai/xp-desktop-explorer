import { projects } from '../../data/projects'
import { ExternalLink, Github } from 'lucide-react'

interface Props {
  projectId?: string
}

export default function ProjectViewer({ projectId }: Props) {
  const project = projects.find((p) => p.id === projectId)
  if (!project)
    return <div className="xp-project-empty">Project not found.</div>

  return (
    <div className="xp-project-viewer">
      <div className="xp-project-hero">
        <div className="xp-project-image">{project.image}</div>
      </div>
      <div className="xp-project-details">
        <h1>{project.title}</h1>
        <p className="xp-project-desc">{project.description}</p>
        <div className="xp-project-tech">
          {project.technologies.map((t) => (
            <span key={t} className="xp-tech-tag">
              {t}
            </span>
          ))}
        </div>
        <div className="xp-project-links">
          {project.link && (
            <a
              href={project.link}
              className="xp-btn xp-btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={12} /> Live Demo
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              className="xp-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={12} /> Source Code
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
