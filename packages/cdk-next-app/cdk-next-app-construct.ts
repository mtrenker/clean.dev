import { Construct } from "constructs";

export interface CdkNextAppProps {
}

export class CdkNextApp extends Construct {
  constructor(scope: Construct, id: string, props: CdkNextAppProps) {
    super(scope, id);
    const {  } = props;
    console.log("Hello, world!");
  }
}
