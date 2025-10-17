import { Controller, Get, Param } from '@nestjs/common';
import { TownService } from './town.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('provinces')
export class TownController {
  constructor(private readonly townService: TownService) {}

  @Public()
  @Get('')
  async findAllProvinces() {
    return this.townService.findAllprovinces();
  }

  @Public()
  @Get(':id/towns')
  async findTownsByProvince(@Param('id') id: string) {
    return this.townService.findByProvince(+id);
  }
}
