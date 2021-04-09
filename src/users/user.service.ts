import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private _userRepository: Repository<User>,
  ) {}

  async getByEmail(email: string) {
    const user = await this._userRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'Пользователь по данному e-mail не найден',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(id: number) {
    const user = this._userRepository.findOne({ id });
    if (user) {
      return user;
    }
    throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
  }
}
