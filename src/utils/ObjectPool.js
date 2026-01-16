export class ObjectPool {
  constructor(factory, initialSize = 100) {
    this.pool = [];
    this.factory = factory;
    this.active = new Set();
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }
  
  acquire() {
    let obj = this.pool.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.active.add(obj);
    return obj;
  }
  
  release(obj) {
    if (this.active.has(obj)) {
      this.active.delete(obj);
      if (obj.reset && typeof obj.reset === 'function') {
        obj.reset();
      }
      this.pool.push(obj);
    }
  }
  
  releaseAll() {
    this.active.forEach(obj => {
      if (obj.reset && typeof obj.reset === 'function') {
        obj.reset();
      }
      this.pool.push(obj);
    });
    this.active.clear();
  }
  
  get activeCount() {
    return this.active.size;
  }
  
  get poolCount() {
    return this.pool.length;
  }
}