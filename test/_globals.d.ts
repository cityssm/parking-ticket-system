export declare const testView = "*testView";
export declare const testUpdate = "*testUpdate";
export declare const testAdmin = "*testAdmin";
export declare const portNumber = 4000;
export declare const fakeViewOnlySession: {
    user: {
        userName: string;
        canUpdate: boolean;
        isAdmin: boolean;
        isOperator: boolean;
    };
};
export declare const fakeAdminSession: {
    user: {
        userName: string;
        canUpdate: boolean;
        isAdmin: boolean;
        isOperator: boolean;
    };
};
export declare const fakeViewOnlyRequest: {
    session: {
        user: {
            userName: string;
            canUpdate: boolean;
            isAdmin: boolean;
            isOperator: boolean;
        };
    };
};
export declare const fakeAdminRequest: {
    session: {
        user: {
            userName: string;
            canUpdate: boolean;
            isAdmin: boolean;
            isOperator: boolean;
        };
    };
};
