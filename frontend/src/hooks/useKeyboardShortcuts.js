import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useKeyboardShortcuts = (shortcuts = {}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if user is typing in an input field
      const isInputFocused = 
        event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable;

      // Don't trigger shortcuts when typing
      if (isInputFocused) return;

      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;

      // Default shortcuts
      const defaultShortcuts = {
        // Navigation
        'Home': () => navigate('/'),
        'ArrowUp': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        'ArrowDown': () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
        
        // Search
        '/': () => {
          event.preventDefault();
          const searchInput = document.querySelector('input[type="text"], input[placeholder*="search"]');
          if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        },
        
        // Theme toggle (Ctrl/Cmd + D)
        'd': () => {
          if (ctrlKey || metaKey) {
            event.preventDefault();
            const themeToggle = document.querySelector('[data-theme-toggle]');
            if (themeToggle) themeToggle.click();
          }
        },
        
        // Profile (Ctrl/Cmd + P)
        'p': () => {
          if (ctrlKey || metaKey) {
            event.preventDefault();
            navigate('/profile');
          }
        },
        
        // Admin dashboard (Ctrl/Cmd + A)
        'a': () => {
          if (ctrlKey || metaKey) {
            event.preventDefault();
            navigate('/admin');
          }
        },
        
        // Help (Ctrl/Cmd + ?)
        '?': () => {
          if (ctrlKey || metaKey || shiftKey) {
            event.preventDefault();
            // Toggle keyboard shortcuts help modal
            const helpModal = document.querySelector('[data-help-modal]');
            if (helpModal) {
              helpModal.style.display = helpModal.style.display === 'none' ? 'block' : 'none';
            }
          }
        },
        
        // Escape to close modals/dropdowns
        'Escape': () => {
          const modals = document.querySelectorAll('[data-modal]');
          modals.forEach(modal => {
            modal.style.display = 'none';
          });
          
          const dropdowns = document.querySelectorAll('[data-dropdown]');
          dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
          });
        }
      };

      // Merge custom shortcuts with defaults
      const allShortcuts = { ...defaultShortcuts, ...shortcuts };

      // Find matching shortcut
      const shortcutKey = `${ctrlKey || metaKey ? 'Ctrl+' : ''}${altKey ? 'Alt+' : ''}${shiftKey ? 'Shift+' : ''}${key}`;
      
      // Check for exact key match or modifier combinations
      if (allShortcuts[key]) {
        allShortcuts[key](event);
      } else if (allShortcuts[shortcutKey]) {
        allShortcuts[shortcutKey](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, navigate]);
};

export default useKeyboardShortcuts;
