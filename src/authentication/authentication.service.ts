import { UserService } from '../users/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import bcrypt from 'bcrypt';
import { PostgresErrorCode } from 'src/database/postgresErrorCode.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthenticationService {
  constructor(private readonly _userService: UserService) {}

  public async register(registrationData: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createUser = await this._userService.create({
        ...registrationData,
        password: hashedPassword,
      });
      createUser.password = undefined;
      return createUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'Пользователь с таким e-mail уже существует',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Что то пошло не так с регистрацией!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this._userService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('Данные не совпали', HttpStatus.BAD_REQUEST);
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException('Данные не совпали', HttpStatus.BAD_REQUEST);
    }
  }
}