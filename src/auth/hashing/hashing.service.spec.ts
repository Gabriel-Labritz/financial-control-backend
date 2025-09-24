import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from './hashing.service';
import * as brcypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let hashingService: HashingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashingService],
    }).compile();

    hashingService = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(HashingService).toBeDefined();
  });

  it('should hash user password', async () => {
    // arranges
    const password = 'testing123';
    const hashedPassword = 'mocked_hash_for_testpassword';
    const mockSalt = 'mocked_salt';

    // mocks
    const spySalt = jest.spyOn(brcypt, 'genSalt').mockResolvedValue(mockSalt);
    const spyHash = jest
      .spyOn(brcypt, 'hash')
      .mockResolvedValue(hashedPassword);

    // action
    const result = await hashingService.hashPassword(password);

    // asserts
    expect(spySalt).toHaveBeenCalled();
    expect(spyHash).toHaveBeenCalledWith(password, mockSalt);
    expect(result).toBe(hashedPassword);
  });

  it('should compare user password', async () => {
    // arranges
    const password = 'testing123';
    const hashedPassword = 'mocked_hash_for_testpassword';

    // mocks
    const spyCompare = jest.spyOn(brcypt, 'compare').mockResolvedValue(true);

    // action
    const result = await hashingService.comparePassword(
      password,
      hashedPassword,
    );

    // asserts
    expect(spyCompare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(true);
  });
});
