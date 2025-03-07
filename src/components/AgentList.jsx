import React from 'react';
import { PlusIcon ,  PencilSquareIcon,
  TrashIcon} from '@heroicons/react/24/outline';

const AgentList = ({   agents,
  openCreateAgentModal,
  openEditAgentModal,
  openDeleteModal,
  currentAgent,handleSelectAgent }) => {

  return (
    <div className="w-60 theme-bg text-gray-100 flex flex-col">
      <div className="p-3 text-base font-medium ">Agent Playground</div>
      <div className="flex-1 overflow-y-auto">
 
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`px-3 py-1.5 cursor-pointer rounded mx-1  hover:bg-gray-100 hover:text-black text-sm
              ${currentAgent?.id === agent?.id ? 'bg-gray-100 text-black' : ''} flex justify-between`}
              onClick={() => handleSelectAgent(agent)}
          >
           <span className="truncate">
              # {agent.name}
            </span>

            <div className="flex gap-2 ml-2">
              <button
                className=" p-1 rounded text-xs hover:bg-black hover:text-white cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditAgentModal(agent);
                }}
              >
                <PencilSquareIcon className="h-4 w-4" />
              </button>

              <button
                className=" p-1 rounded text-xs hover:text-white hover:bg-black hover:text-white cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(agent);
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-800">
        <button
          className="w-full mb-1 bg-white text-gray-800 border rounded-lg hover:bg-white hover:text-black  p-1.5 rounded text-sm flex items-center justify-center cursor-pointer"
          onClick={openCreateAgentModal}
        >
          <PlusIcon className="h-4 w-4 mr-1.5" />
          Create Agent
        </button>
      </div>
    </div>
  );
};

export default AgentList;
