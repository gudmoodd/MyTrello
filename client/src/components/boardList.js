import React, { useEffect, useState } from "react";
import { api } from "../ultils/api";
import { Box, Typography, Paper, Button, TextField } from "@mui/material";

const BOARDLIST_BG = "linear-gradient(135deg, #0079bf 0%, #5067c5 100%)";
const BOARDLIST_CARD_BG = "#fff";
const BOARDLIST_CARD_SHADOW = "0 2px 16px rgba(0,0,0,0.10)";

export default function BoardList({ token, email, selectBoard }) {
    const [editingBoardId, setEditingBoardId] = useState(null);
    const [newBoardName, setNewBoardName] = useState('');
    const [boards, setBoards] = useState([]);
    const [boardName, setBoardName] = useState('');
    const [inviteEmails, setInviteEmails] = useState({});

    const fetchBoards = async () => {
        const res = await api.get('/boards', {
            params: { email },
            headers: { Authorization: `Bearer ${token}` }
        });
        setBoards(res.data);
    };

    useEffect(() => {
        fetchBoards();
    }, [email, token]);

    const [pendingInvite, setPendingInvite] = useState(null);

    useEffect(() => {
        const { socket } = require('../ultils/socket');
        function handleBoardInvite({ email: invitedEmail, invite }) {
            if (invitedEmail === email) {
                setPendingInvite(invite);
            }
        }
        socket.on('board-invite', handleBoardInvite);
        return () => {
            socket.off('board-invite', handleBoardInvite);
        };
    }, [email]);

    const handleInviteResponse = (accepted) => {
        const { socket } = require('../ultils/socket');
        socket.emit('respond-invite', {
            invite_id: pendingInvite.invite_id,
            boardId: pendingInvite.boardId,
            member_id: email,
            status: accepted ? 'accepted' : 'denied',
        });
        setPendingInvite(null);
        if (accepted) {
            fetchBoards();
        }
    };

    const handleCreateBoard = async () => {
        await api.post('/boards', { name: boardName, ownerEmail: email }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setBoardName('');
        fetchBoards();
    };

    return (
        <Box sx={{ minHeight: "100vh", background: BOARDLIST_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={6} sx={{ background: BOARDLIST_CARD_BG, padding: 4, borderRadius: 3, boxShadow: BOARDLIST_CARD_SHADOW, minWidth: 400 }}>
                <Typography variant="h4" sx={{ mb: 2, color: "#17394d", fontWeight: 700 }}>Boards</Typography>
                <Typography variant="h6" sx={{ mb: 2, color: '#17394d', fontWeight: 500 }}>
                    Logged in as: <span style={{ color: '#0079bf', fontWeight: 700 }}>{email}</span>
                </Typography>
                {pendingInvite && (
                    <Box sx={{ background: '#ffe', padding: 2, marginBottom: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                        <Typography sx={{ mb: 1 }}>You have been invited to board <b>{pendingInvite.boardId}</b> by <b>{pendingInvite.board_owner_id}</b>.</Typography>
                        <Button variant="contained" sx={{ bgcolor: '#5aac44', color: '#fff', mr: 1 }} onClick={() => handleInviteResponse(true)}>Accept</Button>
                        <Button variant="outlined" sx={{ color: '#d32f2f', borderColor: '#d32f2f' }} onClick={() => handleInviteResponse(false)}>Deny</Button>
                    </Box>
                )}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        placeholder="Enter board name"
                        size="small"
                        sx={{ bgcolor: '#f4f5f7', borderRadius: 1 }}
                    />
                    <Button variant="contained" onClick={handleCreateBoard} sx={{ bgcolor: '#5aac44', color: '#fff', fontWeight: 700 }}>Create Board</Button>
                </Box>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {boards.map((board) => (
                        <li key={board.id} style={{ marginBottom: 16 }}>
                            <Paper elevation={2} sx={{ padding: 2, borderRadius: 2, background: '#f4f5f7', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>
                                {editingBoardId === board.id ? (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            value={newBoardName}
                                            onChange={e => setNewBoardName(e.target.value)}
                                            placeholder="New board name"
                                            size="small"
                                            sx={{ bgcolor: '#fff', borderRadius: 1 }}
                                        />
                                        <Button variant="contained" size="small" sx={{ bgcolor: '#5aac44', color: '#fff' }} onClick={async () => {
                                            await api.put(`/boards/${board.id}/update-name`, { name: newBoardName }, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            setEditingBoardId(null);
                                            setNewBoardName('');
                                            fetchBoards();
                                        }}>Save</Button>
                                        <Button variant="outlined" size="small" sx={{ color: '#d32f2f', borderColor: '#d32f2f' }} onClick={() => setEditingBoardId(null)}>Cancel</Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#17394d' }}>{board.name}</Typography>
                                        <Button variant="outlined" size="small" sx={{ color: '#5aac44', borderColor: '#5aac44' }} onClick={() => { setEditingBoardId(board.id); setNewBoardName(board.name); }}>Rename</Button>
                                        <Button variant="contained" size="small" sx={{ bgcolor: '#0079bf', color: '#fff', fontWeight: 700 }} onClick={() => selectBoard(board)}>Open</Button>
                                        <TextField
                                            type="email"
                                            value={inviteEmails[board.id] || ''}
                                            onChange={e => setInviteEmails(prev => ({ ...prev, [board.id]: e.target.value }))}
                                            placeholder="Invite member email"
                                            size="small"
                                            sx={{ bgcolor: '#fff', borderRadius: 1 }}
                                        />
                                        <Button variant="contained" size="small" sx={{ bgcolor: '#ffb366', color: '#17394d', fontWeight: 700 }} onClick={() => {
                                            require('../ultils/socket').inviteMemberSocket({
                                                boardId: board.id,
                                                board_owner_id: email,
                                                email_member: inviteEmails[board.id] || ''
                                            });
                                            setInviteEmails(prev => ({ ...prev, [board.id]: '' }));
                                        }}>Invite via Socket</Button>
                                        <Button variant="outlined" size="small" sx={{ color: '#d32f2f', borderColor: '#d32f2f' }} onClick={async () => {
                                            await api.delete(`/boards/${board.id}`, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            fetchBoards();
                                        }}>Delete</Button>
                                    </Box>
                                )}
                            </Paper>
                        </li>
                    ))}
                </ul>
                <Button
                    variant="contained"
                    sx={{ position: 'absolute', top: 24, right: 24, bgcolor: '#d32f2f', color: '#fff', fontWeight: 700, zIndex: 1000, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '8px 24px', letterSpacing: 1, fontSize: '1rem', textTransform: 'uppercase', transition: 'background 0.2s', '&:hover': { bgcolor: '#b71c1c' } }}
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.reload();
                    }}
                >
                    Logout
                </Button>
            </Paper>
        </Box>
    );
}