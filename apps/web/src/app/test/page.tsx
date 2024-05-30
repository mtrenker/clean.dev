import type { NextPage } from 'next';
import { Workflow } from '@/components/agile/workflow';

export const TestPage: NextPage = () => {
  return (
    <div className="container mx-auto">
      <Workflow />
    </div>
  )
}

export default TestPage;
