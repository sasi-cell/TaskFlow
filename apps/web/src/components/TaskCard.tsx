import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import type { TaskWithCategory } from '@taskflow/shared';
import { priorityColors } from '@taskflow/shared';

interface Props {
  task: TaskWithCategory;
  onPress: () => void;
  onToggleStatus: () => void;
}

export function TaskCard({ task, onPress, onToggleStatus }: Props) {
  return (
    <Card sx={{ mb: 1 }}>
      <CardActionArea onClick={onPress}>
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={task.status === 'completed'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus();
            }}
            sx={{ mt: -0.5 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                opacity: task.status === 'completed' ? 0.6 : 1,
              }}
            >
              {task.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              {task.category_name && (
                <Chip
                  label={task.category_name}
                  size="small"
                  sx={{
                    backgroundColor: (task.category_color ?? '#6750A4') + '22',
                    color: task.category_color ?? '#6750A4',
                  }}
                />
              )}
              {task.due_date && (
                <Typography variant="body2" color="text.secondary">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
          <Chip
            label={task.priority}
            size="small"
            sx={{
              backgroundColor: priorityColors[task.priority] + '22',
              color: priorityColors[task.priority],
              textTransform: 'capitalize',
            }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
