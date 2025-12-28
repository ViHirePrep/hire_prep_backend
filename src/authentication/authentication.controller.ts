import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { AuthenticationService } from './authentication.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import type { Request, Response } from 'express';

const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  googleLogin(@Req() req: Request, @Res() res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;
    const callbackURL = this.configService.get<string>('GOOGLE_CALLBACK_URL')!;
    const scope = 'openid profile email';
    const responseType = 'code';
    const referer =
      req.headers.referer ??
      req.headers.origin ??
      this.configService.get<string>('FRONTEND_URL');
    const state = encodeURIComponent(referer as string);

    const authUrl = `${GOOGLE_AUTH_BASE_URL}?client_id=${clientId}&redirect_uri=${callbackURL}&response_type=${responseType}&scope=${scope}&state=${state}&prompt=select_account`;

    return res.redirect(authUrl);
  }

  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const code = req.query.code as string;
    const state = decodeURIComponent(req.query.state as string);

    if (!code) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL')!;

      return res.redirect(`${frontendUrl}/login?error=missing_code`);
    }

    try {
      const callbackURL = this.configService.get<string>(
        'GOOGLE_CALLBACK_URL',
      )!;
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;
      const clientSecret = this.configService.get<string>(
        'GOOGLE_CLIENT_SECRET',
      )!;

      const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackURL,
        grant_type: 'authorization_code',
      });

      const { access_token } = tokenResponse.data;

      const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { id, email, name } = userInfoResponse.data;

      const authResult = await this.authService.loginWithGoogle({
        googleId: id,
        email,
        name: name ?? email.split('@')[0],
      });

      const { user, accessToken } = authResult;

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(
        `${state}/auth/callback?user=${encodeURIComponent(JSON.stringify(user))}`,
      );
    } catch {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL')!;

      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('accessToken');

    return res.json({ message: 'Logged out successfully' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.userId);
  }
}
