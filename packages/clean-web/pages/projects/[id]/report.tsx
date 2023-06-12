import { NextPage } from 'next';

const findings = [{
  title: 'Design System',
  issues: [{
    title: 'Issue 1',
    severity: 'Severity',
    kb: 'kb',
  }]
}, {
  title: 'SaaS',
  issues: [{
    title: 'Issue 1',
    severity: 'Severity',
    kb: 'kb',
  }]
}, {
  title: 'Clean Code',
  issues: [{
    title: 'Issue 1',
    severity: 'Severity',
    kb: 'kb',
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
