import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, getJitsiToken } from "../api/api";
import { JitsiMeeting } from "@jitsi/react-sdk";

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [jitsiToken, setJitsiToken] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      const isLoggedIn = !!localStorage.getItem("accessToken");
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      try {
        // 1️⃣ Fetch session details
        const data = await getSession(id);
        setSession(data);

        // 2️⃣ Request JWT from backend for this room
        const tokenRes = await getJitsiToken(data.room_name);
        setJitsiToken(tokenRes.token);
      } catch (err) {
        console.log("Failed to load session or token", err);
      }
    };

    fetchData();
  }, [id]);

  if (!session) return <p className="text-center mt-20">Loading session...</p>;
  if (!jitsiToken)
    return <p className="text-center mt-20">Generating secure token...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 mt-16">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🎥 Live Session: {session.title}
      </h1>

      <div className="h-[600px] bg-black rounded-xl overflow-hidden">
        <JitsiMeeting
          domain="8x8.vc"
          roomName={`vpaas-magic-cookie-8aca48389d514e87a3ac1a38dd3a7b68/${session.room_name}`}
          jwt={jitsiToken}
          userInfo={{
            displayName: user?.username,
            email: user?.email,
          }}
          configOverwrite={{
            startWithAudioMuted: true,
            startWithVideoMuted: true,
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
            iframeRef.style.width = "100%";
          }}
        />
      </div>
    </div>
  );
};

export default SessionDetail;
