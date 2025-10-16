export class PropertyFilters {
  seller: number;
  province: number;
  search: string;
  sold: boolean;
  page: number;
  //   limit: number;

  constructor(
    seller = 0,
    province = 0,
    search: string = '',
    sold = false,
    page = 1,
  ) {
    this.seller = seller;
    this.province = province;
    this.search = search;
    this.sold = sold;
    this.page = page;
    // this.limit = limit;
  }
}
