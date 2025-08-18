import React, { useState } from "react";
import { api } from "../ultils/api";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";

const AUTH_BG = "linear-gradient(135deg, #0079bf 0%, #5067c5 100%)";
const AUTH_CARD_BG = "#fff";
const AUTH_CARD_SHADOW = "0 2px 16px rgba(0,0,0,0.10)";

export default function AuthPage({ setToken, setEmail }) {
    const [email, setEmailInput] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");

    const handleSendCode = async () => {
        try {
            await api.post('/auth/login', { email });
            setStep(2);
            setMessage("A verification code has been sent to your email. Please check your inbox.");
        } catch (error) {
            setMessage("Failed to send code. Please try again.");
        }
    };

    const handleVerifyCode = async () => {
        try {
            const response = await api.post('/auth/login', { email, verificationCode: code });
            setToken(response.data.token);
            setEmail(email);
        } catch (error) {
            setMessage("Invalid code. Please try again.");
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", background: AUTH_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={6} sx={{ background: AUTH_CARD_BG, padding: 4, borderRadius: 3, boxShadow: AUTH_CARD_SHADOW, minWidth: 350 }}>
                <Typography variant="h4" sx={{ mb: 2, color: "#17394d", fontWeight: 700 }}>Login</Typography>
                {message && <Typography sx={{ mb: 2, color: '#d32f2f' }}>{message}</Typography>}
                {step === 1 ? (
                    <Box>
                        <TextField
                            type="email"
                            label="Enter your email"
                            value={email}
                            onChange={(e) => setEmailInput(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <Button variant="contained" fullWidth onClick={handleSendCode} sx={{ bgcolor: '#5aac44', color: '#fff', fontWeight: 700 }}>Send Verification Code</Button>
                    </Box>
                ) : (
                    <Box>
                        <TextField
                            type="text"
                            label="Enter verification code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <Button variant="contained" fullWidth onClick={handleVerifyCode} sx={{ bgcolor: '#0079bf', color: '#fff', fontWeight: 700 }}>Verify Code</Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
