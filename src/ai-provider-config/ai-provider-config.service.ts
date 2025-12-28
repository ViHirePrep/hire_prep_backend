import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export interface ProviderMapping {
  alias: string;
  baseProvider: string;
  displayName: string;
  apiUrl?: string;
  isActive: boolean;
  priority: number;
}

@Injectable()
export class AIProviderConfigService implements OnModuleInit {
  private providerMappings: Map<string, string> = new Map();
  private providerUrls: Map<string, string> = new Map();
  private providerConfigs: Map<string, ProviderMapping> = new Map();
  private initialized = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadProviderMappings();
  }

  async loadProviderMappings(): Promise<void> {
    try {
      const configs = await this.prisma.aIProviderConfig.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });

      this.providerMappings.clear();

      configs.forEach((config) => {
        this.providerMappings.set(
          config.providerAlias.toLowerCase(),
          config.baseProvider,
        );

        if (config.apiUrl) {
          this.providerUrls.set(
            config.providerAlias.toLowerCase(),
            config.apiUrl,
          );
        }

        this.providerConfigs.set(config.providerAlias.toLowerCase(), {
          alias: config.providerAlias,
          baseProvider: config.baseProvider,
          displayName: config.displayName,
          apiUrl: config.apiUrl || undefined,
          isActive: config.isActive,
          priority: config.priority,
        });
      });

      this.initialized = true;
    } catch {
      return this.initializeFallbackMappings();
    }
  }

  getBaseProvider(alias: string): string | undefined {
    return this.providerMappings.get(alias.toLowerCase().trim());
  }

  getApiUrl(alias: string): string | undefined {
    return this.providerUrls.get(alias.toLowerCase().trim());
  }

  getProviderConfig(alias: string): ProviderMapping | undefined {
    return this.providerConfigs.get(alias.toLowerCase().trim());
  }

  getActiveProviders(): ProviderMapping[] {
    return Array.from(this.providerConfigs.values())
      .filter((config) => config.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  getAllMappings(): ProviderMapping[] {
    return Array.from(this.providerConfigs.values());
  }

  isValidProvider(alias: string): boolean {
    return this.providerMappings.has(alias.toLowerCase().trim());
  }

  private initializeFallbackMappings(): void {
    const fallbackMappings: Record<string, string> = {
      openai: 'openai',
      gpt: 'openai',
      'gpt-4o': 'openai',
      claude: 'claude',
      anthropic: 'claude',
      gemini: 'gemini',
      google: 'gemini',
      grok: 'grok',
      xai: 'grok',
    };

    Object.entries(fallbackMappings).forEach(([alias, base]) => {
      this.providerMappings.set(alias, base);
    });

    this.initialized = true;
  }
}
