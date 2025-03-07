import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import Modal from 'react-modal';
import { api } from './utils/api';
import './styles/chat.css'
import AgentList from './components/AgentList';
import ChatWindow from './components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import { RotatingLines } from 'react-loader-spinner';

Modal.setAppElement('#root');

function App() {
  const [agents, setAgents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newAgent, setNewAgent] = useState({
    name: '',
    objective: '',
    instructions: '',
    llm_type: 'gpt-4o',
    response_format: 'text',
    description: ''
  });
  const [refreshList, setRefreshList] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState(null);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [building, setBuilding] = useState(false);

  const userId = localStorage.getItem("userId");

  const transformMessages = (apiData) => {
    let chatMessages = [];
    apiData.forEach(msg => {
      chatMessages.push({
        id: `user-${msg.id}`,
        message: msg.user_message,
        sender: "user",
        direction: "outgoing"
      });
      chatMessages.push({
        id: `assistant-${msg.id}`,
        message: msg.agent_response,
        sender: "assistant",
        direction: "incoming"
      });
    });
    return chatMessages;
  };

  const fetchAgents = async () => {
    try {
      const response = await api.get('/api/agents/');
      if (response) {
        setAgents(response.data)
      }
    } catch (err) {
      console.log(err)
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
    fetchAgents();
  }, [refreshList]);

  // LLM type options
  const llmOptions = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o-mini' },
  ];

  const openCreateAgentModal = () => {
    setIsEditMode(false);
    setAgentToEdit(null);

    setNewAgent({
      name: '',
      objective: '',
      instructions: '',
      llm_type: 'gpt-4o',
      response_format: 'text',
      description: ''
    });
    setFormStep(1);
    setShowAgentModal(true);
  };

  const handleProceedDescription = async () => {
    if (!newAgent.description.trim()) return;
    setBuilding(true)
    try {
      const response = await api.post('/api/agent/instruction_builder', {
        description: newAgent.description,
        sender_id: userId
      });

      if (response?.response) {
        setNewAgent((prev) => ({
          ...prev,
          name: response?.response.name || '',
          objective: response?.response.objective || '',
          instructions: response?.response.instructions || ''
        }));
      }
      setBuilding(false);
      setFormStep(2);
    } catch (err) {
      console.log(err);
    }
  };


  const openEditAgentModal = (agent) => {
    setIsEditMode(true);
    setAgentToEdit(agent);
    setFormStep(2);
    setNewAgent({
      name: agent.name,
      objective: agent.objective,
      instructions: agent.instructions,
      llm_type: agent.llm_type,
      response_format: agent.response_format,
      description: ''
    });
    setShowAgentModal(true);
  };

  const handleSaveAgent = async () => {
    if (!newAgent.name.trim()) return;

    if (!isEditMode) {
      try {
        await api.post('/api/agents/', newAgent);
        setShowAgentModal(false);
        setRefreshList(!refreshList);
      } catch (err) {
        console.log(err);
      }
    }
    else {
      try {
        if (!agentToEdit) return;
        await api.put(`/api/agents/${agentToEdit.id}/`, newAgent);
        setShowAgentModal(false);
        setRefreshList(!refreshList);
      } catch (err) {
        console.log(err);
      }
    }
  };

  // -------------------- DELETE AGENT --------------------

  const openDeleteModal = (agent) => {
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      await api.delete(`/api/agents/${agentToDelete.id}/`);
      setShowDeleteModal(false);
      setRefreshList(!refreshList);
    } catch (err) {
      console.log(err);
    }
  };

  // -------------------- SELECT AGENT & MESSAGING --------------------

  const handleSelectAgent = async (agent) => {
    setCurrentAgent(agent);
    try {
      const response = await api.get(`/api/agent/messages/${userId}/${agent.id}/`);
      if (response?.status === "success") {
        if (response?.data?.length > 0) {
          const transformed = transformMessages(response.data);
          setMessages(transformed);
        } else {
          await api.post(`/api/agent/${agent.id}/${userId}/init`);
          setMessages([]);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!currentAgent) return;

    const newUserMessage = {
      id: `user-temp-${Date.now()}`,
      message: text,
      sender: "user",
      direction: "outgoing"
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await api.post(`/api/agent/${currentAgent.id}/chat`, {
        sender_id: userId,
        message: text
      });

      const agentReply = response?.response || "I'm not sure...";
      setIsLoading(false);

      const newAgentMessage = {
        id: `assistant-temp-${Date.now()}`,
        message: agentReply,
        sender: "assistant",
        direction: "incoming"
      };
      setMessages(prev => [...prev, newAgentMessage]);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          message: "Oops, something went wrong. Please try again.",
          sender: "assistant",
          direction: "incoming"
        }
      ]);
    }
  };

  // -------------------- STYLES --------------------

  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '8px',
      padding: '0',
      border: 'none',
      maxWidth: '500px',
      width: '90%',
      backgroundColor: '#262626',
      color: '#fafafa',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: '1000'
    }
  };

  const deleteModalStyles = {
    content: {
      ...customModalStyles.content,
      maxWidth: '400px'
    },
    overlay: {
      ...customModalStyles.overlay
    }
  };

  // -------------------- RENDER --------------------

  return (
    <div className="flex h-screen bg-gray-900 font-sans text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <AgentList
        agents={agents}
        openCreateAgentModal={openCreateAgentModal}
        openEditAgentModal={openEditAgentModal}
        openDeleteModal={openDeleteModal}
        currentAgent={currentAgent}
        handleSelectAgent={handleSelectAgent}
      />
      <ChatWindow
        currentAgent={currentAgent}
        messages={messages}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />

      {/* ----------------- CREATE/EDIT AGENT MODAL ----------------- */}
      <Modal
        isOpen={showAgentModal}
        onRequestClose={() => setShowAgentModal(false)}
        style={customModalStyles}
        contentLabel="Agent Modal"
      >
        <div className="border-b theme-bg px-4 py-3 flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-100">
            {isEditMode ? 'Edit Agent' : 'Create a new agent'}
          </h2>
          <button
            onClick={() => setShowAgentModal(false)}
            className="text-gray-400 hover:text-gray-200 cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1 (Description) */}
        {!isEditMode && formStep === 1 && (
          <div className="p-4 bg-white">
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-900 mb-1">
                Agent Description
              </label>
              <textarea
                value={newAgent.description}
                onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                className="w-full p-2 border border-gray-700 rounded text-gray-900 text-sm focus:ring-1 focus:ring-gray-600 focus:border-gray-600 h-28"
                placeholder="Provide a detailed description for the AI agent..."
              />
            </div>
            <div>
              <button
                style={{height:"40px"}}
                onClick={handleProceedDescription}
                className="w-full theme-bg hover:bg-fuchsia-100 text-white rounded text-sm font-medium cursor-pointer"
              >
                {building ? 
                <div className='flex justify-center'>
                 <RotatingLines
                 strokeColor='white'
                 width={20}
                      
                />
                </div> : <span>Proceed</span>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 (Name, Objective, Instructions, etc.) */}
        {(isEditMode || formStep === 2) && (
          <div className="p-4 bg-white">
            {/* Name */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-900 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                className="w-full p-2 border border-gray-700 rounded text-gray-900 text-sm focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                placeholder="Sales Assistant"
              />
            </div>

            {/* Objective */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-900 mb-1">
                Objective
              </label>
              <textarea
                value={newAgent.objective}
                onChange={(e) => setNewAgent({ ...newAgent, objective: e.target.value })}
                className="w-full p-2 border border-gray-700 rounded text-gray-900 text-sm focus:ring-1 focus:ring-gray-600 focus:border-gray-600 h-20"
                placeholder="Help users find appropriate products and answer sales questions"
              />
            </div>

            {/* Instructions */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-900 mb-1">
                Instructions
              </label>
              <textarea
                value={newAgent.instructions}
                onChange={(e) => setNewAgent({ ...newAgent, instructions: e.target.value })}
                className="w-full p-2 border border-gray-700 rounded text-gray-900 text-sm focus:ring-1 focus:ring-gray-600 focus:border-gray-600 h-24"
                placeholder="Be friendly and helpful. Ask clarifying questions when needed."
              />
            </div>

            {/* LLM Type */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-900 mb-1">
                LLM Type
              </label>
              <select
                value={newAgent.llm_type}
                onChange={(e) => setNewAgent({ ...newAgent, llm_type: e.target.value })}
                className="w-full p-2 border border-gray-700 rounded text-gray-900 text-sm focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              >
                {llmOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Response Format */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-900 mb-1">
                Response Format
              </label>
              <textarea
                value={newAgent.response_format}
                onChange={(e) => setNewAgent({ ...newAgent, response_format: e.target.value })}
                className="w-full p-2 border border-gray-700 rounded text-gray-900 text-sm focus:ring-1 focus:ring-gray-600 focus:border-gray-600 h-20"
                placeholder="text, markdown, or JSON"
              />
            </div>

            {/* Create/Save Button */}
            <div className="mt-5">
              <button
                onClick={handleSaveAgent}
                className="w-full theme-bg hover:bg-fuchsia-100 text-white p-2 rounded text-sm font-medium cursor-pointer"
              >
                {isEditMode ? 'Save Changes' : 'Create Agent'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        style={deleteModalStyles}
        contentLabel="Delete Agent Modal"
      >
        <div className="border-b theme-bg px-4 py-3 flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-100">
            Delete Agent
          </h2>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="text-gray-400 hover:text-gray-200 cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 bg-white">
          <p className="text-sm text-gray-900 mb-4">
            Are you sure you want to delete agent{" "}
            <strong>{agentToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="border border-gray-700 rounded text-gray-900 px-3 py-1 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAgent}
              className="theme-bg hover:bg-fuchsia-100 text-white px-3 py-1 text-sm rounded cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;