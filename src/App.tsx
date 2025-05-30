import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import Room from './pages/Room';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;