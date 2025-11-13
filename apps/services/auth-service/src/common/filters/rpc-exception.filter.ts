import { Catch, RpcExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { RpcException } from "@nestjs/microservices";

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter<any> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    return throwError(() => {
      // Extract the actual error message
      let message = "Internal server error";

      if (exception?.response?.message) {
        message = exception.response.message;
      } else if (exception?.message) {
        message = exception.message;
      }

      return new RpcException({
        statusCode: exception?.status || exception?.response?.statusCode || 500,
        message: message,
        error: exception?.response?.error || exception?.name || "Error",
      });
    });
  }
}
