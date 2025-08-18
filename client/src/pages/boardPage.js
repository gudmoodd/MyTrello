import React, { useEffect, useState } from "react";
import { api } from "../ultils/api";
import ListComponent from "../components/ListComponent";
import { Button, Box, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from "@mui/material";

const BOARD_BG = "linear-gradient(135deg, #0079bf 0%, #5067c5 100%)";
const LIST_BG = "#f4f5f7";
const HEADER_COLOR = "#fff";
const HEADER_SHADOW = "0 2px 8px rgba(0,0,0,0.08)";

export default function BoardPage({ token, board, email, goBack }) {
    const [lists, setLists] = useState([]);
    const [listName, setListName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState("");
    const [inviteDialog, setInviteDialog] = useState(false);
    const [inviteData, setInviteData] = useState(null);

    const fetchLists = async () => {
        const res = await api.get(`/lists/${board.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setLists(res.data);
    };
    useEffect(() => {
        fetchLists();
    }, [board.id, token]);

    useEffect(() => {
        const { socket } = require("../ultils/socket");
        socket.on("board-invite", ({ email: invitedEmail, invite }) => {
            if (invitedEmail === email) {
                setInviteData(invite);
                setInviteDialog(true);
            }
        });
        return () => {
            socket.off("board-invite");
        };
    }, [email]);

    const handleCreateList = async () => {
        await api.post("/lists", { boardId: board.id, name: listName }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setListName("");
        fetchLists();
    };

    const handleInviteMember = async () => {
        setInviteStatus("");
        try {
            const invite_id = Math.random().toString(36).substring(2, 12);
            await api.post(`/boards/${board.id}/invite`, {
                invite_id,
                board_owner_id: email,
                member_id: inviteEmail,
                email_member: inviteEmail,
                status: "pending"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInviteStatus("Invitation sent!");
            setInviteEmail("");
        } catch (err) {
            setInviteStatus("Failed to send invitation.");
        }
    };

    const handleRespondInvite = async (status) => {
        if (!inviteData) return;
        try {
            await api.post(`/boards/${inviteData.boardId}/cards/${inviteData.invite_id}/invite/accept`, {
                invite_id: inviteData.invite_id,
                status,
                member_id: email
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInviteDialog(false);
            setInviteData(null);
        } catch (err) {
            setInviteDialog(false);
            setInviteData(null);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", background: BOARD_BG, padding: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, background: HEADER_COLOR, boxShadow: HEADER_SHADOW, borderRadius: 2, px: 3, py: 2 }}>
                <Button variant="contained" onClick={goBack} sx={{ mr: 2, bgcolor: "#026aa7" }}>
                    Go Back to Boards
                </Button>
                <Avatar sx={{ bgcolor: "#5aac44", mr: 2 }}>{email[0]?.toUpperCase()}</Avatar>
                <Typography variant="h4" sx={{ color: "#17394d", fontWeight: 700 }}>{board.name}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                    value={listName}
                    onChange={e => setListName(e.target.value)}
                    placeholder="Enter list name"
                    size="small"
                    sx={{ mr: 1, bgcolor: LIST_BG, borderRadius: 1 }}
                />
                <Button variant="contained" onClick={handleCreateList} sx={{ mr: 2, bgcolor: "#5aac44" }}>
                    Create List
                </Button>
                <TextField
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="Invite member by email"
                    size="small"
                    sx={{ mr: 1, bgcolor: LIST_BG, borderRadius: 1 }}
                />
                <Button variant="contained" onClick={handleInviteMember} sx={{ bgcolor: '#ffb366', color: '#17394d', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Invite Member</Button>
                {inviteStatus && <span style={{ marginLeft: 8, color: "#fff" }}>{inviteStatus}</span>}
            </Box>
            <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 4 }}>
                {lists.map(list => (
                    <ListComponent
                        key={list.id}
                        list={list}
                        token={token}
                        email={email}
                        allLists={lists}
                        refreshLists={fetchLists}
                    />
                ))}
            </Box>
            <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)}>
                <DialogTitle>Board Invitation</DialogTitle>
                <DialogContent>
                    <Typography>
                        You have been invited to join board {inviteData?.boardId} by {inviteData?.board_owner_id}.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleRespondInvite('accepted')} color="success">Accept</Button>
                    <Button onClick={() => handleRespondInvite('denied')} color="error">Deny</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
