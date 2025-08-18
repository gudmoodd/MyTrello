import React, { useEffect, useState } from 'react';
import { api } from '../ultils/api';
import CardComponent from './CardComponent';
import { Paper, Typography, Button, Grid, TextField } from '@mui/material';
import { useDrop } from 'react-dnd';

const LIST_BG = '#f4f5f7';
const LIST_BORDER = '1px solid #dfe1e6';
const LIST_SHADOW = '0 2px 8px rgba(0,0,0,0.08)';

export default function ListComponent({ list, token, email, allLists, refreshLists }) {
  const [cards, setCards] = useState([]);
  const [cardTitle, setCardTitle] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [newListName, setNewListName] = useState(list.name);

  const handleRenameList = async () => {
    await api.put('/lists/update-name', { listId: list.id, name: newListName }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRenaming(false);
    if (typeof refreshLists === 'function') refreshLists();
  };

  const refreshCards = async () => {
    const res = await api.get(`/cards/${list.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCards(res.data);
  };

  useEffect(() => {
    refreshCards();
    // eslint-disable-next-line
  }, [list, token]);

  useEffect(() => {
    const { socket } = require('../ultils/socket');
    function handleCardMoved({ cardID, newListID }) {
      if (newListID === list.id || cards.some(card => card.id === cardID)) {
        refreshCards();
      }
    }
    socket.on('card-moved', handleCardMoved);
    return () => {
      socket.off('card-moved', handleCardMoved);
    };
  }, [list.id, cards]);

  const handleCreateCard = async () => {
    await api.post('/cards', {
      listId: list.id,
      title: cardTitle,
      description: cardDesc
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCardTitle('');
    setCardDesc('');
    refreshCards();
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    drop: (item, monitor) => {
      if (item.listId !== list.id) {
        api.put('/cards/move', { cardID: item.id, newListID: list.id }, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
          refreshCards();
        });
        item.listId = list.id;
      }
    },
    canDrop: (item, monitor) => item.listId !== list.id,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
});

  return (
    <Paper
      ref={drop}
      elevation={4}
      sx={{
        background: LIST_BG,
        border: LIST_BORDER,
        boxShadow: LIST_SHADOW,
        borderRadius: 2,
        minWidth: 300,
        margin: 1,
        padding: 2,
        transition: 'background 0.2s',
        backgroundColor: isOver ? '#e3f2fd' : LIST_BG,
      }}
    >
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs>
          {renaming ? (
            <TextField
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="New list name"
              size="small"
              sx={{ marginRight: 1 }}
            />
          ) : (
            <Typography variant="h6" sx={{ display: 'inline-block', marginRight: 1, fontWeight: 700, color: '#17394d' }}>{list.name}</Typography>
          )}
        </Grid>
        <Grid item>
          <Button variant="outlined" size="small" sx={{ color: '#d32f2f', borderColor: '#d32f2f', marginRight: 1 }} onClick={async () => {
            await api.delete(`/lists/${list.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (typeof refreshLists === 'function') refreshLists();
          }}>Delete</Button>
          {renaming ? (
            <>
              <Button variant="contained" size="small" onClick={handleRenameList} sx={{ bgcolor: '#5aac44' }}>Save</Button>
              <Button variant="outlined" size="small" onClick={() => setRenaming(false)} sx={{ marginLeft: 1 }}>Cancel</Button>
            </>
          ) : (
            <Button variant="outlined" size="small" onClick={() => { setRenaming(true); setNewListName(list.name); }} sx={{ color: '#5aac44', borderColor: '#5aac44' }}>Rename</Button>
          )}
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 1 }}>
        <Grid item xs={12}>
          <TextField
            value={cardTitle}
            onChange={e => setCardTitle(e.target.value)}
            placeholder="Card title"
            size="small"
            sx={{ marginRight: 1, bgcolor: '#fff', borderRadius: 1 }}
          />
          <TextField
            value={cardDesc}
            onChange={e => setCardDesc(e.target.value)}
            placeholder="Card description"
            size="small"
            sx={{ marginRight: 1, bgcolor: '#fff', borderRadius: 1 }}
          />
          <Button variant="contained" size="small" onClick={handleCreateCard} sx={{ bgcolor: '#5aac44' }}>Add Card</Button>
        </Grid>
      </Grid>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
        {cards.map(card => (
          <CardComponent
            key={card.id}
            card={card}
            boardId={list.boardId}
            token={token}
            refreshCards={refreshCards}
            lists={allLists}
          />
        ))}
      </ul>
    </Paper>
  );
}