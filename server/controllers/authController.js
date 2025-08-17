const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const {sendVerificationEmail} = require ('../ultils/mailer');

exports.signup = async (req, res) => {
    const {email, verificationCode} = req.body;
    const db = admin.firestore();

    try {
        const codeDoc = await db.collection('verificationCodes').doc(email).get();
        if (!codeDoc.exists || codeDoc.data().code !== verificationCode) {
            return res.status(401).json({error: 'Invalid verification code'});
        }
        await db.collection('users').doc(email).set({email});
        await sendVerificationEmail(email);
        res.status(201).json({id:email, email});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}
exports.login = async (req, res) => {
    const {email, verificationCode} = req.body;
    const db = admin.firestore();

    if (!verificationCode) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await db.collection('verificationCodes').doc(email).set({code});
        await sendVerificationEmail(email, code);
        return res.json({ message: 'Verification code sent to your email' });
    } else {
        const codeDoc = await db.collection('verificationCodes').doc(email).get();
        if (!codeDoc.exists || codeDoc.data().code !== verificationCode) {
            return res.status(401).json({error: 'Invalid verification code'});
        }
    }
    const token = jwt.sign({email}, 'your_jwt_secret', {expiresIn: '1h'});
    res.json({token});
}
