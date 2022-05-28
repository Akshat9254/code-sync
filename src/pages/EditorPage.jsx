import { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import { socketInit } from "../socket";
import Editor from "../components/Editor";
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ACTIONS from "../Actions";
import toast from 'react-hot-toast';

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location  = useLocation();
  const reactNavigator = useNavigate();
  const {roomId} = useParams();
  const [clientList, setClientList] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await socketInit();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(err) {
        console.log(err);
        toast.error('Error in connecting to the room');
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);
          }

          setClientList(clients);

          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId
          })
        }
      );

      // Listening for disconnected event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClientList((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };

    

    init();

    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    }
  }, [reactNavigator, location.state?.username, roomId]);

  const copyRommId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('ROOM ID copied to clipboard');
    } catch(err) {
      toast.error('Could not copy ROOM ID');
      console.error(err);
    }
  }

  const leaveRoom = () => {
    reactNavigator('/');
  }


  if(!location.state) {
    return <Navigate to={"/"} />
  }
  return (
    <>
      <div className="editorPageOuterWrap">
        <div className="aside">
          <div className="aside-top">
            <figure className="logo-wrapper">
              <img
                src="/code-sync.png"
                alt="code-sync-logo"
                className="editor-page-logo"
              />
            </figure>

            <h3>Connected</h3>
            <div className="clients-list">
              {clientList.map((client) => (
                <div key={client.socketId} className="client-wrapper">
                  <Avatar name={client.username} round={true} />
                  <span>{client.username}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="aside-bottom">
            <button className="btn" onClick={copyRommId}>
              Copy ROOM ID
            </button>
            <button className="btn btn-primary" onClick={leaveRoom}>
              LEAVE
            </button>
          </div>
        </div>
        <div className="editorWrap">
          <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => codeRef.current = code} />
        </div>
      </div>
    </>
  );
};

export default EditorPage;
