# Student Notes Web Application

##  Overview

This project is a Single Page Application  designed to help students take, organize, and share notes during courses and labs. The application is optimized for desktop, tablet, and mobile browsers**, allowing students to access their notes anytime, anywhere.

The platform provides a simple markdown-based note editor, making it easy to format text while taking notes in real time during classes.
Made in collaboration with [**Raevschi Ana**](https://github.com/RaevschiAna) (GitHub).

---
 
 ## 📸 Application Screenshots

### ➕ Add Note Page
![Add Note Page](screenshots/AddNotePage.png)

### 📂 My Notes
![My Notes](screenshots/MyNotes.png)

### 📝 View Note Page
![View Note Page](screenshots/ViewNotePage.png)

### 🧾 Register Page
![Register Page](screenshots/registerPage.png) 


---

# Goal
To develop a modern web application that allows students to:

* Take notes efficiently during courses and labs
* Organize notes by classes and study activities
* Retrieve information quickly using tags, keywords, and dates
* Share notes with colleagues

---

## Tech Stack

### Frontend
* **React** (built with **Vite**)
* Single Page Application (SPA) architecture
* Markdown-based note editor

### Backend
* **Node.js**
* **Express.js**
* **Sequelize ORM**
* **CORS** for cross-origin requests
* **dotenv (.env)** for environment configuration

### Database
* **Sequilize locally -> Postgres in deployment**
### Deployment
* Deployed on **Railway**
* Live URL:
   [https://superb-liberation-production.up.railway.app/mynotes](https://superb-liberation-production.up.railway.app/mynotes)

---
##  Authentication
* Students can log in using their **institutional email address (@stud.ase.ro)**
* Authentication ensures secure access to personal notes
---
##  Features

###  Notes Management

* Create, view, edit, and delete notes
* Markdown support for simple text formatting

### 🗂️Organization

* Organize notes by:

  * Classes
  * Dates
  * Labels (tags)

### Sharing
* Share notes with other colleagues for collaborative learning

### 📎 Attachments
* Notes are designed to support attachments (images, documents)
* **  Full Attachments feature is coming soon**

---

## Deployment Details

* Backend and database are hosted on **Railway**
* Uses **PostgreSQL** for persistent data storage
* Environment variables are managed securely using `.env`

---

##  Future Improvements

* Full implementation of file attachments (images, PDFs, documents)
* Enhanced note sharing and collaboration features
* Search and filtering optimizations
* UI/UX improvements for mobile devices

