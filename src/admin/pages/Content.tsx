import { useState, useEffect } from 'react';
import { 
  FileText, 
  Save,
  Plus,
  X,
  AlertCircle,
  Check,
  Loader2,
  HelpCircle,
  Copy,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Code,
  Globe
} from 'lucide-react';

// Types
interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
}

interface Snippet {
  id: number;
  snippet_key: string;
  snippet_name: string;
  snippet_content: string;
  snippet_type: 'text' | 'html' | 'json';
}

interface PageContent {
  id: number;
  page_slug: string;
  page_title: string;
  page_description: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  content_sections: any;
  is_published: boolean;
  updated_at: string;
}

// Auth helpers
function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  };
}

// Tabs configuration
const TABS = [
  { id: 'faqs', label: 'FAQ Manager', icon: HelpCircle },
  { id: 'snippets', label: 'Snippets', icon: Code },
  { id: 'pages', label: 'Page SEO', icon: Globe }
];

const FAQ_CATEGORIES = ['General', 'Pricing', 'Services', 'Technical', 'Support'];

const EDITABLE_PAGES = [
  { slug: 'home', title: 'Home Page' },
  { slug: 'services', title: 'Services Page' },
  { slug: 'pricing', title: 'Pricing Page' },
  { slug: 'portfolio', title: 'Portfolio Page' },
  { slug: 'about', title: 'About Page' },
  { slug: 'contact', title: 'Contact Page' },
  { slug: 'faq', title: 'FAQ Page' }
];

