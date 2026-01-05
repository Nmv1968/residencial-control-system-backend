import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private adminUser: LoginDto;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const username = this.configService.get<string>('ADMIN_USERNAME');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!username || !password) {
      throw new Error(
        'ADMIN_USERNAME and ADMIN_PASSWORD must be defined in environment variables',
      );
    }

    // Hash password on startup to simulate DB storage (simplified for single admin)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    this.adminUser = { username, password: hashedPassword };
    console.log(`Admin user '${username}' configured.`);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    if (username === this.adminUser.username) {
      const isMatch = await bcrypt.compare(pass, this.adminUser.password);
      if (isMatch) {
        const { password, ...result } = this.adminUser;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
