import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { Province } from '../town/entitites/province.entity';

export class ProvinceSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const csvPath = path.join(__dirname, 'csv/PROVINCIAS.csv');

    try {
      const fileContent = await fs.readFile(csvPath, 'utf-8');

      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      });

      // Iterar sobre los registros parseados y crear las entidades.
      for (const record of records as Array<{
        COD_PROV: string | number;
        PROVINCIA: string;
      }>) {
        const province = new Province();
        province.id = +record.COD_PROV;
        province.name = record.PROVINCIA;

        em.create(Province, province);
      }
    } catch (error) {
      console.error(
        'Error al leer o procesar el archivo CSV de provincias:',
        error,
      );
    }
  }
}
