import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography, Button, Box } from '@mui/material';
import TaskList from './TaskList';
import { api } from '../ultils/api';
const CARD_TYPE = 'CARD';

const CARD_BG = '#fff';
const CARD_BORDER = '1px solid #dfe1e6';
const CARD_SHADOW = '0 1px 4px rgba(0,0,0,0.10)';
const CARD_HOVER = '#f4f5f7';

function CardComponent({ card, boardId, token, refreshCards, lists }) {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: CARD_TYPE,
    item: { id: card.id, listId: card.listId },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(ref);

  // Rename logic
  const [renaming, setRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(card.title);
  const handleRename = async () => {
    await api.put(`/cards/${card.id}/update-name`, { name: newName }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRenaming(false);
    refreshCards();
  };

  const handleDelete = async () => {
    await api.delete(`/boards/${boardId}/cards/${card.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    refreshCards();
  };

  return (
    <Paper
      ref={ref}
      elevation={2}
      sx={{
        background: CARD_BG,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        borderRadius: 2,
        margin: '8px 0',
        padding: 2,
        opacity: isDragging ? 0.5 : 1,
        transition: 'background 0.2s',
        '&:hover': {
          background: CARD_HOVER,
        },
      }}
    >
      {renaming ? (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <Button variant="outlined" size="small" onClick={handleRename} sx={{ bgcolor: '#5aac44', color: '#fff' }}>Save</Button>
          <Button variant="outlined" size="small" onClick={() => setRenaming(false)} sx={{ marginLeft: 1 }}>Cancel</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#17394d' }}>{card.title}</Typography>
          <Button variant="text" size="small" onClick={() => setRenaming(true)} sx={{ marginLeft: 1, color: '#5aac44' }}>Rename</Button>
        </Box>
      )}
      <Typography variant="body2" sx={{ color: '#42526e', mb: 1 }}>{card.description}</Typography>
      <Button variant="outlined" size="small" color="error" onClick={handleDelete} sx={{ marginLeft: 1 }}>Delete</Button>
      <TaskList boardId={boardId} cardId={card.id} token={token} />
    </Paper>
  );
}

export default CardComponent;