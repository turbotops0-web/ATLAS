import React from 'react';

export type ViewState = 'landing' | 'saas' | 'admin';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}