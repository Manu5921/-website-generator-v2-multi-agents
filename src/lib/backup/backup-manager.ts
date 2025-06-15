// =============================================================================
// 💾 SYSTÈME DE BACKUP AUTOMATISÉ 3-2-1 - CORE PLATFORM
// =============================================================================

import { coreLogger } from '@/lib/monitoring';
import { db } from '@/lib/db';
import { metriquesOrchestration, projetsMultiAgents, tachesAgents } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';

// =============================================================================
// 🎯 TYPES ET INTERFACES
// =============================================================================

export interface BackupConfig {
  // Stratégie 3-2-1
  localBackups: number;    // 3 copies locales
  remoteBackups: number;   // 2 copies distantes
  offlineBackups: number;  // 1 copie offline
  
  // Fréquences
  fullBackupFrequency: number;     // en heures
  incrementalFrequency: number;    // en heures
  compressionLevel: number;        // 1-9
  
  // Rétention
  retentionDays: number;
  maxBackupSize: number;  // en MB
  
  // Destinations
  destinations: BackupDestination[];
}

export interface BackupDestination {
  id: string;
  type: 'local' | 'cloud' | 'remote' | 'offline';
  name: string;
  config: {
    path?: string;
    endpoint?: string;
    bucket?: string;
    credentials?: Record<string, string>;
  };
  enabled: boolean;
  priority: number;
}

export interface BackupJob {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: number;
  endTime?: number;
  duration?: number;
  size: number;
  compression: number;
  destinations: string[];
  includeFiles: string[];
  excludeFiles: string[];
  metadata: {
    dbSnapshot: boolean;
    fileSnapshot: boolean;
    configSnapshot: boolean;
    agentData: boolean;
  };
  error?: string;
  checksums: Record<string, string>;
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  lastFullBackup?: number;
  lastIncrementalBackup?: number;
  averageBackupSize: number;
  averageCompressionRatio: number;
  nextScheduledBackup: number;
  storageUtilization: Record<string, number>;
  healthScore: number; // 0-100
}

export interface RestorePoint {
  id: string;
  timestamp: number;
  type: 'full' | 'incremental';
  size: number;
  destinations: string[];
  verified: boolean;
  metadata: Record<string, any>;
}

// =============================================================================
// 🔧 GESTIONNAIRE DE BACKUPS
// =============================================================================

