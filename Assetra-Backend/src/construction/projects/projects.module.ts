import { Module } from '@nestjs/common';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectAccessGuard } from './guards/project-access.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ProjectsService, ProjectAccessGuard],
  controllers: [ProjectsController],
  exports: [ProjectsService, ProjectAccessGuard]
})
export class ProjectsModule {}
