import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Drone Fleet Management API is running! 🚁';
    }
}
