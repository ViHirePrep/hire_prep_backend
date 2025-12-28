import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.aIProviderConfig.deleteMany({});

  const defaultConfigs = [
    {
      providerAlias: 'openai',
      baseProvider: 'openai',
      displayName: 'OpenAI GPT',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      priority: 100,
    },
    {
      providerAlias: 'gpt',
      baseProvider: 'openai',
      displayName: 'GPT',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      priority: 99,
    },
    {
      providerAlias: 'gpt-4o',
      baseProvider: 'openai',
      displayName: 'GPT-4o',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      priority: 98,
    },
    {
      providerAlias: 'claude',
      baseProvider: 'claude',
      displayName: 'Claude',
      apiUrl: 'https://api.anthropic.com/v1/messages',
      priority: 90,
    },
    {
      providerAlias: 'anthropic',
      baseProvider: 'claude',
      displayName: 'Anthropic Claude',
      apiUrl: 'https://api.anthropic.com/v1/messages',
      priority: 89,
    },
    {
      providerAlias: 'gemini',
      baseProvider: 'gemini',
      displayName: 'Google Gemini',
      apiUrl:
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      priority: 80,
    },
    {
      providerAlias: 'google',
      baseProvider: 'gemini',
      displayName: 'Google AI',
      apiUrl:
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      priority: 79,
    },
    {
      providerAlias: 'grok',
      baseProvider: 'grok',
      displayName: 'Grok',
      apiUrl: 'https://api.x.ai/v1/chat/completions',
      priority: 70,
    },
    {
      providerAlias: 'xai',
      baseProvider: 'grok',
      displayName: 'xAI Grok',
      apiUrl: 'https://api.x.ai/v1/chat/completions',
      priority: 69,
    },
  ];

  await prisma.aIProviderConfig.createMany({
    data: defaultConfigs,
  });
}

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
