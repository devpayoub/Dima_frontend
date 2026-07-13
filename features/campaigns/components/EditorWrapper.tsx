import React from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { Template } from '@/types';
import { templates } from '@/data/templates';
import { isPremiumTier } from '@/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
import { withSuspense } from '@/app/withSuspense';
import { CardEditor } from '@/features/campaigns/CardEditor';

const EditorWrapper: React.FC<{ onSave: (t: Template) => Promise<void>; templates: Template[] }> = ({ onSave, templates: createdTemplates }) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { currentOwner } = useAuth();

  let initialTemplate: Template | undefined;

  if (id === 'new') {
    const baseId = searchParams.get('templateId');
    const baseTemplate = templates.find(t => t.id === baseId);
    initialTemplate = baseTemplate
      ? { ...baseTemplate, backgroundOpacity: 80 }
      : undefined;
    if (!initialTemplate && templates[0]) {
      initialTemplate = { ...templates[0], backgroundOpacity: 80 };
    }
  } else {
    initialTemplate = createdTemplates.find(t => t.id === id);
  }

  if (!initialTemplate) return <Navigate to="/campaigns" />;

  const allowFullDesign = isPremiumTier(currentOwner?.tier);

  return (
    withSuspense(
      <CardEditor
        initialTemplate={initialTemplate}
        onSave={onSave}
        allowFullDesign={allowFullDesign}
      />
    )
  );
};

export default EditorWrapper;
