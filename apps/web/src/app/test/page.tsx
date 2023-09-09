import { NextPage } from "next";

import { CodeExample } from "@/components/CodeExample";

const TestPage: NextPage = async () => {
  return (
    <div className="container mx-auto">
      <CodeExample
        expression="fcf8cd61fba1059c6793c968db2cc9275aa59e3a:apps/web/src/components/SlateRender.tsx"
      />
    </div>
  );
}

export default TestPage;
