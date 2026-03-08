import type { MusicTrack, Project } from '../types'

export const projects: Project[] = [
  {
    id: 'myspace',
    title: 'MySpace',
    description: 'My personal MySpace-style page made with Canva.',
    technologies: ['Canva'],
    image: '/icons/xp-myspace.png',
    link: 'https://ifyourereadingthishiremenow.my.canva.site'
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'My portfolio made with Readymag.',
    technologies: ['Readymag'],
    image: '/icons/xp-portfolio.png',
    link: 'https://readymag.website/u2801101920/5411866/'
  }
]

export const musicPlaylist: (MusicTrack & { src: string })[] = [
  { id: 'track-1', title: 'Sk8er Boi', artist: 'Avril Lavigne', youtubeId: 'TIy3n2b7V9k', duration: 219, src: '' },
  { id: 'track-2', title: 'Complicated', artist: 'Avril Lavigne', youtubeId: '5NPBIwQyPWE', duration: 254, src: '' },
  { id: 'track-3', title: 'I Want It That Way', artist: 'Backstreet Boys', youtubeId: '4fndeDfaWCg', duration: 220, src: '' },
  { id: 'track-4', title: 'Bye Bye Bye', artist: '*NSYNC', youtubeId: 'Eo-KmOd3i7s', duration: 239, src: '' },
  { id: 'track-5', title: '...Baby One More Time', artist: 'Britney Spears', youtubeId: 'C-u5WLJ9Yk4', duration: 237, src: '' },
]
