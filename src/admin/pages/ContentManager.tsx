import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle, Save } from 'lucide-react';

interface ContentBlock {
  id: string;
  section: string;
  key: string;
  value: string;
  type: 'text' | 'textarea' | 'number';
}

export function ContentManager() {
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sections = [
    { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle', 'cta_text'] },
    { id: 'services', name: 'Services', fields: ['title', 'description'] },
    { id: 'about', name: 'About', fields: ['title', 'description', 'team_count'] },
    { id: 'footer', name: 'Footer', fields: ['company_name', 'tagline', 'email', 'phone'] }
  ];

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    const stored = localStorage.getItem('website-content');
    if (stored) {
      setContent(JSON.parse(stored));
    } else {
      // Initialize with defaults
      const defaults: ContentBlock[] = [
        { id: '1', section: 'hero', key: 'title', value: 'Build Amazing Digital Experiences', type: 'text' },
        { id: '2', section: 'hero', key: 'subtitle', value: 'Custom websites, SaaS, automations, and AI tools', type: 'textarea' },
        { id: '3', section: 'services', key: 'title', value: 'Our Services', type: 'text' },
        { id: '4', section: 'footer', key: 'company_name', value: 'Chronolyte', type: 'text' },
        { id: '5', section: 'footer', key: 'email', value: 'hello@chronolyte.com', type: 'text' },
      ];
      setContent(defaults);
      localStorage.setItem('website-content', JSON.stringify(defaults));
    }
  };

  const startEdit = (block: ContentBlock) => {
    setEditingId(block.id);
    setEditValues({ [block.id]: block.value });
  };

  const saveEdit = (id: string) => {
    const updated = content.map(c => 
      c.id === id ? { ...c, value: editValues[id] } : c
    );
    setContent(updated);
    localStorage.setItem('website-content', JSON.stringify(updated));
    setEditingId(null);
    setMessage({ type: 'success', text: 'Content updated successfully!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const deleteContent = (id: string) => {
    if (!confirm('Delete this content?')) return;
    const updated = content.filter(c => c.id !== id);
    setContent(updated);
    localStorage.setItem('website-content', JSON.stringify(updated));
    setMessage({ type: 'success', text: 'Content deleted' });
  };

  const addContent = (section: string, key: string) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      section,
      key,
      value: '',
      type: 'text'
    };
    const updated = [...content, newBlock];
    setContent(updated);
    localStorage.setItem('website-content', JSON.stringify(updated));
    setMessage({ type: 'success', text: 'Content block added' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Content Manager</h1>
        <p className="text-white/50 mt-1">Edit all text and content across your website</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <p className={message.type === 'success' ? 'text-emerald-200' : 'text-red-200'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Sections Grid */}
      <div className="space-y-8">
        {sections.map(section => (
          <div key={section.id} className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">{section.name}</h2>
            
            <div className="space-y-3">
              {content
                .filter(c => c.section === section.id)
                .map(block => (
                  <div key={block.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-cyan-400 font-mono">{block.key}</p>
                        {editingId !== block.id && (
                          <p className="text-white text-sm mt-1 line-clamp-2">{block.value}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingId === block.id ? (
                          <button
                            onClick={() => saveEdit(block.id)}
                            className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(block)}
                            className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteContent(block.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingId === block.id && (
                      <div className="mt-3">
                        {block.type === 'textarea' ? (
                          <textarea
                            value={editValues[block.id]}
                            onChange={(e) => setEditValues({ ...editValues, [block.id]: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 bg-white/5 border border-cyan-500/50 rounded-lg text-white focus:outline-none resize-none"
                          />
                        ) : (
                          <input
                            type={block.type === 'number' ? 'number' : 'text'}
                            value={editValues[block.id]}
                            onChange={(e) => setEditValues({ ...editValues, [block.id]: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-cyan-500/50 rounded-lg text-white focus:outline-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              
              {/* Add new field */}
              <div className="pt-2 border-t border-white/10">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addContent(section.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 focus:outline-none"
                >
                  <option value="">Add new field...</option>
                  {section.fields
                    .filter(field => !content.find(c => c.section === section.id && c.key === field))
                    .map(field => (
                      <option key={field} value={field} className="bg-[#15151f]">
                        {field}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentManager;
