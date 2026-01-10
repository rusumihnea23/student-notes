import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MyNotes from './pages/MyNotes.jsx';
import Note from './pages/Note.jsx';
import AddNote from './pages/AddNote.jsx';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
      <Routes>
          <Route element={<App />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>

              <h1>Home Page</h1>
              
            </ProtectedRoute>
          }
          
        />
        <Route path="/mynotes" element={ <ProtectedRoute>

              <MyNotes/>
              
            </ProtectedRoute>}/>
      
           <Route path="/students/notes/:noteId" element={ <ProtectedRoute>

              <Note/>
              
            </ProtectedRoute>}/>
            
            <Route path="/students/note" element={ <ProtectedRoute>

              <AddNote/>
              
            </ProtectedRoute>}/>

        </Route>
        

        <Route
          path="/login"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/register" element={  localStorage.getItem("token") ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )} />
             <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
