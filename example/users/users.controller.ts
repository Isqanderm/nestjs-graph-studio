import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * ⚠️ WARNING: DEMONSTRATION CODE ONLY - NOT FOR PRODUCTION USE
 *
 * This controller has known security vulnerabilities:
 * 1. Reflected XSS vulnerability - user input is returned without sanitization
 * 2. No input validation - accepts 'any' type for createUserDto
 * 3. No authentication or authorization checks
 * 4. No rate limiting or request throttling
 *
 * For production use, please implement:
 * - Proper DTO classes with class-validator decorators
 * - Input sanitization and validation
 * - Authentication guards (@UseGuards(AuthGuard))
 * - Authorization checks (role-based access control)
 * - Rate limiting (@Throttle decorator)
 * - Output encoding to prevent XSS
 *
 * This code is provided solely to demonstrate NestJS controller functionality
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
    return this.usersService.findOne(id);
  }

  /**
   * ⚠️ WARNING: This endpoint accepts unvalidated input (any type)
   * and may return user-provided data without sanitization (XSS risk)
   */
  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }
}

