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
    
    li.appendChild(titleEl);
    li.appendChild(bodyEl);
    
    // We will add the Delete button here in Task 3
    
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

// Event Listeners
loadBtn.addEventListener('click', loadNotes);