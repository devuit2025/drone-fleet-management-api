import { Response } from 'express';

export abstract class BaseController {
  protected parsePage(page?: string, defaultPage = 1): number {
    const n = parseInt(page || String(defaultPage), 10);
    return Number.isFinite(n) && n > 0 ? n : defaultPage;
  }

  protected parsePer(per?: string, defaultPer = 30, maxPer = 200): number {
    const n = parseInt(per || String(defaultPer), 10);
    const value = Number.isFinite(n) && n > 0 ? n : defaultPer;
    return Math.min(value, maxPer);
  }

  protected setPaginationHeaders(res: Response, currentPage: number, perPage: number, total: number): void {
    const lastPage = Math.max(1, Math.ceil(total / Math.max(perPage, 1)));
    res.set('X-Current-Page', String(currentPage));
    res.set('X-Last-Page', String(lastPage));
    res.set('X-Per-Page', String(perPage));
    res.set('X-Total', String(total));
  }

  protected normalizeListResult<T>(result: any): { data: T[]; total: number } {
    if (Array.isArray(result)) {
      return { data: result as T[], total: (result as T[]).length };
    }
    if (result && Array.isArray(result.data)) {
      const total = typeof result.total === 'number' ? result.total : result.data.length;
      return { data: result.data as T[], total };
    }
    return { data: [], total: 0 };
  }
}


