/**
 * @description
 * @date 18/02/2025
 * @class Block
 */
export class Block {
  constructor(id, name, subject, start_day, end_day, head, tail, order, actual_speed, ideal_speed, distance, is_irregular) {
    this.id = id;
    this.name = name;
    this.subject = subject;
    this.start_day = start_day;
    this.end_day = end_day;
    this.head = head;
    this.tail = tail;
    this.order = order;
    this.actual_speed = actual_speed;
    this.ideal_speed = ideal_speed;
    this.distance = distance;
    this.is_irregular = is_irregular;
  };
  calculate_number_of_problems(head, tail){
    return tail - head + 1;
  }
}