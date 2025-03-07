import React, { useState } from 'react';
import Modal from 'react-modal';
import { api } from '../utils/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

Modal.setAppElement('#root');

const CreateAgentModal = ({ setShowCreateModal, setRefreshList }) => {
  const [newAgent, setNewAgent] = useState({
    name: '',
    objective: '',
    instructions: '',
    llm_type: 'gpt-4',
    response_format: 'text'
  });

  const handleCreateAgent = async () => {
    if (!newAgent.name.trim()) return;
    try {
      await api.post('/api/agents/', newAgent);
      setRefreshList(prev => !prev);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen onRequestClose={() => setShowCreateModal(false)}>
      <div className="p-4">
        <div className="flex justify-between">
          <h2>Create a new agent</h2>
          <button onClick={() => setShowCreateModal(false)}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <input value={newAgent.name} onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })} placeholder="Agent Name" />
        <textarea value={newAgent.objective} onChange={(e) => setNewAgent({ ...newAgent, objective: e.target.value })} placeholder="Objective" />
        <button onClick={handleCreateAgent}>Create</button>
      </div>
    </Modal>
  );
};

export default CreateAgentModal;
