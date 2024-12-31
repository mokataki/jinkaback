import { Request as ExpressRequest } from 'express';

export interface RequestWithUser extends ExpressRequest {
    user: { userId: number }; // یا ساختار دقیقتر user
}

