import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Template } from '@/types';
import { templates } from '@/data/templates';
import { withSuspense } from '@/app/withSuspense';
import { LoyaltyCard } from '@/features/campaigns/components/LoyaltyCard';

const ActiveCardWrapper: React.FC<{ templates: Template[] }> = ({ templates }) => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const template = templates.find(t => t.id === cardId);

  if (!template) return <Navigate to="/campaigns" />;

  return (
    <div className="h-screen w-full bg-background relative flex flex-col items-center justify-center animate-fade-in">
      <button
        onClick={() => navigate('/campaigns')}
        className="absolute top-6 left-6 z-50 bg-black/5 text-foreground rounded-full p-2 hover:bg-black/10 transition-colors backdrop-blur-sm"
        title="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      {withSuspense(
        <LoyaltyCard
          template={template}
          mode="active"
          className="h-full w-full"
        />
      )}
    </div>
  );
};

export default ActiveCardWrapper;
