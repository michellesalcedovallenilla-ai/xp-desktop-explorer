import { useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useSystemStore } from '../../store/useSystemStore'
import DraggableWidget from './DraggableWidget'

export default function NotesWidget() {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    addNote,
    updateNote,
    deleteNote,
    loadNotes
  } = useSystemStore()

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const activeNote = notes.find((n) => n.id === activeNoteId)

  const handleNew = () => {
    const note = {
      id: `note-${Date.now()}`,
      title: 'Untitled',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addNote(note)
  }

  return (
    <DraggableWidget id="notes" title="Notepad" className="xp-notes-widget">
      <div className="xp-notepad-menu">
        <button className="xp-notepad-menu-item" onClick={handleNew}>
          File
        </button>
        <button className="xp-notepad-menu-item">Edit</button>
        <button className="xp-notepad-menu-item">Format</button>
        <button className="xp-notepad-menu-item">Help</button>
      </div>
      <div className="xp-notepad-toolbar">
        <button className="xp-notepad-tool-btn" onClick={handleNew} title="New">
          <Plus size={14} />
        </button>
        <button
          className="xp-notepad-tool-btn"
          onClick={() => activeNoteId && deleteNote(activeNoteId)}
          title="Delete"
          disabled={!activeNoteId}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="xp-notepad-body">
        {/* Sidebar */}
        <div className="xp-notepad-sidebar">
          {notes.map((note) => (
            <button
              key={note.id}
              className={`xp-notepad-file ${note.id === activeNoteId ? 'active' : ''}`}
              onClick={() => setActiveNoteId(note.id)}
            >
              <span className="xp-notepad-file-icon">📄</span>
              <span className="xp-notepad-file-name">
                {note.title || 'Untitled'}
              </span>
            </button>
          ))}
          {notes.length === 0 && (
            <div className="xp-notepad-empty-list">No documents</div>
          )}
        </div>
        {/* Editor */}
        <div className="xp-notepad-editor">
          {activeNote ? (
            <textarea
              className="xp-notepad-textarea"
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, e.target.value)}
              placeholder="Start typing..."
            />
          ) : (
            <div className="xp-notepad-placeholder">
              Select a note or create a new one
            </div>
          )}
        </div>
      </div>
      <div className="xp-notepad-statusbar">
        {activeNote ? `${activeNote.content.length} characters` : 'Ready'}
      </div>
    </DraggableWidget>
  )
}
