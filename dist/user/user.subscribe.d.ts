import { EntitySubscriberInterface, UpdateEvent, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UserSubscriber implements EntitySubscriberInterface<User> {
    constructor(dataSource: DataSource);
    listenTo(): typeof User;
    beforeUpdate(event: UpdateEvent<User>): Promise<void>;
}
