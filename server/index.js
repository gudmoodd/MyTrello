const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const ServiceAccount = require('./serviceAccountKey.json');
const authRoutes = require('./routes/authRoutes');

admin.initializeApp({
  credential: admin.credential.cert(ServiceAccount),
  databaseURL: "https://mytrello-a4436.firebaseio.com"
});

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
