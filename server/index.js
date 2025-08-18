const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const ServiceAccount = require('./serviceAccountKey.json');
const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoute');
const listRoutes = require('./routes/listRoute');
const cardRoutes = require('./routes/cardRoute');
const taskRoutes = require('./routes/taskRoute');

admin.initializeApp({
  credential: admin.credential.cert(ServiceAccount),
  databaseURL: "https://mytrello-a4436.firebaseio.com"
});

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);
app.use('/lists', listRoutes);
app.use('/cards', cardRoutes);
app.use(taskRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = 5000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


const { initSocket } = require('./socket');
initSocket(server);