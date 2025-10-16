import { RealstateProperty } from '../entities/realstate_property.entity';

export class PropertiesResponse {
  properties: RealstateProperty[];
  total: number;
  page: number;
  more: boolean;

  constructor(
    properties: RealstateProperty[],
    total: number,
    page: number,
    more: boolean,
  ) {
    this.properties = properties;
    this.total = total;
    this.page = page;
    this.more = more;
  }
}
