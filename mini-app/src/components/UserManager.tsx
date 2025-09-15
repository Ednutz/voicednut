import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Star as AdminIcon,
    PersonAdd as AddIcon
} from '@mui/icons-material';
import { userApi } from '../services/userApi';
import { User } from '../types/user';
import { ErrorAlert } from './ErrorAlert';
import { LoadingSpinner } from './LoadingSpinner';
import { format } from 'date-fns';
import WebApp from '@twa-dev/sdk';

interface ConfirmOptions {
    message: string;
    onConfirm: () => Promise<void>;
}

const useConfirmDialog = () => {
    const showConfirm = async ({ message, onConfirm }: ConfirmOptions) => {
        try {
            const confirmed = await new Promise<boolean>((resolve) => {
                WebApp.showConfirm(message, (result) => resolve(result));
            });

            if (confirmed) {
                await onConfirm();
            }
        } catch (error) {
            console.error('Confirmation error:', error);
        }
    };

    return { showConfirm };
};

export const UserManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newUserId, setNewUserId] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const fetchedUsers = await userApi.getUsers();
            setUsers(fetchedUsers);
        } catch (err) {
            setError('Failed to load users');
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUserId || isNaN(Number(newUserId))) {
            setError('Please enter a valid user ID');
            return;
        }

        try {
            await userApi.addUser(Number(newUserId));
            await loadUsers();
            setAddDialogOpen(false);
            setNewUserId('');
            WebApp.showPopup({
                title: 'Success',
                message: 'User added successfully!',
                buttons: [{ type: 'ok' }]
            });
        } catch (err) {
            setError('Failed to add user');
            console.error('Error adding user:', err);
        }
    };

    const { showConfirm } = useConfirmDialog();

    const handleRemoveUser = (userId: number) => {
        showConfirm({
            message: 'Are you sure you want to remove this user?',
            onConfirm: async () => {
                try {
                    await userApi.removeUser(userId);
                    await loadUsers();
                    WebApp.showPopup({
                        title: 'Success',
                        message: 'User removed successfully!',
                        buttons: [{ type: 'ok' }]
                    });
                } catch (err) {
                    setError('Failed to remove user');
                    console.error('Error removing user:', err);
                }
            }
        });
    };

    const handlePromoteUser = (userId: number) => {
        showConfirm({
            message: 'Are you sure you want to promote this user to admin?',
            onConfirm: async () => {
                try {
                    await userApi.promoteUser(userId);
                    await loadUsers();
                    WebApp.showPopup({
                        title: 'Success',
                        message: 'User promoted to admin!',
                        buttons: [{ type: 'ok' }]
                    });
                } catch (err) {
                    setError('Failed to promote user');
                    console.error('Error promoting user:', err);
                }
            }
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Card elevation={0}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            User Management
                        </Typography>
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            onClick={() => setAddDialogOpen(true)}
                        >
                            Add User
                        </Button>
                    </Box>

                    {error && <ErrorAlert message={error} />}

                    <List>
                        {users.map((user) => (
                            <ListItem
                                key={user.id}
                                secondaryAction={
                                    <Box>
                                        {!user.isAdmin && (
                                            <IconButton
                                                edge="end"
                                                aria-label="promote"
                                                onClick={() => handlePromoteUser(user.id)}
                                                sx={{ mr: 1 }}
                                            >
                                                <AdminIcon />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleRemoveUser(user.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {user.username}
                                            {user.isAdmin && (
                                                <Chip
                                                    size="small"
                                                    label="Admin"
                                                    color="primary"
                                                    icon={<AdminIcon />}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={`Added: ${format(new Date(user.dateAdded), 'PPp')}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="User ID"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddUser} variant="contained">
                        Add User
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};