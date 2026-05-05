import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }))

  const config = new DocumentBuilder()
    .setTitle('Lentil API')
    .setDescription('Lentil backend API')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3850)

  await app.listen(port)
}

bootstrap()