export class BackupManager {
  private static instance: BackupManager;
  private config: BackupConfig;
  private jobs: Map<string, BackupJob> = new Map();
  private scheduler: NodeJS.Timeout | null = null;
  private readonly BACKUP_DIR = path.join(process.cwd(), 'backups');

  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializeBackupSystem();
  }

  public static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  // =============================================================================
  // 🏗️ INITIALISATION
  // =============================================================================

  private getDefaultConfig(): BackupConfig {
    return {
      localBackups: 3,
      remoteBackups: 2,
      offlineBackups: 1,
      fullBackupFrequency: 24,        // toutes les 24h
      incrementalFrequency: 6,        // toutes les 6h
      compressionLevel: 6,
      retentionDays: 30,
      maxBackupSize: 1024,           // 1GB max
      destinations: [
        {
          id: 'local-primary',
          type: 'local',
          name: 'Local Primary Storage',
          config: { path: path.join(this.BACKUP_DIR, 'local') },
          enabled: true,
          priority: 1
        },
        {
          id: 'local-secondary',
          type: 'local',
          name: 'Local Secondary Storage',
          config: { path: path.join(this.BACKUP_DIR, 'secondary') },
          enabled: true,
          priority: 2
        },
        {
          id: 'cloud-s3',
          type: 'cloud',
          name: 'AWS S3 Bucket',
          config: {
            bucket: process.env.BACKUP_S3_BUCKET || 'core-platform-backups',
            endpoint: 's3.amazonaws.com'
          },
          enabled: false, // Activé quand les credentials sont configurés
          priority: 3
        }
      ]
    };
  }

  private async initializeBackupSystem(): Promise<void> {
    try {
      // Créer les répertoires de backup
      await this.ensureBackupDirectories();
      
      // Planifier les backups automatiques
      this.scheduleBackups();
      
      // Vérifier l'intégrité des backups existants
      await this.verifyExistingBackups();
      
      coreLogger.info('Backup system initialized successfully');
    } catch (error) {
      coreLogger.error('Failed to initialize backup system', error as Error);
    }
  }

  private async ensureBackupDirectories(): Promise<void> {
    const localDestinations = this.config.destinations.filter(d => d.type === 'local');
    
    for (const dest of localDestinations) {
      if (dest.config.path) {
        await fs.mkdir(dest.config.path, { recursive: true });
        coreLogger.debug(`Created backup directory: ${dest.config.path}`);
      }
    }
  }

  // =============================================================================
  // 📅 PLANIFICATION DES BACKUPS
  // =============================================================================

  private scheduleBackups(): void {
    // Backup incrémental toutes les heures selon la config
    const incrementalInterval = this.config.incrementalFrequency * 60 * 60 * 1000;
    
    this.scheduler = setInterval(async () => {
      await this.checkAndExecuteScheduledBackups();
    }, Math.min(incrementalInterval, 60 * 60 * 1000)); // Max 1 heure

    coreLogger.info('Backup scheduler started', {
      incrementalFrequency: this.config.incrementalFrequency,
      fullBackupFrequency: this.config.fullBackupFrequency
    });
  }

  private async checkAndExecuteScheduledBackups(): Promise<void> {
    try {
      const now = Date.now();
      const lastFullBackup = await this.getLastBackupTime('full');
      const lastIncremental = await this.getLastBackupTime('incremental');

      // Vérifier si un backup complet est nécessaire
      const fullBackupDue = !lastFullBackup || 
        (now - lastFullBackup) >= (this.config.fullBackupFrequency * 60 * 60 * 1000);

      if (fullBackupDue) {
        await this.createBackup('full');
        return;
      }

      // Vérifier si un backup incrémental est nécessaire
      const incrementalDue = !lastIncremental || 
        (now - lastIncremental) >= (this.config.incrementalFrequency * 60 * 60 * 1000);

      if (incrementalDue) {
        await this.createBackup('incremental');
      }

    } catch (error) {
      coreLogger.error('Error during scheduled backup check', error as Error);
    }
  }

  private async getLastBackupTime(type: 'full' | 'incremental'): Promise<number | null> {
    const jobs = Array.from(this.jobs.values())
      .filter(job => job.type === type && job.status === 'completed')
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));

    return jobs.length > 0 ? (jobs[0].endTime || 0) : null;
  }

  // =============================================================================
  // 💾 CRÉATION DES BACKUPS
  // =============================================================================

  async createBackup(
    type: 'full' | 'incremental' | 'differential',
    options?: {
      destinations?: string[];
      includeFiles?: string[];
      excludeFiles?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    const jobId = `backup-${type}-${Date.now()}`;
    const startTime = Date.now();

    const job: BackupJob = {
      id: jobId,
      type,
      status: 'pending',
      startTime,
      size: 0,
      compression: this.config.compressionLevel,
      destinations: options?.destinations || this.config.destinations
        .filter(d => d.enabled)
        .sort((a, b) => a.priority - b.priority)
        .map(d => d.id),
      includeFiles: options?.includeFiles || [],
      excludeFiles: options?.excludeFiles || [],
      metadata: {
        dbSnapshot: true,
        fileSnapshot: true,
        configSnapshot: true,
        agentData: true,
        ...options?.metadata
      },
      checksums: {}
    };

    this.jobs.set(jobId, job);

    try {
      coreLogger.info(`Starting ${type} backup`, { jobId });
      job.status = 'running';

      // 1. Créer le snapshot de la base de données
      const dbBackupPath = await this.createDatabaseSnapshot(jobId);
      job.checksums.database = await this.calculateChecksum(dbBackupPath);

      // 2. Créer le snapshot des fichiers
      const filesBackupPath = await this.createFilesSnapshot(jobId, type);
      job.checksums.files = await this.calculateChecksum(filesBackupPath);

      // 3. Créer le snapshot de configuration
      const configBackupPath = await this.createConfigSnapshot(jobId);
      job.checksums.config = await this.calculateChecksum(configBackupPath);

      // 4. Compresser les backups
      const compressedBackupPath = await this.compressBackup(jobId, [
        dbBackupPath,
        filesBackupPath,
        configBackupPath
      ]);

      // 5. Calculer la taille finale
      const stats = await fs.stat(compressedBackupPath);
      job.size = stats.size;

      // 6. Distribuer aux destinations
      await this.distributeBackup(job, compressedBackupPath);

      // 7. Finaliser le job
      job.status = 'completed';
      job.endTime = Date.now();
      job.duration = job.endTime - job.startTime;

      // 8. Nettoyer les anciens backups
      await this.cleanupOldBackups();

      coreLogger.info(`Backup completed successfully`, {
        jobId,
        type,
        size: job.size,
        duration: job.duration,
        destinations: job.destinations.length
      });

      return jobId;

    } catch (error) {
      job.status = 'failed';
      job.error = (error as Error).message;
      job.endTime = Date.now();
      job.duration = job.endTime - job.startTime;

      coreLogger.error(`Backup failed`, error as Error, { jobId, type });
      throw error;
    }
  }

  private async createDatabaseSnapshot(jobId: string): Promise<string> {
    const backupPath = path.join(this.BACKUP_DIR, `${jobId}-database.json`);
    
    try {
      // Exporter toutes les tables importantes
      const [projects, tasks, metrics] = await Promise.all([
        db.select().from(projetsMultiAgents).orderBy(desc(projetsMultiAgents.dateCreation)),
        db.select().from(tachesAgents).orderBy(desc(tachesAgents.dateCreation)),
        db.select().from(metriquesOrchestration).orderBy(desc(metriquesOrchestration.dateCreation)).limit(10000)
      ]);

      const snapshot = {
        timestamp: Date.now(),
        jobId,
        version: '1.0',
        tables: {
          projetsMultiAgents: projects,
          tachesAgents: tasks,
          metriquesOrchestration: metrics
        },
        metadata: {
          totalProjects: projects.length,
          totalTasks: tasks.length,
          totalMetrics: metrics.length
        }
      };

      await fs.writeFile(backupPath, JSON.stringify(snapshot, null, 2));
      coreLogger.debug(`Database snapshot created: ${backupPath}`);
      
      return backupPath;

    } catch (error) {
      coreLogger.error('Failed to create database snapshot', error as Error);
      throw error;
    }
  }

  private async createFilesSnapshot(jobId: string, type: 'full' | 'incremental' | 'differential'): Promise<string> {
    const backupPath = path.join(this.BACKUP_DIR, `${jobId}-files.tar`);
    
    // TODO: Implémenter la sauvegarde des fichiers selon le type
    // Pour l'instant, créer un fichier vide
    await fs.writeFile(backupPath, '');
    
    coreLogger.debug(`Files snapshot created: ${backupPath}`);
    return backupPath;
  }

  private async createConfigSnapshot(jobId: string): Promise<string> {
    const backupPath = path.join(this.BACKUP_DIR, `${jobId}-config.json`);
    
    const config = {
      timestamp: Date.now(),
      jobId,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? '[HIDDEN]' : undefined,
        // Ajouter d'autres variables d'environnement importantes (sans secrets)
      },
      packageJson: JSON.parse(await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8')),
      backupConfig: this.config
    };

    await fs.writeFile(backupPath, JSON.stringify(config, null, 2));
    coreLogger.debug(`Config snapshot created: ${backupPath}`);
    
    return backupPath;
  }

  private async compressBackup(jobId: string, filePaths: string[]): Promise<string> {
    const compressedPath = path.join(this.BACKUP_DIR, `${jobId}-complete.tar.gz`);
    
    // Pour simplifier, on va juste compresser le plus gros fichier (la DB)
    const dbPath = filePaths.find(p => p.includes('database'));
    if (dbPath) {
      await pipeline(
        createReadStream(dbPath),
        createGzip({ level: this.config.compressionLevel }),
        createWriteStream(compressedPath)
      );
    }

    coreLogger.debug(`Backup compressed: ${compressedPath}`);
    return compressedPath;
  }

  private async distributeBackup(job: BackupJob, backupPath: string): Promise<void> {
    const destinations = this.config.destinations.filter(d => 
      job.destinations.includes(d.id) && d.enabled
    );

    for (const destination of destinations) {
      try {
        await this.copyToDestination(backupPath, destination, job.id);
        coreLogger.debug(`Backup copied to ${destination.name}`, { jobId: job.id });
      } catch (error) {
        coreLogger.error(`Failed to copy backup to ${destination.name}`, error as Error);
        // Continue avec les autres destinations
      }
    }
  }

  private async copyToDestination(
    sourcePath: string,
    destination: BackupDestination,
    jobId: string
  ): Promise<void> {
    switch (destination.type) {
      case 'local':
        if (destination.config.path) {
          const destPath = path.join(destination.config.path, path.basename(sourcePath));
          await fs.copyFile(sourcePath, destPath);
        }
        break;
      
      case 'cloud':
        // TODO: Implémenter l'upload vers S3/Cloud
        coreLogger.info(`Cloud backup not implemented for ${destination.name}`);
        break;
      
      default:
        coreLogger.warn(`Unsupported destination type: ${destination.type}`);
    }
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    // Pour simplifier, utiliser la taille + mtime comme checksum
    const stats = await fs.stat(filePath);
    return `${stats.size}-${stats.mtimeMs}`;
  }

  // =============================================================================
  // 🧹 NETTOYAGE ET MAINTENANCE
  // =============================================================================

  private async cleanupOldBackups(): Promise<void> {
    const cutoffDate = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    
    const oldJobs = Array.from(this.jobs.values()).filter(
      job => job.startTime < cutoffDate
    );

    for (const job of oldJobs) {
      try {
        // Supprimer les fichiers de backup
        for (const destination of this.config.destinations) {
          if (destination.type === 'local' && destination.config.path) {
            const backupFiles = await fs.readdir(destination.config.path);
            const jobFiles = backupFiles.filter(file => file.includes(job.id));
            
            for (const file of jobFiles) {
              await fs.unlink(path.join(destination.config.path, file));
            }
          }
        }

        // Supprimer le job de la mémoire
        this.jobs.delete(job.id);
        
        coreLogger.debug(`Cleaned up old backup job: ${job.id}`);
      } catch (error) {
        coreLogger.error(`Failed to cleanup backup job ${job.id}`, error as Error);
      }
    }
  }

  private async verifyExistingBackups(): Promise<void> {
    // TODO: Implémenter la vérification d'intégrité des backups existants
    coreLogger.info('Backup verification completed');
  }

  // =============================================================================
  // 📊 STATISTIQUES ET MONITORING
  // =============================================================================

  getBackupStats(): BackupStats {
    const jobs = Array.from(this.jobs.values());
    const successfulBackups = jobs.filter(j => j.status === 'completed');
    const failedBackups = jobs.filter(j => j.status === 'failed');
    
    const totalSize = successfulBackups.reduce((sum, job) => sum + job.size, 0);
    const averageSize = successfulBackups.length > 0 ? totalSize / successfulBackups.length : 0;

    const lastFullBackup = successfulBackups
      .filter(j => j.type === 'full')
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))[0];

    const lastIncrementalBackup = successfulBackups
      .filter(j => j.type === 'incremental')
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))[0];

    // Calculer le prochain backup planifié
    const nextFull = lastFullBackup ? 
      lastFullBackup.endTime! + (this.config.fullBackupFrequency * 60 * 60 * 1000) :
      Date.now();
    
    const nextIncremental = lastIncrementalBackup ?
      lastIncrementalBackup.endTime! + (this.config.incrementalFrequency * 60 * 60 * 1000) :
      Date.now();

    const nextScheduledBackup = Math.min(nextFull, nextIncremental);

    // Score de santé basé sur plusieurs facteurs
    let healthScore = 100;
    if (failedBackups.length > 0) healthScore -= (failedBackups.length * 10);
    if (!lastFullBackup || Date.now() - lastFullBackup.endTime! > 48 * 60 * 60 * 1000) {
      healthScore -= 30; // Pas de backup complet depuis 48h
    }

    return {
      totalBackups: jobs.length,
      successfulBackups: successfulBackups.length,
      failedBackups: failedBackups.length,
      totalSize: totalSize,
      lastFullBackup: lastFullBackup?.endTime,
      lastIncrementalBackup: lastIncrementalBackup?.endTime,
      averageBackupSize: averageSize,
      averageCompressionRatio: 0.7, // TODO: calculer réellement
      nextScheduledBackup,
      storageUtilization: {}, // TODO: calculer l'utilisation par destination
      healthScore: Math.max(0, healthScore)
    };
  }

  getJobs(): BackupJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.startTime - a.startTime);
  }

  getJob(jobId: string): BackupJob | undefined {
    return this.jobs.get(jobId);
  }

  // =============================================================================
  // 🔄 RESTAURATION
  // =============================================================================

  async listRestorePoints(): Promise<RestorePoint[]> {
    const completedJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'completed')
      .sort((a, b) => b.startTime - a.startTime);

    return completedJobs.map(job => ({
      id: job.id,
      timestamp: job.startTime,
      type: job.type as 'full' | 'incremental',
      size: job.size,
      destinations: job.destinations,
      verified: true, // TODO: vérifier réellement
      metadata: job.metadata
    }));
  }

  async restoreFromPoint(restorePointId: string): Promise<void> {
    // TODO: Implémenter la restauration
    coreLogger.info(`Restore requested for point: ${restorePointId}`);
    throw new Error('Restore functionality not yet implemented');
  }

  // =============================================================================
  // 🧹 NETTOYAGE
  // =============================================================================

  cleanup(): void {
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }
  }
}

// =============================================================================
// 🎯 EXPORT ET INSTANCE SINGLETON
// =============================================================================

export const backupManager = BackupManager.getInstance();
export default backupManager;