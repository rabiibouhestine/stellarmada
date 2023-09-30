
import io from 'socket.io-client';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';

// const socket = io.connect("https://cowards-castle-server.onrender.com");
const socket = io.connect("http://localhost:3001");

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Home socket={socket} />}/>
      <Route path=":roomID" element={<Room socket={socket} />}/>
    </Route>
  )
)

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
