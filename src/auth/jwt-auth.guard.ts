import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { catchError, map, Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
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

  handleRequest(err, user, info, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si hay un error de JWT (ej. token expirado) y la ruta NO es pública, lanzamos el error.
    if (err && !isPublic) {
      throw err || new UnauthorizedException();
    }

    // Si no hay usuario (sin token, token inválido) y la ruta NO es pública, lanzamos error.
    if (!user && !isPublic) {
      throw err || new UnauthorizedException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
