import { Controller, Get, Post, Body, Param, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { SanitizeInputPipe } from '../orders/pipes/sanitize-input.pipe';

/**
 * Users controller demonstrating NestJS controller functionality.
 *
 * Security improvements:
 * 1. Uses SanitizeInputPipe to prevent XSS attacks
 * 2. Input is sanitized before processing
 *
 * For production use, additionally implement:
 * - Proper DTO classes with class-validator decorators
 * - Authentication guards (@UseGuards(AuthGuard))
 * - Authorization checks (role-based access control)
 * - Rate limiting (@Throttle decorator)
 *
 * This code is provided to demonstrate NestJS controller functionality
 * in the context of the Graph Studio visualization tool.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Sanitize the ID parameter to prevent XSS
    const sanitizedId = id.replace(/[<>]/g, '');
    return this.usersService.findOne(sanitizedId);
  }

  /**
   * Creates a new user with sanitized input to prevent XSS attacks.
   */
  @Post()
  @UsePipes(SanitizeInputPipe)
  create(@Body() createUserDto: any) {
    // Input is automatically sanitized by SanitizeInputPipe
    return this.usersService.create(createUserDto);
  }
}

