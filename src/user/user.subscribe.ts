import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { Payroll } from '@payroll/entities/payroll.entity';
import { User } from './entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this); // important to register the subscriber
  }

  listenTo() {
    return User;
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    const prev = event.databaseEntity;
    const next = event.entity;

    if (prev && next && prev.employeeId !== next.employeeId) {
      await event.manager.delete(Payroll, { user: { id: next.id } });
    }
  }
}
