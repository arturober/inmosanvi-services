import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { Town } from '../town/entitites/town.entity';

export class TwonSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const csvPath = path.join(__dirname, 'csv/MUNICIPIOS.csv');

    try {
      const fileContent = await fs.readFile(csvPath, 'utf-8');

      interface TownRecord {
        ID: number;
        NAME: string;
        LONGITUDE: string;
        LATITUDE: string;
        PROVINCE: number; // Aquí se espera que sea el ID de la provincia
      }

      const records = parse<TownRecord>(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
        delimiter: ';',
      });

      // Iterar sobre los registros parseados y crear las entidades.
      for (const record of records) {
        em.create(Town, {
          id: record.ID,
          name: record.NAME,
          longitude: +record.LONGITUDE.replace(',', '.'),
          latitude: +record.LATITUDE.replace(',', '.'),
          province: record.PROVINCE, // Asignamos la entidad Provincia encontrada
        });
      }
    } catch (error) {
      console.error(
        'Error al leer o procesar el archivo CSV de provincias:',
        error,
      );
    }
  }
}
