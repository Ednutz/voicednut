import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    IconButton,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    Grid,
    Paper,
    Menu,
    MenuItem,
    ListItemIcon,
    Fab,
    Tooltip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Star as AdminIcon,
    PersonAdd as AddIcon,
    Person as UserIcon,
    MoreVert as MoreIcon,
    Shield as ShieldIcon,
    Group as GroupIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { apiService, User } from '../../services/apiService';
import { telegramWebApp } from '../../utils/telegramWebApp';
import { format } from 'date-fns';

interface UserManagerState {
    users: User[];
    filteredUsers: User[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
    selectedUser: User | null;
    anchorEl: HTMLElement | null;
}

interface AddUserDialogState {
    open: boolean;
    telegramId: string;
    username: string;
    loading: boolean;
    error: string | null;
}

export const UserManager: React.FC = () => {
    const [state, setState] = useState<UserManagerState>({
        users: [],
        filteredUsers: [],
        loading: true,
        error: null,
        searchTerm: '',
        selectedUser: null,
        anchorEl: null
    });

    const [addUserDialog, setAddUserDialog] = useState<AddUserDialogState>({
        open: false,
        telegramId: '',
        username: '',
        loading: false,
        error: null
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        // Filter users based on search term
        const filtered = state.users.filter(user =>
            user.username.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            user.telegram_id.toString().includes(state.searchTerm)
        );
        setState(prev => ({ ...prev, filteredUsers: filtered }));
    }, [state.users, state.searchTerm]);

    const loadUsers = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const response = await apiService.getUsers();
            if (response.success && response.data) {
                setState(prev => ({
                    ...prev,
                    users: response.data || [],
                    loading: false
                }));
            } else {
                throw new Error(response.error || 'Failed to load users');
            }
        } catch (err: any) {
            setState(prev => ({
                ...prev,
                error: err.message || 'Failed to load users',
                loading: false
            }));
            telegramWebApp.notificationOccurred('error');
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, searchTerm: event.target.value }));
        telegramWebApp.selectionChanged();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
        setState(prev => ({
            ...prev,
            anchorEl: event.currentTarget,
            selectedUser: user
        }));
    };

    const handleMenuClose = () => {
        setState(prev => ({
            ...prev,
            anchorEl: null,
            selectedUser: null
        }));
    };

    const handleAddUser = async () => {
        if (!addUserDialog.telegramId || !addUserDialog.username) {
            setAddUserDialog(prev => ({
                ...prev,
                error: 'Please enter both Telegram ID and username'
            }));
            return;
        }

        const telegramId = parseInt(addUserDialog.telegramId);
        if (isNaN(telegramId)) {
            setAddUserDialog(prev => ({
                ...prev,
                error: 'Please enter a valid Telegram ID (numbers only)'
            }));
            return;
        }

        setAddUserDialog(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await apiService.addUser(telegramId, addUserDialog.username);
            if (response.success) {
                await telegramWebApp.showPopup({
                    title: 'Success!',
                    message: `User ${addUserDialog.username} has been added successfully.`,
                    buttons: [{ type: 'ok' }]
                });

                setAddUserDialog({
                    open: false,
                    telegramId: '',
                    username: '',
                    loading: false,
                    error: null
                });

                await loadUsers();
                telegramWebApp.notificationOccurred('success');
            } else {
                throw new Error(response.error || 'Failed to add user');
            }
        } catch (err: any) {
            setAddUserDialog(prev => ({
                ...prev,
                error: err.message || 'Failed to add user',
                loading: false
            }));
            telegramWebApp.notificationOccurred('error');
        }
    };

    const handleRemoveUser = async (user: User) => {
        handleMenuClose();
        
        const confirmed = await telegramWebApp.showConfirm(
            `Are you sure you want to remove user "${user.username}"?\n\nThis action cannot be undone.`
        );
        
        if (!confirmed) return;

        try {
            const response = await apiService.removeUser(user.telegram_id);
            if (response.success) {
                await telegramWebApp.showPopup({
                    title: 'User Removed',
                    message: `${user.username} has been removed from the system.`,
                    buttons: [{ type: 'ok' }]
                });

                await loadUsers();
                telegramWebApp.notificationOccurred('success');
            } else {
                throw new Error(response.error || 'Failed to remove user');
            }
        } catch (err: any) {
            setState(prev => ({ ...prev, error: err.message || 'Failed to remove user' }));
            telegramWebApp.notificationOccurred('error');
        }
    };

    const handlePromoteUser = async (user: User) => {
        handleMenuClose();
        
        const confirmed = await telegramWebApp.showConfirm(
            `Promote "${user.username}" to administrator?\n\nAdmins can manage users and access all features.`
        );
        
        if (!confirmed) return;

        try {
            const response = await apiService.promoteUser(user.telegram_id);
            if (response.success) {
                await telegramWebApp.showPopup({
                    title: 'User Promoted',
                    message: `${user.username} is now an administrator!`,
                    buttons: [{ type: 'ok' }]
                });

                await loadUsers();
                telegramWebApp.notificationOccurred('success');
            } else {
                throw new Error(response.error || 'Failed to promote user');
            }
        } catch (err: any) {
            setState(prev => ({ ...prev, error: err.message || 'Failed to promote user' }));
            telegramWebApp.notificationOccurred('error');
        }
    };

    const getUserInitials = (username: string) => {
        return username.slice(0, 2).toUpperCase();
    };

    const renderUserStats = () => {
        const totalUsers = state.users.length;
        const adminUsers = state.users.filter(user => user.role === 'ADMIN').length;
        const regularUsers = totalUsers - adminUsers;

        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Typography variant="h4">{totalUsers}</Typography>
                        <Typography variant="caption">Total Users</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                        <Typography variant="h4">{adminUsers}</Typography>
                        <Typography variant="caption">Admins</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h4">{regularUsers}</Typography>
                        <Typography variant="caption">Regular</Typography>
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    if (state.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={40} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupIcon color="primary" />
                            User Management
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Refresh">
                                <IconButton onClick={loadUsers} disabled={state.loading}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {state.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {state.error}
                        </Alert>
                    )}

                    {renderUserStats()}

                    <TextField
                        fullWidth
                        placeholder="Search users..."
                        value={state.searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                        }}
                        sx={{ mb: 2 }}
                    />

                    <List>
                        {state.filteredUsers.map((user) => (
                            <React.Fragment key={user.id}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => handleMenuOpen(e, user)}
                                        >
                                            <MoreIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                bgcolor: user.role === 'ADMIN' ? 'warning.main' : 'primary.main',
                                                color: user.role === 'ADMIN' ? 'warning.contrastText' : 'primary.contrastText'
                                            }}
                                        >
                                            {user.role === 'ADMIN' ? <AdminIcon /> : getUserInitials(user.username)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                @{user.username}
                                                {user.role === 'ADMIN' && (
                                                    <Chip
                                                        size="small"
                                                        label="Admin"
                                                        color="warning"
                                                        icon={<ShieldIcon />}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={`ID: ${user.telegram_id} • Joined: ${format(new Date(user.timestamp), 'MMM dd, yyyy')}`}
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                    </List>

                    {state.filteredUsers.length === 0 && !state.loading && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <UserIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                {state.searchTerm ? 'No users found' : 'No users yet'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {state.searchTerm 
                                    ? 'Try adjusting your search terms'
                                    : 'Add your first user to get started'
                                }
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Floating Action Button */}
            <Fab
                color="primary"
                aria-label="add user"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => setAddUserDialog(prev => ({ ...prev, open: true }))}
            >
                <AddIcon />
            </Fab>

            {/* User Action Menu */}
            <Menu
                anchorEl={state.anchorEl}
                open={Boolean(state.anchorEl)}
                onClose={handleMenuClose}
            >
                {state.selectedUser?.role !== 'ADMIN' && (
                    <MenuItem onClick={() => state.selectedUser && handlePromoteUser(state.selectedUser)}>
                        <ListItemIcon>
                            <AdminIcon />
                        </ListItemIcon>
                        Promote to Admin
                    </MenuItem>
                )}
                <MenuItem 
                    onClick={() => state.selectedUser && handleRemoveUser(state.selectedUser)}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <DeleteIcon color="error" />
                    </ListItemIcon>
                    Remove User
                </MenuItem>
            </Menu>

            {/* Add User Dialog */}
            <Dialog 
                open={addUserDialog.open} 
                onClose={() => setAddUserDialog(prev => ({ ...prev, open: false }))}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    {addUserDialog.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {addUserDialog.error}
                        </Alert>
                    )}
                    
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Telegram ID"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={addUserDialog.telegramId}
                        onChange={(e) => setAddUserDialog(prev => ({ 
                            ...prev, 
                            telegramId: e.target.value,
                            error: null 
                        }))}
                        disabled={addUserDialog.loading}
                        helperText="The user's Telegram ID (numeric)"
                        sx={{ mb: 2 }}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Username"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={addUserDialog.username}
                        onChange={(e) => setAddUserDialog(prev => ({ 
                            ...prev, 
                            username: e.target.value,
                            error: null 
                        }))}
                        disabled={addUserDialog.loading}
                        helperText="The user's Telegram username (without @)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setAddUserDialog(prev => ({ ...prev, open: false }))}
                        disabled={addUserDialog.loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddUser}
                        variant="contained"
                        disabled={addUserDialog.loading || !addUserDialog.telegramId || !addUserDialog.username}
                        startIcon={addUserDialog.loading ? <CircularProgress size={20} /> : <AddIcon />}
                    >
                        {addUserDialog.loading ? 'Adding...' : 'Add User'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};