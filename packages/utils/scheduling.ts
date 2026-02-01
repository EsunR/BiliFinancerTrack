/**
 * 传入一个 Promise 函数，自动重试指定次数，间隔指定时间
 */
export function autoRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxTryTimes?: number;
    intervalMs?: number;
    onRetry?: () => void;
  }
) {
  const { maxTryTimes = 10, intervalMs = 500 } = options || {};
  let attempt = 0;

  return new Promise<T>((resolve, reject) => {
    const execute = () => {
      fn()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          attempt++;
          if (attempt < maxTryTimes) {
            setTimeout(() => {
              if (options?.onRetry) {
                options.onRetry();
              }
              execute();
            }, intervalMs);
          } else {
            reject(error);
          }
        });
    };

    execute();
  });
}
