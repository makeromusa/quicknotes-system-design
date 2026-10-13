const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// DOM Elements
const statusEl = document.getElementById('status');
const loadBtn = document.getElementById('load-btn');
const notesList = document.getElementById('notes-list');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const submitBtn = document.getElementById('submit-btn');

// Utility: Show status messages
function showStatus(message, type = '') {
    statusEl.textContent = message;
    statusEl.className = type;
}

// Utility: Reusable Fetch Function (Rubric Requirement)
async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error; // Throw so the caller can catch it
    }
}

// Utility: Create DOM element for a note safely using textContent
function createNoteElement(note) {
    const li = document.createElement('li');
    li.dataset.id = note.id;
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = note.title; // Secure: No innerHTML
    
    const bodyEl = document.createElement('p');
    bodyEl.textContent = note.body;   // Secure: No innerHTML
    
    // Task 3: Add Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    
    // Attach event listener for deletion
    deleteBtn.addEventListener('click', () => deleteNote(note.id, li, deleteBtn));
    
    li.appendChild(titleEl);
    li.appendChild(bodyEl);
    li.appendChild(deleteBtn);
    
    return li;
}

// Task 1: Load Notes (GET)
async function loadNotes() {
    showStatus('Loading notes...', 'loading');
    loadBtn.disabled = true;
    notesList.innerHTML = ''; // Clear current list

    try {
        // Fetch 10 notes
        const notes = await request(`${API_URL}?_limit=10`);
        
        // Handle Empty State
        if (notes.length === 0) {
            notesList.innerHTML = '<li>No notes found.</li>';
            showStatus('Loaded empty list.', 'success');
            return;
        }

        // Render Notes
        notes.forEach(note => {
            const noteEl = createNoteElement(note);
            notesList.appendChild(noteEl);
        });

        showStatus('Loaded 10 notes from the server.', 'success');
    } catch (error) {
        showStatus('Failed to load notes. Please try again.', 'error');
    } finally {
        loadBtn.disabled = false;
    }
}

// Task 2: Create Note (POST)
async function createNote(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validation (Rubric requirement)
    if (!title) {
        showStatus('Title is required.', 'error');
        return;
    }
    if (title.length > 100) {
        showStatus('Title cannot exceed 100 characters.', 'error');
        return;
    }

    showStatus('Creating note...', 'loading');
    submitBtn.disabled = true;

    try {
        const payload = {
            title: title,
            body: body,
            userId: 1
        };

        const newNote = await request(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        // Add the new note to the top of the list
        const noteEl = createNoteElement(newNote);
        notesList.prepend(noteEl);

        // JSONPlaceholder always returns 201 for a successful POST
        showStatus(`Note created (status 201, id ${newNote.id}).`, 'success');
        
        // Clear the form
        noteForm.reset();
    } catch (error) {
        showStatus('Failed to create note. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
}

// Task 3: Delete Note (DELETE)
async function deleteNote(id, listItem, deleteBtn) {
    showStatus('Deleting note...', 'loading');
    deleteBtn.disabled = true; // Disable just this specific button

    try {
        /*
         * EDGE CASE HANDLING: The JSONPlaceholder Illusion
         * JSONPlaceholder gives all new notes an ID of 101+, but doesn't persist them.
         * A DELETE request to /posts/101 will fail with a 404 Not Found error.
         * To handle this sensibly, if the ID is > 100, we skip the network request
         * and only remove the element from the DOM.
         */
        if (id <= 100) {
            await request(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
        } else {
            console.warn(`Simulating deletion for non-persisted JSONPlaceholder ID: ${id}`);
        }

        // Remove the note from the UI
        listItem.remove();
        showStatus(`Note deleted successfully (id ${id}).`, 'success');

        // Show empty state if that was the last note
        if (notesList.children.length === 0) {
            notesList.innerHTML = '<li>No notes found.</li>';
        }
    } catch (error) {
        showStatus('Failed to delete note. Please try again.', 'error');
        deleteBtn.disabled = false; // Re-enable so they can try again
    }
}

// Event Listeners
loadBtn.addEventListener('click', loadNotes);
noteForm.addEventListener('submit', createNote);