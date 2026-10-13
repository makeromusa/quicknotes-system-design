# QuickNotes API Design Document

This document outlines the RESTful API endpoints for the real QuickNotes backend system.

## 1. Endpoints

| Method   | Path              | Description                                          | Success Status   |
| -------- | ----------------- | ---------------------------------------------------- | ---------------- |
| `GET`    | `/api/notes`      | Retrieve a list of notes for the authenticated user. | `200 OK`         |
| `GET`    | `/api/notes/{id}` | Retrieve a specific note by its ID.                  | `200 OK`         |
| `POST`   | `/api/notes`      | Create a new note.                                   | `201 Created`    |
| `PUT`    | `/api/notes/{id}` | Update an existing note's title or body.             | `200 OK`         |
| `DELETE` | `/api/notes/{id}` | Delete a specific note.                              | `204 No Content` |
| `GET`    | `/api/tags`       | Retrieve a list of all tags created by the user.     | `200 OK`         |

---

## 2. JSON Payload Examples

### A. Creating a Note (`POST /api/notes`)

**Request Body:**

```json
{
  "title": "System Design Prep",
  "body": "Need to review caching and load balancers before the interview."
}
```

**Response Body (201 Created):**

```json
{
  "id": 101,
  "userId": 42,
  "title": "System Design Prep",
  "body": "Need to review caching and load balancers before the interview.",
  "createdAt": "2026-10-13T10:00:00Z"
}
```

### B. Listing Notes (`GET /api/notes`)

**Request:** `GET /api/notes?limit=2` _(No body required, query parameters optional)_

**Response Body (200 OK):**

```json
[
  {
    "id": 101,
    "userId": 42,
    "title": "System Design Prep",
    "body": "Need to review caching and load balancers before the interview.",
    "createdAt": "2026-10-13T10:00:00Z"
  },
  {
    "id": 100,
    "userId": 42,
    "title": "Shopping List",
    "body": "Milk, coffee beans, bread.",
    "createdAt": "2026-10-12T14:30:00Z"
  }
]
```

---

## 3. Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request.

### Standard Error Codes

- **`400 Bad Request`**: The client sent invalid data (e.g., missing a required title, or title exceeds 100 characters).
- **`401 Unauthorized`**: The user is not logged in or the authentication token is missing/invalid.
- **`403 Forbidden`**: The user is authenticated but trying to access, edit, or delete a note that belongs to someone else.
- **`404 Not Found`**: The requested resource (like `/api/notes/999`) does not exist in the database.
- **`500 Internal Server Error`**: An unexpected failure occurred on the server side (e.g., database connection lost).

### Example Error Response Body

When an error occurs, the API returns a standardized JSON format so the frontend can easily parse and display the message.

**Response for a `400 Bad Request` (Invalid Title length):**

```json
{
  "error": "Bad Request",
  "message": "Validation failed: Title cannot exceed 100 characters.",
  "statusCode": 400
}
```
