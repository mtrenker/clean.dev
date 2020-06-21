import { Handler } from 'aws-lambda';

interface TrackingEvent {
    info: {
        fieldName: string;
    };
    arguments: {
        input: TrackingInput;
    };
    identity: {
        sub: string;
        username: string;
    };
}
interface TrackingInput {
    id?: string;
    projectId: string;
    startTime: string;
    endTime: string;
    description: string;
}
export declare const handler: Handler<TrackingEvent>;
export {};
