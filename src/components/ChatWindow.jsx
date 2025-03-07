import React from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput
} from '@chatscope/chat-ui-kit-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown-light.css'
import BouncingDotsLoader from './BouncingDotsLoader';

function ShimmerMessage() {
  return (
    <div style={{ width: '70%', marginTop: '5px' }}>
      <BouncingDotsLoader />
    </div>
  );
}

const ChatWindow = ({ currentAgent, messages, handleSendMessage, isLoading }) => {
  return (
    <div
      style={{ overflow: 'hidden', backgroundColor: '#6f2c82', display: 'flex', flexDirection: 'column', height: '100%' }}
      className="flex-1 flex flex-col"
    >
      {currentAgent ? (
        <>
          {/* Header */}
          <div
            className="p-3 shadow-sm border-b flex items-center theme-bg"
            style={{ position: 'relative', zIndex: 10 }}
          >
            <div className="text-base font-medium text-gray-200">{currentAgent.name}</div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-gray-950" style={{ overflowY: 'hidden' }}>
            <MainContainer style={{ position: 'relative', height: '100%' }}>
              <ChatContainer
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  backgroundColor: '#6f2c82',
                  color: '#fafafa'
                }}
              >
                <MessageList
                  style={{
                    backgroundColor: '#121212',
                    padding: '1rem',
                    overflowY: 'auto'
                  }}
                  className="custom-message-list"
                >
                  {messages.map((message, index) => (
                    <Message
                      key={index}
                      model={{
                        type: 'custom',
                        sender: message.sender,
                        direction: message.direction,
                        position: 'single',
                       
                        payload: (
                          <ReactMarkdown
                            // Use remarkGfm to enable GitHub-Flavored Markdown (tables, strikethrough, etc.)
                            remarkPlugins={[remarkGfm]}
                          >
                            {message.message.replace(/\n\s*\n/g, "\n")}
                          </ReactMarkdown>
                        )
                      }}
                    />
                  ))}

                  {isLoading && <ShimmerMessage />}
                </MessageList>

                <MessageInput
                  placeholder="Type your message here..."
                  onSend={handleSendMessage}
                  attachButton={false}
                  style={{
                    backgroundColor: '#251b32',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    position: 'relative',
                    zIndex: 10,                  
                  }}
                />
              </ChatContainer>
            </MainContainer>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-800 bg-white">
          <div className="text-center">
            <div className="text-xl mb-2">👈 Select an agent or create a new one</div>
            <p className="text-sm text-gray-700">Start chatting with your AI agents</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
