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
    description: 'Hygraph: Tying and identifying markets by country code limits flexibility and reusability.',
    severity: 'high',
    kb: '',
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
    <div className='container mx-auto'>
      <div id="cover" className="prose-sm mt-10 flex flex-col items-center justify-center h-screen">
        <header className="mt-14 absolute top-0 left-0 right-0">
          <h2 className="text-center text-4xl">Martin Trenker</h2>
          <h3 className="text-center text-2xl">Software Beratung</h3>
        </header>
        <h1>Mission Report</h1>
        <h2><a href="mailto:oetker@clean.dev">oetker@clean.dev</a></h2>
        <p>(this address also works as your exclusive priority mail for future inquiries)</p>
      </div>

      <div id="audit" className="prose-sm break-before-page mt-10">
        <h1>Mission Report - Part 1</h1>
        <h2>The Review</h2>
        <h3>Intro</h3>
        <p>
          <em className="font-bold">September 2022</em>: After almost two years of in-house development of the new digital platform for Dr. Oetker (OE) by external agencies, Oetker Digital (OD) will inherit the software over the following months while the agencies roll up planned countries and phase out slowly.
        </p>
        <p>
          As part of an independent technical evaluation of the delivered software, our goal was to identify potential improvements with a focus on the following:
        </p>

        <ul className='list-disc'>
          <li>
            <em className='font-bold'>Design System</em>: Reusability and quality of the components/design system for other Brands within Dr. Oetker, focusing on developer and editor experience.
          </li>
          <li>
            <em className='font-bold'>SaaS</em>: Analyzing the choice and implementation of SaaS solutions like the CMS and Search.
          </li>
          <li>
            <em className='font-bold'>Clean Code</em>: Includes code quality, architecture, and other essential markers for maintenance, development speed, and quality.
          </li>
        </ul>

        <h3>Conclusion</h3>

        <p>
          Inheriting these projects in their current state alone would be a challenge due to the low code quality especially in the frontend part, but with the ambitious goals to elevate the existing approach to a central platform for all Dr. Oetker brands, the team is up for a challenging but doable task that requires trust and some time from the stakeholders.
        </p>

        <h3>Recommendations</h3>
        <p>
          For the best long-term benefits of the new platform, the following suggestions should help the new product team to achieve the ambitious goals set:
        </p>
        <ul className='list-disc'>
          <li>
            Simplify CMS structure with a more generic approach.
          </li>
          <li>
            Separate between brands other than by their country code (market)
          </li>
          <li>
            Use the localization of Hygraph to create centralized "master pages" that editors only need to localize
          </li>
          <li>
            Refactor most components to a) fit the less complex cms model structure and b)allow different theming for each brand
          </li>
        </ul>
      </div>

      <div id="findings" className="prose-sm break-before-page mt-10">
        <h1>Mission Report - Part 1</h1>

        <h2>Findings*</h2>

        <p>Here are some of the most important findings from our review in no particular order.</p>

        <table className='border w-full'>
          <thead>
            <tr>
              <th>Issue</th>
              <th>Severity</th>
              <th>kb</th>
            </tr>
          </thead>
          {findings.map((category) => (
            <tbody className='odd:bg-gray-300'>
              <tr>
                <td
                  colSpan={3}
                  className='font-bold text-xl m-0 p-1 border'
                >
                  {category.title}
                </td>
              </tr>
              {category.issues.map((issue) => (
                <tr>
                  <td className='p-1 border'>{issue.description}</td>
                  <td className='p-1 border'>{issue.severity}</td>
                  <td className='p-1 border'>{issue.kb}</td>
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td colSpan={3} className='text-center'>
                * low severity issues are not listed here for brevity
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div id="home" className="prose-sm break-before-page mt-10">
        <h1>Mission Report - Part 2</h1>
        <h2>Project Home</h2>
        <p>
          <em className='font-bold'>February 2023</em>: After conducting the review and sharing my insights into the systems with Ben and Dennis, I gladly extended my service to help build the new product team, prepare the complex handover, and set the course for the shared vision of a future-proof platform for the Dr. Oetker universe.
        </p>
        <p>
          The best way to prepare the team was to work closely together, so when Ajdin joined as our first intern developer in February, we quickly started onboarding by diving into the multiple old and new systems and finding more straightforward solutions for the challenges ahead. Ajdin was very observant, and given the amount of data he had to process in this short time, his curiosity and autonomous work helped me enormously.
        </p>
        <p>
          At this point, we tried to question the "only 6-Months per expert" rule since it became clear that the risk of the project not getting handed over correctly vastly outweighed the risk of being accused of false self-employment.
        </p>
        <p>
          <em className='font-bold'>April 2023</em>: After a lot of onboarding into the different systems and ensuring Ajdin is up to the task ahead of him, we were thrilled to have Lennart join our team as a designer responsible for the new design system.
        </p>
        <p>
          After many conversations about the future use cases of the platform and some experiments with low-hanging fruits like the "live editor", the team came to a decent common understanding of the future platform and how to achieve a long-term solution that can not only improve development speed and quality but also attract new talent with state-of-the-art software.
        </p>
        <h3>Achievements so far</h3>
        <ul className='list-disc'>
          <li>
            Created a monorepo to speed up development and deployment times.
          </li>
          <li>
            Introduced a custom properties-based theming approach, allowing brands to customize design tokens like spacings, borders, colors, and more.
          </li>
          <li>
            Introduced Brands. Replacing the market fields and allowing for a more flexible approach to white-labeling.
          </li>
          <li>
            Added live-editing. Instead of having to work inside the generic CMS editor, the future of editing pages is live! What you see is what you get.
          </li>
          <li>
            Run oetker.com inside the new platform.
          </li>
        </ul>
        <h3>Next big steps</h3>
        <ul className='list-disc'>
          <li>
            Deploy the legacy oetker.com from the new monorepo approach and merge to the main branch.
          </li>
          <li>
            Develop the platform to replace the legacy oetker.com and remove legacy.
          </li>
          <li>
            Develop the platform for a smaller market relaunch and launch parallel to the old stack. Observe how it performs compared to the old stack.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReportPage;
