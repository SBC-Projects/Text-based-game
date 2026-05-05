export class Person {
  constructor() {
    this.name = 'Bob';
    this.healthPoints = 3;
    this.bag = ['map', 'torch'];
  }

  greet() {
    return 'Hello!';
  }

  doMaths(a, b) {
    return a * b;
  }

  doThings() {
    this.name += 's';
    this.healthPoints += 1;
    return this.bag.join(', ');
  }
}
