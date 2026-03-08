import { create } from 'zustand'

const funnyErrors = [
  'This program has performed an illegal operation and will be shut down.',
  'Cannot find file. It might have been moved or deleted.',
  'Access denied. You do not have permission to perform this action.',
  'The operation could not be completed. An unexpected error occurred.',
  'Windows cannot find the specified file. Make sure you typed the name correctly.',
  'This feature is not available in this version of Windows.',
  'An error has occurred in the program. Please contact your system administrator.',
  'The file or folder does not exist. Verify the location and try again.',
  'Insufficient memory to complete this operation. Close some programs and try again.',
  'A fatal exception has occurred at 0x028A:C00038FE.',
]

interface ErrorDialogState {
  isOpen: boolean
  title: string
  message: string
  showError: (title?: string, message?: string) => void
  closeError: () => void
}

export const useErrorDialogStore = create<ErrorDialogState>((set) => ({
  isOpen: false,
  title: 'Error',
  message: '',
  showError: (title?: string, message?: string) => {
    const msg = message || funnyErrors[Math.floor(Math.random() * funnyErrors.length)]
    set({ isOpen: true, title: title || 'Error', message: msg })
  },
  closeError: () => set({ isOpen: false }),
}))
