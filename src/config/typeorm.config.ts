import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 4321,
  username: 'postgres',
  password: 'postgres',
  database: 'aya',
  entities: [join(__dirname + '/../**/*.entity{.ts,.js}')],

  synchronize: true,
};
