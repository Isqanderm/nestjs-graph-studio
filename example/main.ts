import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await app.listen(3001);
  
  console.log('');
  console.log('🚀 Example application is running on: http://localhost:3001');
  console.log('📊 Graph Studio UI: http://localhost:3001/graph-studio');
  console.log('');
}

bootstrap();

