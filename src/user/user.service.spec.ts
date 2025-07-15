import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingProtocol } from 'src/auth/hashing/hashing.protocol';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let hashingService: HashingProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: HashingProtocol,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingService = module.get<HashingProtocol>(HashingProtocol);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        nickName: 'Teste',
        email: 'teste@teste.com',
        password: '123456',
      };
      const passwordHash = 'HASHDESENHA';
      const newUser = {
        id: 1,
        nickName: createUserDto.nickName,
        email: createUserDto.email,
        passwordHash,
      };
      const expectedReturn = {
        message: 'Usuário foi cadastrado com sucesso!',
      };

      jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue(passwordHash);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser as any);

      const result = await userService.create(createUserDto);

      expect(hashingService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        nickName: createUserDto.nickName,
        email: createUserDto.email,
        password: passwordHash,
      });
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(expectedReturn);
    });

    it('should throw a ConflictException when user email is already exists.', async () => {
      const createUserDto: CreateUserDto = {
        nickName: 'Teste',
        email: 'teste@teste.com',
        password: '123456',
      };

      const anyError = new QueryFailedError('', [], new Error());
      anyError['code'] = '23505';

      jest.spyOn(userRepository, 'save').mockRejectedValue(anyError);

      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw a error when this error is HttpException', async () => {
      const createUserDto: CreateUserDto = {
        nickName: 'Teste',
        email: 'teste@teste.com',
        password: '123456',
      };

      const anyError = new BadRequestException();

      jest.spyOn(userRepository, 'save').mockRejectedValue(anyError);

      await expect(userService.create(createUserDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw InternalServerErrorException for another erros', async () => {
      const createUserDto: CreateUserDto = {
        nickName: 'Teste',
        email: 'teste@teste.com',
        password: '123456',
      };

      const anyError = new Error();

      jest.spyOn(userRepository, 'save').mockRejectedValue(anyError);

      await expect(userService.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getProfileUser', () => {
    it('should return profile user data', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      const userData = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        email: 'teste@teste.com',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userData as any);

      const result = await userService.getProfileUser(tokenPayload as any);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: tokenPayload.id },
        select: { id: true, nickName: true, createdAt: true },
      });
      expect(result).toEqual(userData);
    });

    it('should throw a NotFoundException when user not found', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        userService.getProfileUser(tokenPayload as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a error when this error is HttpException', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      const anyError = new NotFoundException();

      jest.spyOn(userRepository, 'findOne').mockRejectedValue(anyError);

      await expect(
        userService.getProfileUser(tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw a InternalServerErrorException for another erros', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      const anyError = new Error();

      jest.spyOn(userRepository, 'findOne').mockRejectedValue(anyError as any);

      await expect(
        userService.getProfileUser(tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        nickName: 'Teste 2',
        password: '123456',
      };
      const tokenPayload = {
        id: 1,
        nickName: 'Teste',
      };
      const userData = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        email: 'teste@teste.com',
      };
      const passwordHash = 'HASHDASENHA';

      const userDataAfterUpdate = {
        ...userData,
        nickName: updateUserDto.nickName,
        password: passwordHash,
      };

      const expectedReturn = {
        message: 'Usuário foi atualizado com sucesso!',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userData as any);
      jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue(passwordHash);

      const result = await userService.update(
        updateUserDto,
        tokenPayload as any,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: tokenPayload.id },
      });
      expect(hashingService.hashPassword).toHaveBeenCalledWith(
        updateUserDto.password,
      );
      expect(userRepository.save).toHaveBeenCalledWith(userDataAfterUpdate);
      expect(result).toEqual(expectedReturn);
    });

    it('should update only user nick_name', async () => {
      const updateUserDto: UpdateUserDto = {
        nickName: 'Novo Apelido',
      };
      const tokenPayload = {
        id: 1,
        nickName: 'Antigo Apelido',
      };
      const userData = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        email: 'teste@teste.com',
        password: 'senhaAntiga',
      };
      const userDataAfterUpdate = {
        ...userData,
        nickName: updateUserDto.nickName,
      };
      const expectedReturn = {
        message: 'Usuário foi atualizado com sucesso!',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userData as any);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(userDataAfterUpdate as any);
      jest.spyOn(hashingService, 'hashPassword');

      const result = await userService.update(
        updateUserDto,
        tokenPayload as any,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: tokenPayload.id },
      });
      expect(hashingService.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(userDataAfterUpdate);
      expect(result).toEqual(expectedReturn);
    });

    it('should throw a NotFoundException when user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        nickName: 'Teste 2',
        password: '123456',
      };
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        userService.update(updateUserDto, tokenPayload as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException when user try update with empty data', async () => {
      const updateUserDto: UpdateUserDto = {};
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };
      const userData = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        email: 'teste@teste.com',
        password: 'senhaAntiga',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userData as any);

      await expect(
        userService.update(updateUserDto, tokenPayload as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a InternalServerErrorException for another erros', async () => {
      const updateUserDto: UpdateUserDto = {
        nickName: 'Teste 2',
        password: '123456',
      };
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      const anyError = new Error();

      jest.spyOn(userRepository, 'findOne').mockRejectedValue(anyError as any);

      await expect(
        userService.update(updateUserDto, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'Teste',
      };
      const userData = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        email: 'teste@teste.com',
      };
      const expectedReturn = {
        message: 'O usuário foi excluído com sucesso!',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userData as any);

      const result = await userService.delete(tokenPayload as any);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: tokenPayload.id },
        select: {
          id: true,
        },
      });
      expect(userRepository.delete).toHaveBeenCalledWith(userData.id);
      expect(result).toEqual(expectedReturn);
    });

    it('should throw a NotFoundException when user not found', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.delete(tokenPayload as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a error when this error is HttpException', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      const anyError = new NotFoundException();

      jest.spyOn(userRepository, 'findOne').mockRejectedValue(anyError);

      await expect(userService.delete(tokenPayload as any)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw a InternalServerErrorException for another erros', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'Gabriel',
      };

      const anyError = new Error();

      jest.spyOn(userRepository, 'findOne').mockRejectedValue(anyError as any);

      await expect(userService.delete(tokenPayload as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
