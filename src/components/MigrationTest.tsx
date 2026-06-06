// Migration Test Component for Nexus AI
// Tests the migration functionality and Supabase integration

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Play, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { tasksService, notesService, calendarService } from '@/lib/supabase-service';
import { runMigration, previewMigration } from '@/lib/migration-utility';

export default function MigrationTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<{
    supabaseConnection: boolean;
    migrationPreview: boolean;
    dataOperations: boolean;
    errors: string[];
  }>({
    supabaseConnection: false,
    migrationPreview: false,
    dataOperations: false,
    errors: []
  });
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    if (!user) return;
    
    setRunning(true);
    const results = {
      supabaseConnection: false,
      migrationPreview: false,
      dataOperations: false,
      errors: []
    };

    try {
      // Test 1: Supabase Connection
      try {
        await tasksService.getAll();
        results.supabaseConnection = true;
      } catch (error: any) {
        results.errors.push(`Supabase connection failed: ${error.message}`);
      }

      // Test 2: Migration Preview
      try {
        const preview = await previewMigration(user.id);
        results.migrationPreview = true;
      } catch (error: any) {
        results.errors.push(`Migration preview failed: ${error.message}`);
      }

      // Test 3: Data Operations
      try {
        // Test creating a task
        const testTask = await tasksService.create({
          project_id: 'test-project',
          title: 'Migration Test Task',
          description: 'This is a test task created during migration testing',
          status: 'todo',
          priority: 'medium',
          assigned_to: null,
          created_by: user.id,
        });

        // Test creating a note
        const testNote = await notesService.create({
          project_id: 'test-project',
          title: 'Migration Test Note',
          content: 'This is a test note created during migration testing',
          tags: ['test', 'migration'],
          created_by: user.id,
        });

        // Test creating a calendar event
        const testEvent = await calendarService.create({
          title: 'Migration Test Meeting',
          description: 'This is a test meeting created during migration testing',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          attendees: ['test@example.com'],
          created_by: user.id,
          team_id: null,
        });

        // Clean up test data
        await tasksService.delete(testTask.id);
        await notesService.delete(testNote.id);
        await calendarService.delete(testEvent.id);

        results.dataOperations = true;
      } catch (error: any) {
        results.errors.push(`Data operations failed: ${error.message}`);
      }

    } catch (error: any) {
      results.errors.push(`Test execution failed: ${error.message}`);
    }

    setTestResults(results);
    setRunning(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-600">PASS</Badge>
    ) : (
      <Badge variant="destructive">FAIL</Badge>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Migration Test</CardTitle>
          <CardDescription>
            Please sign in to run migration tests.
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
            Migration Test Suite
          </CardTitle>
          <CardDescription>
            Test the migration functionality and Supabase integration to ensure everything is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={runTests}
            disabled={running}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {running ? 'Running Tests...' : 'Run Migration Tests'}
          </Button>

          {testResults.errors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Test Errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {testResults.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.supabaseConnection)}
                <div>
                  <div className="font-medium">Supabase Connection</div>
                  <div className="text-sm text-muted-foreground">
                    Test database connectivity and authentication
                  </div>
                </div>
              </div>
              {getStatusBadge(testResults.supabaseConnection)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.migrationPreview)}
                <div>
                  <div className="font-medium">Migration Preview</div>
                  <div className="text-sm text-muted-foreground">
                    Test migration preview functionality
                  </div>
                </div>
              </div>
              {getStatusBadge(testResults.migrationPreview)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.dataOperations)}
                <div>
                  <div className="font-medium">Data Operations</div>
                  <div className="text-sm text-muted-foreground">
                    Test CRUD operations on tasks, notes, and calendar events
                  </div>
                </div>
              </div>
              {getStatusBadge(testResults.dataOperations)}
            </div>
          </div>

          {testResults.supabaseConnection && testResults.migrationPreview && testResults.dataOperations && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>All tests passed!</strong> Your migration setup is working correctly. 
                You can now proceed with migrating your data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
