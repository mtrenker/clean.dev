import { Construct } from "constructs";

export interface NextAppProps {
}

export class NextApp extends Construct {
  constructor(scope: Construct, id: string, props: NextAppProps) {
    super(scope, id);
    const {  } = props;
    console.log("Hello, world!");
  }
}
