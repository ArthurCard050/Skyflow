import { Post, Client, Batch, UserRole } from '../types';

export const CLIENTS: Client[] = [
  { id: '1', name: 'TechStart Solutions', avatar: 'TS', email: 'contact@techstart.com' },
  { id: '2', name: 'GreenLife Organics', avatar: 'GL', email: 'hello@greenlife.com' },
  { id: '3', name: 'Urban Style', avatar: 'US', email: 'marketing@urbanstyle.com' },
];

export const INITIAL_BATCHES: Batch[] = [
  { id: 'b1', name: 'Campanha Verão 2026', clientId: '1', createdAt: '2026-01-15' },
  { id: 'b2', name: 'Lançamento App v2', clientId: '1', createdAt: '2026-02-01' },
  { id: 'b3', name: 'Dia das Mães', clientId: '2', createdAt: '2026-02-10' },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    clientId: '1',
    batchId: 'b1',
    imageUrl: 'https://picsum.photos/seed/tech1/800/800',
    caption: '🚀 Transforme sua produtividade com nossa nova ferramenta de IA! #TechStart #Inovação #AI',
    status: 'copy_production',
    date: '2026-03-15',
    platform: 'LinkedIn',
    title: 'Lançamento IA Produtividade',
    version: 1,
    commentsCount: 2,
    createdAt: '2026-02-20T10:00:00Z',
    createdBy: 'Ana Silva',
    history: [
      { id: 'h1', type: 'created', user: 'Ana Silva', timestamp: '2026-02-20T10:00:00Z' },
      { id: 'h2', type: 'comment', user: 'Carlos Design', timestamp: '2026-02-21T14:30:00Z', details: 'Preciso do briefing visual.' }
    ]
  },
  {
    id: '2',
    clientId: '1',
    batchId: 'b1',
    imageUrl: 'https://picsum.photos/seed/tech2/800/800',
    caption: 'Descubra como grandes empresas estão economizando 30% em custos operacionais.',
    status: 'design_production',
    date: '2026-03-18',
    platform: 'LinkedIn',
    title: 'Case de Sucesso - Economia',
    version: 2,
    commentsCount: 0,
    createdAt: '2026-02-22T09:15:00Z',
    createdBy: 'Ana Silva',
    history: [
      { id: 'h3', type: 'created', user: 'Ana Silva', timestamp: '2026-02-22T09:15:00Z' },
      { id: 'h4', type: 'status_change', user: 'Ana Silva', timestamp: '2026-02-23T11:00:00Z', details: 'Moveu para Design' }
    ]
  },
  {
    id: '3',
    clientId: '2',
    batchId: 'b3',
    imageUrl: 'https://picsum.photos/seed/green1/800/800',
    caption: 'Sua pele merece o melhor da natureza. Conheça nossa nova linha facial. 🌿✨',
    status: 'copy_sent',
    date: '2026-03-10',
    platform: 'Instagram',
    title: 'Linha Facial Natureza',
    version: 1,
    commentsCount: 1,
    createdAt: '2026-02-25T16:45:00Z',
    createdBy: 'Beatriz Copy',
    history: [
      { id: 'h5', type: 'created', user: 'Beatriz Copy', timestamp: '2026-02-25T16:45:00Z' }
    ]
  },
  {
    id: '4',
    clientId: '2',
    batchId: 'b3',
    imageUrl: 'https://picsum.photos/seed/green2/800/800',
    caption: 'Promoção especial para o Dia das Mães! Compre 2 e leve 3.',
    status: 'design_approved',
    date: '2026-03-12',
    platform: 'Instagram',
    title: 'Promo Dia das Mães',
    version: 3,
    commentsCount: 5,
    createdAt: '2026-02-18T13:20:00Z',
    createdBy: 'Beatriz Copy',
    history: [
      { id: 'h6', type: 'created', user: 'Beatriz Copy', timestamp: '2026-02-18T13:20:00Z' },
      { id: 'h7', type: 'approved', user: 'Cliente Demo', timestamp: '2026-02-28T10:00:00Z', details: 'Aprovado pelo cliente' }
    ]
  },
  {
    id: '5',
    clientId: '3',
    imageUrl: 'https://picsum.photos/seed/urban1/800/800',
    caption: 'Streetwear collection drop tomorrow. Be ready. 🔥',
    status: 'published',
    date: '2026-03-01',
    platform: 'Instagram',
    title: 'Drop Collection Teaser',
    version: 1,
    commentsCount: 12,
    createdAt: '2026-02-10T08:00:00Z',
    createdBy: 'Marcos Social',
    history: [
      { id: 'h8', type: 'created', user: 'Marcos Social', timestamp: '2026-02-10T08:00:00Z' },
      { id: 'h9', type: 'status_change', user: 'Marcos Social', timestamp: '2026-03-01T09:00:00Z', details: 'Publicado' }
    ]
  },
  {
    id: '6',
    clientId: '1',
    batchId: 'b2',
    imageUrl: 'https://picsum.photos/seed/tech3/800/800',
    caption: 'Novas features chegando no app! Fiquem ligados.',
    status: 'copy_changes',
    feedback: 'O tom está muito formal, precisamos de algo mais jovem.',
    date: '2026-03-20',
    platform: 'Facebook',
    title: 'Teaser Novas Features',
    version: 2,
    commentsCount: 3,
    createdAt: '2026-02-26T14:00:00Z',
    createdBy: 'Ana Silva',
    history: [
      { id: 'h10', type: 'created', user: 'Ana Silva', timestamp: '2026-02-26T14:00:00Z' },
      { id: 'h11', type: 'status_change', user: 'Cliente Demo', timestamp: '2026-02-27T15:00:00Z', details: 'Solicitou ajustes: Tom muito formal' }
    ]
  }
];

export const MOCK_USERS = [
  { id: 'u1', name: 'Ana Silva', role: 'admin' as UserRole, avatar: 'AS' },
  { id: 'u2', name: 'Beatriz Copy', role: 'copywriter' as UserRole, avatar: 'BC' },
  { id: 'u3', name: 'Carlos Design', role: 'designer' as UserRole, avatar: 'CD' },
  { id: 'u4', name: 'Daniel Scheduler', role: 'scheduler' as UserRole, avatar: 'DS' },
  { id: 'u5', name: 'Cliente Demo', role: 'client' as UserRole, avatar: 'CL' },
];
