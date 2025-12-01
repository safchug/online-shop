import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const rpcContext = context.switchToRpc();
    const pattern = rpcContext.getContext();
    const data = rpcContext.getData();

    console.log(`[Request] Pattern: ${JSON.stringify(pattern)}`);
    console.log(`[Request] Data: ${JSON.stringify(data)}`);

    return next.handle().pipe(
      tap({
        next: (response) => {
          console.log(
            `[Response] Pattern: ${JSON.stringify(pattern)} - ${Date.now() - now}ms`
          );
          console.log(`[Response] Data: ${JSON.stringify(response)}`);
        },
        error: (error) => {
          console.error(
            `[Error] Pattern: ${JSON.stringify(pattern)} - ${Date.now() - now}ms`
          );
          console.error(`[Error] Message: ${error.message}`);
        },
      })
    );
  }
}
