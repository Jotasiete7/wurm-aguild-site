
export interface BaseEntity {
    id: string;
    created_at?: string;
}

export interface ServiceItem extends BaseEntity {
    title: string;
    description: string;
    price: string;
    provider: string;
    type: 'service' | 'material';
    intent: 'buy' | 'sell';
    status: 'open' | 'in_progress';
    assigned_to?: string | null;
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

export interface MapPin extends BaseEntity {
    x: number;
    y: number;
    type: 'resource' | 'infra' | 'project' | 'poi' | 'warning';
    title: string;
    note?: string;
    author: string;
    timestamp: number;
}

export interface Resource {
    id: string;
    name: string;
    type: 'tool' | 'map' | 'sheet' | 'doc' | 'external';
    access: 'public' | 'members' | 'admins';
    url: string;
}
