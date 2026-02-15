---
title: "Listacular Feature Review: Building a SwiftUI Replacement"
date: 2026-02-15
draft: true
category: Code
---

# Listacular Feature Review

**Developer:** Andrew McKinney / Bloomingsoft
**Platform:** iOS (iPhone)
**Status:** Discontinued
**Tech:** SwiftUI replacement planned with Dropbox sync

---

## Core Features to Replicate

### 1. List Management

- Create lists, notes, and outlines in a single app
- Three item types per line: plain text, bullet point (`*`), checkbox/to-do (`-`)
- Folders and sub-folders for organizing lists
- Long-press and drag to reorder items
- Swipe right to mark complete (crossed off and dimmed)
- Extended swipe right to delete
- Completed items auto-move to bottom (configurable)
- Bulk remove all completed tasks
- Email a list from within the app

### 2. Rapid-Fire Entry

This was Listacular's defining feature -- the entire UX was built around speed:

- Hit Return while editing to instantly create a new item below, inheriting item type and indentation level
- Keyboard extension row with one-tap buttons: indent, outdent, plain text, bullet, checkbox
- Paste multi-line text and auto-convert each line into individual items
- Speech-to-text: say "newline" between items to separate them
- Single-tap to create new items (no separate "add" screen)

### 3. Dropbox Sync

- Optional Dropbox sync (app works offline/locally without it)
- Configurable sync folder name (default: "Listacular" in Dropbox)
- Pull-to-refresh to manually trigger sync
- Auto-sync on changes
- Full offline support with sync on reconnect
- Intelligent merge for simultaneous editing by multiple users
- Plain text files stored in Dropbox -- readable/editable from any text editor

### 4. Text Format Support

- Plain text (`.txt`) -- default format
- TaskPaper (`.taskpaper`) -- officially recommended by TaskPaper developer as iOS replacement
- Markdown (`.md`) -- added in later update
- nvALT compatibility
- Syntax:
  - `#` header/project
  - `-` checkbox item
  - `- item @done` completed checkbox
  - `*` bullet point
  - `*italic*`, `**bold**`, `***bold-italic***`
- Toggle between rich view and raw plain text

### 5. Sub-tasks / Indentation / Hierarchy

- Indent/outdent buttons on keyboard extension row
- Unlimited nesting levels
- Outlining support for thought-mapping
- Headers (H1, H2, H3) for section separators within a list
- Folder > sub-folder > list navigation hierarchy

### 6. Tags (TaskPaper Format)

- `@done` marks items as completed
- Other `@tag` annotations recognized
- Limited compared to full TaskPaper -- no advanced query/filtering by tags
- No boolean search or complex tag queries

### 7. Due Dates and Alerts

- Swipe left on a to-do item to set due date and time
- Local notification alerts when due date arrives
- Home screen shows overdue task summary and today's tasks
- No explicit priority field (A/B/C)

### 8. Sharing / Collaboration

- Share Dropbox folders for multi-user collaboration
- Intelligent merge handles simultaneous edits
- Long-press list name to share its Dropbox link
- Share individual lists via email
- Collaboration required Dropbox folder permission setup

### 9. UI/UX

- Minimal, flat design
- Gesture-driven (inspired by Mailbox and Clear):
  - Swipe right: complete
  - Extended swipe right: delete
  - Swipe left: set due date
  - Long-press + drag: reorder
  - Pull-to-refresh: sync
- Keyboard extension row (5 buttons)
- Rich text rendering with raw text toggle
- Completed items crossed out and dimmed
- iPhone-optimized (not native iPad)

---

## Features That Were Missing / Limited

- No built-in search or filter
- No priority levels
- No advanced tag queries (unlike TaskPaper for Mac)
- No dark mode or themes
- No iPad-native layout
- No URL scheme (was "coming soon" but never shipped)
- No confirmed TextExpander SDK integration
- Limited to 3 lists on free tier ($2.99 unlock)

---

## Proposed SwiftUI Replacement: Feature Priorities

### P0 -- Must Have (MVP)

1. **List CRUD** -- create, edit, delete lists and items
2. **Three item types** -- plain text, bullet, checkbox
3. **Rapid-fire entry** -- Return key creates new item, keyboard accessory row
4. **Indentation/hierarchy** -- indent/outdent with unlimited nesting
5. **Swipe gestures** -- complete, delete, due date
6. **Drag to reorder**
7. **Dropbox sync** -- plain text files in configurable folder
8. **Offline support** -- local-first, sync when connected
9. **Multiple file formats** -- .txt, .taskpaper, .md

### P1 -- Should Have

1. **Due dates and local notifications**
2. **Overdue/today task overview on home screen**
3. **Folder organization** with sub-folders
4. **Collaboration** via shared Dropbox folders with merge
5. **Search** across all lists (improvement over original)
6. **Rich text rendering** with raw text toggle
7. **Multi-line paste** auto-conversion
8. **Bulk actions** -- remove all completed, select multiple

### P2 -- Nice to Have

1. **iPad support** (improvement over original)
2. **Dark mode** (improvement over original)
3. **Widgets** -- show overdue/today tasks
4. **Shortcuts/Siri integration**
5. **Share sheet** -- add items from other apps
6. **Tag filtering** -- `@tag` based search/filter (improvement over original)
7. **Priority levels**
8. **URL scheme** for automation

### P3 -- Future

1. **iCloud sync** as alternative to Dropbox
2. **Apple Watch** quick-add
3. **Mac Catalyst or native macOS** companion
4. **Templates** for recurring lists (e.g., packing list)
5. **Import from other apps**

---

## Technical Considerations (SwiftUI)

- **Local-first architecture**: SwiftData or plain file storage with Dropbox as sync layer
- **Dropbox API v2**: Use SwiftyDropbox SDK for auth and file sync
- **Conflict resolution**: Operational transform or CRDT for merge conflicts
- **File parsing**: Build parsers for .txt, .taskpaper, .md formats
- **Keyboard accessory**: Use `UIInputView` / `.toolbar(.keyboard)` in SwiftUI
- **Notifications**: UNUserNotificationCenter for due date alerts
- **Gestures**: SwiftUI `.swipeActions()` for list item interactions
