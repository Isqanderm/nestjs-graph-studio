import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Simple auth check - in real app, validate JWT token
    const authHeader = request.headers['authorization'];
    
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    // Mock user authentication
    request.user = {
      id: 'user-123',
      email: 'user@example.com',
      roles: ['user', 'admin'],
    };

    return true;
  }
}

