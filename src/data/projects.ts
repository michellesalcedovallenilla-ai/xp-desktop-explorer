import type { MusicTrack, Project } from '../types'

export const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Aero Dashboard',
    description:
      'A stunning Frutiger Aero-inspired dashboard application with glassmorphic widgets, real-time data visualization, and smooth animations. Built with a focus on the mid-2000s design aesthetic.',
    technologies: ['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS'],
    image: '🖥️',
    link: '#',
    github: '#'
  },
  {
    id: 'project-2',
    title: 'Crystal Chat',
    description:
      'A real-time messaging application inspired by iChat and MSN Messenger. Features translucent chat bubbles, animated emoticons, and contact presence indicators.',
    technologies: ['Next.js', 'Socket.io', 'PostgreSQL', 'Prisma'],
    image: '💬',
    link: '#',
    github: '#'
  },
  {
    id: 'project-3',
    title: 'Vista Weather',
    description:
      'A weather application with animated 3D weather effects, gradient skies that change based on conditions, and glassmorphic information cards.',
    technologies: ['React', 'Three.js', 'OpenWeather API', 'CSS Gradients'],
    image: '🌤️',
    link: '#',
    github: '#'
  },
  {
    id: 'project-4',
    title: 'Aqua Notes',
    description:
      'A note-taking app inspired by macOS Stickies with real-time sync, markdown support, and the classic "pinned to desktop" feel with skeuomorphic paper textures.',
    technologies: ['Vue.js', 'Firebase', 'Markdown-it', 'GSAP'],
    image: '📝',
    link: '#',
    github: '#'
  }
]

export const musicPlaylist: (MusicTrack & { src: string })[] = [
  { id: 'track-1', title: 'Sk8er Boi', artist: 'Avril Lavigne', youtubeId: 'TIy3n2b7V9k', duration: 219, src: '' },
  { id: 'track-2', title: 'Complicated', artist: 'Avril Lavigne', youtubeId: '5NPBIwQyPWE', duration: 254, src: '' },
  { id: 'track-3', title: 'I Want It That Way', artist: 'Backstreet Boys', youtubeId: '4fndeDfaWCg', duration: 220, src: '' },
  { id: 'track-4', title: 'Bye Bye Bye', artist: '*NSYNC', youtubeId: 'Eo-KmOd3i7s', duration: 239, src: '' },
  { id: 'track-5', title: '...Baby One More Time', artist: 'Britney Spears', youtubeId: 'C-u5WLJ9Yk4', duration: 237, src: '' },
]
