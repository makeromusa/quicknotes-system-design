# QuickNotes Data Model

This document outlines the database schema, relationships, and design choices for the QuickNotes backend.

## 1. Entities and Schema

The system relies on four core tables.

### `users`

- **id**: INT, Primary Key
- **username**: VARCHAR(50), Not Null
- **email**: VARCHAR(255), Not Null, Unique
- **created_at**: TIMESTAMP, Default Current Timestamp

### `notes`

- **id**: INT, Primary Key
- **user_id**: INT, Foreign Key (references `users.id`)
- **title**: VARCHAR(100), Not Null
- **body**: TEXT
- **created_at**: TIMESTAMP, Default Current Timestamp

### `tags`

- **id**: INT, Primary Key
- **name**: VARCHAR(50), Not Null, Unique

### `note_tags` (Join Table)

- **note_id**: INT, Foreign Key (references `notes.id`)
- **tag_id**: INT, Foreign Key (references `tags.id`)
- **Primary Key**: Composite key (`note_id`, `tag_id`)

---

## 2. Relationships

- **One-to-Many (Users to Notes):** A single user can create multiple notes, but each note belongs to exactly one user. This is enforced by placing a `user_id` foreign key inside the `notes` table.
- **Many-to-Many (Notes to Tags):** A single note can have multiple tags (e.g., "Work", "Urgent"), and a single tag can be applied to multiple notes. Relational databases cannot handle this directly, so we resolve it using the `note_tags` junction table, which connects the primary keys of both entities.

---

## 3. CREATE TABLE Statements

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE note_tags (
    note_id INT REFERENCES notes(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

---

## 4. Example SQL Queries

**1. Create a new note:**

```sql
INSERT INTO notes (user_id, title, body)
VALUES (1, 'System Design Notes', 'Review load balancers and caches.');
```

**2. Delete a specific note:**

```sql
DELETE FROM notes WHERE id = 101 AND user_id = 1;
```

**3. Retrieve a note with all its tags (JOIN query):**

```sql
SELECT notes.title, tags.name
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE notes.id = 101;
```

---

## 5. Indexes for Performance

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
```

**Reason:** The most frequent query in QuickNotes is retrieving a specific user's feed (`SELECT * FROM notes WHERE user_id = ?`). Without an index, the database would have to scan millions of rows sequentially. By indexing `user_id`, the database uses a B-Tree to find the user's notes instantly, keeping read latency extremely low as the app scales.

---

## 6. SQL vs. NoSQL Justification

For QuickNotes, a **SQL (Relational) database** is the correct choice. Our data is highly structured with strict relationships (Users -> Notes -> Tags). We need ACID compliance to guarantee data integrity (e.g., if a user deletes their account, all their notes and tag associations must be cleanly deleted via `CASCADE`). Furthermore, filtering notes by tags requires complex `JOIN` operations, which SQL databases handle natively and efficiently. A NoSQL document store (like MongoDB) would require duplicating tag data across note documents, leading to synchronization issues if a tag name is ever changed.
