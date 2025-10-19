import type { Note } from "../types/index.js";

export class NotesManager {
  private notes: Note[] = [];

  async init() {
    await this.loadNotes();
  }

  async loadNotes() {
    const result = await chrome.storage.local.get("notes");
    this.notes = result.notes || [];
  }

  async saveNotes() {
    await chrome.storage.local.set({ notes: this.notes });
  }

  getNotes(): Note[] {
    // Return notes sorted by most recently updated first
    return [...this.notes].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async addNote(title: string, content: string): Promise<Note> {
    const note: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      content: content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.notes.push(note);
    await this.saveNotes();
    return note;
  }

  async updateNote(id: string, title: string, content: string): Promise<void> {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note.title = title.trim();
      note.content = content.trim();
      note.updatedAt = Date.now();
      await this.saveNotes();
    }
  }

  async deleteNote(id: string): Promise<void> {
    const index = this.notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notes.splice(index, 1);
      await this.saveNotes();
    }
  }

  getNote(id: string): Note | undefined {
    return this.notes.find((n) => n.id === id);
  }
}
