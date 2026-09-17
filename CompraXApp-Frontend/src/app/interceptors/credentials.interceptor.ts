import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.url.includes('/api/')) {
    const reqWithCredentials = req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      },
      withCredentials: true 
    });
    return next(reqWithCredentials);
  }
  
  return next(req);
};