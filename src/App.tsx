import { useEffect } from 'react'
import { useSystemStore } from './store/useSystemStore'
import { useWindowStore } from './store/useWindowStore'
import { useAudioStore } from './store/useAudioStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import BootAnimation from './components/Desktop/BootAnimation'
import LockScreen from './components/Desktop/LockScreen'
import MenuBar from './components/Desktop/MenuBar'
import Desktop from './components/Desktop/Desktop'
import Window from './components/Desktop/Window'
import WakeEffect from './components/Desktop/WakeEffect'
import Spotlight from './components/Desktop/Spotlight'
import CalculatorWidget from './components/Windows/CalculatorWidget'
import WeatherWidget from './components/Windows/WeatherWidget'
import ClockWidget from './components/Windows/ClockWidget'
import CalendarWidget from './components/Windows/CalendarWidget'
import MusicPlayerWidget from './components/Windows/MusicPlayerWidget'
import NotesWidget from './components/Windows/NotesWidget'
import Clippy from './components/Desktop/Clippy'
import ShutdownDialog from './components/Desktop/ShutdownDialog'
import XPErrorDialog from './components/Desktop/XPErrorDialog'
import { useErrorDialogStore } from './store/useErrorDialogStore'
import './App.css'

const App = () => {
  const {
    isBooting,
    isLocked,
    isShutdownVisible,
    setShutdownVisible,
    setLocked
  } = useSystemStore()
  const { windows, closeWindow } = useWindowStore()
  const { playStartup, playShutdown } = useAudioStore()
  const { isOpen: errorOpen, title: errorTitle, message: errorMessage, closeError } = useErrorDialogStore()
  useKeyboardShortcuts()

  useEffect(() => {
    if (!isBooting) {
      playStartup()
    }
  }, [isBooting, playStartup])

  return (
    <div className="app-root">
      <div className="xp-desktop-bg" />
      <BootAnimation />
      {!isBooting && <LockScreen />}
      {!isBooting && !isLocked && (
        <>
          <Desktop />
          <CalculatorWidget />
          <WeatherWidget />
          <ClockWidget />
          <CalendarWidget />
          <MusicPlayerWidget />
          <NotesWidget />
          {windows.map((win) => (
            <Window key={win.id} window={win} />
          ))}
          <MenuBar />
          <Spotlight />
          <Clippy />
        </>
      )}
      <ShutdownDialog
        isOpen={isShutdownVisible}
        onClose={() => setShutdownVisible(false)}
        onShutdown={() => {
          playShutdown()
          setShutdownVisible(false)
          windows.forEach((w) => closeWindow(w.id))
          setLocked(true)
        }}
      />
      <XPErrorDialog
        isOpen={errorOpen}
        title={errorTitle}
        message={errorMessage}
        onClose={closeError}
      />
      <WakeEffect />
    </div>
  )
}

export default App
