import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PublicReadGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Allow Public Read (GET)
    if (request.method === 'GET') {
      return true;
    }

    // Rely on JWT Auth for all other methods
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // If we reached here (super.canActivate called), user must be valid
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
