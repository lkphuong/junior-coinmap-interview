import { Module } from '@nestjs/common';
import { modules } from './app.imports';

@Module({
  imports: modules,
  controllers: [],
  providers: [],
})
export class AppModule {}
