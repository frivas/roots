import { ReactNode } from 'react';
import { RouteProps, RoutesProps, RouterProviderProps } from 'react-router-dom';

declare module 'react-router-dom' {
    export interface RouteProps {
        element?: ReactNode;
        path?: string;
    }

    export interface RoutesProps {
        children?: ReactNode;
        location?: string;
    }

    export interface RouterProviderProps {
        router: any;
        fallbackElement?: ReactNode;
        future?: {
            v7_startTransition?: boolean;
        };
    }
}
