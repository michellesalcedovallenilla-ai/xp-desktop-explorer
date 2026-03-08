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
  {
    id: 'track-1',
    title: 'Rush',
    artist: 'Troye Sivan',
    youtubeId: 'LbJnJFmwjTk',
    duration: 195,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'track-2',
    title: 'One of Your Girls',
    artist: 'Troye Sivan',
    youtubeId: 'ycYpCvBO1Mg',
    duration: 195,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'track-3',
    title: 'Got Me Started',
    artist: 'Troye Sivan',
    youtubeId: 'FBdasFIMwKE',
    duration: 188,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'track-4',
    title: '360',
    artist: 'Charli XCX',
    youtubeId: 'JElkGNSjjJo',
    duration: 173,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'track-5',
    title: 'Apple',
    artist: 'Charli XCX',
    youtubeId: 'dASmfXq_MNs',
    duration: 180,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  }
]
