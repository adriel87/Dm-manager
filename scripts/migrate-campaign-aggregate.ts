/**
 * Campaign Aggregate Migration Script
 * 
 * Purpose: Migrates standalone sessions and missions into campaign aggregate structure.
 * 
 * What it does:
 * 1. Creates backups of campaigns, missions, and sessions collections
 * 2. Embeds sessions into campaigns (removes campaignId, generates UUID)
 * 3. Handles missions (leaves campaigns.missions=[], logs mission IDs for manual assignment)
 * 4. Creates GroupSnapshot for campaigns with assigned groups
 * 5. Removes old campaign.groups field
 * 6. Creates indexes for optimized queries
 * 7. Validates migration success
 * 
 * Prerequisites:
 * - MongoDB running on localhost:27017 (or MONGODB_URI set)
 * - Database: dungeon_master (or MONGODB_DB set)
 * - Auth: dungeon_master / dice_roller (or MONGODB_USERNAME/PASSWORD set)
 * 
 * Run: npx tsx scripts/migrate-campaign-aggregate.ts
 */

import { MongoClient, Db, ObjectId } from 'mongodb';
import { randomUUID } from 'crypto';

// ========================================
// Configuration
// ========================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'dungeon_master';
const MONGODB_USERNAME = process.env.MONGODB_USERNAME || 'dungeon_master';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'dice_roller';

const COLLECTION_NAMES = {
  campaigns: 'campaigns',
  missions: 'missions',
  sessions: 'sessions',
  groups: 'groups',
  campaignsBackup: 'campaigns_backup',
  missionsBackup: 'missions_backup',
  sessionsBackup: 'sessions_backup',
};

// ========================================
// Type Definitions (aligned with domain)
// ========================================

interface Session {
  _id: ObjectId;
  campaignId: string;
  title: string;
  notes: string;
  sessionNumber: number;
  date: Date;
}

interface EmbeddedSession {
  id: string; // crypto.randomUUID()
  title: string;
  notes: string;
  sessionNumber: number;
  date: Date;
}

interface Mission {
  _id: ObjectId;
  name: string;
  description: string;
  missionGuide: string;
  missionEvents: Array<{ name: string; difficult: string }> | null;
  missionPriority: string;
  rewards: string | null;
  relatedCharacters: Array<{ id: string; name: string }> | null;
  startDate?: Date;
  endDate?: Date;
  status: 'Activa' | 'Pausada' | 'Finalizada';
}

