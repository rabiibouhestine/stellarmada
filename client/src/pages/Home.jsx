import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ socket }) {
    const navigate = useNavigate();

    const createRoom = () => {
        socket.emit("createRoom");
    }

    useEffect(() => {
        socket.on("createRoomResponse", (data) => {
            navigate(`/${data.room.roomID}`);
        });
    }, [socket]);

    return (
        <div>
            <h3>Create A Room</h3>
            <button onClick={createRoom}>Create A Room</button>
        </div>
    );
}

export default Home;
