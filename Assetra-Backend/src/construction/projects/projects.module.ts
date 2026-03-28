import { Module } from '@nestjs/common';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { ProjectAccessGuard } from './guards/project-access.guard';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ProjectsService, ProjectAccessGuard],
  controllers: [ProjectsController],
  exports: [ProjectsService, ProjectAccessGuard]
})
export class ProjectsModule {}
