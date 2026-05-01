const NoteView = (() => {
  function render(container, params = {}) {
    container.innerHTML = '';

    if (params.id === 'new') {
      renderEditor(container, null);
    } else if (params.id) {
      loadNote(container, params.id);
    } else {
      renderNoteList(container);
    }
  }

  function renderNoteList(container) {
    const header = Utils.createElement('div', { className: 'page-header' }, [
      Utils.createElement('h1', { className: 'page-header__title' }, 'Notes'),
      Utils.createElement('p', { className: 'page-header__subtitle' }, 'Your personal markdown notes')
    ]);
    container.appendChild(header);

    const toolbar = Utils.createElement('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl);' }, [
      Utils.createElement('input', {
        className: 'input',
        id: 'note-search',
        placeholder: 'Search notes...',
        style: 'max-width: 300px;'
      }),
      Utils.createElement('button', {
        className: 'btn btn--primary',
        id: 'new-note-btn'
      }, '+ New Note')
    ]);
    container.appendChild(toolbar);

    const grid = Utils.createElement('div', { id: 'notes-grid', className: 'grid grid--responsive' });
    container.appendChild(grid);

    loadNotes(grid);

    document.getElementById('new-note-btn').addEventListener('click', () => {
      Router.navigate('#note/new');
    });

    document.getElementById('note-search').addEventListener('input', Utils.debounce((e) => {
      filterNotes(grid, e.target.value);
    }, 300));
  }

  function loadNotes(grid) {
    const notes = Store.get('notes', []);
    renderNotesList(grid, notes);
  }

  function renderNotesList(grid, notes) {
    grid.innerHTML = '';

    if (notes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state__icon">📝</div>
          <div class="empty-state__title">No Notes Yet</div>
          <div class="empty-state__description">Create your first note to start studying.</div>
        </div>
      `;
      return;
    }

    notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    notes.forEach((note) => {
      const card = Utils.createElement('a', {
        className: 'card',
        href: `#note/${note.id}`,
        style: 'cursor: pointer;'
      }, [
        Utils.createElement('h3', { className: 'card__title' }, note.title || 'Untitled'),
        Utils.createElement('p', {
          className: 'card__description',
          style: 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: var(--spacing-sm);'
        }, note.content?.slice(0, 150) || ''),
        Utils.createElement('span', {
          className: 'badge badge--primary'
        }, Utils.formatDate(note.updatedAt, 'full'))
      ]);
      grid.appendChild(card);
    });
  }

  function filterNotes(grid, query) {
    const notes = Store.get('notes', []);
    const filtered = notes.filter((n) =>
      n.title?.toLowerCase().includes(query.toLowerCase()) ||
      n.content?.toLowerCase().includes(query.toLowerCase())
    );
    renderNotesList(grid, filtered);
  }

  function loadNote(container, id) {
    const notes = Store.get('notes', []);
    const note = notes.find((n) => n.id === id);

    if (!note) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">❌</div>
          <div class="empty-state__title">Note Not Found</div>
          <a href="#note" class="btn btn--primary" style="margin-top: var(--spacing-xl);">Back to Notes</a>
        </div>
      `;
      return;
    }

    renderEditor(container, note);
  }

  function renderEditor(container, note) {
    const isNew = !note;

    const header = Utils.createElement('div', { className: 'page-header' }, [
      Utils.createElement('div', { style: 'display: flex; justify-content: space-between; align-items: center;' }, [
        Utils.createElement('div', {}, [
          Utils.createElement('h1', { className: 'page-header__title' }, isNew ? 'New Note' : 'Edit Note'),
          Utils.createElement('a', { className: 'breadcrumb__item', href: '#note' }, '← Back to Notes')
        ]),
        Utils.createElement('div', { style: 'display: flex; gap: var(--spacing-sm);' }, [
          Utils.createElement('button', { className: 'btn btn--outline', id: 'preview-btn' }, 'Preview'),
          Utils.createElement('button', { className: 'btn btn--primary', id: 'save-btn' }, 'Save'),
          Utils.createElement('button', { className: 'btn btn--outline', id: 'export-btn' }, 'Export'),
          !isNew ? Utils.createElement('button', { className: 'btn btn--ghost', id: 'delete-btn', style: 'color: var(--color-danger);' }, 'Delete') : null
        ].filter(Boolean))
      ])
    ]);
    container.appendChild(header);

    const editorContainer = Utils.createElement('div', { className: 'grid', style: 'grid-template-columns: 1fr 1fr; gap: var(--spacing-xl);' });

    const editSection = Utils.createElement('div', { id: 'edit-section' }, [
      Utils.createElement('label', { style: 'display: block; margin-bottom: var(--spacing-sm); font-weight: 500;' }, 'Title'),
      Utils.createElement('input', {
        className: 'input',
        id: 'note-title',
        placeholder: 'Note title...',
        value: note?.title || '',
        style: 'margin-bottom: var(--spacing-md);'
      }),
      Utils.createElement('label', { style: 'display: block; margin-bottom: var(--spacing-sm); font-weight: 500;' }, 'Content (Markdown)'),
      Utils.createElement('textarea', {
        className: 'textarea',
        id: 'note-content',
        placeholder: 'Write your notes here...',
        style: 'min-height: 400px;'
      }, note?.content || '')
    ]);

    const previewSection = Utils.createElement('div', { id: 'preview-section', style: 'display: none;' }, [
      Utils.createElement('label', { style: 'display: block; margin-bottom: var(--spacing-sm); font-weight: 500;' }, 'Preview'),
      Utils.createElement('div', {
        id: 'note-preview',
        className: 'card',
        style: 'min-height: 400px; overflow-y: auto;'
      })
    ]);

    editorContainer.appendChild(editSection);
    editorContainer.appendChild(previewSection);
    container.appendChild(editorContainer);

    document.getElementById('save-btn').addEventListener('click', () => saveNote(note?.id));
    document.getElementById('preview-btn').addEventListener('click', togglePreview);
    document.getElementById('export-btn').addEventListener('click', () => exportNote(note));

    if (!isNew) {
      document.getElementById('delete-btn').addEventListener('click', () => deleteNote(note.id));
    }

    const textarea = document.getElementById('note-content');
    textarea.addEventListener('input', Utils.debounce(() => {
      if (previewSection.style.display !== 'none') {
        updatePreview();
      }
    }, 300));
  }

  function saveNote(id) {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();

    if (!title && !content) {
      Utils.showToast('Note cannot be empty', 'error');
      return;
    }

    const notes = Store.get('notes', []);

    if (id) {
      const index = notes.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes[index].title = title;
        notes[index].content = content;
        notes[index].updatedAt = new Date().toISOString();
      }
    } else {
      notes.push({
        id: generateId(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    Store.set('notes', notes);
    Utils.showToast('Note saved!');

    if (!id) {
      const newNote = notes[notes.length - 1];
      Router.navigate(`#note/${newNote.id}`);
    }
  }

  function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    let notes = Store.get('notes', []);
    notes = notes.filter((n) => n.id !== id);
    Store.set('notes', notes);
    Utils.showToast('Note deleted');
    Router.navigate('#note');
  }

  function togglePreview() {
    const editSection = document.getElementById('edit-section');
    const previewSection = document.getElementById('preview-section');

    if (previewSection.style.display === 'none') {
      previewSection.style.display = 'block';
      editSection.style.gridColumn = '1 / -1';
      updatePreview();
    } else {
      previewSection.style.display = 'none';
      editSection.style.gridColumn = '';
    }
  }

  function updatePreview() {
    const content = document.getElementById('note-content').value;
    const preview = document.getElementById('note-preview');
    preview.innerHTML = parseMarkdown(content);
  }

  function parseMarkdown(text) {
    return text
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  function exportNote(note) {
    if (!note) {
      const title = document.getElementById('note-title').value.trim() || 'untitled';
      const content = document.getElementById('note-content').value;
      downloadMarkdown(title, content);
    } else {
      downloadMarkdown(note.title || 'untitled', note.content || '');
    }
  }

  function downloadMarkdown(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  return { render };
})();
