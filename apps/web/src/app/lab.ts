export interface LabItem {
  id: string;
  period: {
    en: string;
    de: string;
  };
  title: {
    en: string;
    de: string;
  };
  description: {
    en: string;
    de: string;
  };
  highlights: {
    en: string[];
    de: string[];
  };
  technologies: string[];
}

export const labItems: LabItem[] = [
  {
    id: 'k8s-platform',
    period: {
      en: 'since 2025',
      de: 'seit 2025',
    },
    title: {
      en: 'EU-sovereign Kubernetes platform',
      de: 'EU-souveräne Kubernetes-Plattform',
    },
    description: {
      en: 'After five years of running my own projects serverless on AWS (CDK, Lambda, Cognito), I migrated everything in 2025 to a self-operated Kubernetes platform on European infrastructure — and have run it in production since.',
      de: 'Nach fünf Jahren Serverless auf AWS (CDK, Lambda, Cognito) habe ich 2025 alle eigenen Projekte auf eine selbst betriebene Kubernetes-Plattform auf europäischer Infrastruktur migriert – und betreibe sie seitdem produktiv.',
    },
    highlights: {
      en: [
        'Terraform-provisioned cluster on Hetzner with Cilium CNI',
        'GitOps deployments via ArgoCD; secrets encrypted in Git with Sealed Secrets',
        'full observability stack: Prometheus, Grafana, Loki',
        'PostgreSQL via CloudNativePG with pooling, alerts, and dashboards',
        'runs five production applications',
      ],
      de: [
        'Terraform-provisionierter Cluster auf Hetzner mit Cilium CNI',
        'GitOps-Deployments über ArgoCD; Secrets verschlüsselt im Git via Sealed Secrets',
        'kompletter Observability-Stack: Prometheus, Grafana, Loki',
        'PostgreSQL mit CloudNativePG inklusive Pooling, Alerts und Dashboards',
        'betreibt fünf produktive Anwendungen',
      ],
    },
    technologies: [
      'kubernetes',
      'terraform',
      'argocd',
      'cilium',
      'sealed-secrets',
      'prometheus',
      'grafana',
      'loki',
      'postgresql',
    ],
  },
  {
    id: 'yamiat',
    period: {
      en: 'since 2020',
      de: 'seit 2020',
    },
    title: {
      en: 'yamiat.com',
      de: 'yamiat.com',
    },
    description: {
      en: 'A production side project in continuous development since 2020: Next.js/React frontend, GraphQL, .NET services, PostgreSQL. The proving ground where I try stack decisions before recommending them to anyone.',
      de: 'Ein produktives Nebenprojekt in kontinuierlicher Entwicklung seit 2020: Next.js/React-Frontend, GraphQL, .NET-Services, PostgreSQL. Das Testfeld, in dem ich Stack-Entscheidungen ausprobiere, bevor ich sie jemandem empfehle.',
    },
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'next.js',
      'react',
      'typescript',
      'graphql',
      'dotnet',
      'postgresql',
      'storybook',
      'playwright',
    ],
  },
  {
    id: 'agent-tooling',
    period: {
      en: 'since 2026',
      de: 'seit 2026',
    },
    title: {
      en: 'Agent tooling & MCP',
      de: 'Agent-Tooling & MCP',
    },
    description: {
      en: 'The workflow behind my daily AI usage: a custom MCP server, skills and extensions for coding agents, and deterministic tooling around AI output — built and used daily, not demoed.',
      de: 'Der Unterbau meiner täglichen KI-Nutzung: ein eigener MCP-Server, Skills und Extensions für Coding-Agents und deterministisches Tooling rund um KI-Output – täglich im Einsatz, nicht nur Demo.',
    },
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'typescript',
      'mcp',
      'ai-agents',
      'node.js',
    ],
  },
];
