import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { catchError, map, Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

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

    const canActivate = super.canActivate(context);
    const canActivate$ =
      canActivate instanceof Promise
        ? fromPromise(canActivate)
        : (canActivate as Observable<boolean>);

    if (isPublic) {
      return canActivate$.pipe(
        catchError(() => of(true)),
        map(() => true), // Siempre permitir el acceso a rutas públicas
      );
    }

    // Para rutas protegidas, se mantiene el comportamiento por defecto.
    return canActivate$;
  }

  handleRequest(err, user) {
    if (err) {
      throw err;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
