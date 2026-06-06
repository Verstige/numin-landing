// Migration Page for Nexus AI
// A dedicated page for users to migrate their localStorage data to Supabase

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MigrationWizard from '@/components/MigrationWizard';

export default function MigrationPage() {
  const handleComplete = () => {
    // Redirect to workspace after migration
    window.location.href = '/workspace';
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Data Migration
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Migrate your local data to our secure cloud database for better performance, 
              accessibility, and data persistence across devices.
            </p>
          </div>
        </div>

        <MigrationWizard onComplete={handleComplete} />
      </div>
    </div>
  );
}
