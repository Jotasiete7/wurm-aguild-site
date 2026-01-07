
export interface ServiceItem {
    id: string;
    title: string;
    description: string;
    price: string;
    provider: string; // Nickname
    type: 'service' | 'material';
    intent: 'buy' | 'sell';
    status: 'open' | 'in_progress';
    assignedTo?: string; // Nick of who is working on it
}

export interface Message {
    id: string;
    author: string;
    content: string;
    timestamp: string;
}

export interface DownloadItem {
    id: string;
    name: string;
    url: string;
    description: string;
}

export type UserRole = 'operator' | 'cartographer' | 'member';

export interface MapPin {
    id: string;
    x: number;
    y: number;
    type: 'resource' | 'infra' | 'project' | 'poi' | 'warning';
    title: string;
    note?: string;
    author: string;
    timestamp: number;
}
