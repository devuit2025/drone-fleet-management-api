import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DronesService } from '../modules/drones/drones.service';
import { MissionsService } from '../modules/missions/missions.service';
import { UpdateLocationDto, UpdateStatusDto } from '../modules/drones/dto';
import { AddPathPointDto } from '../modules/missions/dto';
import { logger } from '../utils/logger';

@WebSocketGateway({
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:8080',
            'http://localhost:5500',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8080',
            'http://127.0.0.1:5500',
            'http://localhost:4173',
            'http://127.0.0.1:4173',
            'http://192.168.0.100:5173',
            'file://'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
        credentials: true,
    },
    namespace: '/drone',
})
export class DroneGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('DroneGateway');
    private lastVideoFrameCount = 0;

    constructor(
        private readonly dronesService: DronesService,
        private readonly flightsService: MissionsService,
    ) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        logger.logWebSocket(`Client connected: ${client.id}`, { clientId: client.id });
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        logger.logWebSocket(`Client disconnected: ${client.id}`, { clientId: client.id });
    }

    @SubscribeMessage('drone:location_update')
    async handleLocationUpdate(
        @MessageBody() data: { droneId: string; location: UpdateLocationDto },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { droneId, location } = data;

            // Update drone location in database
            // Location updates will be handled by telemetry service

            // Broadcast location update to all connected clients
            this.server.emit('drone:location_updated', {
                droneId,
                location,
                timestamp: new Date(),
            });

            this.logger.log(`Location updated for drone ${droneId}`);
            logger.logRealtime(`Location updated for drone ${droneId}`, { droneId, location });
        } catch (error) {
            this.logger.error(`Error updating drone location: ${error.message}`);
            client.emit('error', { message: 'Failed to update drone location' });
        }
    }

    @SubscribeMessage('drone:status_update')
    async handleStatusUpdate(
        @MessageBody() data: { droneId: string; status: UpdateStatusDto },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { droneId, status } = data;

            // Update drone status in database
            await this.dronesService.updateStatus(parseInt(droneId), status);

            // Broadcast status update to all connected clients
            this.server.emit('drone:status_updated', {
                droneId,
                status,
                timestamp: new Date(),
            });

            this.logger.log(`Status updated for drone ${droneId}`);
            logger.logRealtime(`Status updated for drone ${droneId}`, { droneId, status });
        } catch (error) {
            this.logger.error(`Error updating drone status: ${error.message}`);
            logger.error('websocket', `Error updating drone status: ${error.message}`, { error, droneId: data.droneId });
            client.emit('error', { message: 'Failed to update drone status' });
        }
    }

    @SubscribeMessage('flight:path_point')
    async handleFlightPathPoint(
        @MessageBody() data: { flightId: string; pathPoint: AddPathPointDto },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { flightId, pathPoint } = data;

            // TODO: Implement addPathPoint in MissionsService
            // const addedPathPoint = await this.flightsService.addPathPoint(
            //     parseInt(flightId),
            //     pathPoint,
            // );

            // Broadcast path point to all connected clients
            this.server.emit('flight:path_point_added', {
                flightId,
                pathPoint,
                timestamp: new Date(),
            });

            this.logger.log(`Path point added for flight ${flightId}`);
            logger.logRealtime(`Path point added for flight ${flightId}`, { flightId, pathPoint });
        } catch (error) {
            this.logger.error(`Error adding flight path point: ${error.message}`);
            client.emit('error', { message: 'Failed to add flight path point' });
        }
    }

    @SubscribeMessage('flight:start')
    async handleFlightStart(
        @MessageBody() data: { flightId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { flightId } = data;

            // TODO: Implement startFlight in MissionsService
            // await this.flightsService.startFlight(parseInt(flightId), {});

            // Broadcast flight start to all connected clients
            this.server.emit('flight:started', {
                flightId,
                timestamp: new Date(),
            });

            this.logger.log(`Flight started: ${flightId}`);
        } catch (error) {
            this.logger.error(`Error starting flight: ${error.message}`);
            client.emit('error', { message: 'Failed to start flight' });
        }
    }

    @SubscribeMessage('flight:end')
    async handleFlightEnd(
        @MessageBody() data: { flightId: string; endData: any },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { flightId, endData } = data;

            // TODO: Implement endFlight in MissionsService
            // await this.flightsService.endFlight(parseInt(flightId), endData);

            // Broadcast flight end to all connected clients
            this.server.emit('flight:ended', {
                flightId,
                timestamp: new Date(),
            });

            this.logger.log(`Flight ended: ${flightId}`);
        } catch (error) {
            this.logger.error(`Error ending flight: ${error.message}`);
            client.emit('error', { message: 'Failed to end flight' });
        }
    }

    @SubscribeMessage('join:drone')
    handleJoinDrone(@MessageBody() data: { droneId: string }, @ConnectedSocket() client: Socket) {
        const { droneId } = data;
        client.join(`drone:${droneId}`);
        this.logger.log(`Client ${client.id} joined drone ${droneId}`);
    }

    @SubscribeMessage('leave:drone')
    handleLeaveDrone(@MessageBody() data: { droneId: string }, @ConnectedSocket() client: Socket) {
        const { droneId } = data;
        client.leave(`drone:${droneId}`);
        this.logger.log(`Client ${client.id} left drone ${droneId}`);
    }

    @SubscribeMessage('join:flight')
    handleJoinFlight(@MessageBody() data: { flightId: string }, @ConnectedSocket() client: Socket) {
        const { flightId } = data;
        client.join(`flight:${flightId}`);
        this.logger.log(`Client ${client.id} joined flight ${flightId}`);
    }

    @SubscribeMessage('leave:flight')
    handleLeaveFlight(
        @MessageBody() data: { flightId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { flightId } = data;
        client.leave(`flight:${flightId}`);
        this.logger.log(`Client ${client.id} left flight ${flightId}`);
    }

    @SubscribeMessage('ping')
    handlePing(
        @MessageBody() data: { timestamp?: string; message?: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const pongData = {
                timestamp: new Date().toISOString(),
                receivedAt: data.timestamp || new Date().toISOString(),
                message: data.message || 'PING received',
            };

            // Send PONG back to client
            client.emit('pong', pongData);

            // Also broadcast to all clients for testing
            this.server.emit('pong', pongData);

            this.logger.log(`PING received from ${client.id}, sent PONG`);
            logger.logWebSocket(`PING received from ${client.id}`, { clientId: client.id, pongData });
        } catch (error) {
            this.logger.error(`Error handling PING: ${error.message}`);
            client.emit('error', { message: 'Failed to handle PING' });
        }
    }

    @SubscribeMessage('drone:command')
    handleDroneCommand(
        @MessageBody() data: { droneId: string; command: string; timestamp?: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { droneId, command, timestamp } = data;

            this.logger.log(`Received command '${command}' for drone ${droneId} from ${client.id}`);
            logger.logRealtime(`Drone command received: ${command}`, { droneId, command, clientId: client.id });

            // Broadcast command to specific drone room (Android app will listen here)
            this.server.to(`drone:${droneId}`).emit('drone:command', {
                droneId,
                command,
                timestamp: timestamp || new Date().toISOString(),
                sentAt: new Date().toISOString(),
            });

            // Also send response back to sender
            client.emit('drone:command_response', {
                success: true,
                droneId,
                command,
                message: `Command '${command}' sent to drone ${droneId}`,
                timestamp: new Date().toISOString(),
            });

            // Broadcast to all clients for monitoring
            this.server.emit('drone:command_broadcast', {
                droneId,
                command,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            this.logger.error(`Error handling drone command: ${error.message}`);
            logger.error('websocket', `Error handling drone command: ${error.message}`, { error, data });
            client.emit('error', { message: 'Failed to handle drone command' });
        }
    }

    // Method to broadcast drone updates to specific room
    broadcastDroneUpdate(droneId: string, update: any) {
        this.server.to(`drone:${droneId}`).emit('drone:update', {
            droneId,
            update,
            timestamp: new Date(),
        });
    }

    // Method to broadcast flight updates to specific room
    broadcastFlightUpdate(flightId: string, update: any) {
        this.server.to(`flight:${flightId}`).emit('flight:update', {
            flightId,
            update,
            timestamp: new Date(),
        });
    }

    @SubscribeMessage('mission:start')
    async handleMissionStart(
        @MessageBody() data: { droneId: string; mission: { waypoints: any[]; timestamp: string } },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { droneId, mission } = data;

            this.logger.log(`Mission start received for drone ${droneId} with ${mission.waypoints.length} waypoints`);
            logger.logWebSocket(`Mission start received for drone ${droneId}`, { droneId, waypointCount: mission.waypoints.length });

            // Forward mission to drone room
            this.server.to(`drone:${droneId}`).emit('mission:start', {
                droneId,
                mission,
                timestamp: new Date().toISOString(),
            });

            // Also broadcast to all clients
            this.server.emit('mission:started', {
                droneId,
                waypointCount: mission.waypoints.length,
                timestamp: new Date().toISOString(),
            });

            // Send acknowledgment to sender
            client.emit('mission:started', {
                droneId,
                waypointCount: mission.waypoints.length,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            this.logger.error(`Error handling mission start: ${error.message}`);
            client.emit('error', { message: 'Failed to start mission' });
        }
    }

    @SubscribeMessage('mission:end')
    async handleMissionEnd(
        @MessageBody() data: { droneId: string; timestamp: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { droneId } = data;

            this.logger.log(`Mission end received for drone ${droneId}`);
            logger.logWebSocket(`Mission end received for drone ${droneId}`, { droneId });

            // Forward mission end to drone room
            this.server.to(`drone:${droneId}`).emit('mission:end', {
                droneId,
                timestamp: new Date().toISOString(),
            });

            // Also broadcast to all clients
            this.server.emit('mission:ended', {
                droneId,
                timestamp: new Date().toISOString(),
            });

            // Send acknowledgment to sender
            client.emit('mission:ended', {
                droneId,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            this.logger.error(`Error handling mission end: ${error.message}`);
            client.emit('error', { message: 'Failed to end mission' });
        }
    }

    @SubscribeMessage('telemetry:data')
    async handleTelemetryData(
        @MessageBody() data: { droneId: string; telemetry: any; timestamp: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { droneId, telemetry } = data;

            // Convert telemetry data to location update format for frontend compatibility
            const locationUpdate = {
                droneId,
                location: {
                    latitude: telemetry.latitude,
                    longitude: telemetry.longitude,
                    altitude: telemetry.altitude_m,
                    heading: telemetry.heading_deg,
                    speed: telemetry.speed_mps,
                    battery: telemetry.battery_percent,
                },
                timestamp: data.timestamp || new Date().toISOString(),
            };

            // Broadcast location update to all connected clients (for map display)
            this.server.emit('drone:location_updated', locationUpdate);

            // Also send to specific drone room for monitoring
            this.server.to(`drone:${droneId}`).emit('drone:location_updated', locationUpdate);

            // Also emit raw telemetry data for components that need full telemetry
            this.server.emit('telemetry:data', { droneId, telemetry, timestamp: data.timestamp });
            this.server.to(`drone:${droneId}`).emit('telemetry:data', { droneId, telemetry, timestamp: data.timestamp });

            // Log telemetry data (optional, can be disabled for performance)
            // this.logger.debug(`Telemetry data received from drone ${droneId}`);
        } catch (error) {
            this.logger.error(`Error handling telemetry data: ${error.message}`);
            // Don't send error back to avoid spamming
        }
    }

    @SubscribeMessage('app:message')
    async handleAppMessage(
        @MessageBody() data: { droneId: string; message: string; type: string; timestamp: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const { droneId, message, type, timestamp } = data;

            this.logger.log(`App message received from drone ${droneId}: ${message}`);
            logger.logWebSocket(`App message received from drone ${droneId}`, { droneId, message, type });

            // Broadcast message to all connected clients
            this.server.emit('app:message', {
                droneId,
                message,
                type,
                timestamp: timestamp || new Date().toISOString(),
            });

            // Also send to specific drone room
            this.server.to(`drone:${droneId}`).emit('app:message', {
                droneId,
                message,
                type,
                timestamp: timestamp || new Date().toISOString(),
            });
        } catch (error) {
            this.logger.error(`Error handling app message: ${error.message}`);
            // Don't send error back to avoid spamming
        }
    }

    @SubscribeMessage('video:frame')
    async handleVideoFrame(
        @MessageBody() frameData: Buffer | Uint8Array,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            // Ensure frameData is Buffer
            let buffer: Buffer;
            if (frameData instanceof Buffer) {
                buffer = frameData;
            } else if (frameData instanceof Uint8Array) {
                buffer = Buffer.from(frameData);
            } else {
                const dataType = typeof frameData;
                const constructorName = frameData && typeof frameData === 'object' && 'constructor' in frameData
                    ? (frameData as any).constructor?.name
                    : 'unknown';
                this.logger.warn(`⚠️ Unknown frame data type: ${dataType}, ${constructorName}`);
                return;
            }

            const frameSize = buffer.length;

            // Log first frame with first bytes for debugging
            if (this.lastVideoFrameCount === 0) {
                const firstBytes = Array.from(buffer.slice(0, 10))
                    .map(b => '0x' + b.toString(16).padStart(2, '0'))
                    .join(' ');
                const allZeros = Array.from(buffer.slice(0, 10)).every(b => b === 0);
                this.logger.log(`📹 First video frame: ${frameSize} bytes, first 10 bytes: ${firstBytes}`);
                if (allZeros) {
                    this.logger.error(`❌ WARNING: First frame data is all zeros! Data may be corrupted.`);
                }
            }

            // Log every 30th frame to avoid spam
            if (!this.lastVideoFrameCount || this.lastVideoFrameCount % 30 === 0) {
                this.logger.debug(`📹 Received video frame #${this.lastVideoFrameCount + 1}: ${frameSize} bytes from client ${client.id}`);
            }
            this.lastVideoFrameCount = (this.lastVideoFrameCount || 0) + 1;

            // Broadcast video frame to all connected clients
            // Socket.IO may have issues with binary data, so send as base64 string
            // Client will decode it back to ArrayBuffer
            const base64 = buffer.toString('base64');
            this.server.emit('video:frame', base64);

            // Optional: Also send to specific drone room if needed
            // this.server.to(`drone:${droneId}`).emit('video:frame', frameData);
        } catch (error) {
            this.logger.error(`Error handling video frame: ${error.message}`);
            // Don't send error back to avoid spamming
        }
    }
}
