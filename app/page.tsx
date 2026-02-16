'use client';

import { useEffect, useState } from 'react';

interface Item {
  id: string;
  pipeline: string;
  stage: string;
  title: string;
  created: string;
  updated: string;
  metadata: Record<string, any>;
}

interface Pipeline {
  description: string;
  stages: Array<{
    id: string;
    label: string;
    required_fields: string[];
  }>;
}

interface PipelinesConfig {
  pipelines: Record<string, Pipeline>;
}

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [pipelines, setPipelines] = useState<PipelinesConfig | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('content_pipeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      const nextPipelines = data.pipelines && data.pipelines.pipelines ? data.pipelines : null;
      setPipelines(nextPipelines);
      if (nextPipelines) {
        const keys = Object.keys(nextPipelines.pipelines || {});
        if (keys.length > 0 && !keys.includes(selectedPipeline)) {
          setSelectedPipeline(keys[0]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading Mission Control...</div>
      </div>
    );
  }

  if (!pipelines || !pipelines.pipelines || Object.keys(pipelines.pipelines).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No pipelines configured</div>
      </div>
    );
  }

  const pipeline = pipelines.pipelines[selectedPipeline];
  if (!pipeline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Pipeline not found</div>
      </div>
    );
  }

  const pipelineItems = items.filter(i => i.pipeline === selectedPipeline);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Mission Control</h1>
            <p className="mt-2 text-sm text-gray-600">Marketing & Content Pipeline Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Items</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{pipelineItems.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">In Progress</div>
            <div className="mt-2 text-3xl font-semibold text-blue-600">
              {pipelineItems.filter(i => !['published', 'approved'].includes(i.stage)).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Awaiting Review</div>
            <div className="mt-2 text-3xl font-semibold text-yellow-600">
              {pipelineItems.filter(i => i.stage === 'review').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Published</div>
            <div className="mt-2 text-3xl font-semibold text-green-600">
              {pipelineItems.filter(i => i.stage === 'published').length}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <select
          value={selectedPipeline}
          onChange={(e) => setSelectedPipeline(e.target.value)}
          className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.keys(pipelines.pipelines).map(key => (
            <option key={key} value={key}>{key.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipeline.stages.map(stage => {
            const stageItems = pipelineItems.filter(i => i.stage === stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="bg-gray-100 rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                    <p className="text-sm text-gray-500">{stageItems.length} items</p>
                  </div>
                  <div className="p-4 space-y-3 min-h-[400px]">
                    {stageItems.map(item => {
                      const meta = item.metadata || {};
                      return (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-900 text-sm mb-2">{item.title}</div>
                          <div className="text-xs text-gray-500">
                            <div>ID: {item.id}</div>
                            <div>Updated: {new Date(item.updated).toLocaleDateString()}</div>
                          </div>
                          {Object.keys(meta).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-600">
                                {Object.entries(meta).map(([key, value]) => (
                                  <div key={key}><span className="font-medium">{key}:</span> {String(value)}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {stageItems.length === 0 && (
                      <div className="text-center text-gray-400 text-sm py-8">No items</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
        Last updated: {new Date().toLocaleString()} • Auto-refresh every 30s
      </div>
    </div>
  );
}
