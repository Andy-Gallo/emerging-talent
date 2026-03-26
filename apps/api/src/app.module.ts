import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthGuard } from "./common/guards/auth.guard";
import { OptionalAuthGuard } from "./common/guards/optional-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { AiModule } from "./modules/ai/ai.module";
import { ApplicationsModule } from "./modules/applications/applications.module";
import { AuditionsModule } from "./modules/auditions/auditions.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BillingModule } from "./modules/billing/billing.module";
import { FeatureFlagsModule } from "./modules/feature-flags/feature-flags.module";
import { InstitutionsModule } from "./modules/institutions/institutions.module";
import { MediaModule } from "./modules/media/media.module";
import { MessagingModule } from "./modules/messaging/messaging.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { ProfilesModule } from "./modules/profiles/profiles.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SearchModule } from "./modules/search/search.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    InstitutionsModule,
    OrganizationsModule,
    ProfilesModule,
    MediaModule,
    ProjectsModule,
    RolesModule,
    ApplicationsModule,
    AuditionsModule,
    NotificationsModule,
    BillingModule,
    ModerationModule,
    SearchModule,
    FeatureFlagsModule,
    AiModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [AuthGuard, RolesGuard, OptionalAuthGuard],
})
export class AppModule {}
