declare const LocalAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class LocalAuthGuard extends LocalAuthGuard_base {
    handleRequest(err: Error | null, user: any, info: {
        message?: string;
    } | null): any;
}
export {};
