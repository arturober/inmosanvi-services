import { RealstateProperty } from '../entities/realstate_property.entity';

export class SinglePropertyResponse {
  property: RealstateProperty;

  constructor(property: RealstateProperty) {
    this.property = property;
  }
}