interface Group {
  _id: ObjectId;
  name: string;
  members: Array<{ id: string; name: string; classType: string }>;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupSnapshot {
  id: string;
  name: string;
  members: Array<{ id: string; name: string; classType: string }>;
  description: string;
  snapshotAt: Date;
}

interface Campaign {
  _id: ObjectId;
  name: string;
  description: string;
  status: 'Activa' | 'Pausada' | 'Finalizada';
  groups?: string[]; // OLD field — to be removed
  missions?: any[]; // NEW field — to be initialized
  sessions?: any[]; // NEW field — to be populated
  characters?: any[]; // NEW field — to be initialized
  group?: GroupSnapshot | null; // NEW field — to be populated
  nextSessionAt?: Date;
  lastSessionAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================================
// Utility Functions
// ========================================

function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(title);
  console.log('='.repeat(60) + '\n');
}

// ========================================
// Migration Steps
// ========================================

async function checkIfAlreadyMigrated(db: Db): Promise<boolean> {
  logSection('Step 1: Check if migration already ran');
  
  const campaignsCollection = db.collection<Campaign>(COLLECTION_NAMES.campaigns);
  const sampleCampaign = await campaignsCollection.findOne({});
  
  if (!sampleCampaign) {
    log('No campaigns found — migration will proceed (no-op)');
    return false;
  }
  
  const alreadyMigrated = 'missions' in sampleCampaign && Array.isArray(sampleCampaign.missions);
  
  if (alreadyMigrated) {
    log('✓ Migration already completed (campaigns have "missions" field)');
    return true;
  }
  
  log('Migration not yet run — proceeding...');
  return false;
}

async function createBackups(db: Db): Promise<void> {
  logSection('Step 2: Create Backups');
  
  const campaignsCollection = db.collection(COLLECTION_NAMES.campaigns);
  const missionsCollection = db.collection(COLLECTION_NAMES.missions);
  const sessionsCollection = db.collection(COLLECTION_NAMES.sessions);
  
  // Backup campaigns
  const campaigns = await campaignsCollection.find({}).toArray();
  if (campaigns.length > 0) {
    await db.collection(COLLECTION_NAMES.campaignsBackup).insertMany(campaigns);
    log(`✓ Backed up ${campaigns.length} campaigns to campaigns_backup`);
  } else {
    log('No campaigns to backup');
  }
  
  // Backup missions
  const missions = await missionsCollection.find({}).toArray();
  if (missions.length > 0) {
    await db.collection(COLLECTION_NAMES.missionsBackup).insertMany(missions);
    log(`✓ Backed up ${missions.length} missions to missions_backup`);
  } else {
    log('No missions to backup');
  }
  
  // Backup sessions
  const sessions = await sessionsCollection.find({}).toArray();
  if (sessions.length > 0) {
    await db.collection(COLLECTION_NAMES.sessionsBackup).insertMany(sessions);
    log(`✓ Backed up ${sessions.length} sessions to sessions_backup`);
  } else {
    log('No sessions to backup');
  }
}

async function embedSessions(db: Db): Promise<void> {
  logSection('Step 3: Embed Sessions into Campaigns');
  
  const campaignsCollection = db.collection<Campaign>(COLLECTION_NAMES.campaigns);
  const sessionsCollection = db.collection<Session>(COLLECTION_NAMES.sessions);
  
  const campaigns = await campaignsCollection.find({}).toArray();
  let totalSessionsEmbedded = 0;
  
  for (const campaign of campaigns) {
    const campaignIdStr = campaign._id.toString();
    
    // Find all sessions for this campaign
    const sessions = await sessionsCollection.find({ campaignId: campaignIdStr }).toArray();
    
    if (sessions.length === 0) {
      log(`Campaign "${campaign.name}" has no sessions — initializing empty array`);
      await campaignsCollection.updateOne(
        { _id: campaign._id },
        { $set: { sessions: [] } }
      );
      continue;
    }
    
    // Convert to embedded sessions (remove campaignId, generate UUID)
    const embeddedSessions: EmbeddedSession[] = sessions.map(session => ({
      id: randomUUID(),
      title: session.title,
      notes: session.notes,
      sessionNumber: session.sessionNumber,
      date: session.date,
    }));
    
    // Update campaign with embedded sessions
    await campaignsCollection.updateOne(
      { _id: campaign._id },
      { $set: { sessions: embeddedSessions } }
    );
    
    totalSessionsEmbedded += embeddedSessions.length;
    log(`✓ Embedded ${embeddedSessions.length} sessions into campaign "${campaign.name}"`);
  }
  
  log(`\n✓ Total sessions embedded: ${totalSessionsEmbedded}`);
}

async function handleMissions(db: Db): Promise<string[]> {
  logSection('Step 4: Handle Missions (Manual Assignment Required)');
  
  const campaignsCollection = db.collection<Campaign>(COLLECTION_NAMES.campaigns);
  const missionsCollection = db.collection<Mission>(COLLECTION_NAMES.missions);
  
  const campaigns = await campaignsCollection.find({}).toArray();
  const allMissions = await missionsCollection.find({}).toArray();
  
  // Initialize missions=[] for all campaigns
  for (const campaign of campaigns) {
    await campaignsCollection.updateOne(
      { _id: campaign._id },
      { $set: { missions: [] } }
    );
  }
  
  log(`✓ Initialized missions=[] for ${campaigns.length} campaigns`);
  
  // Log all mission IDs for manual assignment
  const missionIds = allMissions.map(m => m._id.toString());
  
  if (missionIds.length > 0) {
    log('\n⚠️  WARNING: The following missions need MANUAL ASSIGNMENT to campaigns:');
    log('Mission IDs requiring assignment:', missionIds);
    log('\nThese missions were standalone entities with no campaignId reference.');
    log('You must assign them to campaigns manually via the UI or API.');
  } else {
    log('No standalone missions found — nothing to assign');
  }
  
  return missionIds;
}

async function createGroupSnapshots(db: Db): Promise<void> {
  logSection('Step 5: Create Group Snapshots');
  
  const campaignsCollection = db.collection<Campaign>(COLLECTION_NAMES.campaigns);
  const groupsCollection = db.collection<Group>(COLLECTION_NAMES.groups);
  
  const campaigns = await campaignsCollection.find({}).toArray();
  let snapshotsCreated = 0;
  
  for (const campaign of campaigns) {
    // Check if campaign has old groups field (array of IDs)
    const oldGroupIds = campaign.groups;
    
    if (!oldGroupIds || !Array.isArray(oldGroupIds) || oldGroupIds.length === 0) {
      // No group assigned — set group to null
      await campaignsCollection.updateOne(
        { _id: campaign._id },
        { $set: { group: null } }
      );
      log(`Campaign "${campaign.name}" has no group — set to null`);
      continue;
    }
    
    // Get the first group ID (campaigns only have one group in aggregate model)
    const groupIdStr = oldGroupIds[0];
    let groupObjectId: ObjectId;
    
    try {
      groupObjectId = new ObjectId(groupIdStr);
    } catch (error) {
      log(`⚠️  Invalid group ID "${groupIdStr}" for campaign "${campaign.name}" — skipping`);
      await campaignsCollection.updateOne(
        { _id: campaign._id },
        { $set: { group: null } }
      );
      continue;
    }
    
    // Fetch full group document
    const group = await groupsCollection.findOne({ _id: groupObjectId });
    
    if (!group) {
      log(`⚠️  Group "${groupIdStr}" not found for campaign "${campaign.name}" — setting to null`);
      await campaignsCollection.updateOne(
        { _id: campaign._id },
        { $set: { group: null } }
      );
      continue;
    }
    
    // Build GroupSnapshot
    const groupSnapshot: GroupSnapshot = {
      id: group._id.toString(),
      name: group.name,
      members: group.members,
      description: group.description,
      snapshotAt: new Date(),
    };
    
    // Update campaign with group snapshot
    await campaignsCollection.updateOne(
      { _id: campaign._id },
      { $set: { group: groupSnapshot } }
    );
    
    snapshotsCreated++;
    log(`✓ Created group snapshot for campaign "${campaign.name}" (group: "${group.name}")`);
  }
  
  log(`\n✓ Total group snapshots created: ${snapshotsCreated}`);
}

async function cleanupOldFields(db: Db): Promise<void> {
  logSection('Step 6: Cleanup Old Fields');
  
  const campaignsCollection = db.collection<Campaign>(COLLECTION_NAMES.campaigns);
  
  // Remove old 'groups' field (array of IDs — replaced by 'group' snapshot)
  const result = await campaignsCollection.updateMany(
    {},
    { $unset: { groups: "" } }
  );
  
  log(`✓ Removed old "groups" field from ${result.modifiedCount} campaigns`);
}

async function initializeCharacters(db: Db): Promise<void> {
  logSection('Step 7: Initialize Characters Array');
  
  const campaignsCollection = db.collection<Campaign>(COLLECTION_NAMES.campaigns);
  
  // Initialize characters=[] for all campaigns
  const result = await campaignsCollection.updateMany(
    {},
    { $set: { characters: [] } }
  );
  
  log(`✓ Initialized characters=[] for ${result.modifiedCount} campaigns`);
  log('Note: Character references must be added via API after migration');
}

async function createIndexes(db: Db): Promise<void> {
  logSection('Step 8: Create Indexes');
  
  const campaignsCollection = db.collection(COLLECTION_NAMES.campaigns);
  
  // Create indexes one by one to avoid union type issues
  try {
    await campaignsCollection.createIndex({ status: 1 }, { name: 'idx_status' });
    log('✓ Created index: idx_status');
  } catch (error: any) {
    if (error.code === 85) log('Index "idx_status" already exists — skipping');
    else throw error;
  }
  
  try {
    await campaignsCollection.createIndex({ 'missions.id': 1 }, { name: 'idx_missions_id' });
    log('✓ Created index: idx_missions_id');
  } catch (error: any) {
    if (error.code === 85) log('Index "idx_missions_id" already exists — skipping');
    else throw error;
  }
  
  try {
    await campaignsCollection.createIndex({ 'sessions.id': 1 }, { name: 'idx_sessions_id' });
    log('✓ Created index: idx_sessions_id');
  } catch (error: any) {
    if (error.code === 85) log('Index "idx_sessions_id" already exists — skipping');
    else throw error;
  }
  
  try {
    await campaignsCollection.createIndex({ 'characters.id': 1 }, { name: 'idx_characters_id' });
    log('✓ Created index: idx_characters_id');
  } catch (error: any) {
    if (error.code === 85) log('Index "idx_characters_id" already exists — skipping');
    else throw error;
  }
  
  try {
    await campaignsCollection.createIndex({ 'group.id': 1 }, { name: 'idx_group_id' });
    log('✓ Created index: idx_group_id');
  } catch (error: any) {
    if (error.code === 85) log('Index "idx_group_id" already exists — skipping');
    else throw error;
  }
  
  try {
    await campaignsCollection.createIndex({ lastSessionAt: -1 }, { name: 'idx_lastSessionAt_desc' });
    log('✓ Created index: idx_lastSessionAt_desc');
  } catch (error: any) {
    if (error.code === 85) log('Index "idx_lastSessionAt_desc" already exists — skipping');
    else throw error;
  }
  
  try {
    await campaignsCollection.createIndex({ nextSessionAt: 1 }, { name: 'idx_nextSessionAt_asc' });
    log('✓ Created index: idx_nextSessionAt_asc');
  } catch (error: any) {
    if (error.code === 85) log('Index "idx_nextSessionAt_asc" already exists — skipping');
    else throw error;
  }
}

async function validateMigration(db: Db): Promise<void> {
  logSection('Step 9: Validate Migration');
  
  const campaignsCollection = db.collection<Campaign>(COLLECTION_NAMES.campaigns);
  const campaigns = await campaignsCollection.find({}).toArray();
  
  let validationErrors: string[] = [];
  
  for (const campaign of campaigns) {
    // Check required fields exist
    if (!('missions' in campaign) || !Array.isArray(campaign.missions)) {
      validationErrors.push(`Campaign "${campaign.name}" missing "missions" field`);
    }
    
    if (!('sessions' in campaign) || !Array.isArray(campaign.sessions)) {
      validationErrors.push(`Campaign "${campaign.name}" missing "sessions" field`);
    }
    
    if (!('characters' in campaign) || !Array.isArray(campaign.characters)) {
      validationErrors.push(`Campaign "${campaign.name}" missing "characters" field`);
    }
    
    if (!('group' in campaign)) {
      validationErrors.push(`Campaign "${campaign.name}" missing "group" field`);
    }
    
    // Check that old 'groups' field is removed
    if ('groups' in campaign) {
      validationErrors.push(`Campaign "${campaign.name}" still has old "groups" field`);
    }
  }
  
  if (validationErrors.length > 0) {
    log('❌ VALIDATION FAILED:');
    validationErrors.forEach(err => log(`  - ${err}`));
    throw new Error('Migration validation failed');
  }
  
  log(`✓ All ${campaigns.length} campaigns validated successfully`);
  log('✓ Migration structure is correct');
}

// ========================================
// Main Migration Flow
// ========================================

async function migrate() {
  let client: MongoClient | null = null;
  
  try {
    logSection('Campaign Aggregate Migration');
    log('Connecting to MongoDB...');
    log(`URI: ${MONGODB_URI}`);
    log(`Database: ${MONGODB_DB}`);
    
    client = new MongoClient(MONGODB_URI, {
      auth: { username: MONGODB_USERNAME, password: MONGODB_PASSWORD },
    });
    
    await client.connect();
    const db = client.db(MONGODB_DB);
    log('✓ Connected to MongoDB\n');
    
    // Step 1: Check if already migrated
    const alreadyMigrated = await checkIfAlreadyMigrated(db);
    if (alreadyMigrated) {
      log('\n✓ Migration already completed — exiting');
      return;
    }
    
    // Step 2: Create backups
    await createBackups(db);
    
    // Step 3: Embed sessions
    await embedSessions(db);
    
    // Step 4: Handle missions (manual assignment required)
    const orphanMissionIds = await handleMissions(db);
    
    // Step 5: Create group snapshots
    await createGroupSnapshots(db);
    
    // Step 6: Cleanup old fields
    await cleanupOldFields(db);
    
    // Step 7: Initialize characters
    await initializeCharacters(db);
    
    // Step 8: Create indexes
    await createIndexes(db);
    
    // Step 9: Validate migration
    await validateMigration(db);
    
    // Final summary
    logSection('Migration Complete');
    log('✓ All steps completed successfully');
    
    if (orphanMissionIds.length > 0) {
      log('\n⚠️  ACTION REQUIRED:');
      log(`${orphanMissionIds.length} missions need manual assignment to campaigns`);
      log('Mission IDs:', orphanMissionIds);
    }
    
    log('\nNext steps:');
    log('1. Verify campaign data via API: GET /api/campaign');
    log('2. Manually assign orphan missions to campaigns (if any)');
    log('3. Add character references to campaigns via API');
    log('4. After 2-week deprecation period, delete old mission/session collections and routes');
    
  } catch (error) {
    logSection('Migration Failed');
    console.error('Error during migration:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      log('\nDisconnected from MongoDB');
    }
  }
}

// ========================================
// Execute Migration
// ========================================

migrate()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
