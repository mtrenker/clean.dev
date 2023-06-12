import { NextPage } from 'next';

const findings = [{
  title: 'Design System',
  issues: [{
    description: 'No design tokens used. All colors, fonts, borders, etc. are hardcoded into the components.',
    severity: 'high',
    kb: 'design-tokens',
  }, {
    description: 'Related to #1: No theming support.',
    severity: 'high',
    kb: 'design-tokens#theming',
  }, {
    description: 'Unnecessary mix of tailwind (tw), styled-components(sc), and tw-sc makes it difficult to maintain and extend the design system.',
    severity: 'high',
    kb: 'mixed-design-approaches',
  }, {
    description: 'Unclear naming conventions for components and styles.',
    severity: 'medium',
    kb: 'design-tokens',
  }, {
    description: 'Split in components-library (main and corporate-main) due to lack of theming support.',
    severity: 'medium',
    kb: 'design-system#source-of-truth',
  }]
}, {
  title: 'SaaS',
  issues: [{
    description: 'Hygraph: Separating home and corporate into two projects adds unnecessary complexity and costs.',
    severity: 'high',
    kb: 'reusable-cms-model',
  }, {
    description: 'Hygraph: Opting for a page-per-locale approach instead of using the localization approach provided by the CMS.',
    severity: 'high',
    kb: 'cms-localization',
  }, {
    description: 'Hygraph: Complex model structure could be simplified by using a more generic approach.',
    severity: 'medium',
    kb: 'reusable-cms-model#composition',
  }, {
    description: 'Algolia: Clarify cost / benefit of a high-performance search.',
    severity: 'medium',
    kb: 'cost-benefit',
  }, {
    description: 'Algolia: Constantly scratching on 1k index limit.',
    severity: 'medium',
    kb: '',
  }]
}, {
  title: 'Architecture / Clean Code',
  issues: [{
    description: 'Complex repository dependencies, consider a monorepo approach',
    severity: 'medium',
    kb: 'mono-repo',
  }, {
    description: 'Complexity of components higher than necessary.',
    severity: 'high',
    kb: 'component-complexity',
  }, {
    description: 'Components coupled to CMS data structure.',
    severity: 'medium',
    kb: 'decoupled-components',
  }, {
    description: 'Inheritance used over composition.',
    severity: 'medium',
    kb: 'composition-over-inheritance',
  }, {
    description: 'Manual code patterns despite codegeneration.',
    severity: 'medium',
    kb: 'code-generation',
  }]
}];

const ReportPage: NextPage = () => {
  return (
    <div className='prose-sm container mx-auto'>
      <div id="cover" className='hidden'>
        <h1>Mission Report</h1>
      </div>

      <div id="audit">
        <h1>Mission Report</h1>
        <h2>The Audit</h2>

        <h3>Intro</h3>

        <h3>Findings</h3>

        <table className='w-full'>
          <thead>
            <tr>
              <th>Issue</th>
              <th>Severity</th>
              <th>kb</th>
            </tr>
          </thead>
          {findings.map((category) => (
            <tbody>
              <tr>
                <td
                  colSpan={3}
                  className='font-bold text-xl'
                >
                  {category.title}
                </td>
              </tr>
              {category.issues.map((issue) => (
                <tr>
                  <td>{issue.title}</td>
                  <td>{issue.severity}</td>
                  <td>{issue.kb}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>

        <h3>Recommendations</h3>

      </div>

      <div id="home" className='hidden'>
        <h1>Mission Report</h1>
        <h2>Project Home</h2>
      </div>
    </div>
  );
};

export default ReportPage;
