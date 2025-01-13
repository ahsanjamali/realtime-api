// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import CallAI from "./pages/CallAI";
import BookAppointment from "./pages/BookAppointment";
import "./App.css";

function App() {
    return (
        <Router>
            <div className="App">
                <Sidebar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/call-ai" element={<CallAI />} />
                    <Route path="/book-appointment" element={<BookAppointment />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;






