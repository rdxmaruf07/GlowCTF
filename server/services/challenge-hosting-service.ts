import Docker from 'dockerode';
import path from 'path';
import fs from 'fs/promises';
import { storage } from '../storage';

interface ChallengeContainer {
  id: string;
  challengeId: number;
  containerName: string;
  port: number;
  status: 'starting' | 'running' | 'stopped' | 'error';
  createdAt: Date;
  lastAccessed: Date;
}

export class ChallengeHostingService {
  private docker: Docker;
  private containers: Map<number, ChallengeContainer> = new Map();
  private portRange = { start: 8100, end: 8200 };
  private usedPorts: Set<number> = new Set();

  constructor() {
    this.docker = new Docker();
    this.initializeService();
  }

  private async initializeService() {
    // Clean up any existing challenge containers on startup
    await this.cleanupContainers();
    
    // Start health monitoring
    setInterval(() => this.healthCheck(), 30000); // Every 30 seconds
    
    // Cleanup idle containers every 5 minutes
    setInterval(() => this.cleanupIdleContainers(), 300000);
  }

  /**
   * Deploy a challenge container
   */
  async deployChallenge(challengeId: number): Promise<ChallengeContainer> {
    try {
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if container already exists
      const existing = this.containers.get(challengeId);
      if (existing && existing.status === 'running') {
        existing.lastAccessed = new Date();
        return existing;
      }

      // Get available port
      const port = this.getAvailablePort();
      if (!port) {
        throw new Error('No available ports for challenge deployment');
      }

      // Build container configuration
      const containerConfig = await this.buildContainerConfig(challenge, port);
      
      // Create and start container
      const container = await this.docker.createContainer(containerConfig);
      await container.start();

      const containerInfo: ChallengeContainer = {
        id: container.id,
        challengeId,
        containerName: `ctf-challenge-${challengeId}`,
        port,
        status: 'starting',
        createdAt: new Date(),
        lastAccessed: new Date()
      };

      this.containers.set(challengeId, containerInfo);
      this.usedPorts.add(port);

      // Wait for container to be ready
      await this.waitForContainer(container);
      containerInfo.status = 'running';

      console.log(`Challenge ${challengeId} deployed on port ${port}`);
      return containerInfo;

    } catch (error) {
      console.error(`Failed to deploy challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Stop and remove a challenge container
   */
  async stopChallenge(challengeId: number): Promise<void> {
    const containerInfo = this.containers.get(challengeId);
    if (!containerInfo) {
      return;
    }

    try {
      const container = this.docker.getContainer(containerInfo.id);
      await container.stop();
      await container.remove();

      this.usedPorts.delete(containerInfo.port);
      this.containers.delete(challengeId);

      console.log(`Challenge ${challengeId} stopped and removed`);
    } catch (error) {
      console.error(`Failed to stop challenge ${challengeId}:`, error);
    }
  }

  /**
   * Get challenge access URL
   */
  getChallengeUrl(challengeId: number): string | null {
    const containerInfo = this.containers.get(challengeId);
    if (!containerInfo || containerInfo.status !== 'running') {
      return null;
    }

    const baseUrl = process.env.CHALLENGE_BASE_URL || 'http://localhost';
    return `${baseUrl}:${containerInfo.port}`;
  }

  /**
   * List all running challenges
   */
  getRunningChallenges(): ChallengeContainer[] {
    return Array.from(this.containers.values()).filter(c => c.status === 'running');
  }

  /**
   * Build Docker container configuration
   */
  private async buildContainerConfig(challenge: any, port: number): Promise<any> {
    const challengePath = path.join(process.cwd(), 'challenges', challenge.category, challenge.id.toString());
    
    // Check if Dockerfile exists
    const dockerfilePath = path.join(challengePath, 'Dockerfile');
    try {
      await fs.access(dockerfilePath);
    } catch {
      throw new Error(`Dockerfile not found for challenge ${challenge.id}`);
    }

    return {
      Image: `ctf-challenge-${challenge.id}:latest`,
      name: `ctf-challenge-${challenge.id}`,
      ExposedPorts: {
        '80/tcp': {}
      },
      HostConfig: {
        PortBindings: {
          '80/tcp': [{ HostPort: port.toString() }]
        },
        Memory: 256 * 1024 * 1024, // 256MB limit
        CpuShares: 512, // 0.5 CPU
        ReadonlyRootfs: true,
        SecurityOpt: ['no-new-privileges:true'],
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=100m'
        }
      },
      Env: [
        `FLAG=${challenge.flag}`,
        `CHALLENGE_ID=${challenge.id}`,
        `CHALLENGE_TITLE=${challenge.title}`
      ],
      Labels: {
        'ctf.challenge.id': challenge.id.toString(),
        'ctf.challenge.category': challenge.category,
        'ctf.managed': 'true'
      },
      NetworkMode: 'ctf-network'
    };
  }

  /**
   * Get next available port
   */
  private getAvailablePort(): number | null {
    for (let port = this.portRange.start; port <= this.portRange.end; port++) {
      if (!this.usedPorts.has(port)) {
        return port;
      }
    }
    return null;
  }

  /**
   * Wait for container to be ready
   */
  private async waitForContainer(container: Docker.Container, timeout = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const info = await container.inspect();
        if (info.State.Running && info.State.Health?.Status === 'healthy') {
          return;
        }
      } catch (error) {
        // Container might not be ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Container failed to start within timeout');
  }

  /**
   * Health check for all containers
   */
  private async healthCheck(): Promise<void> {
    for (const [challengeId, containerInfo] of this.containers.entries()) {
      try {
        const container = this.docker.getContainer(containerInfo.id);
        const info = await container.inspect();
        
        if (!info.State.Running) {
          containerInfo.status = 'stopped';
          console.warn(`Challenge ${challengeId} container stopped unexpectedly`);
        } else {
          containerInfo.status = 'running';
        }
      } catch (error) {
        containerInfo.status = 'error';
        console.error(`Health check failed for challenge ${challengeId}:`, error);
      }
    }
  }

  /**
   * Clean up idle containers (not accessed for 30 minutes)
   */
  private async cleanupIdleContainers(): Promise<void> {
    const idleThreshold = 30 * 60 * 1000; // 30 minutes
    const now = new Date();

    for (const [challengeId, containerInfo] of this.containers.entries()) {
      const idleTime = now.getTime() - containerInfo.lastAccessed.getTime();
      
      if (idleTime > idleThreshold) {
        console.log(`Cleaning up idle challenge ${challengeId}`);
        await this.stopChallenge(challengeId);
      }
    }
  }

  /**
   * Clean up all challenge containers
   */
  private async cleanupContainers(): Promise<void> {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: ['ctf.managed=true']
        }
      });

      for (const containerInfo of containers) {
        try {
          const container = this.docker.getContainer(containerInfo.Id);
          if (containerInfo.State === 'running') {
            await container.stop();
          }
          await container.remove();
        } catch (error) {
          console.error(`Failed to cleanup container ${containerInfo.Id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup containers:', error);
    }
  }

  /**
   * Build challenge Docker image
   */
  async buildChallengeImage(challengeId: number): Promise<void> {
    const challenge = await storage.getChallengeById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const challengePath = path.join(process.cwd(), 'challenges', challenge.category, challenge.id.toString());
    const imageName = `ctf-challenge-${challenge.id}:latest`;

    try {
      const stream = await this.docker.buildImage({
        context: challengePath,
        src: ['.']
      }, {
        t: imageName,
        labels: {
          'ctf.challenge.id': challenge.id.toString(),
          'ctf.challenge.category': challenge.category
        }
      });

      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      console.log(`Built Docker image for challenge ${challengeId}: ${imageName}`);
    } catch (error) {
      console.error(`Failed to build image for challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Update container last accessed time
   */
  updateLastAccessed(challengeId: number): void {
    const containerInfo = this.containers.get(challengeId);
    if (containerInfo) {
      containerInfo.lastAccessed = new Date();
    }
  }
}

// Singleton instance
export const challengeHostingService = new ChallengeHostingService();
