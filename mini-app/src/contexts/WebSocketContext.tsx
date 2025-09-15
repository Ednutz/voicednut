import { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';

interface WebSocketContextType {
    isConnected: boolean;
    lastMessage: string | null;
    sendMessage: (message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    isConnected: false,
    lastMessage: null,
    sendMessage: () => { },
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
    children: ReactNode;
    url: string;
}

export const WebSocketProvider: FC<WebSocketProviderProps> = ({ children, url }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            setLastMessage(event.data);
        };

        socket.onclose = () => {
            setIsConnected(false);
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, [url]);

    const sendMessage = (message: string) => {
        if (ws && isConnected) {
            ws.send(message);
        }
    };

    return (
        <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};