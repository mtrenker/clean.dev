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
      en: 'A production side project in continuous development since 2020. From 2020 to 2025 it ran serverless on AWS using CDK, Node.js Lambdas, AppSync, Cognito, EventBridge, and a single-table DynamoDB model.',
      de: 'Ein produktives Nebenprojekt in kontinuierlicher Entwicklung seit 2020. Von 2020 bis 2025 lief es serverless auf AWS mit CDK, Node.js-Lambdas, AppSync, Cognito, EventBridge und einem Single-Table-DynamoDB-Modell.',
    },
    ownership: {
      en: 'I owned the full AWS architecture, infrastructure as code, data model, application code, and self-mutating deployment pipeline.',
      de: 'Ich verantwortete die gesamte AWS-Architektur, Infrastructure as Code, das Datenmodell, den Anwendungscode und die selbstaktualisierende Deployment-Pipeline.',
    },
    clientRelevance: {
      en: 'Direct experience designing and operating serverless APIs, event-driven services, access control, CI/CD, and DynamoDB access patterns in production.',
      de: 'Direkte Erfahrung mit Konzeption und Betrieb von serverless APIs, eventgetriebenen Services, Zugriffskontrolle, CI/CD und DynamoDB-Zugriffsmustern in Produktion.',
    },
    operations: {
      en: 'Operated on AWS for five years, then migrated to a self-operated Kubernetes platform in 2025; continuously developed in production since 2020.',
      de: 'Fünf Jahre auf AWS betrieben und 2025 auf eine selbst betriebene Kubernetes-Plattform migriert; seit 2020 kontinuierlich produktiv weiterentwickelt.',
    },
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'aws',
      'aws-cdk',
      'lambda',
      'node.js',
      'appsync',
      'dynamodb',
      'cognito',
      'eventbridge',
      'codepipeline',
      'next.js',
      'react',
      'typescript',
      'graphql',
      'dotnet',
      'postgresql',
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
