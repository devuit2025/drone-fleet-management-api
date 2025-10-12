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
import { FlightsService } from '../modules/flights/flights.service';
import { UpdateLocationDto, UpdateStatusDto } from '../modules/drones/dto';
import { AddPathPointDto } from '../modules/flights/dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/drone',
})
export class DroneGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('DroneGateway');

  constructor(
    private readonly dronesService: DronesService,
    private readonly flightsService: FlightsService,
  ) { }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
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
    } catch (error) {
      this.logger.error(`Error updating drone status: ${error.message}`);
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

      // Add path point to flight
      const addedPathPoint = await this.flightsService.addPathPoint(parseInt(flightId), pathPoint);

      // Broadcast path point to all connected clients
      this.server.emit('flight:path_point_added', {
        flightId,
        pathPoint: addedPathPoint,
        timestamp: new Date(),
      });

      this.logger.log(`Path point added for flight ${flightId}`);
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

      // Start flight
      await this.flightsService.startFlight(parseInt(flightId), {});

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

      // End flight
      await this.flightsService.endFlight(parseInt(flightId), endData);

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
  handleJoinDrone(
    @MessageBody() data: { droneId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { droneId } = data;
    client.join(`drone:${droneId}`);
    this.logger.log(`Client ${client.id} joined drone ${droneId}`);
  }

  @SubscribeMessage('leave:drone')
  handleLeaveDrone(
    @MessageBody() data: { droneId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { droneId } = data;
    client.leave(`drone:${droneId}`);
    this.logger.log(`Client ${client.id} left drone ${droneId}`);
  }

  @SubscribeMessage('join:flight')
  handleJoinFlight(
    @MessageBody() data: { flightId: string },
    @ConnectedSocket() client: Socket,
  ) {
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
}
