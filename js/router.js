export class Router {
  constructor() {
    this.routes = [];
    this.notFoundHandler = null;
    window.addEventListener('hashchange', () => this.resolve());
  }

  on(pattern, handler) {
    const paramNames = [];
    const regexStr = pattern.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({ regex: new RegExp(`^${regexStr}$`), handler, paramNames });
    return this;
  }

  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  resolve() {
    const hash = (location.hash || '#/').slice(1);
    for (const route of this.routes) {
      const match = hash.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
        route.handler(params);
        return;
      }
    }
    if (this.notFoundHandler) this.notFoundHandler();
  }

  navigate(path) {
    location.hash = path;
  }

  start() {
    this.resolve();
  }
}
