import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // For public routes, we will attempt to authenticate but not fail if it doesn't succeed.
      // We override handleRequest to achieve this.
      return true;
    }

    // For protected routes, proceed with the default authentication flow.
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err) {
      throw err;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
