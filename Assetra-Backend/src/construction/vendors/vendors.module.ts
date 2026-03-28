import { Module } from '@nestjs/common';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [VendorsService],
  controllers: [VendorsController],
  exports: [VendorsService]
})
export class VendorsModule {}
