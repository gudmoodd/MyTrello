import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper } from "@mui/material";

const INVITE_BG = "linear-gradient(135deg, #0079bf 0%, #5067c5 100%)";
const INVITE_CARD_BG = "#fff";
const INVITE_CARD_SHADOW = "0 2px 16px rgba(0,0,0,0.10)";

const InviteResponsePage = () => {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite_id = params.get("invite_id");
    const boardId = params.get("boardId");
    const action = params.get("action");

    if (!invite_id || !boardId || !action) {
      setMessage("Invalid invitation link.");
      return;
    }

    const respondToInvite = async () => {
      try {
        await axios.post(`/boards/${boardId}/cards/${invite_id}/invite/accept`, {
          invite_id,
          status: action === "accept" ? "accepted" : "denied",
        });
        setStatus(action);
        setMessage(`You have ${action === "accept" ? "accepted" : "denied"} the invitation.`);
      } catch (error) {
        setMessage("Failed to respond to invitation.");
      }
    };

    respondToInvite();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", background: INVITE_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={6} sx={{ background: INVITE_CARD_BG, padding: 4, borderRadius: 3, boxShadow: INVITE_CARD_SHADOW, minWidth: 350 }}>
        <Typography variant="h4" sx={{ mb: 2, color: "#17394d", fontWeight: 700 }}>Board Invitation Response</Typography>
        <Typography sx={{ mb: 2, color: status === 'accept' ? '#5aac44' : '#d32f2f', fontWeight: 500 }}>{message}</Typography>
      </Paper>
    </Box>
  );
};

export default InviteResponsePage;
