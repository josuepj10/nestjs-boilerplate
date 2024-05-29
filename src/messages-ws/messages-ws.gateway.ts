import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtPayload } from '../auth/interfaces';

//Allows to listen to the connection and disconnection events from de client

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  //Inject the MessagesWsService
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    // console.log({ token });

    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

   // console.log({ payload });

   
    //Join the client to a room and emit a message to all the clients in that room
    // client.join('chatroom');
    // client.join(client.id);
    // client.join(user.email);
    // this.wss.to('chatroom').emit('Message');

    //Send a message to all the connected clients with the number of connected clients
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected', client.id)
    this.messagesWsService.removeClient(client.id);
    //console.log({ disconnectedClients: this.messagesWsService.getConnectedClients()})

    //Send a message to all the connected clients with the number of disconnected clients
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    // console.log(client.id, payload);

    //Only emit the message to the client that sent it, not to all the connected clients
    // client.emit('message-from-server', {
    //   fullName: 'I am',
    //   message: payload.message || 'no-message',
    // });

    //Emit the message to all the connected clients except the one that sent it
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'I am',
    //   message: payload.message || 'no-message',
    // });

    //Emit the message to all the connected clients
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message',
    });
  }
}
