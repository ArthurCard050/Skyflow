import React, { useState } from 'react';
import { PostCard } from './components/PostCard';
import { PostCardCompact } from './components/PostCardCompact';
import { CalendarView } from './components/CalendarView';
import { ReportsView } from './components/ReportsView';
import { TeamView } from './components/TeamView';
import { KanbanView } from './components/KanbanView';
import { NewPostModal } from './components/NewPostModal';
import { NewClientModal } from './components/NewClientModal';
import { ShareLinkModal } from './components/ShareLinkModal';
import { NotificationsView } from './components/NotificationsView';
import { LoginView } from './components/LoginView';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { PostDetailModal } from './components/PostDetailModal';
import { ToastProvider, useToast } from './components/Toast';
import { INITIAL_POSTS, CLIENTS, INITIAL_BATCHES, INITIAL_NOTIFICATIONS } from './data/mockData';
import { Post, Client, Notification, Batch, PostStatus, UserRole } from './types';
import { MOCK_USERS } from './data/mockData';
import { Plus, Folder, Edit3, Trash2, ListFilter, LayoutGrid, Calendar, Users, Bell, Settings, ChevronDown, Share2, Menu, X, Sun, Moon, Cloud, Kanban, BarChart3, RotateCcw, Check, Palette, List, Grid } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'motion/react';

// ... imports

type View = 'feed' | 'calendar' | 'kanban' | 'reports' | 'team' | 'notifications' | 'settings';

