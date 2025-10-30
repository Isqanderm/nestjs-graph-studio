import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseOrderIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    // Validate order ID format (e.g., ORD-XXXXX)
    const orderIdPattern = /^ORD-\d{5}$/;

    if (!orderIdPattern.test(value)) {
      throw new BadRequestException(
        `Invalid order ID format. Expected format: ORD-XXXXX, got: ${value}`,
      );
    }

    return value;
  }
}

