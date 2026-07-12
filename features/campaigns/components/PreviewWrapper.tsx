import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { templates } from '@/data/templates';
import { withSuspense } from '@/app/withSuspense';
import { LoyaltyCard } from '@/features/campaigns/components/LoyaltyCard';

const PreviewWrapper: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = templates.find(t => t.id === templateId);

  if (!template) return <Navigate to="/gallery" />;

  return (
    <div className="h-screen w-full">
      {withSuspense(
        <LoyaltyCard
          template={template}
          mode="preview"
          onBack={() => navigate('/gallery')}
          onCreate={() => navigate(`/editor/new?templateId=${templateId}`)}
          className="h-full w-full"
        />
      )}
    </div>
  );
};

export default PreviewWrapper;
