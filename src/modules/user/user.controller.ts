import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { uniqBy, filter, forEach, differenceWith } from 'lodash';
import { User } from './entities/user.entity';
import { log } from 'console';
import { DonationService } from '../donation/donation.service';

@Controller('employee')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly donationService: DonationService,
  ) {}

  @Get()
  async getCharitableEmployees(): Promise<User[]> {
    const query = `
SELECT * ,
    (
    SELECT sum(d2.amount)
    FROM donation d2
    where d2."userId"=u.id
    and d2."date">=current_date -interval '6 month'
    ) ,(
	SELECT (SUM(s.amount)/12)*0.1
    FROM salary s 
    where s."userId"=u.id
    and s."date">=current_date -interval '6 month'
    ) 
     ssuma,
    (
    SELECT sum(d2.amount)
    FROM donation d2
    where d2."userId"=u.id
    and d2."date">=current_date -interval '6 month'
    ) dsum
    FROM "user" u, donation d 
    where u.id = d."userId"  AND d."date" >=current_date -interval '6 month';
`;

    const result = await this.userService.queryBuilder(query);

    let employees = filter(result, (emp) => {
      return emp.dsum > emp.ssuma;
    });

    employees = uniqBy(result, 'userId');

    const finalEmpData = [];
    employees.forEach((emp) => {
      delete emp.ssuma;
      delete emp.dsum;
      delete emp.sum;
      delete emp.userId;

      finalEmpData.push(emp);
    });

    return finalEmpData.reverse();
  }

  @Post()
  async charitableEmployees() {
    const donations = await this.donationService.find();
    let firstTargetArr = [];
    let secondTargetArr = [];

    const FIRST_SUM_TARGET = 10000;
    const SECOND_SUM_TARGET = 1000;
    let sum1 = 0;
    let sum2 = 0;

    for (const donation of donations) {
      if (sum1 >= FIRST_SUM_TARGET) {
        break;
      }

      sum1 += +donation.amount;
      firstTargetArr.push(donation);
    }

    log('jsabdja');

    for (const newDonation of firstTargetArr) {
      if (sum2 >= SECOND_SUM_TARGET) {
        break;
      }
      sum2 += +newDonation.amount;
      secondTargetArr.push(newDonation);
    }

    let currentId = 0;
    let obj = {};
    for (const newDonation of secondTargetArr) {
      if (newDonation.userId !== currentId) {
        obj = newDonation;
        obj['total'] = +newDonation.amount;
        currentId = newDonation.userId;
      } else {
        obj['total'] += +newDonation.amount;
      }
    }

    secondTargetArr = uniqBy(secondTargetArr, 'userId');
    firstTargetArr = uniqBy(firstTargetArr, 'userId');
    let ids = this.getIds(firstTargetArr);
    const ids2 = this.getIds(secondTargetArr);

    ids = differenceWith(ids, ids2);

    this.updateQuery(FIRST_SUM_TARGET * 0.1, ids);
    this.updateQuery(FIRST_SUM_TARGET * 0.2, ids2);
  }

  private getIds(array): number[] {
    const ids = [];
    forEach(array, (arr) => {
      ids.push(arr.userId);
    });

    return ids;
  }

  private updateQuery(amount: number, ids: number[]): void {
    const updateQuery = `
     UPDATE "user" set balance= balance + ${amount} where id IN( ${ids});
     `;

    this.userService.queryBuilder(updateQuery);
  }
}
