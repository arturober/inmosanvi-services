import { Controller, Get, Param } from '@nestjs/common';
import { TownService } from './town.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('town')
export class TownController {
  constructor(private readonly townService: TownService) {}

  @Public()
  @Get('provinces')
  async findAllProvinces() {
    return this.townService.findAllprovinces();
  }

  @Public()
  @Get('province/:id/towns')
  async findTownsByProvince(@Param('id') id: string) {
    return this.townService.findByProvince(+id);
  }
}
