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
  ownership: {
    en: string;
    de: string;
  };
  clientRelevance: {
    en: string;
    de: string;
  };
  operations: {
    en: string;
    de: string;
  };
  workflowExample?: {
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
    ownership: {
      en: 'I provision the cluster and own deployment, observability, data services, secrets, upgrades, and recovery.',
      de: 'Ich provisioniere den Cluster und verantworte Deployment, Observability, Datendienste, Secrets, Upgrades und Recovery.',
    },
    clientRelevance: {
      en: 'Direct operating experience with GitOps, Kubernetes, and production observability informs architecture and delivery decisions for client systems.',
      de: 'Eigene Betriebserfahrung mit GitOps, Kubernetes und Produktions-Observability fließt direkt in Architektur- und Delivery-Entscheidungen für Kundensysteme ein.',
    },
    operations: {
      en: 'Five production applications run on the platform with PostgreSQL pooling, alerts, dashboards, logs, and metrics.',
      de: 'Fünf produktive Anwendungen laufen auf der Plattform mit PostgreSQL-Pooling, Alerts, Dashboards, Logs und Metriken.',
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
    ownership: {
      en: 'I own the product and its full stack, from frontend and APIs to data, tests, deployments, and maintenance.',
      de: 'Ich verantworte das Produkt und den gesamten Stack – von Frontend und APIs bis zu Daten, Tests, Deployments und Wartung.',
    },
    clientRelevance: {
      en: 'It is where I test stack and architecture choices in real use before recommending them to a client team.',
      de: 'Hier prüfe ich Stack- und Architekturentscheidungen im echten Betrieb, bevor ich sie einem Kundenteam empfehle.',
    },
    operations: {
      en: 'Continuously developed and operated in production since 2020.',
      de: 'Seit 2020 kontinuierlich weiterentwickelt und produktiv betrieben.',
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
    ownership: {
      en: 'I build and maintain the MCP server, agent skills, extensions, and deterministic checks around generated work.',
      de: 'Ich entwickle und pflege den MCP-Server, Agent-Skills, Extensions und deterministische Prüfungen rund um generierte Arbeit.',
    },
    clientRelevance: {
      en: 'The system makes AI-assisted delivery bounded, inspectable, and reviewable instead of treating model output as an unchecked result.',
      de: 'Das System macht KI-gestützte Delivery begrenzt, einsehbar und überprüfbar, statt Modell-Output ungeprüft als Ergebnis zu übernehmen.',
    },
    operations: {
      en: 'Used in daily engineering work with human review before changes are accepted.',
      de: 'Im täglichen Engineering-Einsatz, mit menschlichem Review bevor Änderungen übernommen werden.',
    },
    workflowExample: {
      en: 'Reviewable example: issue-scoped agent → isolated worktree → deterministic test and build gates → human-reviewed pull request.',
      de: 'Überprüfbares Beispiel: Agent mit begrenztem Issue-Scope → isolierter Worktree → deterministische Test- und Build-Gates → Pull Request mit menschlichem Review.',
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
