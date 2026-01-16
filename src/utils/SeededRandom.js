export class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }
  
  random() {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  
  range(min, max) {
    return min + this.random() * (max - min);
  }
  
  chance(probability) {
    return this.random() < probability;
  }
  
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }
  
  pick(array) {
    return array[this.int(0, array.length - 1)];
  }
}