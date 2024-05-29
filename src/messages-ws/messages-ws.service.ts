import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


//Interface to store the id of the connected clients
interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User,
        // desktop: boolean,
        // mobile: boolean
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {};

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }


    //Register the client in the connectedClients object
    async registerClient(client: Socket, userId: string) {

        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');
        if (!user.isActive) throw new Error('User is not active');

        this.checkUserConnection(user); //Check if the user is already connected and disconnect the previous connection
        
        //Add the client to the connectedClients object
        this.connectedClients[client.id] = {
            socket: client,
            user: user    
        };
    }

    //Remove the client from the connectedClients object
    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    //Return the number of connected clients
    getConnectedClients(): string[] {
        //console.log(this.connectedClients);
        return Object.keys(this.connectedClients);
    }

    getUserFullName(socketId: string) {
        return this.connectedClients[socketId].user.fullName;
    }

    //Check if the user is already connected and disconnect the previous connection
    private checkUserConnection(user: User){
        for (const clientId of Object.keys(this.connectedClients)) {
           const connectedClients = this.connectedClients[clientId];
           if (connectedClients.user.id === user.id){
               connectedClients.socket.disconnect();
               break; //If found the user, break the loop
           }
        }
    }

}