export function Content() {
  const [activeTab, setActiveTab] = useState('faqs');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  // FAQ State
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('all');
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [showAddFaq, setShowAddFaq] = useState(false);

  // Snippets State
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [newSnippet, setNewSnippet] = useState({ snippet_key: '', snippet_name: '', snippet_content: '', snippet_type: 'text' as const });
  const [showAddSnippet, setShowAddSnippet] = useState(false);

  // Pages State
  const [pages, setPages] = useState<PageContent[]>([]);
  const [activePageSlug, setActivePageSlug] = useState('home');
  const [pageData, setPageData] = useState<Partial<PageContent>>({});
  const [saving, setSaving] = useState(false);

  // Show message helper
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 3000);
  };

  // Load FAQs
  const loadFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/backend/api/faqs.php?action=list', {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setFaqs(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Snippets
  const loadSnippets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/backend/api/snippets.php?action=list', {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setSnippets(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load snippets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Pages
  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/backend/api/pages.php?action=list', {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setPages(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load pages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load page content
  const loadPageContent = async (slug: string) => {
    try {
      const res = await fetch(`/backend/api/pages.php?action=get&slug=${slug}`, {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPageData(json.data);
      } else {
        const pageConfig = EDITABLE_PAGES.find(p => p.slug === slug);
        setPageData({
          page_slug: slug,
          page_title: pageConfig?.title || '',
          meta_title: pageConfig?.title || '',
          is_published: true
        });
      }
    } catch (err) {
      console.error('Failed to load page:', err);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'faqs') loadFaqs();
    if (activeTab === 'snippets') loadSnippets();
    if (activeTab === 'pages') loadPages();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'pages') loadPageContent(activePageSlug);
  }, [activePageSlug, activeTab]);

  // FAQ Actions
  const saveFaq = async (faq: Partial<FAQ>) => {
    setSaving(true);
    try {
      const isEdit = !!faq.id;
      const res = await fetch(`/backend/api/faqs.php?action=${isEdit ? 'update' : 'create'}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(faq)
      });
      const json = await res.json();
      if (json.success) {
        showMessage('success', isEdit ? 'FAQ updated!' : 'FAQ created!');
        loadFaqs();
        setEditingFaq(null);
        setShowAddFaq(false);
        setNewFaq({ question: '', answer: '', category: 'General' });
      } else {
        showMessage('error', json.message || 'Failed to save FAQ');
      }
    } catch (err) {
      showMessage('error', 'Error saving FAQ');
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      const res = await fetch(`/backend/api/faqs.php?action=delete&id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (json.success) {
        showMessage('success', 'FAQ deleted');
        loadFaqs();
      }
    } catch (err) {
      showMessage('error', 'Error deleting FAQ');
    }
  };

  const moveFaq = async (id: number, direction: 'up' | 'down') => {
    const index = faqs.findIndex(f => f.id === id);
    if (index < 0) return;
    
    const newFaqs = [...faqs];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex < 0 || swapIndex >= newFaqs.length) return;
    
    // Swap positions
    const tempOrder = newFaqs[index].display_order;
    newFaqs[index].display_order = newFaqs[swapIndex].display_order;
    newFaqs[swapIndex].display_order = tempOrder;
    
    // Swap in array
    [newFaqs[index], newFaqs[swapIndex]] = [newFaqs[swapIndex], newFaqs[index]];
    setFaqs(newFaqs);
    
    // Save order to backend
    try {
      await fetch('/backend/api/faqs.php?action=reorder', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orders: newFaqs.map(f => ({ id: f.id, display_order: f.display_order })) })
      });
    } catch (err) {
      console.error('Failed to save order:', err);
    }
  };

  // Snippet Actions
  const saveSnippet = async (snippet: Partial<Snippet>) => {
    setSaving(true);
    try {
      const isEdit = !!snippet.id;
      const res = await fetch(`/backend/api/snippets.php?action=${isEdit ? 'update' : 'create'}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(snippet)
      });
      const json = await res.json();
      if (json.success) {
        showMessage('success', isEdit ? 'Snippet updated!' : 'Snippet created!');
        loadSnippets();
        setEditingSnippet(null);
        setShowAddSnippet(false);
        setNewSnippet({ snippet_key: '', snippet_name: '', snippet_content: '', snippet_type: 'text' });
      } else {
        showMessage('error', json.message || 'Failed to save snippet');
      }
    } catch (err) {
      showMessage('error', 'Error saving snippet');
    } finally {
      setSaving(false);
    }
  };

  const deleteSnippet = async (id: number) => {
    if (!confirm('Delete this snippet?')) return;
    try {
      const res = await fetch(`/backend/api/snippets.php?action=delete&id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (json.success) {
        showMessage('success', 'Snippet deleted');
        loadSnippets();
      }
    } catch (err) {
      showMessage('error', 'Error deleting snippet');
    }
  };

  const copySnippet = (content: string) => {
    navigator.clipboard.writeText(content);
    showMessage('success', 'Copied to clipboard!');
  };

  // Page Actions
  const savePage = async () => {
    setSaving(true);
    try {
      const existingPage = pages.find(p => p.page_slug === activePageSlug);
      const res = await fetch(`/backend/api/pages.php?action=${existingPage ? 'update' : 'create'}${existingPage ? `&slug=${activePageSlug}` : ''}`, {
        method: existingPage ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(pageData)
      });
      const json = await res.json();
      if (json.success) {
        showMessage('success', 'Page saved!');
        loadPages();
      } else {
        showMessage('error', json.message || 'Failed to save page');
      }
    } catch (err) {
      showMessage('error', 'Error saving page');
    } finally {
      setSaving(false);
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="text-cyan-400" />
          Content Management
        </h2>
        <p className="text-white/60 mt-1">Manage FAQs, reusable snippets, and page SEO settings</p>
      </div>

      {/* Message */}
      {message.type && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
            : 'bg-red-500/20 border border-red-500/50 text-red-200'
        }`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* FAQ Manager Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {/* FAQ Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search FAQs..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-cyan-500/50"
                />
              </div>
              <select
                value={faqCategory}
                onChange={(e) => setFaqCategory(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50"
              >
                <option value="all">All Categories</option>
                {FAQ_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddFaq(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
            >
              <Plus size={18} />
              Add FAQ
            </button>
          </div>

          {/* Add FAQ Form */}
          {showAddFaq && (
            <div className="bg-dark-900 border border-cyan-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Add New FAQ</h3>
                <button onClick={() => setShowAddFaq(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-white/70 mb-1">Question *</label>
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50"
                    placeholder="Enter the question..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-white/70 mb-1">Answer *</label>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 resize-none"
                    placeholder="Enter the answer..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Category</label>
                  <select
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50"
                  >
                    {FAQ_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowAddFaq(false)}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveFaq({ ...newFaq, is_published: true, display_order: faqs.length })}
                  disabled={!newFaq.question || !newFaq.answer || saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save FAQ
                </button>
              </div>
            </div>
          )}

          {/* FAQ List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No FAQs found. Add your first FAQ!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <div key={faq.id} className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
                  {editingFaq?.id === faq.id ? (
                    <div className="p-4 space-y-4">
                      <input
                        type="text"
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50"
                      />
                      <textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 resize-none"
                      />
                      <div className="flex items-center gap-4">
                        <select
                          value={editingFaq.category}
                          onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50"
                        >
                          {FAQ_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm text-white/70">
                          <input
                            type="checkbox"
                            checked={editingFaq.is_published}
                            onChange={(e) => setEditingFaq({ ...editingFaq, is_published: e.target.checked })}
                            className="rounded"
                          />
                          Published
                        </label>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setEditingFaq(null)}
                          className="px-4 py-2 text-white/60 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveFaq(editingFaq)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded">
                              {faq.category}
                            </span>
                            {!faq.is_published && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded">
                                Draft
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-white mb-2">{faq.question}</h4>
                          <p className="text-white/60 text-sm whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveFaq(faq.id, 'up')}
                            disabled={index === 0}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            onClick={() => moveFaq(faq.id, 'down')}
                            disabled={index === filteredFaqs.length - 1}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ChevronDown size={18} />
                          </button>
                          <button
                            onClick={() => setEditingFaq(faq)}
                            className="p-2 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteFaq(faq.id)}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Snippets Tab */}
      {activeTab === 'snippets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-white/60">Reusable text and code snippets for quick access</p>
            <button
              onClick={() => setShowAddSnippet(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
            >
              <Plus size={18} />
              Add Snippet
            </button>
          </div>

          {/* Add Snippet Form */}
          {showAddSnippet && (
            <div className="bg-dark-900 border border-cyan-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Add New Snippet</h3>
                <button onClick={() => setShowAddSnippet(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Key (unique identifier) *</label>
                  <input
                    type="text"
                    value={newSnippet.snippet_key}
                    onChange={(e) => setNewSnippet({ ...newSnippet, snippet_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 font-mono"
                    placeholder="e.g., company_address"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newSnippet.snippet_name}
                    onChange={(e) => setNewSnippet({ ...newSnippet, snippet_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50"
                    placeholder="e.g., Company Address"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Type</label>
                  <select
                    value={newSnippet.snippet_type}
                    onChange={(e) => setNewSnippet({ ...newSnippet, snippet_type: e.target.value as 'text' | 'html' | 'json' })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50"
                  >
                    <option value="text">Plain Text</option>
                    <option value="html">HTML</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-white/70 mb-1">Content *</label>
                  <textarea
                    value={newSnippet.snippet_content}
                    onChange={(e) => setNewSnippet({ ...newSnippet, snippet_content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 resize-none font-mono text-sm"
                    placeholder="Enter snippet content..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowAddSnippet(false)}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveSnippet(newSnippet)}
                  disabled={!newSnippet.snippet_key || !newSnippet.snippet_name || !newSnippet.snippet_content || saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Snippet
                </button>
              </div>
            </div>
          )}

          {/* Snippets List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : snippets.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No snippets yet. Create reusable content snippets!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {snippets.map(snippet => (
                <div key={snippet.id} className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
                  {editingSnippet?.id === snippet.id ? (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingSnippet.snippet_key}
                          onChange={(e) => setEditingSnippet({ ...editingSnippet, snippet_key: e.target.value })}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
                          placeholder="Key"
                        />
                        <input
                          type="text"
                          value={editingSnippet.snippet_name}
                          onChange={(e) => setEditingSnippet({ ...editingSnippet, snippet_name: e.target.value })}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          placeholder="Name"
                        />
                      </div>
                      <textarea
                        value={editingSnippet.snippet_content}
                        onChange={(e) => setEditingSnippet({ ...editingSnippet, snippet_content: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingSnippet(null)} className="px-3 py-1.5 text-white/60 hover:text-white text-sm">
                          Cancel
                        </button>
                        <button
                          onClick={() => saveSnippet(editingSnippet)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-black font-semibold rounded text-sm hover:bg-emerald-400 disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{snippet.snippet_name}</h4>
                            <p className="text-xs text-cyan-400 font-mono">{snippet.snippet_key}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 text-xs font-medium bg-white/10 text-white/60 rounded">
                              {snippet.snippet_type}
                            </span>
                            <button
                              onClick={() => copySnippet(snippet.snippet_content)}
                              className="p-2 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded"
                              title="Copy to clipboard"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => setEditingSnippet(snippet)}
                              className="p-2 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteSnippet(snippet.id)}
                              className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-black/20 max-h-48 overflow-auto">
                        <pre className="text-sm text-white/70 whitespace-pre-wrap font-mono">{snippet.snippet_content}</pre>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page SEO Tab */}
      {activeTab === 'pages' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Page Selector */}
          <div className="lg:col-span-1">
            <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden sticky top-20">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BookOpen size={18} />
                  Pages
                </h3>
              </div>
              <div className="p-2 space-y-1">
                {EDITABLE_PAGES.map(page => {
                  const exists = pages.some(p => p.page_slug === page.slug);
                  return (
                    <button
                      key={page.slug}
                      onClick={() => setActivePageSlug(page.slug)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activePageSlug === page.slug
                          ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                          : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <p className="font-medium text-sm">{page.title}</p>
                      <p className="text-xs text-white/50 mt-0.5">
                        {exists ? '✓ Configured' : '○ Default'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Page Editor */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-dark-900 border border-white/10 rounded-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">SEO & Meta Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={pageData.page_title || ''}
                    onChange={(e) => setPageData({ ...pageData, page_title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Meta Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={pageData.meta_title || ''}
                    onChange={(e) => setPageData({ ...pageData, meta_title: e.target.value })}
                    placeholder="Title shown in search results"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    {(pageData.meta_title || '').length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={pageData.meta_description || ''}
                    onChange={(e) => setPageData({ ...pageData, meta_description: e.target.value })}
                    rows={3}
                    placeholder="Description shown in search results"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 resize-none"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    {(pageData.meta_description || '').length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={pageData.meta_keywords || ''}
                    onChange={(e) => setPageData({ ...pageData, meta_keywords: e.target.value })}
                    placeholder="Comma-separated keywords"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={pageData.is_published || false}
                    onChange={(e) => setPageData({ ...pageData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="is_published" className="text-sm text-white/70">
                    Page is active
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={savePage}
              disabled={saving}
              className="w-full px-6 py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Page Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
