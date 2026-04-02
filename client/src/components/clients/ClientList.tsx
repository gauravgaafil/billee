import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  [key: string]: unknown;
}

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onRowClick: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete, onRowClick }) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No clients found. Add your first client to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr
              key={client.id}
              onClick={() => onRowClick(client)}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{client.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{client.email}</td>
              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{client.company || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{client.phone || '-'}</td>
              <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(client); }}
                  className="text-gray-400 hover:text-primary-600 transition-colors mr-3"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(client); }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;
