import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
const PORT = +configService.get<number>('PORT');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  app.use(compression());
  app.use(helmet());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Accounts App')
    .setDescription('Accounts App API description')
    .setVersion('1.0')
    .addTag('Accounts App')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/v1', app, document);

  await app.listen(PORT);
}
bootstrap();