function AppContent({ 
  userRole, 
  onLogout,
  onRoleChange,
  initialClientId,
  initialViewMonth
}: { 
  userRole: UserRole, 
  onLogout: () => void,
  onRoleChange: (role: UserRole) => void,
  initialClientId?: string | null,
  initialViewMonth?: string | null
}) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'changes_requested' | 'published'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('feed');
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || CLIENTS[0].id);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [viewMonth, setViewMonth] = useState<string | null>(initialViewMonth || null);
  const [calendarNewPostDate, setCalendarNewPostDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'full'>('compact');
  
  type Theme = 'default' | 'dark' | 'light';
  const [theme, setTheme] = useState<Theme>('default');

  React.useEffect(() => {
    // @custom-variant dark in index.css handles all dark: Tailwind classes
    // via [data-theme="dark"] — no classList toggling needed
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(t => t === 'default' ? 'dark' : t === 'dark' ? 'light' : 'default');
  };

  const themeLabel: Record<Theme, string> = {
    default: 'Padrão',
    dark: 'Escuro',
    light: 'Claro'
  };

  const themeIcon: Record<Theme, React.ReactNode> = {
    default: <Palette className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    light: <Sun className="w-4 h-4" />
  };

  const themeNextLabel: Record<Theme, string> = {
    default: 'Escuro',
    dark: 'Claro',
    light: 'Padrão'
  };
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  const { addToast } = useToast();

  const currentUser = MOCK_USERS.find(u => u.id === 'u1') || MOCK_USERS[0];
  const isAgency = userRole !== 'client';

  // Check URL params on mount - Removed as it's handled in App component now
  
  const handleAddComment = (id: string, comment: string) => {
    setPosts(posts.map(post => 
      post.id === id ? { 
        ...post, 
        commentsCount: (post.commentsCount || 0) + 1,
        history: [
          { 
            id: Math.random().toString(36).substr(2, 9), 
            type: 'comment', 
            user: isAgency ? currentUser.name : 'Cliente Demo', 
            timestamp: new Date().toISOString(),
            details: comment
          },
          ...(post.history || [])
        ]
      } : post
    ));
    addToast('Comentário adicionado!', 'success');
  };

  const handleStatusChange = (postId: string, newStatus: PostStatus) => {
    setPosts(posts.map(post => 
      post.id === postId ? { 
        ...post, 
        status: newStatus,
        history: [
          { 
            id: Math.random().toString(36).substr(2, 9), 
            type: 'status_change', 
            user: isAgency ? currentUser.name : 'Cliente Demo', 
            timestamp: new Date().toISOString(),
            details: `Moveu para ${newStatus.replace('_', ' ')}`
          },
          ...(post.history || [])
        ]
      } : post
    ));
    addToast('Status atualizado com sucesso!', 'success');
  };

  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const handleAddClient = (name: string, email: string) => {
    if (clients.length >= 20) {
      addToast('Limite máximo de 20 clientes atingido.', 'error');
      return;
    }

    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      avatar: name.substring(0, 2).toUpperCase()
    };

    setClients([...clients, newClient]);
    setSelectedClientId(newClient.id);
    setIsNewClientModalOpen(false);
    addToast(`Cliente ${name} adicionado com sucesso!`, 'success');
  };

  const handleApprove = (id: string, rating: number) => {
    setPosts(posts.map(post => {
      if (post.id !== id) return post;
      
      let newStatus = post.status;
      let details = 'Aprovado';

      if (userRole === 'client') {
        if (post.status.includes('copy')) newStatus = 'copy_approved';
        else if (post.status.includes('design')) newStatus = 'design_approved';
        else if (post.status === 'scheduling') newStatus = 'scheduled';
        else newStatus = 'copy_approved'; // fallback
        details = `Aprovado pelo cliente (Nota: ${rating})`;
      } else {
        // Internal approval logic
        if (post.status === 'copy_production') newStatus = 'copy_sent';
        if (post.status === 'design_production') newStatus = 'design_sent';
        details = `Aprovado internamente por ${userRole}`;
      }

      return {
        ...post,
        status: newStatus,
        rating: rating > 0 ? rating : post.rating,
        approvedAt: newStatus.includes('approved') ? new Date().toISOString() : post.approvedAt,
        history: [
          { 
            id: Math.random().toString(36).substr(2, 9), 
            type: 'approved', 
            user: userRole === 'client' ? 'Cliente Demo' : 'Ana Silva', 
            timestamp: new Date().toISOString(),
            details
          },
          ...(post.history || [])
        ]
      };
    }));
    
    if (userRole === 'client') {
      const post = posts.find(p => p.id === id);
      if (post) {
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          clientId: post.clientId,
          postId: post.id,
          type: 'approved',
          message: `O post de ${post.platform} foi aprovado com ${rating} estrelas!`,
          date: new Date().toISOString(),
          read: false
        };
        setNotifications([newNotification, ...notifications]);
      }
    }
    
    addToast('Post aprovado com sucesso!', 'success');
  };

  const handleRequestChanges = (id: string, feedback: string) => {
    setPosts(posts.map(post => {
      if (post.id !== id) return post;

      let newStatus = post.status;
      if (userRole === 'client') {
        if (post.status.includes('copy')) newStatus = 'copy_changes';
        else if (post.status.includes('design')) newStatus = 'design_changes';
        else newStatus = 'copy_changes';
      }

      return {
        ...post,
        status: newStatus,
        feedback,
        history: [
          { 
            id: Math.random().toString(36).substr(2, 9), 
            type: 'status_change', 
            user: userRole === 'client' ? 'Cliente Demo' : 'Ana Silva', 
            timestamp: new Date().toISOString(),
            details: `Solicitou ajustes: ${feedback}`
          },
          ...(post.history || [])
        ]
      };
    }));

    if (userRole === 'client') {
      const post = posts.find(p => p.id === id);
      if (post) {
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          clientId: post.clientId,
          postId: post.id,
          type: 'changes_requested',
          message: `Solicitação de ajuste: "${feedback}"`,
          date: new Date().toISOString(),
          read: false
        };
        setNotifications([newNotification, ...notifications]);
      }
    }

    addToast('Solicitação de ajuste enviada.', 'info');
  };

  const handleMarkAsPublished = (id: string) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, status: 'published' } : post
    ));
    addToast('Post marcado como publicado!', 'success');
  };

  const handleDeletePost = (id: string) => {
    setPostToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete));
      addToast('Post excluído com sucesso.', 'success');
      setPostToDelete(null);
    }
  };

  const handleCreateBatch = () => {
    const name = window.prompt('Nome do novo lote (ex: Maio 2026):');
    if (name) {
      const newBatch: Batch = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        clientId: selectedClientId,
        createdAt: new Date().toISOString()
      };
      setBatches(prevBatches => [...prevBatches, newBatch]);
      setSelectedBatchId(newBatch.id);
      addToast(`Lote "${name}" criado com sucesso!`, 'success');
    }
  };

  const handleRenameBatch = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    
    const newName = window.prompt('Novo nome do lote:', batch.name);
    if (newName && newName !== batch.name) {
      setBatches(prevBatches => prevBatches.map(b => b.id === batchId ? { ...b, name: newName } : b));
      addToast('Lote renomeado com sucesso!', 'success');
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    if (confirm('Tem certeza que deseja excluir este lote? Todos os posts associados perderão a referência ao lote.')) {
      setBatches(prevBatches => prevBatches.filter(b => b.id !== batchId));
      setPosts(prevPosts => prevPosts.map(p => p.batchId === batchId ? { ...p, batchId: undefined } : p));
      if (selectedBatchId === batchId) {
        setSelectedBatchId('all');
      }
      addToast('Lote excluído com sucesso.', 'success');
    }
  };

  const handleReset = () => {
    if (confirm('Deseja resetar todas as alterações?')) {
      setPosts(INITIAL_POSTS);
      addToast('Dados resetados para o estado inicial.', 'info');
    }
  };

  const handleSavePost = (savedPost: Post) => {
    if (editingPost) {
      // Update existing post
      setPosts(posts.map(p => p.id === savedPost.id ? savedPost : p));
      addToast('Post atualizado com sucesso!', 'success');
      setEditingPost(null);
    } else {
      // Create new post
      setPosts([savedPost, ...posts]);
      if (savedPost.clientId !== selectedClientId) {
        setSelectedClientId(savedPost.clientId);
        const clientName = clients.find(c => c.id === savedPost.clientId)?.name;
        addToast(`Alternado para ${clientName} para ver o novo post.`, 'info');
      } else {
        addToast('Novo post adicionado ao feed.', 'success');
      }
    }
    setIsNewPostModalOpen(false);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsNewPostModalOpen(true);
  };

  const filteredPosts = posts.filter(post => {
    // Filter by Client
    if (post.clientId !== selectedClientId) return false;

    // Filter by Batch (Agency only)
    if (isAgency && selectedBatchId !== 'all') {
      if (post.batchId !== selectedBatchId) return false;
    }

    // Filter by Month (if in client mode and month is selected)
    if (!isAgency && viewMonth) {
      const postDate = new Date(post.date);
      const postMonth = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}`;
      if (postMonth !== viewMonth) return false;
    }

    // Filter by Status
    if (filter === 'all') return true;
    
    if (filter === 'pending') {
      return ['copy_production', 'copy_sent', 'design_production', 'design_sent', 'scheduling'].includes(post.status);
    }
    if (filter === 'changes_requested') {
      return ['copy_changes', 'design_changes'].includes(post.status);
    }
    if (filter === 'approved') {
      return ['copy_approved', 'design_approved', 'scheduled'].includes(post.status);
    }
    if (filter === 'published') {
      return post.status === 'published';
    }
    
    return false;
  });

  const pendingCount = posts.filter(p => p.clientId === selectedClientId && ['copy_production', 'copy_sent', 'design_production', 'design_sent', 'scheduling'].includes(p.status)).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handlePostNavigation = (postId: string, clientId?: string) => {
    // If clientId is provided, switch to that client
    if (clientId && clientId !== selectedClientId) {
      setSelectedClientId(clientId);
    }

    // Switch to feed view
    setCurrentView('feed');
    
    // Set highlighted post
    setHighlightedPostId(postId);

    // Scroll to post after a brief delay to allow rendering
    setTimeout(() => {
      const element = document.getElementById(`post-${postId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Remove highlight after 3 seconds
        setTimeout(() => setHighlightedPostId(null), 3000);
      }
    }, 300);
  };

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentView}-${selectedClientId}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {currentView === 'calendar' && (
            <CalendarView 
              posts={posts.filter(p => p.clientId === selectedClientId)} 
              onPostClick={(postId) => {
                const post = posts.find(p => p.id === postId);
                if (post) setSelectedPostForDetail(post);
              }}
              onDayClick={isAgency ? (date) => {
                setCalendarNewPostDate(date);
                setEditingPost(null);
                setIsNewPostModalOpen(true);
              } : undefined}
            />
          )}
          {currentView === 'kanban' && (
            <KanbanView 
              posts={posts.filter(p => p.clientId === selectedClientId && (selectedBatchId === 'all' || p.batchId === selectedBatchId))} 
              onPostClick={(post) => setSelectedPostForDetail(post)}
              onStatusChange={handleStatusChange}
              userRole={userRole}
            />
          )}
          {currentView === 'reports' && (
            <ReportsView 
              posts={posts.filter(p => p.clientId === selectedClientId)} 
              batches={batches.filter(b => b.clientId === selectedClientId)}
            />
          )}
          {currentView === 'team' && <TeamView />}
          {currentView === 'notifications' && (
            <NotificationsView 
              notifications={notifications}
              clients={clients}
              onMarkAsRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))}
              onDelete={(id) => setNotifications(notifications.filter(n => n.id !== id))}
              onClearAll={() => setNotifications([])}
              onNotificationClick={(notification) => handlePostNavigation(notification.postId, notification.clientId)}
            />
          )}
          {currentView === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações</h2>
              
              <div className="space-y-6">
                {/* Theme Selector */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Aparência</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Escolha o tema visual do sistema</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(['default', 'dark', 'light'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          theme === t
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-sky-300 hover:bg-sky-50/50 dark:hover:bg-sky-900/10'
                        }`}
                      >
                        {/* Mini preview */}
                        <div className={`w-full h-10 rounded-lg flex items-center gap-1 px-2 ${
                          t === 'default' ? 'bg-gradient-to-r from-indigo-100 to-purple-100' :
                          t === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${ t === 'dark' ? 'bg-sky-400' : 'bg-sky-500'}`} />
                          <div className={`flex-1 h-1.5 rounded ${ t === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`} />
                        </div>
                        <span className={`text-xs font-medium ${ theme === t ? 'text-sky-600 dark:text-sky-400' : 'text-gray-600 dark:text-gray-300'}`}>
                          {{'default': 'Padrão', 'dark': 'Escuro', 'light': 'Claro'}[t]}
                        </span>
                        {theme === t && <Check className="w-3 h-3 text-sky-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Informações da Agência</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SkyFlow Agency v1.0.0</p>
                </div>
              </div>
            </div>
          )}
          {currentView === 'feed' && (
            <>
              {/* Action Banner */}
              {(() => {
                const actionPosts = isAgency
                  ? filteredPosts.filter(p => p.status === 'copy_changes' || p.status === 'design_changes')
                  : filteredPosts.filter(p => p.status === 'copy_sent' || p.status === 'design_sent');
                if (actionPosts.length === 0) return null;
                return (
                  <div className="mb-4 p-3 rounded-xl border border-orange-200 dark:border-orange-800/50 bg-orange-50/70 dark:bg-orange-900/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                        {isAgency
                          ? `${actionPosts.length} post${actionPosts.length > 1 ? 's' : ''} aguardando sua revisão`
                          : `${actionPosts.length} post${actionPosts.length > 1 ? 's' : ''} aguardando sua aprovação`
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {actionPosts.slice(0, 3).map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPostForDetail(p)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors truncate max-w-[120px]"
                        >
                          {p.title || p.platform}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Intro */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {userRole === 'client' && viewMonth 
                    ? `Posts de ${new Date(parseInt(viewMonth.split('-')[0]), parseInt(viewMonth.split('-')[1]) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
                    : 'Feed de Aprovação'
                  }
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {isAgency 
                    ? <span>Gerencie o conteúdo para <span className="font-semibold text-sky-600 dark:text-sky-400">{currentClient.name}</span>.</span>
                    : <span>Revise e aprove o conteúdo planejado para sua marca.</span>
                  }
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-6 mb-8">
                {/* Batch Selector (Agency Only) */}
                {isAgency && (
                  <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full sm:w-fit transition-colors">
                    <div className="hidden sm:flex items-center gap-2 px-3 text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                      <Folder className="w-4 h-4" />
                      <span className="text-sm font-medium">Lotes</span>
                    </div>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="bg-transparent text-sm font-medium text-gray-900 dark:text-gray-100 outline-none cursor-pointer flex-1 sm:flex-none min-w-[120px] sm:min-w-[150px] dark:bg-gray-800"
                    >
                      <option value="all">Todos os Posts</option>
                      {batches
                        .filter(b => b.clientId === selectedClientId)
                        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                        .map(batch => (
                          <option key={batch.id} value={batch.id}>{batch.name}</option>
                        ))}
                    </select>
                    
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      {selectedBatchId !== 'all' && (
                        <>
                          <button 
                            onClick={() => handleRenameBatch(selectedBatchId)}
                            className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                            title="Renomear Lote"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteBatch(selectedBatchId)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Excluir Lote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button 
                        onClick={handleCreateBatch}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span className="hidden sm:inline">Novo</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterButton 
                      active={filter === 'all'} 
                      onClick={() => setFilter('all')}
                      label="Todos"
                      count={posts.filter(p => p.clientId === selectedClientId && (selectedBatchId === 'all' || p.batchId === selectedBatchId)).length}
                    />
                    <FilterButton 
                      active={filter === 'pending'} 
                      onClick={() => setFilter('pending')}
                      label="Pendentes"
                      count={posts.filter(p => p.clientId === selectedClientId && ['copy_production', 'copy_sent', 'design_production', 'design_sent', 'scheduling'].includes(p.status) && (selectedBatchId === 'all' || p.batchId === selectedBatchId)).length}
                      color="sky"
                    />
                    <FilterButton 
                      active={filter === 'approved'} 
                      onClick={() => setFilter('approved')}
                      label="Aprovados"
                      count={posts.filter(p => p.clientId === selectedClientId && ['copy_approved', 'design_approved', 'scheduled'].includes(p.status) && (selectedBatchId === 'all' || p.batchId === selectedBatchId)).length}
                      color="green"
                    />
                    <FilterButton 
                      active={filter === 'changes_requested'} 
                      onClick={() => setFilter('changes_requested')}
                      label="Ajustes"
                      count={posts.filter(p => p.clientId === selectedClientId && ['copy_changes', 'design_changes'].includes(p.status) && (selectedBatchId === 'all' || p.batchId === selectedBatchId)).length}
                      color="orange"
                    />
                    <FilterButton 
                      active={filter === 'published'} 
                      onClick={() => setFilter('published')}
                      label="Publicados"
                      count={posts.filter(p => p.clientId === selectedClientId && p.status === 'published' && (selectedBatchId === 'all' || p.batchId === selectedBatchId)).length}
                      color="sky"
                    />
                  </div>
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <button
                      onClick={() => setViewMode('compact')}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'compact'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      )}
                      title="Visualização compacta"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('full')}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'full'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      )}
                      title="Visualização completa"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Grid */}
              <div className={cn("pb-20", viewMode === 'compact' ? 'space-y-2' : 'space-y-6')}>
                {filteredPosts.length > 0 ? (
                  viewMode === 'compact' ? (
                    filteredPosts.map(post => (
                      <PostCardCompact
                        key={post.id}
                        post={post}
                        onClick={(p) => setSelectedPostForDetail(p)}
                        userRole={userRole}
                        highlighted={highlightedPostId === post.id}
                      />
                    ))
                  ) : (
                  filteredPosts.map(post => (
                    <PostCard
                      key={post.id}
                      id={`post-${post.id}`}
                      post={post}
                      onApprove={handleApprove}
                      onRequestChanges={handleRequestChanges}
                      onImageClick={setSelectedImage}
                      onEdit={handleEditPost}
                      onMarkAsPublished={handleMarkAsPublished}
                      onDelete={handleDeletePost}
                      userRole={userRole}
                      highlighted={highlightedPostId === post.id}
                    />
                  ))
                  )
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ListFilter className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum post encontrado</h3>
                    <p className="text-gray-500 text-sm mt-1">Tente mudar o filtro selecionado ou adicione um novo post.</p>
                    {isAgency && (
                      <button 
                        onClick={() => {
                          setEditingPost(null);
                          setIsNewPostModalOpen(true);
                        }}
                        className="mt-4 text-sky-600 font-medium hover:underline"
                      >
                        Criar primeiro post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 font-sans selection:bg-sky-100 dark:selection:bg-sky-900 flex transition-colors duration-300">
      {/* Mobile FAB for New Post */}
      {isAgency && (
        <button
          onClick={() => {
            setEditingPost(null);
            setIsNewPostModalOpen(true);
          }}
          className="fixed bottom-6 right-6 z-30 lg:hidden w-14 h-14 bg-sky-600 text-white rounded-full shadow-lg shadow-sky-300 dark:shadow-sky-900/50 flex items-center justify-center hover:bg-sky-700 transition-transform active:scale-95"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 fixed h-full z-20 transition-colors duration-300">
        <div className="h-16 flex items-center px-6 border-b border-white/20 dark:border-gray-800/50">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-500">
            <Cloud className="w-6 h-6 fill-current" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SkyFlow</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutGrid className="w-5 h-5" />} 
            label="Feed de Aprovação" 
            active={currentView === 'feed'} 
            onClick={() => setCurrentView('feed')}
          />
          <NavItem 
            icon={<Calendar className="w-5 h-5" />} 
            label="Calendário" 
            active={currentView === 'calendar'} 
            onClick={() => setCurrentView('calendar')}
          />
          {isAgency && (
            <>
              <NavItem 
                icon={<Kanban className="w-5 h-5" />} 
                label="Quadro" 
                active={currentView === 'kanban'} 
                onClick={() => setCurrentView('kanban')}
              />
              <NavItem 
                icon={<BarChart3 className="w-5 h-5" />} 
                label="Relatórios" 
                active={currentView === 'reports'} 
                onClick={() => setCurrentView('reports')}
              />
              <NavItem 
                icon={<Users className="w-5 h-5" />} 
                label="Equipe" 
                active={currentView === 'team'} 
                onClick={() => setCurrentView('team')}
              />
              <NavItem 
                icon={<Bell className="w-5 h-5" />} 
                label="Notificações" 
                active={currentView === 'notifications'} 
                onClick={() => setCurrentView('notifications')}
                badge={unreadNotifications > 0 ? unreadNotifications : undefined}
              />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/20 dark:border-gray-800/50">
          {isAgency && (
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Configurações" 
              active={currentView === 'settings'} 
              onClick={() => setCurrentView('settings')}
            />
          )}
          
          {/* Client Switcher */}
          <div className="mt-4 relative">
            <button 
              onClick={() => isAgency && setIsClientMenuOpen(!isClientMenuOpen)}
              disabled={!isAgency}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-white/20 dark:border-gray-700/50 transition-all group backdrop-blur-sm",
                userRole !== 'client' ? "hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer" : "opacity-75 cursor-default bg-white/30 dark:bg-gray-800/30"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-xs font-bold text-sky-700 shadow-sm">
                {currentClient.avatar}
              </div>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate w-full text-left">{currentClient.name}</span>
                <span className="text-xs text-gray-500 truncate w-full text-left">
                  {isAgency ? 'Mudar cliente' : 'Visualizando como cliente'}
                </span>
              </div>
              {isAgency && (
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-sky-500" />
              )}
            </button>

            <AnimatePresence>
              {isClientMenuOpen && isAgency && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsClientMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 w-full mb-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden z-20"
                  >
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                      {clients.map(client => (
                        <button
                          key={client.id}
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setIsClientMenuOpen(false);
                            addToast(`Cliente alterado para ${client.name}`, 'info');
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            selectedClientId === client.id 
                              ? "bg-sky-50 text-sky-700" 
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            selectedClientId === client.id ? "bg-sky-200 text-sky-800" : "bg-gray-100 text-gray-500"
                          )}>
                            {client.avatar}
                          </div>
                          <span className="flex-1 text-left truncate">{client.name}</span>
                          {selectedClientId === client.id && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="p-2 border-t border-white/20 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                      <button
                        onClick={() => {
                          setIsClientMenuOpen(false);
                          setIsNewClientModalOpen(true);
                        }}
                        disabled={clients.length >= 20}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-100/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Cliente ({clients.length}/20)
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-xl"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sky-600">
                  <Cloud className="w-6 h-6 fill-current" />
                  <span className="text-xl font-bold tracking-tight text-gray-900">SkyFlow</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                <NavItem 
                  icon={<LayoutGrid className="w-5 h-5" />} 
                  label="Feed de Aprovação" 
                  active={currentView === 'feed'} 
                  onClick={() => { setCurrentView('feed'); setSidebarOpen(false); }}
                />
                <NavItem 
                  icon={<Calendar className="w-5 h-5" />} 
                  label="Calendário" 
                  active={currentView === 'calendar'} 
                  onClick={() => { setCurrentView('calendar'); setSidebarOpen(false); }}
                />
                {isAgency && (
                  <>
                    <NavItem 
                      icon={<Kanban className="w-5 h-5" />} 
                      label="Quadro" 
                      active={currentView === 'kanban'} 
                      onClick={() => { setCurrentView('kanban'); setSidebarOpen(false); }}
                    />
                    <NavItem 
                      icon={<BarChart3 className="w-5 h-5" />} 
                      label="Relatórios" 
                      active={currentView === 'reports'} 
                      onClick={() => { setCurrentView('reports'); setSidebarOpen(false); }}
                    />
                    <NavItem 
                      icon={<Users className="w-5 h-5" />} 
                      label="Equipe" 
                      active={currentView === 'team'} 
                      onClick={() => { setCurrentView('team'); setSidebarOpen(false); }}
                    />
                    <NavItem 
                      icon={<Bell className="w-5 h-5" />} 
                      label="Notificações" 
                      active={currentView === 'notifications'} 
                      onClick={() => { setCurrentView('notifications'); setSidebarOpen(false); }}
                      badge={unreadNotifications > 0 ? unreadNotifications : undefined}
                    />
                  </>
                )}
              </nav>
              
              <div className="p-4 border-t border-gray-100">
                {isAgency && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente Ativo</p>
                      <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {clients.length}/20
                      </span>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto mb-2">
                      {clients.map(client => (
                        <button
                          key={client.id}
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setSidebarOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            selectedClientId === client.id 
                              ? "bg-sky-50 text-sky-700" 
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            selectedClientId === client.id ? "bg-sky-200 text-sky-800" : "bg-gray-100 text-gray-500"
                          )}>
                            {client.avatar}
                          </div>
                          <span className="flex-1 text-left truncate">{client.name}</span>
                          {selectedClientId === client.id && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        setIsNewClientModalOpen(true);
                      }}
                      disabled={clients.length >= 20}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-sky-600 border border-dashed border-sky-200 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Cliente
                    </button>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/50 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600">
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-semibold text-gray-900">SkyFlow</span>
            </div>
            
            <div className="hidden lg:block text-sm text-gray-500">
              {isAgency 
                ? <>Gerenciando: <span className="font-medium text-gray-900 dark:text-gray-100">{currentClient.name}</span></>
                : <>Visualizando como: <span className="font-medium text-gray-900 dark:text-gray-100">{currentClient.name}</span></>
              }
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isAgency && (
                <>
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all"
                    title="Gerar Link de Aprovação"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden md:inline">Compartilhar</span>
                  </button>
                  
                  <button 
                    onClick={() => setCurrentView('notifications')}
                    className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex"
                    title="Notificações"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      setEditingPost(null);
                      setIsNewPostModalOpen(true);
                    }}
                    className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-200 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Post</span>
                  </button>
                </>
              )}
              {isAgency && (
                <>
                  <button 
                    onClick={handleReset}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors hidden sm:flex"
                    title="Resetar Demo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  {/* Theme Switcher */}
                  <button
                    onClick={cycleTheme}
                    title={`Tema atual: ${themeLabel[theme]} — Próximo: ${themeNextLabel[theme]}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                      text-gray-600 dark:text-gray-300
                      bg-white/70 dark:bg-gray-800/70
                      border-gray-200 dark:border-gray-700
                      hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400
                      hover:bg-sky-50 dark:hover:bg-sky-900/20
                      backdrop-blur-sm shadow-sm
                    "
                  >
                    {themeIcon[theme]}
                    <span className="hidden sm:inline">{themeLabel[theme]}</span>
                  </button>
                </>
              )}
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-sm text-gray-500 hidden sm:flex">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                {pendingCount} pendentes
              </div>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block" />
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 rounded-full flex items-center justify-center font-bold text-xs">
                  {currentUser.avatar}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{isAgency ? 'Agency' : 'Cliente'}</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <PostDetailModal
        isOpen={!!selectedPostForDetail}
        onClose={() => setSelectedPostForDetail(null)}
        post={selectedPostForDetail}
        userRole={userRole}
        onApprove={handleApprove}
        onRequestChanges={handleRequestChanges}
        onAddComment={handleAddComment}
        onEdit={(post) => {
          setSelectedPostForDetail(null);
          setEditingPost(post);
          setIsNewPostModalOpen(true);
        }}
      />

      {/* New Post Modal */}
      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => {
          setIsNewPostModalOpen(false);
          setEditingPost(null);
          setCalendarNewPostDate(null);
        }}
        onSave={handleSavePost}
        clients={clients}
        batches={batches}
        selectedClientId={selectedClientId}
        post={editingPost}
        defaultDate={calendarNewPostDate || undefined}
        currentUser={currentUser.name}
      />

      {/* New Client Modal */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleAddClient}
      />

      {/* Share Link Modal */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        client={currentClient}
        posts={posts}
        onSimulate={(month) => {
          onRoleChange('client');
          setCurrentView('feed');
          if (month) setViewMonth(month);
          addToast(`Simulando acesso do cliente: ${currentClient.name}`, 'info');
        }}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeletePost}
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
        active 
          ? "text-sky-700 dark:text-sky-400 shadow-sm ring-1 ring-sky-100 dark:ring-sky-900" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      )}
    >
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-gradient-to-r from-sky-50 to-white dark:from-sky-900/20 dark:to-gray-900 opacity-100"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3">
        {icon}
        {label}
      </span>
      {badge !== undefined && (
        <span className="relative z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
          {badge}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-500 dark:bg-sky-400 rounded-r-full"
        />
      )}
    </button>
  );
}

function FilterButton({ 
  active, 
  onClick, 
  label, 
  count,
  color = 'gray' 
}: { 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  count: number;
  color?: 'gray' | 'sky' | 'green' | 'orange';
}) {
  const colorStyles = {
    gray: active ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-gray-900/50" : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-xl",
    sky: active ? "bg-sky-500 text-white shadow-lg shadow-sky-200 dark:shadow-sky-900/50" : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-sky-50/80 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 backdrop-blur-xl",
    green: active ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/50" : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-green-50/80 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 backdrop-blur-xl",
    orange: active ? "bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/50" : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-orange-50/80 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 backdrop-blur-xl",
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent shadow-sm
        ${colorStyles[color]}
        ${!active && "border-white/40 dark:border-gray-700/50"}
      `}
    >
      {label}
      <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-100/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'}`}>
        {count}
      </span>
    </button>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [initialClientId, setInitialClientId] = useState<string | null>(null);
  const [initialViewMonth, setInitialViewMonth] = useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const clientId = params.get('id');
    const month = params.get('month');

    if (mode === 'client' && clientId) {
      const clientExists = CLIENTS.find(c => c.id === clientId);
      if (clientExists) {
        setUserRole('client');
        setIsAuthenticated(true);
        setInitialClientId(clientId);
        if (month) setInitialViewMonth(month);
      }
    }
  }, []);

  const handleLogin = (role: UserRole, clientId?: string) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (clientId) {
      setInitialClientId(clientId);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setInitialClientId(null);
    setInitialViewMonth(null);
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <ToastProvider>
      {isAuthenticated ? (
        <AppContent 
          userRole={userRole} 
          onLogout={handleLogout}
          onRoleChange={handleRoleChange}
          initialClientId={initialClientId}
          initialViewMonth={initialViewMonth}
        />
      ) : (
        <LoginView onLogin={handleLogin} />
      )}
    </ToastProvider>
  );
}
