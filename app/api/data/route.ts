import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const MC_DIR = path.join(WORKSPACE, 'mission-control');
const DATA_DIR = path.join(MC_DIR, '.data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');
const CONFIG_DIR = path.join(MC_DIR, 'config');
const PIPELINES_FILE = path.join(CONFIG_DIR, 'pipelines.yaml');

export async function GET() {
  try {
    // Load items
    let items = { items: [] };
    if (fs.existsSync(ITEMS_FILE)) {
      const itemsContent = fs.readFileSync(ITEMS_FILE, 'utf8');
      items = JSON.parse(itemsContent);
    }

    // Load pipelines
    let pipelines = { pipelines: {} };
    if (fs.existsSync(PIPELINES_FILE)) {
      const pipelinesContent = fs.readFileSync(PIPELINES_FILE, 'utf8');
      pipelines = yaml.load(pipelinesContent) as any;
    }

    return NextResponse.json({
      items: items.items,
      pipelines,
    });
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}
