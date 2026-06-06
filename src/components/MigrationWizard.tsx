// Migration Wizard Component for Nexus AI
// Provides a user-friendly interface for migrating localStorage data to Supabase

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { runMigration, previewMigration, MigrationUtility } from '@/lib/migration-utility';
import { MigrationResult } from '@/lib/migration-utility';

interface MigrationWizardProps {
  onComplete?: () => void;
}

export default function MigrationWizard({ onComplete }: MigrationWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'preview' | 'migrating' | 'complete'>('preview');
  const [previewData, setPreviewData] = useState<MigrationResult | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPreview();
    }
  }, [user]);

  const loadPreview = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await previewMigration(user.id);
      setPreviewData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startMigration = async () => {
    if (!user) return;
    
    setStep('migrating');
    setLoading(true);
    setError(null);
    
    try {
      const result = await runMigration(user.id);
      setMigrationResult(result);
      setStep('complete');
    } catch (err: any) {
      setError(err.message);
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    if (!user) return;
    
    MigrationUtility.clearLocalStorageData(user.id);
    onComplete?.();
  };

  const getTotalItems = (data: MigrationResult) => {
    return data.migrated.tasks + data.migrated.notes + data.migrated.calendarEvents + 
           data.migrated.emails + data.migrated.contacts;
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Migration Required</CardTitle>
          <CardDescription>
            Please sign in to migrate your data to the cloud database.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Migration Wizard
          </CardTitle>
          <CardDescription>
            Migrate your local data to our secure cloud database for better performance and accessibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'preview' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Data Preview</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPreview}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>

                {previewData && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{previewData.migrated.tasks}</div>
                      <div className="text-sm text-muted-foreground">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{previewData.migrated.notes}</div>
                      <div className="text-sm text-muted-foreground">Notes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{previewData.migrated.calendarEvents}</div>
                      <div className="text-sm text-muted-foreground">Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{previewData.migrated.emails}</div>
                      <div className="text-sm text-muted-foreground">Emails</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{previewData.migrated.contacts}</div>
                      <div className="text-sm text-muted-foreground">Contacts</div>
                    </div>
                  </div>
                )}

                {previewData && getTotalItems(previewData) === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No data found in localStorage to migrate. Your data may already be in the cloud or you may not have any local data yet.
                    </AlertDescription>
                  </Alert>
                )}

                {previewData && getTotalItems(previewData) > 0 && (
                  <div className="flex gap-2">
                    <Button onClick={startMigration} disabled={loading} className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Start Migration
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 'migrating' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Migrating Your Data</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Please wait while we securely transfer your data to the cloud...
                </div>
                <Progress value={loading ? 50 : 100} className="w-full" />
              </div>
            </div>
          )}

          {step === 'complete' && migrationResult && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">Migration Complete!</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Your data has been successfully migrated to the cloud database.
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{migrationResult.migrated.tasks}</div>
                  <div className="text-sm text-muted-foreground">Tasks Migrated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{migrationResult.migrated.notes}</div>
                  <div className="text-sm text-muted-foreground">Notes Migrated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{migrationResult.migrated.calendarEvents}</div>
                  <div className="text-sm text-muted-foreground">Events Migrated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{migrationResult.migrated.emails}</div>
                  <div className="text-sm text-muted-foreground">Emails Migrated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{migrationResult.migrated.contacts}</div>
                  <div className="text-sm text-muted-foreground">Contacts Migrated</div>
                </div>
              </div>

              {migrationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Some items could not be migrated:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={clearLocalStorage} variant="outline" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Local Data & Continue
                </Button>
                <Button onClick={onComplete} className="flex-1">
                  Continue to App
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Your local data will be preserved until you choose to clear it. 
                  You can always access your migrated data in the cloud, even if you clear local storage.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
