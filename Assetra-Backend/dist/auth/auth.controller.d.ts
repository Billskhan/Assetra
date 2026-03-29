import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    status(): {
        status: string;
        module: string;
    };
}
