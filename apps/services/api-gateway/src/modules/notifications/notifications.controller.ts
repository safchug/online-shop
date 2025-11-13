import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import { MICROSERVICES } from "../../config/microservices.config";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    @Inject(MICROSERVICES.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy
  ) {}

  @Get()
  @ApiOperation({ summary: "Get user notifications" })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
  })
  async getUserNotifications(@CurrentUser() user: any) {
    return await firstValueFrom(
      this.notificationService.send(
        { cmd: "get-notifications" },
        { userId: user.userId }
      )
    );
  }

  @Put(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  async markAsRead(@CurrentUser() user: any, @Param("id") id: string) {
    return await firstValueFrom(
      this.notificationService.send(
        { cmd: "mark-as-read" },
        { notificationId: id, userId: user.userId }
      )
    );
  }

  @Put("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read" })
  async markAllAsRead(@CurrentUser() user: any) {
    return await firstValueFrom(
      this.notificationService.send(
        { cmd: "mark-all-as-read" },
        { userId: user.userId }
      )
    );
  }

  @Get("preferences")
  @ApiOperation({ summary: "Get notification preferences" })
  @ApiResponse({
    status: 200,
    description: "Preferences retrieved successfully",
  })
  async getPreferences(@CurrentUser() user: any) {
    return await firstValueFrom(
      this.notificationService.send(
        { cmd: "get-preferences" },
        { userId: user.userId }
      )
    );
  }

  @Post("preferences")
  @ApiOperation({ summary: "Update notification preferences" })
  @ApiResponse({ status: 200, description: "Preferences updated successfully" })
  async updatePreferences(@CurrentUser() user: any, @Body() preferences: any) {
    return await firstValueFrom(
      this.notificationService.send(
        { cmd: "update-preferences" },
        { userId: user.userId, ...preferences }
      )
    );
  }
}
