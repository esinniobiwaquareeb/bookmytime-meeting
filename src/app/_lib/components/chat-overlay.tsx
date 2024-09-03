import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Flex, TextField, Text } from '@radix-ui/themes';
import { Icon } from '@iconify/react';
import EmojiPicker from 'emoji-picker-react';

interface ChatOverlayProps {
    messages: { name: string; text: string; file?: File }[];
    onSendMessage: (message: string, file?: File) => void;
    onClose: () => void;
    senderName: string;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ messages, onSendMessage, onClose, senderName }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const chatRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (message.trim() || selectedFile) {
            onSendMessage(message, selectedFile);
            setMessage('');
            setSelectedFile(undefined);
        }
    };

    const handleEmojiClick = (emoji: any) => {
        setMessage(message + emoji.emoji);
        setShowEmojiPicker(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : undefined;
        setSelectedFile(file);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Box
            className="fixed bottom-0 right-0 h-full w-full max-w-md bg-gray-800 text-white p-4"
            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
        >
            <Flex direction="column" height="100%" gap="2">
                <span className="flex items-center justify-between">
                    <Text size="4" weight="bold">In-chat Message</Text>
                    <Button variant="ghost" color="red" onClick={onClose}>
                        <Icon icon="mdi:close" width={24} height={24} />
                    </Button>
                </span>

                <Box
                    ref={chatRef}
                    style={{ flex: '1', overflowY: 'auto', maxHeight: 'calc(100% - 90px)' }}
                >
                    {messages.map((msg, index) => (
                        <Box key={index} mb="2">
                            <Text weight="bold">{msg.name}: </Text>
                            <Text as="span">{msg.text}</Text>
                            {msg.file && (
                                <Box mt="2">
                                    <Text size="2" weight="bold">Attached File:</Text>
                                    {msg.file.type.startsWith('image/') ? (
                                        <img src={URL.createObjectURL(msg.file)} alt="Attachment" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                                    ) : (
                                        <Text size="2" color="gray">{msg.file.name}</Text>
                                    )}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>

                <Flex direction="row" gap="2" align="center" style={{ position: 'absolute', bottom: '0', width: 'calc(100% - 2rem)', padding: '1rem', backgroundColor: '#333' }}>
                    <Flex direction="row" align="center" style={{ flex: '1', position: 'relative' }}>
                        {showEmojiPicker && (
                            <Box style={{ position: 'absolute', bottom: '60px', left: '0', right: '0', backgroundColor: '#333', padding: '10px', zIndex: 1000 }}>
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </Box>
                        )}
                        <span
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                        >
                            <Icon icon="twemoji:smiling-face" width={24} height={24} />
                        </span>
                        <TextField.Root
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message"
                            style={{ flex: '1', paddingLeft: '40px', resize: 'none', overflowY: 'auto', color: 'white', backgroundColor: '#444', borderRadius: '10px', fontSize: '18px', lineHeight: '1.5' }}
                            onKeyDown={handleKeyDown}
                        />
                        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
                        <label htmlFor="file-upload">
                            <Icon icon="mdi:paperclip" width={24} height={24} style={{ cursor: 'pointer', marginLeft: '10px' }} />
                        </label>
                        <Button variant="ghost" color="red" onClick={handleSendMessage}>
                            <Icon icon="mdi:send" width={24} height={24} />
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Box>
    );
};

export default ChatOverlay;
