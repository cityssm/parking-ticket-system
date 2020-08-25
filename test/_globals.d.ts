import type { Request } from "express";
export declare const fakeViewOnlySession: {
    id: string;
    cookie: any;
    destroy: any;
    regenerate: any;
    reload: any;
    save: any;
    touch: any;
    user: {
        userProperties: {
            canCreate: boolean;
            canUpdate: boolean;
            isAdmin: boolean;
            isOperator: boolean;
        };
    };
};
export declare const fakeAdminSession: {
    id: string;
    cookie: any;
    destroy: any;
    regenerate: any;
    reload: any;
    save: any;
    touch: any;
    user: {
        userProperties: {
            canCreate: boolean;
            canUpdate: boolean;
            isAdmin: boolean;
            isOperator: boolean;
        };
    };
};
export declare const fakeRequest: Request;
export declare const fakeViewOnlyRequest: Request<import("express-serve-static-core").ParamsDictionary, any, any, any> & {
    session: {
        id: string;
        cookie: any;
        destroy: any;
        regenerate: any;
        reload: any;
        save: any;
        touch: any;
        user: {
            userProperties: {
                canCreate: boolean;
                canUpdate: boolean;
                isAdmin: boolean;
                isOperator: boolean;
            };
        };
    };
};
export declare const fakeAdminRequest: Request<import("express-serve-static-core").ParamsDictionary, any, any, any> & {
    session: {
        id: string;
        cookie: any;
        destroy: any;
        regenerate: any;
        reload: any;
        save: any;
        touch: any;
        user: {
            userProperties: {
                canCreate: boolean;
                canUpdate: boolean;
                isAdmin: boolean;
                isOperator: boolean;
            };
        };
    };
};
export declare const userName = "__testUser";
