class RequestCache {
  constructor() {
    this.cache = new Map();
  }
  async getQuestion(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    const res = await fetch(url);
    const data = await res.json();
    this.cache.set(url, data);
    return data;
  }
}
export default new RequestCache();
