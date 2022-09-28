import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const HomePage = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const createNewRoomId = () => {
    const id = uuidv4();
    setRoomId(id);
    toast.success("Created New Room");
  };

  const join = () => {
    if (!roomId || !username) {
      toast.error("Please enter ROOM ID and Username");
      return;
    }

    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  return (
    <div className="homeOuterWrap">
      <div className="formWrap">
        <img src="./code-sync.png" alt="code-sync-logo" className="home-logo" />
        <h4>Paste Invitation ROOM ID</h4>
        <input
          type="text"
          placeholder="ROOM ID"
          className="form-input"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          type="text"
          placeholder="USERNAME"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="joinBtn" onClick={join}>
          Join
        </button>
        <p className="new-room-info">
          If you don't have an invite then create &nbsp;
          <span className="new-room-link" onClick={createNewRoomId}>
            new room
          </span>
        </p>
      </div>
      <footer>
        Built with ❤️ by &nbsp;
        <a href="https://github.com/Akshat9254" target={"_blank"}>
          Akshat Pandey
        </a>
      </footer>
    </div>
  );
};

export default HomePage;
